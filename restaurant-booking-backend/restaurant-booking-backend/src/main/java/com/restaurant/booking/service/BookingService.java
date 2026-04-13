package com.restaurant.booking.service;

import com.restaurant.booking.dto.request.BookingRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.BookingResponse;
import com.restaurant.booking.entity.*;
import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.Booking.PaymentStatus;
import com.restaurant.booking.exception.BadRequestException;
import com.restaurant.booking.exception.BookingConflictException;
import com.restaurant.booking.exception.ResourceNotFoundException;
import com.restaurant.booking.exception.UnauthorizedException;
import com.restaurant.booking.repository.BookingRepository;
import com.restaurant.booking.repository.RestaurantRepository;
import com.restaurant.booking.repository.RestaurantTableRepository;
import com.restaurant.booking.repository.UserRepository;
import com.restaurant.booking.util.BookingReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository         bookingRepository;
    private final RestaurantRepository      restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository            userRepository;
    private final BookingReferenceGenerator referenceGenerator;
    private final EmailService              emailService;
    private final NotificationService       notificationService;
    private final PaymentService            paymentService;

    // ── Create Booking ────────────────────────────────────────────────────────
    /**
     * SERIALIZABLE isolation + double-check at DB level prevents race conditions.
     * Even if two requests arrive simultaneously for the same slot, only one
     * will succeed; the other sees countConflictingBookings > 0 and throws.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public ApiResponse<BookingResponse> createBooking(BookingRequest req, Authentication auth) {
        validateTimeRange(req.getStartTime(), req.getEndTime());

        User customer = getUser(auth.getName());
        Restaurant restaurant = restaurantRepository.findByIdAndActiveTrue(req.getRestaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", req.getRestaurantId()));

        // Auto-select or validate the requested table
        RestaurantTable table = resolveTable(req, restaurant);

        // ── DOUBLE-BOOKING PREVENTION ─────────────────────────────────────────
        long conflicts = bookingRepository.countConflictingBookings(
            table.getId(), req.getBookingDate(), req.getStartTime(), req.getEndTime()
        );
        if (conflicts > 0) {
            throw new BookingConflictException(
                "Table #" + table.getTableNumber() +
                " is already booked for " + req.getBookingDate() +
                " between " + req.getStartTime() + " and " + req.getEndTime() +
                ". Please choose a different time or table."
            );
        }

        // ── Mock payment ──────────────────────────────────────────────────────
        String transactionId = null;
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        if (req.getDepositAmount() != null) {
            transactionId = paymentService.processDeposit(
                customer, req.getDepositAmount(), restaurant.getName()
            );
            paymentStatus = PaymentStatus.PAID;
        }

        // ── Persist booking ───────────────────────────────────────────────────
        String reference = generateUniqueReference();
        Booking booking = Booking.builder()
            .bookingReference(reference)
            .customer(customer)
            .restaurant(restaurant)
            .table(table)
            .bookingDate(req.getBookingDate())
            .startTime(req.getStartTime())
            .endTime(req.getEndTime())
            .guestCount(req.getGuestCount())
            .status(BookingStatus.CONFIRMED)
            .specialRequests(req.getSpecialRequests())
            .depositAmount(req.getDepositAmount())
            .paymentStatus(paymentStatus)
            .transactionId(transactionId)
            .build();

        bookingRepository.save(booking);
        log.info("Booking confirmed: ref={} customer={} restaurant={} date={} {}–{}",
            reference, customer.getEmail(), restaurant.getName(),
            req.getBookingDate(), req.getStartTime(), req.getEndTime());

        // ── Async side-effects ────────────────────────────────────────────────
        emailService.sendBookingConfirmation(booking);
        notificationService.notifyNewBooking(booking);

        return ApiResponse.success("Booking confirmed successfully", toResponse(booking));
    }

    // ── Cancel Booking ────────────────────────────────────────────────────────
    @Transactional
    public ApiResponse<BookingResponse> cancelBooking(Long bookingId, Authentication auth) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        authorizeBookingAccess(booking, auth);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Refund deposit if paid
        if (booking.getPaymentStatus() == PaymentStatus.PAID
                && booking.getDepositAmount() != null) {
            paymentService.refund(booking.getTransactionId(), booking.getDepositAmount());
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        bookingRepository.save(booking);
        log.info("Booking cancelled: ref={} by {}", booking.getBookingReference(), auth.getName());

        emailService.sendCancellationConfirmation(booking);
        notificationService.notifyBookingCancelled(booking);

        return ApiResponse.success("Booking cancelled successfully", toResponse(booking));
    }

    // ── Customer – booking history ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Authentication auth, Pageable pageable) {
        User customer = getUser(auth.getName());
        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer, pageable)
            .map(this::toResponse);
    }

    // ── Owner – restaurant bookings ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsByRestaurant(Long restaurantId,
                                                          Authentication auth,
                                                          Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        boolean isAdmin = hasRole(auth, "ROLE_ADMIN");
        if (!isAdmin && !restaurant.getOwner().getEmail().equals(auth.getName())) {
            throw new UnauthorizedException("Not authorized to view bookings for this restaurant");
        }

        return bookingRepository
            .findByRestaurantOrderByBookingDateDescStartTimeAsc(restaurant, pageable)
            .map(this::toResponse);
    }

    // ── Get by reference ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BookingResponse getByReference(String reference, Authentication auth) {
        Booking booking = bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", reference));
        authorizeBookingAccess(booking, auth);
        return toResponse(booking);
    }

    // ── Availability check ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RestaurantTable> getAvailableTables(Long restaurantId, LocalDate date,
                                                     LocalTime startTime, LocalTime endTime,
                                                     int guestCount) {
        validateTimeRange(startTime, endTime);
        return tableRepository.findAvailableTables(restaurantId, date, startTime, endTime, guestCount);
    }

    // ── Owner: update booking status ──────────────────────────────────────────
    @Transactional
    public ApiResponse<BookingResponse> updateStatus(Long bookingId, BookingStatus newStatus,
                                                      Authentication auth) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        boolean isAdmin = hasRole(auth, "ROLE_ADMIN");
        boolean isOwner = booking.getRestaurant().getOwner().getEmail().equals(auth.getName());
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("Not authorized to update this booking");
        }

        booking.setStatus(newStatus);
        bookingRepository.save(booking);
        log.info("Booking status updated: ref={} newStatus={}", booking.getBookingReference(), newStatus);
        return ApiResponse.success("Booking status updated", toResponse(booking));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private RestaurantTable resolveTable(BookingRequest req, Restaurant restaurant) {
        if (req.getTableId() != null) {
            // Customer requested a specific table – validate it belongs to this restaurant
            RestaurantTable table = tableRepository.findById(req.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table", "id", req.getTableId()));
            if (!table.getRestaurant().getId().equals(restaurant.getId())) {
                throw new BadRequestException("Table does not belong to the requested restaurant");
            }
            if (table.getCapacity() < req.getGuestCount()) {
                throw new BadRequestException(
                    "Table capacity (" + table.getCapacity() + ") is less than guest count (" + req.getGuestCount() + ")"
                );
            }
            return table;
        }

        // Auto-select smallest suitable available table
        List<RestaurantTable> available = tableRepository.findAvailableTables(
            restaurant.getId(), req.getBookingDate(),
            req.getStartTime(), req.getEndTime(), req.getGuestCount()
        );
        if (available.isEmpty()) {
            throw new BookingConflictException(
                "No tables available for " + req.getGuestCount() + " guests on " +
                req.getBookingDate() + " between " + req.getStartTime() + " and " + req.getEndTime()
            );
        }
        return available.get(0); // already ordered by capacity ASC
    }

    private void validateTimeRange(LocalTime start, LocalTime end) {
        if (!end.isAfter(start)) {
            throw new BadRequestException("End time must be after start time");
        }
        if (java.time.Duration.between(start, end).toMinutes() < 30) {
            throw new BadRequestException("Booking duration must be at least 30 minutes");
        }
    }

    private String generateUniqueReference() {
        String ref;
        int attempts = 0;
        do {
            ref = referenceGenerator.generate();
            if (++attempts > 10) throw new RuntimeException("Could not generate unique booking reference");
        } while (bookingRepository.findByBookingReference(ref).isPresent());
        return ref;
    }

    private void authorizeBookingAccess(Booking booking, Authentication auth) {
        boolean isAdmin = hasRole(auth, "ROLE_ADMIN");
        boolean isOwner = booking.getRestaurant().getOwner().getEmail().equals(auth.getName());
        boolean isCustomer = booking.getCustomer().getEmail().equals(auth.getName());
        if (!isAdmin && !isOwner && !isCustomer) {
            throw new UnauthorizedException("You are not authorized to access this booking");
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().contains(new SimpleGrantedAuthority(role));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
            .id(b.getId())
            .bookingReference(b.getBookingReference())
            .customerId(b.getCustomer().getId())
            .customerName(b.getCustomer().getFullName())
            .customerEmail(b.getCustomer().getEmail())
            .restaurantId(b.getRestaurant().getId())
            .restaurantName(b.getRestaurant().getName())
            .tableId(b.getTable().getId())
            .tableNumber(b.getTable().getTableNumber())
            .tableCapacity(b.getTable().getCapacity())
            .bookingDate(b.getBookingDate())
            .startTime(b.getStartTime())
            .endTime(b.getEndTime())
            .guestCount(b.getGuestCount())
            .status(b.getStatus())
            .specialRequests(b.getSpecialRequests())
            .depositAmount(b.getDepositAmount())
            .paymentStatus(b.getPaymentStatus())
            .transactionId(b.getTransactionId())
            .createdAt(b.getCreatedAt())
            .build();
    }
}

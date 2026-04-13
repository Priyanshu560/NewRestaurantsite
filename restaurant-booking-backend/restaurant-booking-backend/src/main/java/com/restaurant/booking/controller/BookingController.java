package com.restaurant.booking.controller;

import com.restaurant.booking.dto.request.BookingRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.BookingResponse;
import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.RestaurantTable;
import com.restaurant.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bookings", description = "Create, view, and cancel restaurant bookings")
public class BookingController {

    private final BookingService bookingService;

    // ── Create ────────────────────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @Operation(summary = "Create a booking (CUSTOMER)")
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(request, auth));
    }

    // ── Cancel ────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a booking (CUSTOMER who owns it, OWNER, or ADMIN)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, auth));
    }

    // ── Customer: my bookings ─────────────────────────────────────────────────
    @GetMapping("/my")
    @Operation(summary = "Get booking history for the authenticated customer")
    public ResponseEntity<Page<BookingResponse>> myBookings(
            Authentication auth,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth, pageable));
    }

    // ── Get by reference ──────────────────────────────────────────────────────
    @GetMapping("/ref/{reference}")
    @Operation(summary = "Look up a booking by reference code")
    public ResponseEntity<BookingResponse> getByReference(
            @PathVariable String reference,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.getByReference(reference, auth));
    }

    // ── Owner / Admin: bookings for a restaurant ──────────────────────────────
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Operation(summary = "Get all bookings for a restaurant (OWNER / ADMIN)")
    public ResponseEntity<Page<BookingResponse>> byRestaurant(
            @PathVariable Long restaurantId,
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
            bookingService.getBookingsByRestaurant(restaurantId, auth, pageable));
    }

    // ── Availability check ────────────────────────────────────────────────────
    @GetMapping("/available-tables")
    @Operation(summary = "Check available tables for a given restaurant, date, and time (public-ish)")
    public ResponseEntity<List<RestaurantTable>> availableTables(
            @RequestParam Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(defaultValue = "2") int guestCount) {
        return ResponseEntity.ok(
            bookingService.getAvailableTables(restaurantId, date, startTime, endTime, guestCount));
    }

    // ── Owner: update status ──────────────────────────────────────────────────
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Operation(summary = "Update booking status – e.g. mark COMPLETED or NO_SHOW (OWNER / ADMIN)")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.updateStatus(id, status, auth));
    }
}

package com.restaurant.booking.service;

import com.restaurant.booking.dto.request.ReviewRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.ReviewResponse;
import com.restaurant.booking.entity.Booking;
import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.Review;
import com.restaurant.booking.entity.User;
import com.restaurant.booking.exception.BadRequestException;
import com.restaurant.booking.exception.ResourceNotFoundException;
import com.restaurant.booking.exception.UnauthorizedException;
import com.restaurant.booking.repository.BookingRepository;
import com.restaurant.booking.repository.RestaurantRepository;
import com.restaurant.booking.repository.ReviewRepository;
import com.restaurant.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository     reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final BookingRepository    bookingRepository;
    private final UserRepository       userRepository;

    // ── Create review ─────────────────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = {"reviews", "restaurant"}, allEntries = true)
    public ApiResponse<ReviewResponse> createReview(ReviewRequest req, Authentication auth) {
        User customer = getUser(auth.getName());
        Restaurant restaurant = restaurantRepository.findByIdAndActiveTrue(req.getRestaurantId())
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", req.getRestaurantId()));

        // If a booking ID is supplied, verify it belongs to this customer + restaurant
        Booking booking = null;
        if (req.getBookingId() != null) {
            booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", req.getBookingId()));

            if (!booking.getCustomer().getId().equals(customer.getId())) {
                throw new UnauthorizedException("Booking does not belong to you");
            }
            if (!booking.getRestaurant().getId().equals(restaurant.getId())) {
                throw new BadRequestException("Booking does not match the restaurant");
            }
            if (booking.getStatus() != BookingStatus.COMPLETED) {
                throw new BadRequestException("You can only review a completed booking");
            }
            // Duplicate check
            if (reviewRepository.existsByCustomerAndRestaurantAndBookingId(
                    customer, restaurant, req.getBookingId())) {
                throw new BadRequestException("You have already reviewed this booking");
            }
        }

        Review review = Review.builder()
            .customer(customer)
            .restaurant(restaurant)
            .booking(booking)
            .rating(req.getRating())
            .comment(req.getComment())
            .build();

        reviewRepository.save(review);

        // Recalculate and persist average rating on restaurant
        recalculateAverageRating(restaurant);

        log.info("Review created: restaurantId={} by={} rating={}", restaurant.getId(),
            customer.getEmail(), req.getRating());
        return ApiResponse.success("Review submitted successfully", toResponse(review));
    }

    // ── Get reviews for a restaurant ──────────────────────────────────────────
    @Cacheable(value = "reviews", key = "#restaurantId + '_' + #pageable.pageNumber")
    public Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findByIdAndActiveTrue(restaurantId)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));
        return reviewRepository
            .findByRestaurantAndVisibleTrueOrderByCreatedAtDesc(restaurant, pageable)
            .map(this::toResponse);
    }

    // ── Customer: my reviews ──────────────────────────────────────────────────
    public Page<ReviewResponse> getMyReviews(Authentication auth, Pageable pageable) {
        User customer = getUser(auth.getName());
        return reviewRepository.findByCustomerOrderByCreatedAtDesc(customer, pageable)
            .map(this::toResponse);
    }

    // ── Admin: hide/show review ───────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = "reviews", allEntries = true)
    public ApiResponse<Void> toggleVisibility(Long reviewId, Authentication auth) {
        if (!auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            throw new UnauthorizedException("Only admins can moderate reviews");
        }
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setVisible(!review.isVisible());
        reviewRepository.save(review);
        return ApiResponse.success(
            review.isVisible() ? "Review visible" : "Review hidden", null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private void recalculateAverageRating(Restaurant restaurant) {
        reviewRepository.calculateAverageRating(restaurant).ifPresent(avg -> {
            restaurant.setAverageRating(
                BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP)
            );
            restaurantRepository.save(restaurant);
        });
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
            .id(r.getId())
            .customerId(r.getCustomer().getId())
            .customerName(r.getCustomer().getFullName())
            .restaurantId(r.getRestaurant().getId())
            .restaurantName(r.getRestaurant().getName())
            .bookingId(r.getBooking() != null ? r.getBooking().getId() : null)
            .rating(r.getRating())
            .comment(r.getComment())
            .createdAt(r.getCreatedAt())
            .build();
    }
}

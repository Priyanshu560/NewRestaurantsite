package com.restaurant.booking.controller;

import com.restaurant.booking.dto.request.ReviewRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.ReviewResponse;
import com.restaurant.booking.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Submit and read restaurant reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // ── Public: get reviews for a restaurant ──────────────────────────────────
    @GetMapping("/restaurants/{restaurantId}/reviews")
    @Operation(summary = "Get reviews for a restaurant (public)")
    public ResponseEntity<Page<ReviewResponse>> getByRestaurant(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByRestaurant(restaurantId, pageable));
    }

    // ── Customer: submit a review ─────────────────────────────────────────────
    @PostMapping("/reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submit a review (CUSTOMER)")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @Valid @RequestBody ReviewRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reviewService.createReview(request, auth));
    }

    // ── Customer: my reviews ──────────────────────────────────────────────────
    @GetMapping("/reviews/my")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get the current user's reviews")
    public ResponseEntity<Page<ReviewResponse>> myReviews(
            Authentication auth,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getMyReviews(auth, pageable));
    }

    // ── Admin: toggle visibility ──────────────────────────────────────────────
    @PatchMapping("/admin/reviews/{reviewId}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Toggle review visibility (ADMIN)")
    public ResponseEntity<ApiResponse<Void>> toggleVisibility(
            @PathVariable Long reviewId,
            Authentication auth) {
        return ResponseEntity.ok(reviewService.toggleVisibility(reviewId, auth));
    }
}

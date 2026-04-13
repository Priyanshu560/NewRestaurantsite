package com.restaurant.booking.controller;

import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.RestaurantResponse;
import com.restaurant.booking.dto.response.UserResponse;
import com.restaurant.booking.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only user management and analytics")
public class AdminController {

    private final AdminService adminService;

    // ── Users ─────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    @Operation(summary = "List all users (paginated)")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId));
    }

    // ── Restaurants ───────────────────────────────────────────────────────────
    @GetMapping("/restaurants")
    @Operation(summary = "List all restaurants (including inactive)")
    public ResponseEntity<Page<RestaurantResponse>> getRestaurants(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllRestaurants(pageable));
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    @Operation(summary = "Get analytics dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}

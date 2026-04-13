package com.restaurant.booking.service;

import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.BookingResponse;
import com.restaurant.booking.dto.response.RestaurantResponse;
import com.restaurant.booking.dto.response.UserResponse;
import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.User;
import com.restaurant.booking.exception.ResourceNotFoundException;
import com.restaurant.booking.repository.BookingRepository;
import com.restaurant.booking.repository.RestaurantRepository;
import com.restaurant.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository       userRepository;
    private final BookingRepository    bookingRepository;
    private final RestaurantRepository restaurantRepository;
    private final BookingService       bookingService;
    private final RestaurantService    restaurantService;

    // ── User management ───────────────────────────────────────────────────────
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserResponse);
    }

    @Transactional
    public ApiResponse<UserResponse> toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        log.info("Admin toggled user status: userId={} enabled={}", userId, user.isEnabled());
        return ApiResponse.success(
            user.isEnabled() ? "User enabled" : "User disabled",
            toUserResponse(user)
        );
    }

    // ── Restaurant management ─────────────────────────────────────────────────
    public Page<RestaurantResponse> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable)
            .map(restaurantService::toResponse);
    }

    // ── Analytics dashboard ───────────────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Booking counts
        stats.put("totalBookings",     bookingRepository.count());
        stats.put("confirmedBookings", bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        stats.put("cancelledBookings", bookingRepository.countByStatus(BookingStatus.CANCELLED));
        stats.put("completedBookings", bookingRepository.countByStatus(BookingStatus.COMPLETED));
        stats.put("pendingBookings",   bookingRepository.countByStatus(BookingStatus.PENDING));

        // User and restaurant counts
        stats.put("totalUsers",       userRepository.count());
        stats.put("totalRestaurants", restaurantRepository.count());

        // Top restaurants by booking count
        List<Object[]> topRestaurants = bookingRepository.countBookingsPerRestaurant();
        Map<String, Long> topRestaurantMap = new LinkedHashMap<>();
        topRestaurants.stream().limit(5).forEach(row ->
            topRestaurantMap.put((String) row[0], (Long) row[1]));
        stats.put("topRestaurantsByBookings", topRestaurantMap);

        // Daily booking trend – last 30 days
        List<Object[]> dailyCounts = bookingRepository.dailyBookingCountsFrom(
            LocalDate.now().minusDays(30)
        );
        Map<String, Long> dailyTrend = new LinkedHashMap<>();
        dailyCounts.forEach(row -> dailyTrend.put(row[0].toString(), (Long) row[1]));
        stats.put("dailyBookingTrend", dailyTrend);

        return stats;
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
            .id(u.getId())
            .fullName(u.getFullName())
            .email(u.getEmail())
            .phone(u.getPhone())
            .enabled(u.isEnabled())
            .roles(u.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet()))
            .createdAt(u.getCreatedAt())
            .build();
    }
}

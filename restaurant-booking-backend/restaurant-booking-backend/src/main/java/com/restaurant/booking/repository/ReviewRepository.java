package com.restaurant.booking.repository;

import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.Review;
import com.restaurant.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByRestaurantAndVisibleTrueOrderByCreatedAtDesc(Restaurant restaurant, Pageable pageable);

    Page<Review> findByCustomerOrderByCreatedAtDesc(User customer, Pageable pageable);

    boolean existsByCustomerAndRestaurantAndBookingId(User customer, Restaurant restaurant, Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant = :restaurant AND r.visible = true")
    Optional<Double> calculateAverageRating(@Param("restaurant") Restaurant restaurant);
}

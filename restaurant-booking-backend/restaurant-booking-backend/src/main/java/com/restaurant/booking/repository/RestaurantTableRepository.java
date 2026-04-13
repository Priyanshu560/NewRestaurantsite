package com.restaurant.booking.repository;

import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByRestaurantAndAvailableTrue(Restaurant restaurant);

    List<RestaurantTable> findByRestaurant(Restaurant restaurant);

    /**
     * Find tables that are NOT already booked for the given date/time window.
     * This is the core double-booking prevention query.
     */
    @Query("""
        SELECT t FROM RestaurantTable t
        WHERE t.restaurant.id = :restaurantId
          AND t.available = true
          AND t.capacity >= :guestCount
          AND t.id NOT IN (
              SELECT b.table.id FROM Booking b
              WHERE b.restaurant.id = :restaurantId
                AND b.bookingDate = :date
                AND b.status NOT IN ('CANCELLED', 'NO_SHOW')
                AND b.startTime < :endTime
                AND b.endTime > :startTime
          )
        ORDER BY t.capacity ASC
        """)
    List<RestaurantTable> findAvailableTables(
        @Param("restaurantId") Long restaurantId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("guestCount") int guestCount
    );
}

package com.restaurant.booking.repository;

import com.restaurant.booking.entity.Booking;
import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String reference);

    Page<Booking> findByCustomerOrderByCreatedAtDesc(User customer, Pageable pageable);

    Page<Booking> findByRestaurantOrderByBookingDateDescStartTimeAsc(Restaurant restaurant, Pageable pageable);

    List<Booking> findByRestaurantAndBookingDateAndStatusNotIn(
        Restaurant restaurant, LocalDate date, List<BookingStatus> excludedStatuses
    );

    /**
     * Pessimistic check for overlapping bookings on the same table.
     * Used inside a @Transactional block to prevent race conditions.
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.table.id = :tableId
          AND b.bookingDate = :date
          AND b.status NOT IN ('CANCELLED', 'NO_SHOW')
          AND b.startTime < :endTime
          AND b.endTime > :startTime
        """)
    long countConflictingBookings(
        @Param("tableId") Long tableId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    // Admin analytics
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") BookingStatus status);

    @Query("SELECT b.restaurant.name, COUNT(b) FROM Booking b GROUP BY b.restaurant ORDER BY COUNT(b) DESC")
    List<Object[]> countBookingsPerRestaurant();

    @Query("SELECT b.bookingDate, COUNT(b) FROM Booking b WHERE b.bookingDate >= :from GROUP BY b.bookingDate ORDER BY b.bookingDate")
    List<Object[]> dailyBookingCountsFrom(@Param("from") LocalDate from);
}

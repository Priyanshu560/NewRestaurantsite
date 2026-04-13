package com.restaurant.booking.repository;

import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("""
        SELECT r FROM Restaurant r
        WHERE r.active = true
          AND (:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:city IS NULL OR LOWER(r.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:cuisine IS NULL OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%')))
        """)
    Page<Restaurant> searchRestaurants(
        @Param("name") String name,
        @Param("city") String city,
        @Param("cuisine") String cuisine,
        Pageable pageable
    );

    List<Restaurant> findByOwnerAndActiveTrue(User owner);

    Optional<Restaurant> findByIdAndActiveTrue(Long id);

    @Query("SELECT DISTINCT r.cuisine FROM Restaurant r WHERE r.active = true ORDER BY r.cuisine")
    List<String> findAllCuisines();
}

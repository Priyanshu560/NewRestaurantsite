package com.restaurant.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String cuisine;
    private String description;
    private String phone;
    private String email;
    private String imageUrl;
    private BigDecimal averageRating;
    private Integer totalTables;
    private String openingTime;
    private String closingTime;
    private boolean active;
    private String ownerName;
    private Long ownerId;
    private LocalDateTime createdAt;
}

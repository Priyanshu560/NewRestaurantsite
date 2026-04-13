package com.restaurant.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequest {

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 20, message = "Maximum 20 guests per booking")
    private Integer guestCount;

    @Size(max = 500, message = "Special requests must be under 500 characters")
    private String specialRequests;

    /** Optional - if not provided, system auto-selects best available table */
    private Long tableId;

    /** Mock deposit amount provided by client */
    private BigDecimal depositAmount;
}

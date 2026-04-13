package com.restaurant.booking.dto.response;

import com.restaurant.booking.entity.Booking.BookingStatus;
import com.restaurant.booking.entity.Booking.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long restaurantId;
    private String restaurantName;
    private Long tableId;
    private Integer tableNumber;
    private Integer tableCapacity;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer guestCount;
    private BookingStatus status;
    private String specialRequests;
    private BigDecimal depositAmount;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime createdAt;
}

package com.restaurant.booking.service;

import com.restaurant.booking.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // ── New booking: notify owner dashboard ───────────────────────────────────
    @Async
    public void notifyNewBooking(Booking booking) {
        try {
            Map<String, Object> payload = Map.of(
                "type",      "NEW_BOOKING",
                "reference", booking.getBookingReference(),
                "customer",  booking.getCustomer().getFullName(),
                "date",      booking.getBookingDate().toString(),
                "time",      booking.getStartTime().toString(),
                "guests",    booking.getGuestCount()
            );
            // Broadcast to all subscribers of the restaurant-specific topic
            messagingTemplate.convertAndSend(
                "/topic/restaurant/" + booking.getRestaurant().getId() + "/bookings",
                payload
            );
            // Also send to the customer's personal queue
            messagingTemplate.convertAndSendToUser(
                booking.getCustomer().getEmail(),
                "/queue/notifications",
                payload
            );
            log.debug("WebSocket notification sent for new booking {}", booking.getBookingReference());
        } catch (Exception ex) {
            log.warn("Failed to send WebSocket notification: {}", ex.getMessage());
        }
    }

    // ── Cancellation: notify owner dashboard ──────────────────────────────────
    @Async
    public void notifyBookingCancelled(Booking booking) {
        try {
            Map<String, Object> payload = Map.of(
                "type",      "BOOKING_CANCELLED",
                "reference", booking.getBookingReference(),
                "customer",  booking.getCustomer().getFullName(),
                "date",      booking.getBookingDate().toString()
            );
            messagingTemplate.convertAndSend(
                "/topic/restaurant/" + booking.getRestaurant().getId() + "/bookings",
                payload
            );
            messagingTemplate.convertAndSendToUser(
                booking.getCustomer().getEmail(),
                "/queue/notifications",
                payload
            );
        } catch (Exception ex) {
            log.warn("Failed to send cancellation WebSocket notification: {}", ex.getMessage());
        }
    }
}

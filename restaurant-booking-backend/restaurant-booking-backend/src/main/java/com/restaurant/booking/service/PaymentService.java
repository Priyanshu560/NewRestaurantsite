package com.restaurant.booking.service;

import com.restaurant.booking.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Mock Payment Service.
 * In production replace with a real gateway (Stripe, Razorpay, etc.).
 * All methods simulate success; error paths can be toggled for testing.
 */
@Slf4j
@Service
public class PaymentService {

    /**
     * Process a deposit for a booking.
     *
     * @return a mock transaction ID
     */
    public String processDeposit(User customer, BigDecimal amount, String restaurantName) {
        // Simulate payment gateway call
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        log.info("[MOCK PAYMENT] Deposit of {} processed for customer={} restaurant={} txnId={}",
            amount, customer.getEmail(), restaurantName, transactionId);
        return transactionId;
    }

    /**
     * Refund a deposit when a booking is cancelled.
     */
    public void refund(String transactionId, BigDecimal amount) {
        String refundId = "REF-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        log.info("[MOCK PAYMENT] Refund of {} for txnId={} → refundId={}",
            amount, transactionId, refundId);
        // In production: call payment gateway refund API here
    }
}

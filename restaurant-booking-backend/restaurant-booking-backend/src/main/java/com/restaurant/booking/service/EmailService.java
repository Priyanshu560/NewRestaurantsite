package com.restaurant.booking.service;

import com.restaurant.booking.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMMM d, yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");

    // ── Booking confirmation ───────────────────────────────────────────────────
    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            String subject = "Booking Confirmed – " + booking.getBookingReference();
            String body = buildConfirmationHtml(booking);
            sendHtmlEmail(booking.getCustomer().getEmail(), subject, body);
            log.info("Confirmation email sent for booking {}", booking.getBookingReference());
        } catch (Exception ex) {
            log.error("Failed to send confirmation email for booking {}: {}",
                booking.getBookingReference(), ex.getMessage());
        }
    }

    // ── Cancellation confirmation ─────────────────────────────────────────────
    @Async
    public void sendCancellationConfirmation(Booking booking) {
        try {
            String subject = "Booking Cancelled – " + booking.getBookingReference();
            String body = buildCancellationHtml(booking);
            sendHtmlEmail(booking.getCustomer().getEmail(), subject, body);
            log.info("Cancellation email sent for booking {}", booking.getBookingReference());
        } catch (Exception ex) {
            log.error("Failed to send cancellation email for booking {}: {}",
                booking.getBookingReference(), ex.getMessage());
        }
    }

    // ── Core send ─────────────────────────────────────────────────────────────
    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    // ── HTML templates ────────────────────────────────────────────────────────
    private String buildConfirmationHtml(Booking booking) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
              <div style="background:#2d6a4f;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;">Booking Confirmed! 🎉</h1>
              </div>
              <div style="padding:24px;">
                <p>Hi <strong>%s</strong>,</p>
                <p>Your table has been reserved. Here are your booking details:</p>
                <table style="width:100%%;border-collapse:collapse;">
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Reference</b></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Restaurant</b></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Date</b></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Time</b></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s – %s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Guests</b></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%d</td></tr>
                  <tr><td style="padding:8px;"><b>Table</b></td>
                      <td style="padding:8px;">#%d</td></tr>
                </table>
                <p style="margin-top:24px;">
                  <a href="%s/bookings/%s" style="background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
                    View Booking
                  </a>
                </p>
                <p style="color:#666;font-size:12px;">To cancel, visit the link above or contact the restaurant directly.</p>
              </div>
            </body>
            </html>
            """.formatted(
                booking.getCustomer().getFullName(),
                booking.getBookingReference(),
                booking.getRestaurant().getName(),
                booking.getBookingDate().format(DATE_FMT),
                booking.getStartTime().format(TIME_FMT),
                booking.getEndTime().format(TIME_FMT),
                booking.getGuestCount(),
                booking.getTable().getTableNumber(),
                frontendUrl,
                booking.getBookingReference()
            );
    }

    private String buildCancellationHtml(Booking booking) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
              <div style="background:#c0392b;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;">Booking Cancelled</h1>
              </div>
              <div style="padding:24px;">
                <p>Hi <strong>%s</strong>,</p>
                <p>Your booking <strong>%s</strong> at <strong>%s</strong> on %s has been cancelled.</p>
                %s
                <p>We hope to see you again soon!</p>
                <p><a href="%s/restaurants" style="background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
                  Browse Restaurants
                </a></p>
              </div>
            </body>
            </html>
            """.formatted(
                booking.getCustomer().getFullName(),
                booking.getBookingReference(),
                booking.getRestaurant().getName(),
                booking.getBookingDate().format(DATE_FMT),
                booking.getPaymentStatus() != null &&
                    booking.getPaymentStatus().name().equals("REFUNDED")
                    ? "<p>Your deposit has been refunded.</p>" : "",
                frontendUrl
            );
    }
}

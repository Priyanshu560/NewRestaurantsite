package com.restaurant.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    @Size(min = 2, max = 150)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "Cuisine type is required")
    @Size(max = 50)
    private String cuisine;

    @Size(max = 2000)
    private String description;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number")
    private String phone;

    @Email(message = "Invalid email")
    private String email;

    private String imageUrl;

    /** Format HH:mm */
    @NotBlank
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time format must be HH:mm")
    private String openingTime;

    @NotBlank
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time format must be HH:mm")
    private String closingTime;
}

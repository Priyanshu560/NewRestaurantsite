package com.restaurant.booking.dto.request;

import com.restaurant.booking.entity.RestaurantTable.TableType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TableRequest {

    @NotNull(message = "Table number is required")
    @Min(1)
    private Integer tableNumber;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 20, message = "Capacity cannot exceed 20")
    private Integer capacity;

    private TableType tableType = TableType.STANDARD;

    private boolean available = true;
}

package com.restaurant.booking.dto.response;

import com.restaurant.booking.entity.RestaurantTable.TableType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private Integer tableNumber;
    private Integer capacity;
    private TableType tableType;
    private boolean available;
    private Long restaurantId;
    private String restaurantName;
}

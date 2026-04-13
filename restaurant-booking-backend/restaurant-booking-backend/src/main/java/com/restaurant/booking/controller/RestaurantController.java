package com.restaurant.booking.controller;

import com.restaurant.booking.dto.request.RestaurantRequest;
import com.restaurant.booking.dto.request.TableRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.RestaurantResponse;
import com.restaurant.booking.dto.response.TableResponse;
import com.restaurant.booking.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "Restaurant search, management and table operations")
public class RestaurantController {

    private final RestaurantService restaurantService;

    // ── Public endpoints ──────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Search / list restaurants (public)")
    public ResponseEntity<Page<RestaurantResponse>> searchRestaurants(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String cuisine,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(
            restaurantService.searchRestaurants(name, city, cuisine, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant details by ID (public)")
    public ResponseEntity<RestaurantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @GetMapping("/cuisines")
    @Operation(summary = "Get all distinct cuisine types (public)")
    public ResponseEntity<List<String>> getCuisines() {
        return ResponseEntity.ok(restaurantService.getAllCuisines());
    }

    @GetMapping("/{id}/tables")
    @Operation(summary = "Get tables for a restaurant (public)")
    public ResponseEntity<List<TableResponse>> getTables(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getTablesByRestaurant(id));
    }

    // ── Owner / Admin endpoints ────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new restaurant (OWNER / ADMIN)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> create(
            @Valid @RequestBody RestaurantRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(restaurantService.createRestaurant(request, auth));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a restaurant (OWNER of that restaurant / ADMIN)")
    public ResponseEntity<ApiResponse<RestaurantResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request,
            Authentication auth) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, request, auth));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Soft-delete a restaurant (OWNER / ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(restaurantService.deleteRestaurant(id, auth));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all restaurants owned by the authenticated user")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(Authentication auth) {
        return ResponseEntity.ok(restaurantService.getMyRestaurants(auth));
    }

    // ── Table sub-resource ────────────────────────────────────────────────────

    @PostMapping("/{restaurantId}/tables")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add a table to a restaurant (OWNER / ADMIN)")
    public ResponseEntity<ApiResponse<TableResponse>> addTable(
            @PathVariable Long restaurantId,
            @Valid @RequestBody TableRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(restaurantService.addTable(restaurantId, request, auth));
    }

    @PutMapping("/{restaurantId}/tables/{tableId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a table (OWNER / ADMIN)")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long restaurantId,
            @PathVariable Long tableId,
            @Valid @RequestBody TableRequest request,
            Authentication auth) {
        return ResponseEntity.ok(
            restaurantService.updateTable(restaurantId, tableId, request, auth));
    }
}

package com.restaurant.booking.service;

import com.restaurant.booking.dto.request.RestaurantRequest;
import com.restaurant.booking.dto.request.TableRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.RestaurantResponse;
import com.restaurant.booking.dto.response.TableResponse;
import com.restaurant.booking.entity.Restaurant;
import com.restaurant.booking.entity.RestaurantTable;
import com.restaurant.booking.entity.User;
import com.restaurant.booking.exception.ResourceNotFoundException;
import com.restaurant.booking.exception.UnauthorizedException;
import com.restaurant.booking.repository.RestaurantRepository;
import com.restaurant.booking.repository.RestaurantTableRepository;
import com.restaurant.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository      restaurantRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository            userRepository;

    // ── Public search ─────────────────────────────────────────────────────────
    @Cacheable(value = "restaurants", key = "#name + '_' + #city + '_' + #cuisine + '_' + #pageable.pageNumber")
    public Page<RestaurantResponse> searchRestaurants(String name, String city,
                                                      String cuisine, Pageable pageable) {
        return restaurantRepository.searchRestaurants(name, city, cuisine, pageable)
            .map(this::toResponse);
    }

    @Cacheable(value = "restaurant", key = "#id")
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant r = restaurantRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));
        return toResponse(r);
    }

    @Cacheable(value = "cuisines")
    public List<String> getAllCuisines() {
        return restaurantRepository.findAllCuisines();
    }

    // ── Owner operations ──────────────────────────────────────────────────────
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "restaurants", allEntries = true),
        @CacheEvict(value = "cuisines",    allEntries = true)
    })
    public ApiResponse<RestaurantResponse> createRestaurant(RestaurantRequest req,
                                                             Authentication auth) {
        User owner = getUser(auth.getName());

        Restaurant restaurant = Restaurant.builder()
            .name(req.getName())
            .address(req.getAddress())
            .city(req.getCity())
            .cuisine(req.getCuisine())
            .description(req.getDescription())
            .phone(req.getPhone())
            .email(req.getEmail())
            .imageUrl(req.getImageUrl())
            .openingTime(req.getOpeningTime())
            .closingTime(req.getClosingTime())
            .owner(owner)
            .build();

        restaurantRepository.save(restaurant);
        log.info("Restaurant created: '{}' by {}", restaurant.getName(), owner.getEmail());
        return ApiResponse.success("Restaurant created successfully", toResponse(restaurant));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "restaurant",  key = "#id"),
        @CacheEvict(value = "restaurants", allEntries = true)
    })
    public ApiResponse<RestaurantResponse> updateRestaurant(Long id, RestaurantRequest req,
                                                             Authentication auth) {
        Restaurant restaurant = findAndAuthorize(id, auth);

        restaurant.setName(req.getName());
        restaurant.setAddress(req.getAddress());
        restaurant.setCity(req.getCity());
        restaurant.setCuisine(req.getCuisine());
        restaurant.setDescription(req.getDescription());
        restaurant.setPhone(req.getPhone());
        restaurant.setEmail(req.getEmail());
        restaurant.setImageUrl(req.getImageUrl());
        restaurant.setOpeningTime(req.getOpeningTime());
        restaurant.setClosingTime(req.getClosingTime());

        restaurantRepository.save(restaurant);
        log.info("Restaurant updated: id={}", id);
        return ApiResponse.success("Restaurant updated successfully", toResponse(restaurant));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "restaurant",  key = "#id"),
        @CacheEvict(value = "restaurants", allEntries = true)
    })
    public ApiResponse<Void> deleteRestaurant(Long id, Authentication auth) {
        Restaurant restaurant = findAndAuthorize(id, auth);
        restaurant.setActive(false);   // soft delete
        restaurantRepository.save(restaurant);
        log.info("Restaurant soft-deleted: id={}", id);
        return ApiResponse.success("Restaurant deleted successfully", null);
    }

    public List<RestaurantResponse> getMyRestaurants(Authentication auth) {
        User owner = getUser(auth.getName());
        return restaurantRepository.findByOwnerAndActiveTrue(owner)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Table management ──────────────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = "restaurant", key = "#restaurantId")
    public ApiResponse<TableResponse> addTable(Long restaurantId, TableRequest req,
                                               Authentication auth) {
        Restaurant restaurant = findAndAuthorize(restaurantId, auth);

        RestaurantTable table = RestaurantTable.builder()
            .tableNumber(req.getTableNumber())
            .capacity(req.getCapacity())
            .tableType(req.getTableType())
            .available(req.isAvailable())
            .restaurant(restaurant)
            .build();

        tableRepository.save(table);
        restaurant.setTotalTables(restaurant.getTotalTables() + 1);
        restaurantRepository.save(restaurant);

        log.info("Table #{} added to restaurant id={}", req.getTableNumber(), restaurantId);
        return ApiResponse.success("Table added successfully", toTableResponse(table));
    }

    @Transactional
    @CacheEvict(value = "restaurant", key = "#restaurantId")
    public ApiResponse<TableResponse> updateTable(Long restaurantId, Long tableId,
                                                   TableRequest req, Authentication auth) {
        findAndAuthorize(restaurantId, auth);
        RestaurantTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new ResourceNotFoundException("Table", "id", tableId));

        table.setCapacity(req.getCapacity());
        table.setTableType(req.getTableType());
        table.setAvailable(req.isAvailable());
        tableRepository.save(table);
        return ApiResponse.success("Table updated", toTableResponse(table));
    }

    public List<TableResponse> getTablesByRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findByIdAndActiveTrue(restaurantId)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));
        return tableRepository.findByRestaurant(restaurant)
            .stream().map(this::toTableResponse).collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Restaurant findAndAuthorize(Long id, Authentication auth) {
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));

        boolean isAdmin = auth.getAuthorities()
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isAdmin && !restaurant.getOwner().getEmail().equals(auth.getName())) {
            throw new UnauthorizedException("You are not the owner of this restaurant");
        }
        return restaurant;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
            .id(r.getId())
            .name(r.getName())
            .address(r.getAddress())
            .city(r.getCity())
            .cuisine(r.getCuisine())
            .description(r.getDescription())
            .phone(r.getPhone())
            .email(r.getEmail())
            .imageUrl(r.getImageUrl())
            .averageRating(r.getAverageRating())
            .totalTables(r.getTotalTables())
            .openingTime(r.getOpeningTime())
            .closingTime(r.getClosingTime())
            .active(r.isActive())
            .ownerName(r.getOwner().getFullName())
            .ownerId(r.getOwner().getId())
            .createdAt(r.getCreatedAt())
            .build();
    }

    private TableResponse toTableResponse(RestaurantTable t) {
        return TableResponse.builder()
            .id(t.getId())
            .tableNumber(t.getTableNumber())
            .capacity(t.getCapacity())
            .tableType(t.getTableType())
            .available(t.isAvailable())
            .restaurantId(t.getRestaurant().getId())
            .restaurantName(t.getRestaurant().getName())
            .build();
    }
}

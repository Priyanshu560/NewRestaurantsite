package com.restaurant.booking.service;

import com.restaurant.booking.dto.request.LoginRequest;
import com.restaurant.booking.dto.request.RegisterRequest;
import com.restaurant.booking.dto.response.ApiResponse;
import com.restaurant.booking.dto.response.JwtResponse;
import com.restaurant.booking.entity.Role;
import com.restaurant.booking.entity.Role.ERole;
import com.restaurant.booking.entity.User;
import com.restaurant.booking.exception.BadRequestException;
import com.restaurant.booking.repository.RoleRepository;
import com.restaurant.booking.repository.UserRepository;
import com.restaurant.booking.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository        userRepository;
    private final RoleRepository        roleRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtTokenProvider      jwtTokenProvider;

    // ── Register ──────────────────────────────────────────────────────────────
    @Transactional
    public ApiResponse<JwtResponse> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email is already in use: " + req.getEmail());
        }
        if (req.getPhone() != null && userRepository.existsByPhone(req.getPhone())) {
            throw new BadRequestException("Phone number is already registered");
        }

        Set<Role> roles = resolveRoles(req.getRoles());

        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .roles(roles)
            .build();

        userRepository.save(user);
        log.info("New user registered: {} with roles {}", user.getEmail(), roles);

        // Auto-login after registration
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        return ApiResponse.success("Registration successful",
            buildJwtResponse(auth, user));
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public ApiResponse<JwtResponse> login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));

        log.info("User logged in: {}", req.getEmail());
        return ApiResponse.success("Login successful", buildJwtResponse(auth, user));
    }

    // ── Refresh token ─────────────────────────────────────────────────────────
    public ApiResponse<JwtResponse> refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("User not found"));

        String newAccessToken  = jwtTokenProvider.generateAccessToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name())
            .collect(Collectors.toList());

        JwtResponse response = JwtResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(roles)
            .build();

        return ApiResponse.success("Token refreshed", response);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private JwtResponse buildJwtResponse(Authentication auth, User user) {
        String accessToken  = jwtTokenProvider.generateAccessToken(auth);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        List<String> roles = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        return JwtResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .roles(roles)
            .build();
    }

    /**
     * Resolves requested roles from string set.
     * Clients may only request CUSTOMER or OWNER.
     * ADMIN is never self-assigned.
     */
    private Set<Role> resolveRoles(Set<String> requestedRoles) {
        Set<Role> roles = new HashSet<>();

        if (requestedRoles == null || requestedRoles.isEmpty()) {
            roles.add(findRole(ERole.ROLE_CUSTOMER));
        } else {
            for (String roleName : requestedRoles) {
                switch (roleName.toUpperCase()) {
                    case "OWNER"         -> roles.add(findRole(ERole.ROLE_OWNER));
                    case "CUSTOMER"      -> roles.add(findRole(ERole.ROLE_CUSTOMER));
                    // silently ignore any attempt to self-assign ADMIN
                    default              -> roles.add(findRole(ERole.ROLE_CUSTOMER));
                }
            }
        }
        return roles;
    }

    private Role findRole(ERole eRole) {
        return roleRepository.findByName(eRole)
            .orElseThrow(() -> new RuntimeException("Role not found: " + eRole));
    }
}

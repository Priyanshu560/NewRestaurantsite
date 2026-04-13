package com.restaurant.booking.util;

import com.restaurant.booking.entity.Role;
import com.restaurant.booking.entity.Role.ERole;
import com.restaurant.booking.entity.User;
import com.restaurant.booking.repository.RoleRepository;
import com.restaurant.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository  roleRepository;
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
    }

    private void seedRoles() {
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(Role.builder().name(eRole).build());
                log.info("Seeded role: {}", eRole);
            }
        }
    }

    private void seedAdminUser() {
        String adminEmail = "admin@restaurant.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found after seeding"));

            User admin = User.builder()
                .fullName("System Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode("Admin@1234"))
                .phone("+1234567890")
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

            userRepository.save(admin);
            log.info("Default admin user created: {} / Admin@1234", adminEmail);
            log.warn("IMPORTANT: Change the default admin password immediately in production!");
        }
    }
}

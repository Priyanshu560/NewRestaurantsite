package com.restaurant.booking.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "Restaurant Booking API",
        version     = "1.0.0",
        description = "Production-ready REST API for the Restaurant Booking System",
        contact     = @Contact(name = "Restaurant Team", email = "api@restaurant.com"),
        license     = @License(name = "MIT")
    ),
    servers = {
        @Server(url = "/api", description = "Local / Docker"),
        @Server(url = "https://api.your-domain.com/api", description = "Production AWS")
    },
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name         = "bearerAuth",
    type         = SecuritySchemeType.HTTP,
    scheme       = "bearer",
    bearerFormat = "JWT",
    in           = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {
    // All configuration is annotation-driven via springdoc-openapi
}

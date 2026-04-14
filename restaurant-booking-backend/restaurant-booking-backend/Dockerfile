# ── Stage 1: Build ─────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# 👇 IMPORTANT: correct path
COPY restaurant-booking-backend/restaurant-booking-backend/pom.xml .

RUN mvn -B dependency:go-offline

COPY restaurant-booking-backend/restaurant-booking-backend/src ./src

RUN mvn -B clean package -DskipTests

# ── Stage 2: Run ───────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

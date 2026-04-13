# ── Stage 1: Build ────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy pom first (layer-cache dependencies)
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Copy source and build
COPY src/ src/
RUN mvn -q -B package -DskipTests

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/restaurant-booking-*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

-- ============================================================
-- Restaurant Booking System – MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurant_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE restaurant_db;

-- ── roles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id   TINYINT      UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20)  NOT NULL UNIQUE
);

-- Seed roles
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_CUSTOMER'),
    ('ROLE_OWNER'),
    ('ROLE_ADMIN');

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT        UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    phone       VARCHAR(15)   UNIQUE,
    enabled     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email  (email),
    INDEX idx_users_phone  (phone)
);

-- ── user_roles (join table) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT   UNSIGNED NOT NULL,
    role_id TINYINT  UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users  (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles  (id) ON DELETE CASCADE
);

-- ── restaurants ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
    id              BIGINT         UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)   NOT NULL,
    address         VARCHAR(255)   NOT NULL,
    city            VARCHAR(100)   NOT NULL,
    cuisine         VARCHAR(50)    NOT NULL,
    description     TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(150),
    image_url       VARCHAR(255),
    average_rating  DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
    total_tables    INT            NOT NULL DEFAULT 0,
    opening_time    VARCHAR(5),         -- HH:mm
    closing_time    VARCHAR(5),         -- HH:mm
    active          TINYINT(1)     NOT NULL DEFAULT 1,
    owner_id        BIGINT         UNSIGNED NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rest_owner FOREIGN KEY (owner_id) REFERENCES users (id),
    INDEX idx_rest_city    (city),
    INDEX idx_rest_cuisine (cuisine),
    INDEX idx_rest_active  (active),
    INDEX idx_rest_owner   (owner_id)
);

-- ── restaurant_tables ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id            BIGINT    UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    table_number  INT       NOT NULL,
    capacity      INT       NOT NULL,
    table_type    ENUM('STANDARD','WINDOW','OUTDOOR','PRIVATE','VIP')
                            NOT NULL DEFAULT 'STANDARD',
    available     TINYINT(1) NOT NULL DEFAULT 1,
    restaurant_id BIGINT    UNSIGNED NOT NULL,
    CONSTRAINT fk_rt_restaurant FOREIGN KEY (restaurant_id)
        REFERENCES restaurants (id) ON DELETE CASCADE,
    UNIQUE KEY uq_table_per_restaurant (restaurant_id, table_number),
    INDEX idx_rt_restaurant (restaurant_id),
    INDEX idx_rt_available  (restaurant_id, available)
);

-- ── bookings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id                BIGINT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20)     NOT NULL UNIQUE,
    customer_id       BIGINT          UNSIGNED NOT NULL,
    restaurant_id     BIGINT          UNSIGNED NOT NULL,
    table_id          BIGINT          UNSIGNED NOT NULL,
    booking_date      DATE            NOT NULL,
    start_time        TIME            NOT NULL,
    end_time          TIME            NOT NULL,
    guest_count       INT             NOT NULL,
    status            ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW')
                                      NOT NULL DEFAULT 'PENDING',
    special_requests  TEXT,
    deposit_amount    DECIMAL(10,2),
    payment_status    ENUM('PENDING','PAID','REFUNDED','FAILED')
                                      NOT NULL DEFAULT 'PENDING',
    transaction_id    VARCHAR(100),
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_book_customer   FOREIGN KEY (customer_id)   REFERENCES users             (id),
    CONSTRAINT fk_book_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants       (id),
    CONSTRAINT fk_book_table      FOREIGN KEY (table_id)      REFERENCES restaurant_tables (id),
    -- Critical index for double-booking prevention query
    INDEX idx_book_slot          (table_id, booking_date, start_time, end_time),
    INDEX idx_book_customer      (customer_id),
    INDEX idx_book_restaurant    (restaurant_id),
    INDEX idx_book_date          (booking_date),
    INDEX idx_book_reference     (booking_reference)
);

-- ── reviews ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id            BIGINT    UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id   BIGINT    UNSIGNED NOT NULL,
    restaurant_id BIGINT    UNSIGNED NOT NULL,
    booking_id    BIGINT    UNSIGNED,
    rating        TINYINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    visible       TINYINT(1) NOT NULL DEFAULT 1,
    created_at    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rev_customer   FOREIGN KEY (customer_id)   REFERENCES users       (id),
    CONSTRAINT fk_rev_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (id),
    CONSTRAINT fk_rev_booking    FOREIGN KEY (booking_id)    REFERENCES bookings    (id),
    -- One review per booking per customer
    UNIQUE KEY uq_review_per_booking (customer_id, restaurant_id, booking_id),
    INDEX idx_rev_restaurant (restaurant_id),
    INDEX idx_rev_customer   (customer_id)
);

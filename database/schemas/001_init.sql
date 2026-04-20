-- 1. Create database if not exists
CREATE DATABASE IF NOT EXISTS prison_db;

-- 2. Select it
USE prison_db;

-- 3. Example table
CREATE TABLE super_admin (
    national_id     VARCHAR(20)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    address         TEXT            NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL
);

CREATE TABLE prison (
    prison_id               SERIAL          PRIMARY KEY,
    name                    VARCHAR(150)    NOT NULL,
    location                VARCHAR(100)    NOT NULL,          -- City / Governorate
    type                    VARCHAR(50)     NOT NULL           -- Maximum Security | Minimum Security | Remand | Juvenile | Women's
                            CHECK (type IN ('Maximum Security','Minimum Security','Remand','Juvenile','Women''s')),
    security_level          VARCHAR(50)     NOT NULL,
    total_capacity          INTEGER         NOT NULL CHECK (total_capacity > 0),
    current_occupancy       INTEGER         NOT NULL DEFAULT 0
                            CHECK (current_occupancy >= 0),
    -- Facility feature flags
    has_infirmary           BOOLEAN         NOT NULL DEFAULT FALSE,
    has_workshops           BOOLEAN         NOT NULL DEFAULT FALSE,
    has_agricultural_ward   BOOLEAN         NOT NULL DEFAULT FALSE,
    has_visitation_hall     BOOLEAN         NOT NULL DEFAULT FALSE,
    visitation_hall_capacity INTEGER                 DEFAULT NULL,  -- NULL when flag is FALSE
    -- Manager assigned after OFFICER table is created
    manager_id              VARCHAR(20)             DEFAULT NULL    -- FK added below
);
-- 3. Example table
CREATE TABLE IF NOT EXISTS super_admin (
    national_id     TEXT            PRIMARY KEY,
    name            TEXT    NOT NULL,
    phone           TEXT     NOT NULL,
    address         TEXT            NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS prison (
    prison_id               INTEGER          PRIMARY KEY AUTOINCREMENT,
    name                    TEXT    NOT NULL,
    location                TEXT    NOT NULL,          -- City / Governorate
    type                    TEXT     NOT NULL           -- Maximum Security | Minimum Security | Remand | Juvenile | Women's
                            CHECK (type IN ('Maximum Security','Minimum Security','Remand','Juvenile','Women''s')),
    security_level          TEXT     NOT NULL,
    total_capacity          INTEGER         NOT NULL CHECK (total_capacity > 0),
    current_occupancy       INTEGER         NOT NULL DEFAULT 0
                            CHECK (current_occupancy >= 0),
    -- Facility feature flags
    has_infirmary           INTEGER         NOT NULL DEFAULT 0,
    has_workshops           INTEGER         NOT NULL DEFAULT 0,
    has_agricultural_ward   INTEGER         NOT NULL DEFAULT 0,
    has_visitation_hall     INTEGER         NOT NULL DEFAULT 0,
    visitation_hall_capacity INTEGER                 DEFAULT NULL,  -- NULL when flag is FALSE
    -- Manager assigned after OFFICER table is created
    manager_id              TEXT             DEFAULT NULL    -- FK added below
);

CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
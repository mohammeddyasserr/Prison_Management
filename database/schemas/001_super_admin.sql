-- 3. Example table
CREATE TABLE super_admin (
    national_id     CHAR(14)    PRIMARY KEY,
    name            VARCHAR(50)    NOT NULL,
    phone           CHAR(11)    NOT NULL UNIQUE,
    address         VARCHAR(100)   NOT NULL,
    email           VARCHAR(100)   NOT NULL UNIQUE,
    password_hash   TEXT           NOT NULL
);

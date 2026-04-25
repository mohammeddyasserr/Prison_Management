-- 3. Example table
CREATE TABLE super_admin (
    national_id     VARCHAR(14)    PRIMARY KEY,
    name            VARCHAR(50)    NOT NULL,
    phone           VARCHAR(11)    NOT NULL,
    address         VARCHAR(100)   NOT NULL,
    email           VARCHAR(100)   NOT NULL UNIQUE,
    password_hash   TEXT           NOT NULL
);

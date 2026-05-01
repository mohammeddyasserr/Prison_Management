CREATE TABLE officer (
    national_id     CHAR(14)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    phone           CHAR(11)     NOT NULL,
    address         TEXT            NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,

    prison_id       INTEGER         NOT NULL REFERENCES prison(prison_id) ON DELETE RESTRICT
);

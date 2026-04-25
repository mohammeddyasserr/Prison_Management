CREATE TABLE doctor (
    national_id     VARCHAR(20)     PRIMARY KEY,
    prison_id       INTEGER         NOT NULL REFERENCES prison(prison_id) ON DELETE RESTRICT,
    name            VARCHAR(100)    NOT NULL,
    address         TEXT,
    phone           VARCHAR(11)     NOT NULL
);

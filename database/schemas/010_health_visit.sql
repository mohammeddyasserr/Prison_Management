CREATE TABLE health_visit (
    visit_id        INTEGER         PRIMARY KEY AUTOINCREMENT,
    inmate_id       INTEGER         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    doctor_id       INTEGER         NOT NULL REFERENCES doctor(national_id) ON DELETE RESTRICT,
    visit_datetime  TIMESTAMP       NOT NULL,
    diagnosis       TEXT            NOT NULL
);

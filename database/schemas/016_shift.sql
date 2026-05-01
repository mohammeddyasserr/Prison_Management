CREATE TABLE Shift (
    shift_id        INTEGER         PRIMARY KEY AUTOINCREMENT,
    shift_type      VARCHAR(20)     NOT NULL
                    CHECK (shift_type IN ('Morning','Afternoon','Night')),
    officer_id      CHAR(14)         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    manager_id      CHAR(14)         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT
);

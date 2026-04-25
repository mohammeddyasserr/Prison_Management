CREATE TABLE Shift (
    shift_id        INTEGER         PRIMARY KEY AUTOINCREMENT,
    shift_type      VARCHAR(20)     NOT NULL
                    CHECK (shift_type IN ('Morning','Afternoon','Night')),
    officer_id      INTEGER         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    manager_id      INTEGER         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT
);

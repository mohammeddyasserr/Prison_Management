CREATE TABLE Shift (
    shift_id        INTEGER         PRIMARY KEY AUTOINCREMENT,
    shift_type      VARCHAR(20)     NOT NULL
                    CHECK (shift_type IN ('Morning','Afternoon','Night')),
    officer_id      VARCHAR(14)         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    manager_id      VARCHAR(14)         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    block_id        INTEGER         NOT NULL REFERENCES block(block_id) ON DELETE CASCADE,
    date            DATE            NOT NULL
);

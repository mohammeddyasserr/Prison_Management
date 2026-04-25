CREATE TABLE transfer (
    transfer_id         INTEGER         PRIMARY KEY AUTOINCREMENT,
    inmate_id           Integer         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    requesting_prison   INTEGER         NOT NULL REFERENCES prison(prison_id) ON DELETE RESTRICT,
    destination_prison  INTEGER         NOT NULL REFERENCES prison(prison_id) ON DELETE RESTRICT,
    manager_id          INTEGER         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    reason              TEXT            NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Pending','Approved','Denied')),
    requested_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by         INTEGER         REFERENCES super_admin(national_id) ON DELETE SET NULL,
    approval_date       DATE,
    CONSTRAINT chk_different_prisons CHECK (requesting_prison <> destination_prison)
);

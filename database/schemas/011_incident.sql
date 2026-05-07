CREATE TABLE incident (
    incident_id         INTEGER          PRIMARY KEY AUTOINCREMENT,
    type                VARCHAR(50)     NOT NULL
                        CHECK (type IN ('Fight','Self-Harm','Escape Attempt',
                                        'Property Damage','Assault on Staff','Other')),
    block_id            INTEGER         REFERENCES block(block_id) ON DELETE SET NULL,

    occurred_at         TIMESTAMP       NOT NULL,
    reporting_officer   INTEGER         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    description         TEXT,
    action_taken        TEXT            NOT NULL
);

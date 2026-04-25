CREATE TABLE disciplinary_log (
    inmate_id           INTEGER         NOT NULL REFERENCES inmate(inmate_id)   ON DELETE RESTRICT,
    incident_id         INTEGER         REFERENCES incident(incident_id)         ON DELETE SET NULL,
    imposed_by          INTEGER         NOT NULL REFERENCES officer(national_id) ON DELETE RESTRICT,
    punishment_type VARCHAR(80) NOT NULL
                                CHECK (punishment_type IN (
                                'Loss of Privileges',
                                'Solitary Confinement',
                                'Transfer to High-Security',
                                'Other')),
    solitary_days       INTEGER         CHECK (solitary_days BETWEEN 1 AND 30), -- system-enforced 30-day cap
    date_imposed        DATE            NOT NULL,
    notes               TEXT,
    PRIMARY KEY (inmate_id,imposed_by, incident_id)
);

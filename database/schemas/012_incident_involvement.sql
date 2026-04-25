CREATE TABLE incident_involvement (
    incident_id     INTEGER         NOT NULL REFERENCES incident(incident_id) ON DELETE CASCADE,
    inmate_id       INTEGER         NOT NULL REFERENCES inmate(inmate_id)     ON DELETE CASCADE,
    PRIMARY KEY (incident_id, inmate_id)
);

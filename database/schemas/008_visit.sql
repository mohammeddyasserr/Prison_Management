CREATE TABLE visit (
    visit_id            INTEGER         PRIMARY KEY AUTOINCREMENT,
    visit_type          VARCHAR(20)     NOT NULL DEFAULT 'Regular'
                        CHECK (visit_type IN ('Regular','Legal')),
    visit_date          DATE            NOT NULL,
    --time_slot           VARCHAR(50)     NOT NULL,           -- pre-defined slot label

    inmate_id           INTEGER         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    visitor_id          INTEGER         NOT NULL REFERENCES visitor(national_id) ON DELETE RESTRICT,

    duration_minutes    INTEGER         NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
    status              VARCHAR(20)     NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Pending','Approved','Denied')),
    denial_reason       TEXT

);

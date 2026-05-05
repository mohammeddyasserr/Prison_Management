CREATE TABLE timeslot (
    date     DATE         PRIMARY KEY,
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL
);

CREATE TABLE visit (
    visit_id            INTEGER         PRIMARY KEY AUTOINCREMENT,
    visit_type          VARCHAR(20)     NOT NULL DEFAULT 'Regular'
                        CHECK (visit_type IN ('Regular','Legal')),
    visit_date          DATE            NOT NULL REFERENCES timeslot(date) ON DELETE RESTRICT,
    inmate_id           INTEGER         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    visitor_id          VARCHAR(20)     NOT NULL REFERENCES visitor(national_id) ON DELETE RESTRICT,

    status              VARCHAR(20)     NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Pending','Approved','Denied')),
    denial_reason       TEXT
);

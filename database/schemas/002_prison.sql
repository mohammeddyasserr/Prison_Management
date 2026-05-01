CREATE TABLE prison (
    prison_id               INTEGER        PRIMARY KEY AUTOINCREMENT,
    name                    VARCHAR(50)    NOT NULL,
    type                    VARCHAR(50)    NOT NULL           -- Maximum Security | Minimum Security | Remand | Juvenile | Women's
                            CHECK (type IN ('Maximum Security','Minimum Security','Remand','Juvenile','Women''s')),
    security_level          VARCHAR(50)         NOT NULL
                            CHECK (security_level IN ('High','Medium','Low')),
    location                VARCHAR(100)    NOT NULL,          -- City / Governorate
    manager_id              VARCHAR(14)         REFERENCES officer(national_id) ON DELETE SET NULL,
    -- Facility feature flags
    has_hospital            BOOLEAN         NOT NULL DEFAULT 0,
    has_workshops           BOOLEAN         NOT NULL DEFAULT 0,
    has_agricultural_ward   BOOLEAN         NOT NULL DEFAULT 0,
    has_visitation_hall     BOOLEAN         NOT NULL DEFAULT 0,

    visitation_hall_capacity INTEGER        DEFAULT NULL  -- NULL when flag is FALSE
    -- Manager assigned after OFFICER table is created
    -- manager_id              TEXT            DEFAULT NULL    -- FK added below
);

CREATE TABLE visitor (
    national_id     CHAR(20)     PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    relationship    VARCHAR(30)     NOT NULL
                    CHECK (relationship IN ('Spouse','Parent','Sibling','Friend','Lawyer','Other')),
    phone           CHAR(11)     NOT NULL,
    email           VARCHAR(100)
);

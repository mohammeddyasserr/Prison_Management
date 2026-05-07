ALTER TABLE inmate RENAME TO inmate_old;

CREATE TABLE inmate (
    inmate_id               INTEGER         PRIMARY KEY,
    national_id             VARCHAR(14)     NOT NULL UNIQUE,
    full_name               VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NOT NULL,
    gender                  VARCHAR(10)     NOT NULL CHECK (gender IN ('Male','Female','Other')),
    nationality             VARCHAR(80)     NOT NULL,
    occupation              VARCHAR(100),
    start_date              DATE            NOT NULL,
    education_level         VARCHAR(50)     NOT NULL CHECK (education_level IN ('Illiterate','Literate', 'Primary','Preparatory', 'Secondary', 'Bachelor''s','Postgraduate education')),
    assigned_cell           INTEGER         REFERENCES cell(cell_id)     ON DELETE SET NULL,
    assigned_prison         INTEGER         REFERENCES prison(prison_id) ON DELETE SET NULL,
    status                  VARCHAR(20)     DEFAULT 'Active' CHECK (status IN ('Active','Released','Transferred'))
);

INSERT INTO inmate SELECT * FROM inmate_old;

DROP TABLE inmate_old;

ALTER TABLE pending_inmate RENAME TO pending_inmate_old;

CREATE TABLE pending_inmate (
    pending_inmate_id       INTEGER         PRIMARY KEY,
    national_id             VARCHAR(14)     NOT NULL UNIQUE,
    full_name               VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NOT NULL,
    gender                  VARCHAR(10)     NOT NULL CHECK (gender IN ('Male','Female','Other')),
    nationality             VARCHAR(80)     NOT NULL,
    occupation              VARCHAR(100),
    start_date              DATE            NOT NULL,
    education_level         VARCHAR(50)     NOT NULL CHECK (education_level IN ('Illiterate','Literate', 'Primary','Preparatory', 'Secondary', 'Bachelor''s','Postgraduate education')),
    assigned_prison         INTEGER         REFERENCES prison(prison_id) ON DELETE SET NULL,
    status                  VARCHAR(20)     DEFAULT 'Active' CHECK (status IN ('Active','Released','Transferred'))
);

INSERT INTO pending_inmate SELECT * FROM pending_inmate_old;

DROP TABLE pending_inmate_old;

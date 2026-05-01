CREATE TABLE legal_case (
    case_number         INTEGER     PRIMARY KEY AUTOINCREMENT,
    crime_type          VARCHAR(100)    NOT NULL 
                                        CHECK (crime_type IN (
                                            'Theft',
                                            'Burglary',
                                            'Robbery',
                                            'Fraud',
                                            'Assault',
                                            'Murder',
                                            'Drug Offense',
                                            'Sexual Offense',
                                            'Kidnapping',
                                            'Arson',
                                            'Vandalism',
                                            'Cybercrime',
                                            'Weapons Offense',
                                            'Public Order'
                                            )),

    inmate_id           INTEGER         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    court_name          VARCHAR(150)    NOT NULL,
    sentence_duration_years    INTEGER         NOT NULL,           -- e.g. years
    sentence_duration_months   INTEGER         NOT NULL,           -- e.g. months
    sentence_duration_days     INTEGER         NOT NULL            -- e.g. days
);

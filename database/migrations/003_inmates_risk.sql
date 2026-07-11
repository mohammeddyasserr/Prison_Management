CREATE TABLE inmates_risk (
    inmate_id           INTEGER         NOT NULL REFERENCES inmate(inmate_id) ON DELETE CASCADE,
    risk_level VARCHAR(50)     CHECK (risk_level IN ('High','Medium','Low')),
    recidivism Int
);

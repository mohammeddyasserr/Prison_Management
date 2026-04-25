CREATE TABLE block (
    block_id            INTEGER         PRIMARY KEY AUTOINCREMENT,
    prison_id           INTEGER         NOT NULL REFERENCES prison(prison_id) ON DELETE CASCADE,
    security_level      VARCHAR(50)     NOT NULL CHECK (security_level IN ('High','Medium','Low'))
);

CREATE TABLE overcrowding (
    prison_id     INTEGER    NOT NULL REFERENCES prison(prison_id) ON DELETE CASCADE,
    occupancy_next_30_days INT,
    occupancy_next_60_days INT,
    occupancy_next_90_days INT
);
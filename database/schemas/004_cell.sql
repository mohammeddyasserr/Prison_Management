CREATE TABLE cell (
    cell_id             INTEGER         PRIMARY KEY AUTOINCREMENT,
    block_id            INTEGER         NOT NULL REFERENCES block(block_id) ON DELETE CASCADE,
    capacity            INTEGER         NOT NULL CHECK (capacity > 0)
);

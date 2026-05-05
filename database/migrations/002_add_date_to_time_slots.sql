ALTER TABLE time_slots ADD COLUMN date DATE;
ALTER TABLE time_slots ADD CONSTRAINT unique_date_time_slot UNIQUE (date, start_time, end_time);

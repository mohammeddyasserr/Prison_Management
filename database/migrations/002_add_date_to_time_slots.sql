ALTER TABLE timeslot ADD COLUMN date DATE;
ALTER TABLE timeslot ADD CONSTRAINT unique_date_timeslot UNIQUE (date, start_time, end_time);

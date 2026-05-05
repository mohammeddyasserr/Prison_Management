-- Seed timeslots first
INSERT INTO timeslot (label, start_time, end_time, date)
VALUES
('09:00 - 09:30', '09:00', '09:30', '2024-03-01'),
('09:30 - 10:00', '09:30', '10:00', '2024-03-01'),
('10:00 - 10:30', '10:00', '10:30', '2024-03-01'),
('10:30 - 11:00', '10:30', '11:00', '2024-03-01'),
('11:00 - 11:30', '11:00', '11:30', '2024-03-01'),
('13:00 - 13:30', '13:00', '13:30', '2024-03-01'),
('13:30 - 14:00', '13:30', '14:00', '2024-03-01'),
('14:00 - 14:30', '14:00', '14:30', '2024-03-01'),
('14:30 - 15:00', '14:30', '15:00', '2024-03-01');

-- Seed visits (removed duration_minutes, added timeslot_id)
INSERT INTO visit (visit_type, visit_date, timeslot_id, inmate_id, visitor_id, status, denial_reason)
VALUES
('Regular', '2024-03-01', 1, 1,  '22222222222222', 'Approved', NULL),
('Legal',   '2024-03-05', 3, 4,  '23232323232323', 'Approved', NULL),
('Regular', '2024-03-10', 2, 2,  '21212121212121', 'Pending',  NULL),
('Regular', '2024-03-15', 4, 3,  '21212121212121', 'Denied',   'Visitor banned from entry.'),
('Regular', '2024-03-16', 5, 5,  '24242424242424', 'Approved', NULL),
('Legal',   '2024-03-17', 6, 6,  '29292929292929', 'Approved', NULL),
('Regular', '2024-03-18', 1, 7,  '26262626262626', 'Pending',  NULL),
('Regular', '2024-03-19', 2, 8,  '27272727272727', 'Approved', NULL),
('Regular', '2024-03-20', 3, 9,  '28282828282828', 'Approved', NULL),
('Regular', '2024-03-21', 4, 10, '30303030303030', 'Denied',   'Inmate in solitary.'),
('Legal',   '2024-03-22', 7, 11, '29292929292929', 'Approved', NULL),
('Regular', '2024-03-23', 5, 12, '31313131313131', 'Approved', NULL),
('Regular', '2024-03-24', 6, 13, '33333333333333', 'Pending',  NULL),
('Regular', '2024-03-25', 8, 14, '34343434343434', 'Approved', NULL),
('Regular', '2024-03-26', 9, 15, '35353535353535', 'Approved', NULL);

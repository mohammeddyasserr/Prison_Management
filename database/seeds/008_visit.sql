-- Seed timeslots first
INSERT INTO timeslot (date, start_time, end_time)
VALUES
('2024-03-01', '09:00', '09:30'),
('2024-03-05', '10:00', '10:30'),
('2024-03-10', '09:30', '10:00'),
('2024-03-15', '10:30', '11:00'),
('2024-03-16', '11:00', '11:30'),
('2024-03-17', '13:00', '13:30'),
('2024-03-18', '09:00', '09:30'),
('2024-03-19', '09:30', '10:00'),
('2024-03-20', '10:00', '10:30'),
('2024-03-21', '10:30', '11:00'),
('2024-03-22', '13:30', '14:00'),
('2024-03-23', '11:00', '11:30'),
('2024-03-24', '13:00', '13:30'),
('2024-03-25', '14:00', '14:30'),
('2024-03-26', '14:30', '15:00');

-- Seed visits (removed duration_minutes, added timeslot_id)
INSERT INTO visit (visit_type, visit_date, inmate_id, visitor_id, status, denial_reason)
VALUES
('Regular', '2024-03-01', 1,  '22222222222222', 'Approved', NULL),
('Legal',   '2024-03-05', 4,  '23232323232323', 'Approved', NULL),
('Regular', '2024-03-10', 2,  '21212121212121', 'Pending',  NULL),
('Regular', '2024-03-15', 3,  '21212121212121', 'Denied',   'Visitor banned from entry.'),
('Regular', '2024-03-16', 5,  '24242424242424', 'Approved', NULL),
('Legal',   '2024-03-17', 6,  '29292929292929', 'Approved', NULL),
('Regular', '2024-03-18', 7,  '26262626262626', 'Pending',  NULL),
('Regular', '2024-03-19', 8,  '27272727272727', 'Approved', NULL),
('Regular', '2024-03-20', 9,  '28282828282828', 'Approved', NULL),
('Regular', '2024-03-21', 10, '30303030303030', 'Denied',   'Inmate in solitary.'),
('Legal',   '2024-03-22', 11, '29292929292929', 'Approved', NULL),
('Regular', '2024-03-23', 12, '31313131313131', 'Approved', NULL),
('Regular', '2024-03-24', 13, '33333333333333', 'Pending',  NULL),
('Regular', '2024-03-25', 14, '34343434343434', 'Approved', NULL),
('Regular', '2024-03-26', 15, '35353535353535', 'Approved', NULL);

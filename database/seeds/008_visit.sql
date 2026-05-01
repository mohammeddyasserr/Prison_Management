INSERT INTO visit (visit_type, visit_date, inmate_id, visitor_id, duration_minutes, status, denial_reason)
VALUES
('Regular', '2024-03-01', 1, '22222222222222', 30, 'Approved', NULL),
('Legal', '2024-03-05', 4, '23232323232323', 60, 'Approved', NULL),
('Regular', '2024-03-10', 2, '21212121212121', 30, 'Pending', NULL),
('Regular', '2024-03-15', 3, '21212121212121', 30, 'Denied', 'Visitor banned from entry.'),
('Regular', '2024-03-16', 5, '24242424242424', 45, 'Approved', NULL),
('Legal', '2024-03-17', 6, '29292929292929', 60, 'Approved', NULL),
('Regular', '2024-03-18', 7, '26262626262626', 30, 'Pending', NULL),
('Regular', '2024-03-19', 8, '27272727272727', 30, 'Approved', NULL),
('Regular', '2024-03-20', 9, '28282828282828', 30, 'Approved', NULL),
('Regular', '2024-03-21', 10, '30303030303030', 30, 'Denied', 'Inmate in solitary.'),
('Legal', '2024-03-22', 11, '29292929292929', 90, 'Approved', NULL),
('Regular', '2024-03-23', 12, '31313131313131', 30, 'Approved', NULL),
('Regular', '2024-03-24', 13, '33333333333333', 30, 'Pending', NULL),
('Regular', '2024-03-25', 14, '34343434343434', 45, 'Approved', NULL),
('Regular', '2024-03-26', 15, '35353535353535', 30, 'Approved', NULL);

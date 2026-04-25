INSERT INTO transfer (inmate_id, requesting_prison, destination_prison, manager_id, reason, status, requested_at, approval_date)
VALUES
(3, 3, 1, 'OFC-03', 'Security level adjusted to lower risk.', 'Approved', '2024-03-25 10:00:00', '2024-03-26'),
(8, 8, 4, 'OFC-08', 'Requires specialized medical care.', 'Pending', '2024-03-26 12:00:00', NULL),
(15, 15, 5, 'OFC-15', 'Overcrowding at current facility.', 'Approved', '2024-03-27 14:00:00', '2024-03-28'),
(10, 10, 2, 'OFC-10', 'Inmate requested closer loc to family.', 'Denied', '2024-03-28 09:00:00', NULL),
(12, 12, 6, 'OFC-12', 'Involved in gang activities, transferred for safety.', 'Approved', '2024-03-29 11:00:00', '2024-03-30');

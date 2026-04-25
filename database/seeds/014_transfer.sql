INSERT INTO transfer (inmate_id, requesting_prison, destination_prison, manager_id, reason, status, requested_at, approved_by, approval_date)
VALUES
(3, 3, 1, '10000000000003', 'Security level adjusted to lower risk.', 'Approved', '2024-03-25 10:00:00', '1', '2024-03-26'),
(8, 8, 4, '10000000000008', 'Requires specialized medical care.', 'Pending', '2024-03-26 12:00:00', NULL, NULL),
(15, 15, 5, '10000000000015', 'Overcrowding at current facility.', 'Approved', '2024-03-27 14:00:00', '1', '2024-03-28'),
(10, 10, 2, '10000000000010', 'Inmate requested closer loc to family.', 'Denied', '2024-03-28 09:00:00', NULL, NULL),
(12, 12, 6, '10000000000012', 'Involved in gang activities, transferred for safety.', 'Approved', '2024-03-29 11:00:00', '1', '2024-03-30');

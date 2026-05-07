INSERT INTO transfer (
inmate_id,
requesting_prison,
destination_prison,
manager_id,
reason,
status,
requested_at,
approved_by,
approval_date
)
VALUES

-- =====================================================
-- APPROVED TRANSFERS
-- Inmates should currently belong to destination prison
-- =====================================================

(3, 1, 2, '10000000000001',
'Transferred due to rehabilitation program availability.',
'Approved',
'2026-03-02 10:00:00',
'10101010101010',
'2026-03-03'),

(11, 2, 3, '10000000000002',
'Medical monitoring required in specialized facility.',
'Approved',
'2026-03-08 12:30:00',
'10101010101010',
'2026-03-09'),

(18, 3, 5, '10000000000003',
'Security reclassification to higher supervision.',
'Approved',
'2026-03-15 09:45:00',
'10101010101010',
'2026-03-16'),

(27, 4, 1, '10000000000004',
'Overcrowding management transfer.',
'Approved',
'2026-03-20 14:00:00',
'10101010101010',
'2026-03-21'),

(35, 5, 4, '10000000000005',
'Closer access to medical treatment.',
'Approved',
'2026-03-25 16:10:00',
'10101010101010',
'2026-03-26'),

-- =====================================================
-- PENDING TRANSFERS
-- At least one pending request from each prison
-- =====================================================

(5, 1, 3, '10000000000001',
'Behavioral reassessment requested.',
'Pending',
'2026-05-01 11:00:00',
NULL,
NULL),

(7, 1, 4, '10000000000001',
'Family requested closer location.',
'Pending',
'2026-05-03 15:30:00',
NULL,
NULL),

(13, 2, 5, '10000000000002',
'Participation in vocational training.',
'Pending',
'2026-05-02 10:15:00',
NULL,
NULL),

(16, 2, 1, '10000000000002',
'Temporary transfer requested for investigation.',
'Pending',
'2026-05-05 13:20:00',
NULL,
NULL),

(20, 3, 2, '10000000000003',
'Security downgrade under review.',
'Pending',
'2026-05-04 09:10:00',
NULL,
NULL),

(23, 3, 4, '10000000000003',
'Medical examination transfer.',
'Pending',
'2026-05-06 12:40:00',
NULL,
NULL),

(29, 4, 5, '10000000000004',
'Inmate requested relocation.',
'Pending',
'2026-05-02 17:00:00',
NULL,
NULL),

(31, 4, 2, '10000000000004',
'Rehabilitation reassignment request.',
'Pending',
'2026-05-07 08:30:00',
NULL,
NULL),

(37, 5, 1, '10000000000005',
'Transfer requested for security balancing.',
'Pending',
'2026-05-03 14:15:00',
NULL,
NULL),

(39, 5, 3, '10000000000005',
'Pending disciplinary review transfer.',
'Pending',
'2026-05-08 11:45:00',
NULL,
NULL),

-- =====================================================
-- DENIED TRANSFERS
-- =====================================================

(9, 2, 4, '10000000000002',
'Insufficient medical justification.',
'Denied',
'2026-04-01 10:00:00',
NULL,
NULL),

(24, 3, 1, '10000000000003',
'Security risk assessment rejected transfer.',
'Denied',
'2026-04-11 13:50:00',
NULL,
NULL),

(33, 5, 2, '10000000000005',
'Destination prison capacity exceeded.',
'Denied',
'2026-04-18 16:30:00',
NULL,
NULL);
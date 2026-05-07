INSERT INTO disciplinary_log (
inmate_id,
incident_id,
imposed_by,
punishment_type,
solitary_days,
duration_days,
date_imposed,
notes
)
VALUES

-- =====================================================
-- PRISON 1 (inmates 1–8)
-- Active solitary during 6–15 May 2026
-- =====================================================

(1, 1, '10000000000001', 'Loss of Privileges', NULL, 14,
'2026-04-04',
'Visitation rights suspended.'),

(2, 2, '10000000000002', 'Solitary Confinement', 8, 8,
'2026-05-06',
'Solitary active until 2026-05-14 due to escape attempt.'),

(3, 3, '10000000000003', 'Transfer to High-Security', NULL, 30,
'2026-04-10',
'Requires maximum monitoring.'),

(5, 5, '10000000000004', 'Other', NULL, 21,
'2026-05-01',
'Placed under behavioral observation.'),

-- =====================================================
-- PRISON 2 (inmates 9–16)
-- =====================================================

(9, 9, '10000000000005', 'Solitary Confinement', 7, 7,
'2026-05-06',
'Solitary active until 2026-05-13 for assault incident.'),

(10, 10, '10000000000006', 'Loss of Privileges', NULL, 10,
'2026-04-21',
'Phone access suspended.'),

(12, 12, '10000000000007', 'Other', NULL, 7,
'2026-04-29',
'Formal written warning.'),

(14, 14, '10000000000008', 'Transfer to High-Security', NULL, 60,
'2026-05-03',
'Repeated violent behavior.'),

-- =====================================================
-- PRISON 3 (inmates 17–24)
-- =====================================================

(17, 17, '10000000000009', 'Loss of Privileges', NULL, 21,
'2026-04-15',
'Restricted recreation access.'),

(18, 18, '10000000000010', 'Solitary Confinement', 9, 9,
'2026-05-06',
'Solitary active until 2026-05-15 due to organized fight.'),

(20, 20, '10000000000011', 'Other', NULL, 14,
'2026-04-25',
'Behavioral counseling assigned.'),

(22, 22, '10000000000012', 'Transfer to High-Security', NULL, 45,
'2026-05-04',
'High-risk inmate classification.'),

-- =====================================================
-- PRISON 4 (inmates 25–32)
-- =====================================================

(25, 25, '10000000000013', 'Loss of Privileges', NULL, 30,
'2026-04-19',
'Lost commissary privileges.'),

(27, 27, '10000000000014', 'Solitary Confinement', 6, 6,
'2026-05-06',
'Solitary active until 2026-05-12 after staff assault.'),

(29, 29, '10000000000015', 'Transfer to High-Security', NULL, 90,
'2026-04-30',
'Security level increased.'),

(31, 31, '10000000000001', 'Other', NULL, 14,
'2026-05-02',
'Psychological supervision required.'),

-- =====================================================
-- PRISON 5 (inmates 33–40)
-- =====================================================

(33, 33, '10000000000002', 'Loss of Privileges', NULL, 14,
'2026-04-22',
'Outdoor activity restricted.'),

(35, 35, '10000000000003', 'Solitary Confinement', 8, 8,
'2026-05-06',
'Solitary active until 2026-05-14 for violent conduct.'),

(37, 37, '10000000000004', 'Other', NULL, 30,
'2026-05-01',
'Placed under disciplinary monitoring.'),

(39, 39, '10000000000005', 'Transfer to High-Security', NULL, 60,
'2026-05-05',
'Repeat offender risk assessment.');

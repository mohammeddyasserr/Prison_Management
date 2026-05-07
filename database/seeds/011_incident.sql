INSERT INTO incident (
type, block_id, occurred_at, reporting_officer,
description, action_taken
)
VALUES

-- =====================================================
-- BLOCK 1
-- =====================================================

('Fight', 1, '2026-04-03 18:20:00', '10000000000001',
'Two inmates fought during dinner distribution.',
'Separated inmates and revoked visitation privileges.'),

('Property Damage', 1, '2026-04-11 10:15:00', '10000000000002',
'An inmate damaged a cell door lock.',
'Cell inspected and inmate disciplined.'),

('Other', 1, '2026-05-05 14:00:00', '10000000000003',
'Multiple inmates caught smoking contraband cigarettes.',
'Contraband confiscated and warning issued.'),

('Escape Attempt', 1, '2026-05-17 02:30:00', '10000000000004',
'Three inmates attempted coordinated escape through maintenance area.',
'Area locked down and inmates transferred.'),

-- =====================================================
-- BLOCK 2
-- =====================================================

('Fight', 2, '2026-04-02 16:00:00', '10000000000005',
'Fight between two inmates over phone access.',
'Separated and isolated temporarily.'),

('Self-Harm', 2, '2026-04-19 09:30:00', '10000000000006',
'Inmate found with self-inflicted injuries.',
'Transferred to medical supervision.'),

('Assault on Staff', 2, '2026-05-08 13:15:00', '10000000000007',
'Group of inmates pushed officer during inspection.',
'Security reinforcements called.'),

('Other', 2, '2026-05-21 20:00:00', '10000000000008',
'Unauthorized communication device discovered in shared cell.',
'Device confiscated.'),

-- =====================================================
-- BLOCK 3
-- =====================================================

('Fight', 3, '2026-04-01 12:10:00', '10000000000009',
'Three inmates involved in cafeteria altercation.',
'Privileges suspended.'),

('Property Damage', 3, '2026-04-14 11:00:00', '10000000000010',
'Broken surveillance camera discovered.',
'Security audit performed.'),

('Other', 3, '2026-05-03 18:00:00', '10000000000011',
'Inmates caught gambling in recreation area.',
'Recreation access restricted.'),

('Escape Attempt', 3, '2026-05-25 01:40:00', '10000000000012',
'Two inmates attempted tunnel excavation.',
'Transferred to higher supervision.'),

-- =====================================================
-- BLOCK 4
-- =====================================================

('Fight', 4, '2026-04-05 17:20:00', '10000000000013',
'Physical altercation between cellmates.',
'Separated inmates.'),

('Assault on Staff', 4, '2026-04-20 08:40:00', '10000000000014',
'Food tray thrown at prison guard.',
'Loss of recreation privileges.'),

('Self-Harm', 4, '2026-05-06 10:25:00', '10000000000015',
'Inmate refusing meals for several days.',
'Psychological evaluation scheduled.'),

('Fight', 4, '2026-05-18 15:00:00', '10000000000001',
'Multiple inmates involved in yard fight.',
'Block temporarily locked down.'),

-- =====================================================
-- BLOCK 5
-- =====================================================

('Other', 5, '2026-04-07 19:00:00', '10000000000002',
'Contraband mobile phone discovered.',
'Phone confiscated.'),

('Fight', 5, '2026-04-18 13:10:00', '10000000000003',
'Fight involving three inmates in workshop.',
'Workshop privileges revoked.'),

('Property Damage', 5, '2026-05-02 11:45:00', '10000000000004',
'Cell furniture intentionally damaged.',
'Repair costs documented.'),

('Escape Attempt', 5, '2026-05-29 03:15:00', '10000000000005',
'Inmates tampered with ventilation opening.',
'Additional guards assigned.'),

-- =====================================================
-- BLOCK 6
-- =====================================================

('Fight', 6, '2026-04-09 14:30:00', '10000000000006',
'Fight over shared resources.',
'Separated inmates.'),

('Other', 6, '2026-04-15 21:00:00', '10000000000007',
'Smoking materials discovered.',
'Warning issued.'),

('Assault on Staff', 6, '2026-05-07 12:20:00', '10000000000008',
'Two inmates resisted officer instructions.',
'Security response activated.'),

('Fight', 6, '2026-05-23 16:00:00', '10000000000009',
'Group altercation during exercise time.',
'Exercise suspended for block.'),

-- =====================================================
-- BLOCK 7
-- =====================================================

('Property Damage', 7, '2026-04-04 10:10:00', '10000000000010',
'Broken sink discovered in shared cell.',
'Maintenance called.'),

('Fight', 7, '2026-04-22 17:45:00', '10000000000011',
'Two inmates fought over food portions.',
'Meal schedules adjusted.'),

('Other', 7, '2026-05-09 20:10:00', '10000000000012',
'Unauthorized notes exchanged between inmates.',
'Materials confiscated.'),

('Escape Attempt', 7, '2026-05-20 02:50:00', '10000000000013',
'Three inmates attempted fence breach.',
'Transferred to isolation.'),

-- =====================================================
-- BLOCK 8
-- =====================================================

('Fight', 8, '2026-04-08 15:20:00', '10000000000014',
'Fight in visitation waiting area.',
'Visitation suspended temporarily.'),

('Self-Harm', 8, '2026-04-17 09:00:00', '10000000000015',
'Inmate found unconscious.',
'Immediate medical treatment provided.'),

('Fight', 8, '2026-05-11 18:30:00', '10000000000001',
'Four inmates involved in violent altercation.',
'Emergency response team deployed.'),

('Other', 8, '2026-05-27 22:00:00', '10000000000002',
'Contraband medication discovered.',
'Investigation launched.'),

-- =====================================================
-- BLOCK 9
-- =====================================================

('Fight', 9, '2026-04-06 16:40:00', '10000000000003',
'Fight between neighboring cells.',
'Separated involved inmates.'),

('Property Damage', 9, '2026-04-24 12:00:00', '10000000000004',
'Broken security light.',
'Security maintenance completed.'),

('Other', 9, '2026-05-04 19:30:00', '10000000000005',
'Illegal trading between inmates detected.',
'Confiscated unauthorized items.'),

('Assault on Staff', 9, '2026-05-24 08:15:00', '10000000000006',
'Two inmates verbally and physically threatened staff.',
'Transferred under supervision.'),

-- =====================================================
-- BLOCK 10
-- =====================================================

('Fight', 10, '2026-04-10 17:00:00', '10000000000007',
'Fight during recreation period.',
'Recreation canceled for day.'),

('Other', 10, '2026-04-26 20:00:00', '10000000000008',
'Contraband cigarettes found.',
'Items confiscated.'),

('Escape Attempt', 10, '2026-05-10 01:30:00', '10000000000009',
'Two inmates attempted roof access.',
'Placed under maximum monitoring.'),

('Fight', 10, '2026-05-28 14:20:00', '10000000000010',
'Multiple inmates involved in fight over gambling debt.',
'All participants isolated.');
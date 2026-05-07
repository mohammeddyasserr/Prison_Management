-- Manager ID will be updated in 015_officer.sql
INSERT INTO prison (
name, type, security_level, location,
has_hospital, has_workshops, has_agricultural_ward,
has_visitation_hall, visitation_hall_capacity
)
VALUES

('Al-Qata', 'Maximum Security', 'High', 'Giza', 1, 1, 0, 1, 50),

('Tora Complex', 'Maximum Security', 'High', 'Cairo', 1, 1, 1, 1, 100),

('Wadi el-Natrun', 'Maximum Security', 'High', 'Beheira', 1, 1, 1, 1, 80),

('Borg El Arab', 'Maximum Security', 'High', 'Alexandria', 1, 1, 0, 1, 60),

('Minya Prison', 'Maximum Security', 'High', 'Minya', 1, 1, 1, 1, 50);
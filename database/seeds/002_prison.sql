-- Manager ID will be updated in 015_officer.sql
INSERT INTO prison (name, type, security_level, location, has_hospital, has_workshops, has_agricultural_ward, has_visitation_hall, visitation_hall_capacity)
VALUES
('Al-Qata', 'Maximum Security', 'High', 'Giza', 1, 1, 0, 1, 50),
('Fayoum Prison', 'Minimum Security', 'Medium', 'Fayoum', 1, 0, 1, 1, 30),
('Tora Complex', 'Maximum Security', 'High', 'Cairo', 1, 1, 1, 1, 100),
('Wadi el-Natrun', 'Maximum Security', 'High', 'Beheira', 1, 1, 1, 1, 80),
('Borg El Arab', 'Maximum Security', 'High', 'Alexandria', 1, 1, 0, 1, 60),
('Qena Prison', 'Maximum Security', 'High', 'Qena', 1, 1, 1, 1, 40),
('Assiut Prison', 'Maximum Security', 'High', 'Assiut', 1, 1, 1, 1, 45),
('Zagazig Prison', 'Minimum Security', 'Medium', 'Sharqia', 1, 0, 1, 1, 20),
('Ismailia Prison', 'Minimum Security', 'Medium', 'Ismailia', 0, 0, 1, 1, 25),
('Suez Prison', 'Remand', 'Low', 'Suez', 1, 0, 0, 1, 30),
('Mansoura Prison', 'Remand', 'Low', 'Dakahlia', 1, 0, 1, 1, 20),
('Tanta Prison', 'Minimum Security', 'Medium', 'Gharbia', 1, 1, 0, 1, 30),
('Banha Prison', 'Remand', 'Low', 'Qalyubia', 0, 0, 0, 1, 15),
('Kafr El Sheikh', 'Minimum Security', 'Medium', 'Kafr El Sheikh', 1, 0, 1, 1, 20),
('Minya Prison', 'Maximum Security', 'High', 'Minya', 1, 1, 1, 1, 50);

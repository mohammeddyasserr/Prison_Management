INSERT INTO officer (national_id, name, phone, address, email, password_hash, prison_id)
VALUES
('10000000000001', 'Tarek Mahmoud', '01010101010', 'Nasr City, Cairo', 'tarek.m1@prison.gov', 'hash3', 1),
('10000000000002', 'Mahmoud Hassan', '01212121212', 'Maadi, Cairo', 'mahmoud.h2@prison.gov', 'hash4', 2),
('10000000000003', 'Sami Youssef', '01111111111', 'Fayoum City', 'sami.y3@prison.gov', 'hash5', 3),
('10000000000004', 'Ramy Adel', '01515151515', 'Giza', 'ramy.a4@prison.gov', 'hash6', 4),
('10000000000005', 'Ahmed Ali', '01055555555', 'Alexandria', 'ahmed.a5@prison.gov', 'hash', 5),
('10000000000006', 'Kareem Zaki', '01266666666', 'Suez', 'kareem.z6@prison.gov', 'hash', 6),
('10000000000007', 'Mostafa Kamal', '01177777777', 'Mansoura', 'mostafa.k7@prison.gov', 'hash', 7),
('10000000000008', 'Youssef Nabil', '01588888888', 'Tanta', 'youssef.n8@prison.gov', 'hash', 8),
('10000000000009', 'Ibrahim Sayed', '01099999999', 'Zagazig', 'ibrahim.s9@prison.gov', 'hash', 9),
('10000000000010', 'Nader Fathy', '01212341234', 'Ismailia', 'nader.f10@prison.gov', 'hash', 10),
('10000000000011', 'Hassan Saeed', '01123452345', 'Beheira', 'hassan.s11@prison.gov', 'hash', 11),
('10000000000012', 'Sayed Hossam', '01534563456', 'Qena', 'sayed.h12@prison.gov', 'hash', 12),
('10000000000013', 'Ziad Tarek', '01045674567', 'Minya', 'ziad.t13@prison.gov', 'hash', 13),
('10000000000014', 'Adel Mahmoud', '01256785678', 'Assiut', 'adel.m14@prison.gov', 'hash', 14),
('10000000000015', 'Fathy Magdy', '01167896789', 'Kafr El Sheikh', 'fathy.m15@prison.gov', 'hash', 15);

-- Update the managers of the 15 prisons
UPDATE prison SET manager_id = '10000000000001' WHERE prison_id = 1;
UPDATE prison SET manager_id = '10000000000002' WHERE prison_id = 2;
UPDATE prison SET manager_id = '10000000000003' WHERE prison_id = 3;
UPDATE prison SET manager_id = '10000000000004' WHERE prison_id = 4;
UPDATE prison SET manager_id = '10000000000005' WHERE prison_id = 5;
UPDATE prison SET manager_id = '10000000000006' WHERE prison_id = 6;
UPDATE prison SET manager_id = '10000000000007' WHERE prison_id = 7;
UPDATE prison SET manager_id = '10000000000008' WHERE prison_id = 8;
UPDATE prison SET manager_id = '10000000000009' WHERE prison_id = 9;
UPDATE prison SET manager_id = '10000000000010' WHERE prison_id = 10;
UPDATE prison SET manager_id = '10000000000011' WHERE prison_id = 11;
UPDATE prison SET manager_id = '10000000000012' WHERE prison_id = 12;
UPDATE prison SET manager_id = '10000000000013' WHERE prison_id = 13;
UPDATE prison SET manager_id = '10000000000014' WHERE prison_id = 14;
UPDATE prison SET manager_id = '10000000000015' WHERE prison_id = 15;

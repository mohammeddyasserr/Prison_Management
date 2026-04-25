INSERT INTO officer (national_id, name, phone, address, email, password_hash, prison_id)
VALUES
('OFC-01', 'Tarek Mahmoud', '01010101010', 'Nasr City, Cairo', 'tarek.m1@prison.gov', 'hash3', 1),
('OFC-02', 'Mahmoud Hassan', '01212121212', 'Maadi, Cairo', 'mahmoud.h2@prison.gov', 'hash4', 2),
('OFC-03', 'Sami Youssef', '01111111111', 'Fayoum City', 'sami.y3@prison.gov', 'hash5', 3),
('OFC-04', 'Ramy Adel', '01515151515', 'Giza', 'ramy.a4@prison.gov', 'hash6', 4),
('OFC-05', 'Ahmed Ali', '01055555555', 'Alexandria', 'ahmed.a5@prison.gov', 'hash', 5),
('OFC-06', 'Kareem Zaki', '01266666666', 'Suez', 'kareem.z6@prison.gov', 'hash', 6),
('OFC-07', 'Mostafa Kamal', '01177777777', 'Mansoura', 'mostafa.k7@prison.gov', 'hash', 7),
('OFC-08', 'Youssef Nabil', '01588888888', 'Tanta', 'youssef.n8@prison.gov', 'hash', 8),
('OFC-09', 'Ibrahim Sayed', '01099999999', 'Zagazig', 'ibrahim.s9@prison.gov', 'hash', 9),
('OFC-10', 'Nader Fathy', '01212341234', 'Ismailia', 'nader.f10@prison.gov', 'hash', 10),
('OFC-11', 'Hassan Saeed', '01123452345', 'Beheira', 'hassan.s11@prison.gov', 'hash', 11),
('OFC-12', 'Sayed Hossam', '01534563456', 'Qena', 'sayed.h12@prison.gov', 'hash', 12),
('OFC-13', 'Ziad Tarek', '01045674567', 'Minya', 'ziad.t13@prison.gov', 'hash', 13),
('OFC-14', 'Adel Mahmoud', '01256785678', 'Assiut', 'adel.m14@prison.gov', 'hash', 14),
('OFC-15', 'Fathy Magdy', '01167896789', 'Kafr El Sheikh', 'fathy.m15@prison.gov', 'hash', 15);

-- Update the managers of the 15 prisons
UPDATE prison SET manager_id = 'OFC-01' WHERE prison_id = 1;
UPDATE prison SET manager_id = 'OFC-02' WHERE prison_id = 2;
UPDATE prison SET manager_id = 'OFC-03' WHERE prison_id = 3;
UPDATE prison SET manager_id = 'OFC-04' WHERE prison_id = 4;
UPDATE prison SET manager_id = 'OFC-05' WHERE prison_id = 5;
UPDATE prison SET manager_id = 'OFC-06' WHERE prison_id = 6;
UPDATE prison SET manager_id = 'OFC-07' WHERE prison_id = 7;
UPDATE prison SET manager_id = 'OFC-08' WHERE prison_id = 8;
UPDATE prison SET manager_id = 'OFC-09' WHERE prison_id = 9;
UPDATE prison SET manager_id = 'OFC-10' WHERE prison_id = 10;
UPDATE prison SET manager_id = 'OFC-11' WHERE prison_id = 11;
UPDATE prison SET manager_id = 'OFC-12' WHERE prison_id = 12;
UPDATE prison SET manager_id = 'OFC-13' WHERE prison_id = 13;
UPDATE prison SET manager_id = 'OFC-14' WHERE prison_id = 14;
UPDATE prison SET manager_id = 'OFC-15' WHERE prison_id = 15;

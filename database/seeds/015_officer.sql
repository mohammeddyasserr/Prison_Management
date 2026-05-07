INSERT INTO officer (
national_id,
name,
phone,
address,
email,
password_hash,
prison_id
)
VALUES

-- =====================================================
-- PRISON 1
-- =====================================================

-- Manager
('10000000000001', 'Tarek Mahmoud', '01010101010',
'Nasr City, Cairo', 'tarek.m1@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

-- Officers
('10000000000016', 'Ali Hassan', '01010101011',
'Giza', 'ali.h16@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

('10000000000017', 'Omar Fathy', '01010101012',
'Giza', 'omar.f17@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

('10000000000018', 'Karim Adel', '01010101013',
'Cairo', 'karim.a18@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

('10000000000019', 'Hany Nabil', '01010101014',
'6th October', 'hany.n19@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

('10000000000020', 'Sameh Yasser', '01010101015',
'Faisal', 'sameh.y20@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 1),

-- =====================================================
-- PRISON 2
-- =====================================================

('10000000000002', 'Mahmoud Hassan', '01212121212',
'Maadi, Cairo', 'mahmoud.h2@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

('10000000000021', 'Bassem Tarek', '01212121213',
'Fayoum', 'bassem.t21@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

('10000000000022', 'Sherif Adel', '01212121214',
'Fayoum', 'sherif.a22@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

('10000000000023', 'Wael Ibrahim', '01212121215',
'Beni Suef', 'wael.i23@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

('10000000000024', 'Maged Ali', '01212121216',
'Fayoum', 'maged.a24@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

('10000000000025', 'Islam Mostafa', '01212121217',
'Giza', 'islam.m25@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 2),

-- =====================================================
-- PRISON 3
-- =====================================================

('10000000000003', 'Sami Youssef', '01111111111',
'Fayoum City', 'sami.y3@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

('10000000000026', 'Mohsen Adel', '01111111112',
'Cairo', 'mohsen.a26@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

('10000000000027', 'Reda Kamal', '01111111113',
'Helwan', 'reda.k27@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

('10000000000028', 'Yasser Nader', '01111111114',
'Nasr City', 'yasser.n28@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

('10000000000029', 'Tamer Hassan', '01111111115',
'Maadi', 'tamer.h29@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

('10000000000030', 'Walid Saeed', '01111111116',
'Cairo', 'walid.s30@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 3),

-- =====================================================
-- PRISON 4
-- =====================================================

('10000000000004', 'Ramy Adel', '01515151515',
'Giza', 'ramy.a4@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

('10000000000031', 'Ashraf Mohamed', '01515151516',
'Alexandria', 'ashraf.m31@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

('10000000000032', 'Hazem Farouk', '01515151517',
'Alexandria', 'hazem.f32@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

('10000000000033', 'Amr Salah', '01515151518',
'Smouha', 'amr.s33@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

('10000000000034', 'Fouad Ali', '01515151519',
'Miami, Alex', 'fouad.a34@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

('10000000000035', 'Khaled Amin', '01515151520',
'Alexandria', 'khaled.a35@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 4),

-- =====================================================
-- PRISON 5
-- =====================================================

('10000000000005', 'Ahmed Ali', '01055555555',
'Alexandria', 'ahmed.a5@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5),

('10000000000036', 'Saad Ibrahim', '01055555556',
'Minya', 'saad.i36@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5),

('10000000000037', 'Hossam Adel', '01055555557',
'Minya', 'hossam.a37@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5),

('10000000000038', 'Naeem Tarek', '01055555558',
'Beni Mazar', 'naeem.t38@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5),

('10000000000039', 'Essam Youssef', '01055555559',
'Minya', 'essam.y39@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5),

('10000000000040', 'Medhat Samy', '01055555560',
'Mallawi', 'medhat.s40@prison.gov',
'$argon2id$v=19$m=65536,t=3,p=4$66iZU0XU5nx+kTHKUCEbYw$GYsXuv8a1pz535U+mzNb/zWsKNrCLUaPS9MEPv/pgWU', 5);

-- =====================================================
-- UPDATE PRISON MANAGERS
-- =====================================================

UPDATE prison SET manager_id = '10000000000001' WHERE prison_id = 1;
UPDATE prison SET manager_id = '10000000000002' WHERE prison_id = 2;
UPDATE prison SET manager_id = '10000000000003' WHERE prison_id = 3;
UPDATE prison SET manager_id = '10000000000004' WHERE prison_id = 4;
UPDATE prison SET manager_id = '10000000000005' WHERE prison_id = 5;
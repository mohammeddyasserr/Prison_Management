INSERT INTO inmate (
national_id, full_name, date_of_birth, gender, nationality,
occupation, start_date, education_level,
assigned_cell, assigned_prison
) VALUES

-- =========================
-- PRISON 1 (cells 1–4)
-- =========================

('10000000000001','Ahmed Ali','1990-01-10','Male','Egyptian','Driver','2019-03-12','Illiterate',1,1),
('10000000000002','Mona Hassan','1992-02-11','Female','Egyptian','Teacher','2021-06-18','Literate',1,1),

('10000000000003','Youssef Omar','1988-05-21','Male','Egyptian','Farmer','2020-07-09','Primary',2,1),
('10000000000004','Sara Tarek','1995-11-02','Female','Egyptian','Nurse','2022-11-01','Preparatory',2,1),

('10000000000005','Khaled Ahmed','1985-03-15','Male','Sudanese','Mechanic','2018-09-20','Secondary',3,1),
('10000000000006','Salma Nour','1994-12-01','Female','Egyptian','Clerk','2023-02-14','Bachelor''s',3,1),

('10000000000007','Omar Hassan','1991-07-08','Male','Egyptian','Electrician','2024-05-19','Postgraduate education',4,1),
('10000000000008','Fatma Ali','1993-10-10','Female','Egyptian','Student','2020-08-25','Illiterate',4,1),

-- =========================
-- PRISON 2 (cells 5–8)
-- =========================

('10000000000009','Ali Mohamed','1989-06-06','Male','Egyptian','Driver','2019-11-10','Literate',5,2),
('10000000000010','Amina Hassan','1995-02-20','Female','Egyptian','Teacher','2021-03-18','Primary',5,2),

('10000000000011','Hassan Omar','1990-09-09','Male','Libyan','Farmer','2020-07-22','Preparatory',6,2),
('10000000000012','Farida Ahmed','1996-11-30','Female','Egyptian','Nurse','2023-06-05','Secondary',6,2),

('10000000000013','Tarek Khaled','1987-01-17','Male','Egyptian','Mechanic','2018-12-01','Bachelor''s',7,2),
('10000000000014','Menna Ali','1992-04-04','Female','Egyptian','Clerk','2020-10-10','Postgraduate education',7,2),

('10000000000015','Mohamed Omar','1989-03-25','Male','Sudanese','Electrician','2024-01-20','Illiterate',8,2),
('10000000000016','Nour Hassan','1997-12-12','Female','Egyptian','Student','2021-05-30','Literate',8,2),

-- =========================
-- PRISON 3 (cells 9–12)
-- =========================

('10000000000017','Ahmed Tarek','1986-03-03','Male','Egyptian','Driver','2018-04-14','Primary',9,3),
('10000000000018','Mona Ali','1997-12-12','Female','Egyptian','Teacher','2022-09-09','Preparatory',9,3),

('10000000000019','Youssef Hassan','1991-05-25','Male','Egyptian','Farmer','2020-02-02','Secondary',10,3),
('10000000000020','Sara Omar','1993-06-16','Female','Egyptian','Nurse','2023-03-03','Bachelor''s',10,3),

('10000000000021','Khaled Ali','1988-10-10','Male','Syrian','Mechanic','2019-08-08','Postgraduate education',11,3),
('10000000000022','Salma Ahmed','1995-11-11','Female','Egyptian','Clerk','2021-12-12','Illiterate',11,3),

('10000000000023','Omar Hassan','1990-01-01','Male','Egyptian','Electrician','2024-04-04','Literate',12,3),
('10000000000024','Fatma Tarek','1992-02-02','Female','Egyptian','Student','2020-06-06','Primary',12,3),

-- =========================
-- PRISON 4 (cells 13–16)
-- =========================

('10000000000025','Ali Hassan','1987-07-07','Male','Egyptian','Driver','2019-09-09','Preparatory',13,4),
('10000000000026','Amina Omar','1996-08-08','Female','Egyptian','Teacher','2022-10-10','Secondary',13,4),

('10000000000027','Hassan Tarek','1991-09-09','Male','Libyan','Farmer','2021-11-11','Bachelor''s',14,4),
('10000000000028','Farida Ali','1993-10-10','Female','Egyptian','Nurse','2023-12-12','Postgraduate education',14,4),

('10000000000029','Tarek Ahmed','1989-11-11','Male','Egyptian','Mechanic','2018-01-01','Illiterate',15,4),
('10000000000030','Menna Hassan','1994-12-12','Female','Egyptian','Clerk','2020-03-03','Literate',15,4),

('10000000000031','Omar Ali','1992-01-13','Male','Sudanese','Electrician','2022-05-05','Primary',16,4),
('10000000000032','Salma Nour','1995-02-14','Female','Egyptian','Student','2024-07-07','Preparatory',16,4),

-- =========================
-- PRISON 5 (cells 17–20)
-- =========================

('10000000000033','Ahmed Omar','1988-03-15','Male','Egyptian','Driver','2019-02-10','Secondary',17,5),
('10000000000034','Mona Hassan','1992-04-16','Female','Egyptian','Teacher','2021-08-18','Bachelor''s',17,5),

('10000000000035','Youssef Ali','1987-05-17','Male','Egyptian','Farmer','2020-06-22','Illiterate',18,5),
('10000000000036','Sara Ahmed','1993-06-18','Female','Egyptian','Nurse','2023-09-11','Literate',18,5),

('10000000000037','Khaled Omar','1990-07-19','Male','Libyan','Mechanic','2018-11-05','Primary',19,5),
('10000000000038','Amina Hassan','1994-08-20','Female','Egyptian','Clerk','2022-12-01','Preparatory',19,5),

('10000000000039','Hassan Ali','1991-09-21','Male','Egyptian','Electrician','2024-03-03','Secondary',20,5),
('10000000000040','Fatma Omar','1995-10-22','Female','Egyptian','Student','2020-07-07','Bachelor''s',20,5);
INSERT INTO pending_inmate (
    pending_inmate_id,
    national_id,
    full_name,
    date_of_birth,
    gender,
    nationality,
    occupation,
    start_date,
    education_level,
    assigned_prison,
    status
)
VALUES

-- =========================
-- PRISON 1 (41–45)
-- =========================
(41, '41000000000001', 'Mahmoud Adel', '1991-04-12', 'Male', 'Egyptian', 'Driver', '2026-05-06', 'Secondary', 1, 'Active'),
(42, '42000000000002', 'Nourhan Sami', '1996-09-25', 'Female', 'Egyptian', 'Teacher', '2026-05-07', 'Bachelor''s', 1, 'Active'),
(43, '43000000000003', 'Kareem Hassan', '1988-02-14', 'Male', 'Egyptian', 'Electrician', '2026-05-06', 'Preparatory', 1, 'Active'),
(44, '44000000000004', 'Salma Nabil', '1999-11-03', 'Female', 'Egyptian', 'Student', '2026-05-08', 'Secondary', 1, 'Active'),
(45, '45000000000005', 'Ahmed Fathy', '1985-07-18', 'Male', 'Egyptian', 'Mechanic', '2026-05-05', 'Primary', 1, 'Active'),

-- =========================
-- PRISON 2 (46–50)
-- =========================
(46, '46000000000006', 'Mariam Tarek', '1994-01-20', 'Female', 'Egyptian', 'Nurse', '2026-05-09', 'Bachelor''s', 2, 'Active'),
(47, '47000000000007', 'Youssef Kamal', '1990-12-11', 'Male', 'Egyptian', 'Accountant', '2026-05-07', 'Postgraduate education', 2, 'Active'),
(48, '48000000000008', 'Farah Ali', '1997-06-30', 'Female', 'Egyptian', 'Clerk', '2026-05-10', 'Literate', 2, 'Active'),
(49, '49000000000009', 'Omar Ibrahim', '1983-03-05', 'Male', 'Egyptian', 'Farmer', '2026-05-06', 'Illiterate', 2, 'Active'),
(50, '50000000000010', 'Heba Mostafa', '2001-08-19', 'Female', 'Egyptian', 'Student', '2026-05-08', 'Secondary', 2, 'Active'),

-- =========================
-- PRISON 3 (51–55)
-- =========================
(51, '51000000000011', 'Saeed Hassan', '1986-05-22', 'Male', 'Egyptian', 'Driver', '2026-05-06', 'Secondary', 3, 'Active'),
(52, '52000000000012', 'Laila Mohamed', '1995-10-10', 'Female', 'Egyptian', 'Pharmacist', '2026-05-07', 'Bachelor''s', 3, 'Active'),
(53, '53000000000013', 'Tamer Adel', '1992-02-02', 'Male', 'Egyptian', 'Technician', '2026-05-08', 'Preparatory', 3, 'Active'),
(54, '54000000000014', 'Nadine Youssef', '1998-12-15', 'Female', 'Egyptian', 'Student', '2026-05-09', 'Secondary', 3, 'Active'),
(55, '55000000000015', 'Hassan Ibrahim', '1980-09-09', 'Male', 'Egyptian', 'Carpenter', '2026-05-10', 'Primary', 3, 'Active'),

-- =========================
-- PRISON 4 (56–60)
-- =========================
(56, '56000000000016', 'Omar Saad', '1987-07-07', 'Male', 'Egyptian', 'Engineer', '2026-05-06', 'Bachelor''s', 4, 'Active'),
(57, '57000000000017', 'Mona Adel', '1993-03-18', 'Female', 'Egyptian', 'Teacher', '2026-05-07', 'Bachelor''s', 4, 'Active'),
(58, '58000000000018', 'Yousef Nader', '1991-11-11', 'Male', 'Egyptian', 'Electrician', '2026-05-08', 'Secondary', 4, 'Active'),
(59, '59000000000019', 'Rana Tarek', '1996-04-04', 'Female', 'Egyptian', 'Clerk', '2026-05-09', 'Literate', 4, 'Active'),
(60, '60000000000020', 'Khaled Mostafa', '1984-01-01', 'Male', 'Egyptian', 'Mechanic', '2026-05-10', 'Primary', 4, 'Active'),

-- =========================
-- PRISON 5 (61–65)
-- =========================
(61, '61000000000021', 'Ahmed Zaki', '1989-08-08', 'Male', 'Egyptian', 'Driver', '2026-05-06', 'Secondary', 5, 'Active'),
(62, '62000000000022', 'Sara Ibrahim', '1997-09-09', 'Female', 'Egyptian', 'Nurse', '2026-05-07', 'Bachelor''s', 5, 'Active'),
(63, '63000000000023', 'Mahmoud Fathy', '1982-02-20', 'Male', 'Egyptian', 'Farmer', '2026-05-08', 'Illiterate', 5, 'Active'),
(64, '64000000000024', 'Nour Ali', '2000-12-12', 'Female', 'Egyptian', 'Student', '2026-05-09', 'Secondary', 5, 'Active'),
(65, '65000000000025', 'Ibrahim Saeed', '1985-06-06', 'Male', 'Egyptian', 'Accountant', '2026-05-10', 'Bachelor''s', 5, 'Active');
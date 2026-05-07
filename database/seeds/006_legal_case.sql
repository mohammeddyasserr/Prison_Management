INSERT INTO legal_case (
crime_type, inmate_id, court_name,
sentence_duration_years, sentence_duration_months, sentence_duration_days
) VALUES

-- =========================
-- PRISON 1 (inmates 1–8)
-- 2 will be released in 2024 (short sentences)
-- =========================

('Theft', 1, 'Cairo Criminal Court', 2, 0, 0),   -- RELEASE 2024
('Fraud', 2, 'Giza Court', 1, 6, 0),             -- RELEASE 2024
('Robbery', 3, 'Cairo Criminal Court', 6, 0, 0),
('Assault', 4, 'Giza Court', 5, 0, 0),
('Drug Offense', 5, 'Cairo Criminal Court', 7, 0, 0),
('Burglary', 6, 'Giza Court', 4, 0, 0),
('Cybercrime', 7, 'Cairo Court', 3, 0, 0),
('Murder', 8, 'Giza Court', 20, 0, 0),

-- =========================
-- PRISON 2 (inmates 9–16)
-- =========================

('Theft', 9, 'Alexandria Court', 1, 0, 0),       -- RELEASE 2024
('Fraud', 10, 'Alexandria Court', 2, 0, 0),      -- RELEASE 2024
('Robbery', 11, 'Tanta Court', 6, 0, 0),
('Assault', 12, 'Tanta Court', 5, 0, 0),
('Drug Offense', 13, 'Alexandria Court', 8, 0, 0),
('Burglary', 14, 'Tanta Court', 4, 0, 0),
('Arson', 15, 'Alexandria Court', 10, 0, 0),
('Kidnapping', 16, 'Tanta Court', 15, 0, 0),

-- =========================
-- PRISON 3 (inmates 17–24)
-- =========================

('Theft', 17, 'Suez Court', 1, 0, 0),            -- RELEASE 2024
('Fraud', 18, 'Suez Court', 2, 0, 0),            -- RELEASE 2024
('Cybercrime', 19, 'Suez Court', 3, 0, 0),
('Assault', 20, 'Suez Court', 4, 0, 0),
('Drug Offense', 21, 'Suez Court', 7, 0, 0),
('Robbery', 22, 'Suez Court', 6, 0, 0),
('Arson', 23, 'Suez Court', 9, 0, 0),
('Murder', 24, 'Suez Court', 25, 0, 0),

-- =========================
-- PRISON 4 (inmates 25–32)
-- =========================

('Theft', 25, 'Minya Court', 1, 0, 0),           -- RELEASE 2024
('Fraud', 26, 'Minya Court', 2, 0, 0),           -- RELEASE 2024
('Burglary', 27, 'Minya Court', 5, 0, 0),
('Assault', 28, 'Minya Court', 4, 0, 0),
('Drug Offense', 29, 'Minya Court', 8, 0, 0),
('Cybercrime', 30, 'Minya Court', 3, 0, 0),
('Kidnapping', 31, 'Minya Court', 12, 0, 0),
('Murder', 32, 'Minya Court', 22, 0, 0),

-- =========================
-- PRISON 5 (inmates 33–40)
-- =========================

('Theft', 33, 'Fayoum Court', 1, 0, 0),          -- RELEASE 2024
('Fraud', 34, 'Fayoum Court', 2, 0, 0),          -- RELEASE 2024
('Robbery', 35, 'Fayoum Court', 6, 0, 0),
('Assault', 36, 'Fayoum Court', 5, 0, 0),
('Drug Offense', 37, 'Fayoum Court', 7, 0, 0),
('Burglary', 38, 'Fayoum Court', 4, 0, 0),
('Arson', 39, 'Fayoum Court', 10, 0, 0),
('Murder', 40, 'Fayoum Court', 18, 0, 0);

-- =========================
-- Pending inmates
-- =========================

('Theft', 41, 'Fayoum Court', 1, 0, 0),
('Fraud', 42, 'Fayoum Court', 2, 0, 0),
('Robbery', 43, 'Fayoum Court', 6, 0, 0),
('Assault', 44, 'Fayoum Court', 5, 0, 0),
('Drug Offense', 45, 'Fayoum Court', 7, 0, 0),
('Burglary', 46, 'Fayoum Court', 4, 0, 0),
('Arson', 47, 'Fayoum Court', 10, 0, 0),
('Murder', 48, 'Fayoum Court', 18, 0, 0),
('Theft', 49, 'Fayoum Court', 1, 0, 0),
('Fraud', 50, 'Fayoum Court', 2, 0, 0),
('Robbery', 51, 'Fayoum Court', 6, 0, 0),
('Assault', 52, 'Fayoum Court', 5, 0, 0),
('Drug Offense', 53, 'Fayoum Court', 7, 0, 0),
('Burglary', 54, 'Fayoum Court', 4, 0, 0),
('Arson', 55, 'Fayoum Court', 10, 0, 0),
('Murder', 56, 'Fayoum Court', 18, 0, 0),
('Burglary', 57, 'Fayoum Court', 4, 0, 0),
('Arson', 58, 'Fayoum Court', 10, 0, 0),
('Murder', 59, 'Fayoum Court', 18, 0, 0),
('Theft', 60, 'Fayoum Court', 1, 0, 0),
('Fraud', 61, 'Fayoum Court', 2, 0, 0),
('Robbery', 62, 'Fayoum Court', 6, 0, 0),
('Assault', 63, 'Fayoum Court', 5, 0, 0),
('Drug Offense', 64, 'Fayoum Court', 7, 0, 0),
('Burglary', 65, 'Fayoum Court', 4, 0, 0);


// Mock Data for CPMS - No backend/database required
// 50+ sample records for testing all frontend features

export const mockPrisons = [
    { prison_id: 1, name: 'Cairo Central Prison', location: 'Cairo', type: 'Maximum Security', security_level: 'Maximum', total_capacity: 500, current_occupancy: 423, has_infirmary: 1, has_workshops: 1, has_agricultural_ward: 0, has_visitation_hall: 1, visitation_hall_capacity: 50, manager_id: 'MGR001' },
    { prison_id: 2, name: 'Alexandria Correctional Facility', location: 'Alexandria', type: 'Minimum Security', security_level: 'Medium', total_capacity: 300, current_occupancy: 245, has_infirmary: 1, has_workshops: 0, has_agricultural_ward: 1, has_visitation_hall: 1, visitation_hall_capacity: 30, manager_id: 'MGR002' },
    { prison_id: 3, name: 'Tanta Youth Detention', location: 'Gharbia', type: 'Juvenile', security_level: 'Minimum', total_capacity: 150, current_occupancy: 98, has_infirmary: 1, has_workshops: 1, has_agricultural_ward: 0, has_visitation_hall: 1, visitation_hall_capacity: 20, manager_id: null },
    { prison_id: 4, name: 'Giza Maximum Security', location: 'Giza', type: 'Maximum Security', security_level: 'Maximum', total_capacity: 800, current_occupancy: 756, has_infirmary: 1, has_workshops: 1, has_agricultural_ward: 0, has_visitation_hall: 1, visitation_hall_capacity: 80, manager_id: null },
    { prison_id: 5, name: 'Luxor Medium Security', location: 'Luxor', type: 'Medium Security', security_level: 'Medium', total_capacity: 200, current_occupancy: 167, has_infirmary: 0, has_workshops: 1, has_agricultural_ward: 1, has_visitation_hall: 1, visitation_hall_capacity: 25, manager_id: null },
    { prison_id: 6, name: 'Port Said Detention Center', location: 'Port Said', type: 'Minimum Security', security_level: 'Minimum', total_capacity: 180, current_occupancy: 134, has_infirmary: 1, has_workshops: 1, has_agricultural_ward: 0, has_visitation_hall: 1, visitation_hall_capacity: 25, manager_id: null },
    { prison_id: 7, name: 'Suez Correctional Facility', location: 'Suez', type: 'Medium Security', security_level: 'Medium', total_capacity: 350, current_occupancy: 289, has_infirmary: 1, has_workshops: 1, has_agricultural_ward: 1, has_visitation_hall: 1, visitation_hall_capacity: 40, manager_id: null },
];

export const mockBlocks = [
    { block_id: 1, prison_id: 1, name: 'Block A — Max Security', capacity: 100, current_occupancy: 87, security_level: 'Maximum', number_of_cells: 4 },
    { block_id: 2, prison_id: 1, name: 'Block B — Medium', capacity: 80, current_occupancy: 65, security_level: 'Medium', number_of_cells: 3 },
    { block_id: 3, prison_id: 1, name: 'Block C — Minimum', capacity: 60, current_occupancy: 45, security_level: 'Minimum', number_of_cells: 3 },
    { block_id: 4, prison_id: 2, name: 'Block A — General', capacity: 120, current_occupancy: 98, security_level: 'Medium', number_of_cells: 4 },
    { block_id: 5, prison_id: 2, name: 'Block B — Minimum', capacity: 80, current_occupancy: 56, security_level: 'Minimum', number_of_cells: 3 },
    { block_id: 6, prison_id: 3, name: 'Block A — Juvenile', capacity: 75, current_occupancy: 52, security_level: 'Minimum', number_of_cells: 3 },
    { block_id: 7, prison_id: 4, name: 'Block A — Max Security', capacity: 150, current_occupancy: 142, security_level: 'Maximum', number_of_cells: 5 },
    { block_id: 8, prison_id: 4, name: 'Block B — Max Security', capacity: 150, current_occupancy: 138, security_level: 'Maximum', number_of_cells: 5 },
    { block_id: 9, prison_id: 4, name: 'Block C — Medium', capacity: 100, current_occupancy: 89, security_level: 'Medium', number_of_cells: 4 },
    { block_id: 10, prison_id: 5, name: 'Block A — Medium', capacity: 60, current_occupancy: 48, security_level: 'Medium', number_of_cells: 3 },
    { block_id: 11, prison_id: 5, name: 'Block B — Minimum', capacity: 50, current_occupancy: 35, security_level: 'Minimum', number_of_cells: 3 },
    { block_id: 12, prison_id: 6, name: 'Block A — Minimum', capacity: 80, current_occupancy: 62, security_level: 'Minimum', number_of_cells: 4 },
    { block_id: 13, prison_id: 7, name: 'Block A — Medium', capacity: 100, current_occupancy: 85, security_level: 'Medium', number_of_cells: 4 },
    { block_id: 14, prison_id: 7, name: 'Block B — Minimum', capacity: 80, current_occupancy: 67, security_level: 'Minimum', number_of_cells: 4 },
];

export const mockOfficers = [
    { national_id: 'OFF001', name: 'Mohamed Youssef', phone: '01033333333', email: 'mohamed@cpms.gov', role: 'officer', prison_id: 1 },
    { national_id: 'OFF002', name: 'Sara Ibrahim', phone: '01044444444', email: 'sara@cpms.gov', role: 'officer', prison_id: 1 },
    { national_id: 'OFF003', name: 'Omar Khaled', phone: '01055555555', email: 'omar@cpms.gov', role: 'officer', prison_id: 2 },
    { national_id: 'OFF004', name: 'Ali Mansour', phone: '01066666666', email: 'ali@cpms.gov', role: 'officer', prison_id: 3 },
    { national_id: 'OFF005', name: 'Nour El-Din', phone: '01077777777', email: 'nour@cpms.gov', role: 'officer', prison_id: 3 },
    { national_id: 'OFF006', name: 'Hassan Fawzi', phone: '01088888888', email: 'hassan@cpms.gov', role: 'officer', prison_id: 4 },
    { national_id: 'OFF007', name: 'Yasser Gamal', phone: '01099999999', email: 'yasser@cpms.gov', role: 'officer', prison_id: 4 },
    { national_id: 'OFF008', name: 'Tamer Nabil', phone: '01100000000', email: 'tamer@cpms.gov', role: 'officer', prison_id: 5 },
    { national_id: 'MGR001', name: 'Ahmed Hassan', phone: '01011111111', email: 'ahmed@cpms.gov', role: 'prison_manager', prison_id: 1 },
    { national_id: 'MGR002', name: 'Fatima Ali', phone: '01022222222', email: 'fatima@cpms.gov', role: 'prison_manager', prison_id: 2 },
    { national_id: 'MGR003', name: 'Karim Taha', phone: '01033334444', email: 'karim@cpms.gov', role: 'prison_manager', prison_id: 5 },
];

export const mockInmates = [
    { inmate_id: 1, full_name: 'Khaled Mahmoud', date_of_birth: '1990-03-15', gender: 'Male', nationality: 'Egyptian', occupation: 'Carpenter', national_id: 'NID100001', start_date: '2025-01-10', expected_release_date: '2028-06-15', assigned_prison: 1, assigned_block: 1, assigned_cell: 1, status: 'active' },
    { inmate_id: 2, full_name: 'Yasser Abdel-Fattah', date_of_birth: '1985-07-22', gender: 'Male', nationality: 'Egyptian', occupation: 'Driver', national_id: 'NID100002', start_date: '2024-11-01', expected_release_date: '2029-11-01', assigned_prison: 1, assigned_block: 1, assigned_cell: 2, status: 'active' },
    { inmate_id: 3, full_name: 'Mona El-Sayed', date_of_birth: '1992-01-30', gender: 'Female', nationality: 'Egyptian', occupation: 'Teacher', national_id: 'NID100003', start_date: '2025-03-01', expected_release_date: '2026-09-01', assigned_prison: 1, assigned_block: 2, assigned_cell: 5, status: 'active' },
    { inmate_id: 4, full_name: 'Hassan Ali', date_of_birth: '1978-12-05', gender: 'Male', nationality: 'Egyptian', occupation: 'Farmer', national_id: 'NID100004', start_date: '2023-06-20', expected_release_date: '2033-06-20', assigned_prison: 1, assigned_block: 1, assigned_cell: 3, status: 'active' },
    { inmate_id: 5, full_name: 'Amira Nabil', date_of_birth: '1995-09-18', gender: 'Female', nationality: 'Egyptian', occupation: 'Nurse', national_id: 'NID100005', start_date: '2025-02-14', expected_release_date: '2026-08-14', assigned_prison: 2, assigned_block: 3, assigned_cell: 8, status: 'active' },
    { inmate_id: 6, full_name: 'Tarek Samir', date_of_birth: '1988-04-11', gender: 'Male', nationality: 'Egyptian', occupation: 'Mechanic', national_id: 'NID100006', start_date: '2024-08-05', expected_release_date: '2027-02-05', assigned_prison: 2, assigned_block: 3, assigned_cell: 9, status: 'active' },
    { inmate_id: 7, full_name: 'Nadia Hussein', date_of_birth: '1993-06-25', gender: 'Female', nationality: 'Egyptian', occupation: 'Student', national_id: 'NID100007', start_date: '2025-01-20', expected_release_date: '2026-07-20', assigned_prison: 2, assigned_block: 4, assigned_cell: 12, status: 'active' },
    { inmate_id: 8, full_name: 'Mahmoud Salah', date_of_birth: '1982-11-10', gender: 'Male', nationality: 'Egyptian', occupation: 'Businessman', national_id: 'NID100008', start_date: '2024-05-15', expected_release_date: '2034-05-15', assigned_prison: 1, assigned_block: 1, assigned_cell: 4, status: 'active' },
    { inmate_id: 9, full_name: 'Heba Ramadan', date_of_birth: '1997-02-14', gender: 'Female', nationality: 'Egyptian', occupation: 'Artist', national_id: 'NID100009', start_date: '2025-04-01', expected_release_date: '2026-04-01', assigned_prison: 2, assigned_block: 4, assigned_cell: 13, status: 'active' },
    { inmate_id: 10, full_name: 'Ahmed Farouk', date_of_birth: '1990-08-30', gender: 'Male', nationality: 'Egyptian', occupation: 'Engineer', national_id: 'NID100010', start_date: '2024-12-01', expected_release_date: '2029-12-01', assigned_prison: 1, assigned_block: 2, assigned_cell: 6, status: 'active' },
    { inmate_id: 11, full_name: 'Samia Ibrahim', date_of_birth: '1989-04-18', gender: 'Female', nationality: 'Egyptian', occupation: 'Doctor', national_id: 'NID100011', start_date: '2025-02-01', expected_release_date: '2027-02-01', assigned_prison: 2, assigned_block: 3, assigned_cell: 10, status: 'active' },
    { inmate_id: 12, full_name: 'Karim Adel', date_of_birth: '1994-07-22', gender: 'Male', nationality: 'Egyptian', occupation: 'Chef', national_id: 'NID100012', start_date: '2024-09-15', expected_release_date: '2026-09-15', assigned_prison: 1, assigned_block: 2, assigned_cell: 7, status: 'active' },
    { inmate_id: 13, full_name: 'Laila Mansour', date_of_birth: '1991-12-05', gender: 'Female', nationality: 'Egyptian', occupation: 'Lawyer', national_id: 'NID100013', start_date: '2025-03-10', expected_release_date: '2028-03-10', assigned_prison: 2, assigned_block: 4, assigned_cell: 14, status: 'active' },
    { inmate_id: 14, full_name: 'Hany Sobhi', date_of_birth: '1986-03-28', gender: 'Male', nationality: 'Egyptian', occupation: 'Accountant', national_id: 'NID100014', start_date: '2024-07-20', expected_release_date: '2029-07-20', assigned_prison: 1, assigned_block: 1, assigned_cell: 1, status: 'active' },
    { inmate_id: 15, full_name: 'Rania Kamal', date_of_birth: '1998-09-12', gender: 'Female', nationality: 'Egyptian', occupation: 'Journalist', national_id: 'NID100015', start_date: '2025-01-05', expected_release_date: '2026-01-05', assigned_prison: 2, assigned_block: 3, assigned_cell: 11, status: 'released' },
    { inmate_id: 16, full_name: 'Wael Hassan', date_of_birth: '1983-05-17', gender: 'Male', nationality: 'Egyptian', occupation: 'Electrician', national_id: 'NID100016', start_date: '2023-11-11', expected_release_date: '2033-11-11', assigned_prison: 1, assigned_block: 1, assigned_cell: 2, status: 'active' },
    { inmate_id: 17, full_name: 'Dina Magdy', date_of_birth: '1996-01-23', gender: 'Female', nationality: 'Egyptian', occupation: 'Pharmacist', national_id: 'NID100017', start_date: '2025-02-28', expected_release_date: '2027-02-28', assigned_prison: 2, assigned_block: 4, assigned_cell: 12, status: 'active' },
    { inmate_id: 18, full_name: 'Sherif Nabil', date_of_birth: '1987-10-08', gender: 'Male', nationality: 'Egyptian', occupation: 'Plumber', national_id: 'NID100018', start_date: '2024-06-15', expected_release_date: '2028-06-15', assigned_prison: 1, assigned_block: 2, assigned_cell: 5, status: 'active' },
    { inmate_id: 19, full_name: 'Mai Ahmed', date_of_birth: '1992-06-30', gender: 'Female', nationality: 'Egyptian', occupation: 'Designer', national_id: 'NID100019', start_date: '2025-04-10', expected_release_date: '2026-10-10', assigned_prison: 2, assigned_block: 3, assigned_cell: 8, status: 'active' },
    { inmate_id: 20, full_name: 'Ashraf Mahmoud', date_of_birth: '1984-02-14', gender: 'Male', nationality: 'Egyptian', occupation: 'Tailor', national_id: 'NID100020', start_date: '2024-03-20', expected_release_date: '2030-03-20', assigned_prison: 1, assigned_block: 1, assigned_cell: 3, status: 'active' },
    { inmate_id: 21, full_name: 'Nour El-Din', date_of_birth: '1999-08-05', gender: 'Male', nationality: 'Egyptian', occupation: 'Student', national_id: 'NID100021', start_date: '2025-01-15', expected_release_date: '2026-07-15', assigned_prison: 3, assigned_block: 5, assigned_cell: 15, status: 'active' },
    { inmate_id: 22, full_name: 'Hoda Zakaria', date_of_birth: '1990-11-20', gender: 'Female', nationality: 'Egyptian', occupation: 'Secretary', national_id: 'NID100022', start_date: '2024-10-01', expected_release_date: '2027-10-01', assigned_prison: 2, assigned_block: 4, assigned_cell: 13, status: 'active' },
    { inmate_id: 23, full_name: 'Gamal Abdel', date_of_birth: '1981-04-12', gender: 'Male', nationality: 'Egyptian', occupation: 'Welder', national_id: 'NID100023', start_date: '2023-08-25', expected_release_date: '2033-08-25', assigned_prison: 1, assigned_block: 1, assigned_cell: 4, status: 'active' },
    { inmate_id: 24, full_name: 'Soha Samir', date_of_birth: '1995-03-08', gender: 'Female', nationality: 'Egyptian', occupation: 'Cashier', national_id: 'NID100024', start_date: '2025-03-15', expected_release_date: '2026-09-15', assigned_prison: 2, assigned_block: 3, assigned_cell: 9, status: 'active' },
    { inmate_id: 25, full_name: 'Fathy Omar', date_of_birth: '1988-07-19', gender: 'Male', nationality: 'Egyptian', occupation: 'Baker', national_id: 'NID100025', start_date: '2024-04-10', expected_release_date: '2028-04-10', assigned_prison: 1, assigned_block: 2, assigned_cell: 6, status: 'transferred' },
    { inmate_id: 26, full_name: 'Omar Nabil', date_of_birth: '1989-05-22', gender: 'Male', nationality: 'Egyptian', occupation: 'Technician', national_id: 'NID100026', start_date: '2024-02-14', expected_release_date: '2027-08-14', assigned_prison: 3, assigned_block: 5, assigned_cell: 14, status: 'active' },
    { inmate_id: 27, full_name: 'Sara Mohamed', date_of_birth: '1991-08-11', gender: 'Female', nationality: 'Egyptian', occupation: 'Accountant', national_id: 'NID100027', start_date: '2024-11-20', expected_release_date: '2028-05-20', assigned_prison: 4, assigned_block: 7, assigned_cell: 21, status: 'active' },
    { inmate_id: 28, full_name: 'Ahmed Ibrahim', date_of_birth: '1987-12-03', gender: 'Male', nationality: 'Egyptian', occupation: 'Driver', national_id: 'NID100028', start_date: '2023-09-15', expected_release_date: '2030-03-15', assigned_prison: 4, assigned_block: 8, assigned_cell: 26, status: 'active' },
    { inmate_id: 29, full_name: 'Mona Fawzi', date_of_birth: '1993-04-17', gender: 'Female', nationality: 'Egyptian', occupation: 'Nurse', national_id: 'NID100029', start_date: '2025-01-08', expected_release_date: '2026-07-08', assigned_prison: 5, assigned_block: 10, assigned_cell: 35, status: 'active' },
    { inmate_id: 30, full_name: 'Hassan Taha', date_of_birth: '1985-06-28', gender: 'Male', nationality: 'Egyptian', occupation: 'Electrician', national_id: 'NID100030', start_date: '2024-08-30', expected_release_date: '2029-02-28', assigned_prison: 5, assigned_block: 11, assigned_cell: 38, status: 'active' },
    { inmate_id: 31, full_name: 'Laila Gamal', date_of_birth: '1992-10-05', gender: 'Female', nationality: 'Egyptian', occupation: 'Teacher', national_id: 'NID100031', start_date: '2025-03-22', expected_release_date: '2026-09-22', assigned_prison: 6, assigned_block: 12, assigned_cell: 41, status: 'active' },
    { inmate_id: 32, full_name: 'Yasser Salem', date_of_birth: '1988-01-19', gender: 'Male', nationality: 'Egyptian', occupation: 'Plumber', national_id: 'NID100032', start_date: '2024-05-11', expected_release_date: '2028-11-11', assigned_prison: 6, assigned_block: 12, assigned_cell: 42, status: 'active' },
    { inmate_id: 33, full_name: 'Dina Khaled', date_of_birth: '1994-07-07', gender: 'Female', nationality: 'Egyptian', occupation: 'Designer', national_id: 'NID100033', start_date: '2025-02-14', expected_release_date: '2027-08-14', assigned_prison: 7, assigned_block: 13, assigned_cell: 45, status: 'active' },
    { inmate_id: 34, full_name: 'Mahmoud Fathy', date_of_birth: '1986-09-25', gender: 'Male', nationality: 'Egyptian', occupation: 'Businessman', national_id: 'NID100034', start_date: '2023-12-01', expected_release_date: '2031-06-01', assigned_prison: 7, assigned_block: 14, assigned_cell: 49, status: 'active' },
    { inmate_id: 35, full_name: 'Sara Nabil', date_of_birth: '1991-03-14', gender: 'Female', nationality: 'Egyptian', occupation: 'Pharmacist', national_id: 'NID100035', start_date: '2024-10-20', expected_release_date: '2028-04-20', assigned_prison: 4, assigned_block: 9, assigned_cell: 31, status: 'active' },
    { inmate_id: 36, full_name: 'Omar El-Sayed', date_of_birth: '1989-11-28', gender: 'Male', nationality: 'Egyptian', occupation: 'Mechanic', national_id: 'NID100036', start_date: '2024-06-05', expected_release_date: '2029-12-05', assigned_prison: 4, assigned_block: 9, assigned_cell: 32, status: 'active' },
    { inmate_id: 37, full_name: 'Heba Taha', date_of_birth: '1995-05-16', gender: 'Female', nationality: 'Egyptian', occupation: 'Nurse', national_id: 'NID100037', start_date: '2025-04-01', expected_release_date: '2026-10-01', assigned_prison: 5, assigned_block: 10, assigned_cell: 36, status: 'active' },
    { inmate_id: 38, full_name: 'Karim Ramadan', date_of_birth: '1987-08-09', gender: 'Male', nationality: 'Egyptian', occupation: 'Chef', national_id: 'NID100038', start_date: '2024-03-15', expected_release_date: '2028-09-15', assigned_prison: 6, assigned_block: 12, assigned_cell: 43, status: 'active' },
    { inmate_id: 39, full_name: 'Mona Ibrahim', date_of_birth: '1993-12-22', gender: 'Female', nationality: 'Egyptian', occupation: 'Accountant', national_id: 'NID100039', start_date: '2025-01-18', expected_release_date: '2027-07-18', assigned_prison: 7, assigned_block: 13, assigned_cell: 46, status: 'active' },
    { inmate_id: 40, full_name: 'Ahmed Fawzi', date_of_birth: '1984-04-30', gender: 'Male', nationality: 'Egyptian', occupation: 'Welder', national_id: 'NID100040', start_date: '2023-11-10', expected_release_date: '2030-05-10', assigned_prison: 7, assigned_block: 14, assigned_cell: 50, status: 'active' },
    { inmate_id: 41, full_name: 'Laila Mansour', date_of_birth: '1990-06-12', gender: 'Female', nationality: 'Egyptian', occupation: 'Teacher', national_id: 'NID100041', start_date: '2024-09-01', expected_release_date: '2028-03-01', assigned_prison: 4, assigned_block: 7, assigned_cell: 22, status: 'active' },
    { inmate_id: 42, full_name: 'Hassan Ali', date_of_birth: '1988-10-08', gender: 'Male', nationality: 'Egyptian', occupation: 'Electrician', national_id: 'NID100042', start_date: '2024-07-25', expected_release_date: '2029-01-25', assigned_prison: 5, assigned_block: 11, assigned_cell: 39, status: 'active' },
    { inmate_id: 43, full_name: 'Sara Kamal', date_of_birth: '1992-02-14', gender: 'Female', nationality: 'Egyptian', occupation: 'Designer', national_id: 'NID100043', start_date: '2025-03-01', expected_release_date: '2026-09-01', assigned_prison: 6, assigned_block: 12, assigned_cell: 44, status: 'active' },
    { inmate_id: 44, full_name: 'Omar Nasser', date_of_birth: '1986-05-20', gender: 'Male', nationality: 'Egyptian', occupation: 'Technician', national_id: 'NID100044', start_date: '2024-01-15', expected_release_date: '2028-07-15', assigned_prison: 7, assigned_block: 13, assigned_cell: 47, status: 'active' },
    { inmate_id: 45, full_name: 'Dina Fathy', date_of_birth: '1994-09-30', gender: 'Female', nationality: 'Egyptian', occupation: 'Pharmacist', national_id: 'NID100045', start_date: '2025-02-01', expected_release_date: '2027-08-01', assigned_prison: 4, assigned_block: 8, assigned_cell: 28, status: 'active' },
    { inmate_id: 46, full_name: 'Mahmoud Taha', date_of_birth: '1985-12-11', gender: 'Male', nationality: 'Egyptian', occupation: 'Businessman', national_id: 'NID100046', start_date: '2023-10-20', expected_release_date: '2030-04-20', assigned_prison: 5, assigned_block: 10, assigned_cell: 37, status: 'active' },
    { inmate_id: 47, full_name: 'Laila Ibrahim', date_of_birth: '1991-04-25', gender: 'Female', nationality: 'Egyptian', occupation: 'Nurse', national_id: 'NID100047', start_date: '2024-11-15', expected_release_date: '2028-05-15', assigned_prison: 6, assigned_block: 12, assigned_cell: 40, status: 'active' },
    { inmate_id: 48, full_name: 'Karim Salem', date_of_birth: '1987-07-07', gender: 'Male', nationality: 'Egyptian', occupation: 'Chef', national_id: 'NID100048', start_date: '2024-04-01', expected_release_date: '2028-10-01', assigned_prison: 7, assigned_block: 14, assigned_cell: 51, status: 'active' },
    { inmate_id: 49, full_name: 'Mona Khaled', date_of_birth: '1993-08-18', gender: 'Female', nationality: 'Egyptian', occupation: 'Accountant', national_id: 'NID100049', start_date: '2025-01-25', expected_release_date: '2027-07-25', assigned_prison: 4, assigned_block: 7, assigned_cell: 23, status: 'active' },
    { inmate_id: 50, full_name: 'Ahmed Mansour', date_of_birth: '1984-02-28', gender: 'Male', nationality: 'Egyptian', occupation: 'Welder', national_id: 'NID100050', start_date: '2023-09-01', expected_release_date: '2030-03-01', assigned_prison: 5, assigned_block: 11, assigned_cell: 40, status: 'active' },
];

export const mockIncidents = [
    { incident_id: 1, type: 'Fight', date_time: '2026-04-15 14:30', prison_id: 1, block_id: 1, cell_id: 1, reporting_officer: 'OFF001', description: 'Altercation between two inmates during yard time.', action_taken: 'Inmates separated, both sent to cells.' },
    { incident_id: 2, type: 'Self-Harm', date_time: '2026-04-17 22:15', prison_id: 1, block_id: 2, cell_id: 5, reporting_officer: 'OFF002', description: 'Inmate found with self-inflicted cuts.', action_taken: 'Medical team called, inmate transferred to infirmary.' },
    { incident_id: 3, type: 'Escape Attempt', date_time: '2026-04-18 03:00', prison_id: 1, block_id: 1, cell_id: 2, reporting_officer: 'OFF001', description: 'Inmate attempted to climb perimeter fence.', action_taken: 'Alarm triggered, inmate apprehended and placed in solitary.' },
    { incident_id: 4, type: 'Contraband', date_time: '2026-04-19 10:00', prison_id: 2, block_id: 3, cell_id: 8, reporting_officer: 'OFF003', description: 'Mobile phone found hidden in cell.', action_taken: 'Phone confiscated, inmate lost privileges for 30 days.' },
    { incident_id: 5, type: 'Medical Emergency', date_time: '2026-04-20 16:45', prison_id: 1, block_id: 2, cell_id: 7, reporting_officer: 'OFF002', description: 'Inmate collapsed due to heat exhaustion.', action_taken: 'Transferred to hospital, condition stable.' },
    { incident_id: 6, type: 'Property Damage', date_time: '2026-04-21 09:15', prison_id: 1, block_id: 1, cell_id: 3, reporting_officer: 'OFF001', description: 'Inmate damaged cell door during outburst.', action_taken: 'Repairs completed, inmate placed in observation.' },
    { incident_id: 7, type: 'Assault on Staff', date_time: '2026-04-22 11:30', prison_id: 4, block_id: 7, cell_id: 21, reporting_officer: 'OFF006', description: 'Inmate assaulted officer during cell search.', action_taken: 'Officer treated for minor injuries, inmate placed in solitary.' },
    { incident_id: 8, type: 'Fight', date_time: '2026-04-23 16:45', prison_id: 2, block_id: 4, cell_id: 12, reporting_officer: 'OFF003', description: 'Multiple inmates involved in cafeteria altercation.', action_taken: 'All involved inmates sent to cells, investigation ongoing.' },
    { incident_id: 9, type: 'Self-Harm', date_time: '2026-04-24 08:20', prison_id: 3, block_id: 6, cell_id: 19, reporting_officer: 'OFF004', description: 'Juvenile inmate found with ligature marks.', action_taken: 'Immediate medical attention, psychiatric evaluation ordered.' },
    { incident_id: 10, type: 'Contraband', date_time: '2026-04-25 14:00', prison_id: 4, block_id: 8, cell_id: 27, reporting_officer: 'OFF007', description: 'Drugs found during routine cell search.', action_taken: 'Contraband seized, inmate sent to disciplinary hearing.' },
];

export const mockDisciplinaryLogs = [
    { log_id: 1, inmate_id: 1, incident_id: 1, punishment_type: 'Solitary Confinement', solitary_confinement_duration: 7, imposed_by: 'OFF001', date_imposed: '2026-04-15', end_date: '2026-04-22', notes: 'Instigated fight' },
    { log_id: 2, inmate_id: 2, incident_id: 1, punishment_type: 'Loss of Privileges', solitary_confinement_duration: null, imposed_by: 'OFF001', date_imposed: '2026-04-15', end_date: '2026-04-30', notes: 'Involved in fight' },
    { log_id: 3, inmate_id: 3, incident_id: 2, punishment_type: 'Medical Monitoring', solitary_confinement_duration: null, imposed_by: 'MGR001', date_imposed: '2026-04-17', end_date: '2026-05-17', notes: 'Weekly psychological evaluation required' },
    { log_id: 4, inmate_id: 2, incident_id: 3, punishment_type: 'Solitary Confinement', solitary_confinement_duration: 14, imposed_by: 'MGR001', date_imposed: '2026-04-18', end_date: '2026-05-02', notes: 'Escape attempt - maximum security response' },
    { log_id: 5, inmate_id: 5, incident_id: 4, punishment_type: 'Loss of Privileges', solitary_confinement_duration: null, imposed_by: 'OFF003', date_imposed: '2026-04-19', end_date: '2026-05-19', notes: 'Contraband possession' },
    { log_id: 6, inmate_id: 8, incident_id: 6, punishment_type: 'Solitary Confinement', solitary_confinement_duration: 5, imposed_by: 'OFF001', date_imposed: '2026-04-21', end_date: '2026-04-26', notes: 'Property damage' },
    { log_id: 7, inmate_id: 23, incident_id: 7, punishment_type: 'Solitary Confinement', solitary_confinement_duration: 30, imposed_by: 'OFF006', date_imposed: '2026-04-22', end_date: '2026-05-22', notes: 'Assault on staff member' },
    { log_id: 8, inmate_id: 12, incident_id: 8, punishment_type: 'Loss of Privileges', solitary_confinement_duration: null, imposed_by: 'OFF003', date_imposed: '2026-04-23', end_date: '2026-05-07', notes: 'Cafeteria disturbance' },
    { log_id: 9, inmate_id: 21, incident_id: 9, punishment_type: 'Medical Monitoring', solitary_confinement_duration: null, imposed_by: 'MGR002', date_imposed: '2026-04-24', end_date: '2026-05-24', notes: 'Self-harm incident - juvenile facility' },
    { log_id: 10, inmate_id: 20, incident_id: 10, punishment_type: 'Transfer to High-Security', solitary_confinement_duration: 7, imposed_by: 'OFF007', date_imposed: '2026-04-25', end_date: '2026-05-02', notes: 'Drug possession - pending transfer' },
];

export const mockVisits = [
    { visit_id: 1, inmate_national_id: 'NID100001', visit_date: '2026-04-20', time_slot: '09:00-10:00', duration: 30, status: 'Pending', visit_type: 'Regular', prison_id: 1 },
    { visit_id: 2, inmate_national_id: 'NID100004', visit_date: '2026-04-21', time_slot: '14:00-15:00', duration: 60, status: 'Pending', visit_type: 'Legal', prison_id: 1 },
    { visit_id: 3, inmate_national_id: 'NID100002', visit_date: '2026-04-22', time_slot: '10:00-11:00', duration: 30, status: 'Approved', visit_type: 'Regular', prison_id: 1 },
    { visit_id: 4, inmate_national_id: 'NID100005', visit_date: '2026-04-23', time_slot: '09:00-10:00', duration: 45, status: 'Approved', visit_type: 'Regular', prison_id: 2 },
    { visit_id: 5, inmate_national_id: 'NID100003', visit_date: '2026-04-24', time_slot: '14:00-15:00', duration: 30, status: 'Denied', visit_type: 'Regular', prison_id: 1 },
    { visit_id: 6, inmate_national_id: 'NID100006', visit_date: '2026-04-25', time_slot: '10:00-11:00', duration: 30, status: 'Pending', visit_type: 'Regular', prison_id: 2 },
    { visit_id: 7, inmate_national_id: 'NID100008', visit_date: '2026-04-26', time_slot: '15:00-16:00', duration: 60, status: 'Approved', visit_type: 'Legal', prison_id: 1 },
    { visit_id: 8, inmate_national_id: 'NID100010', visit_date: '2026-04-27', time_slot: '09:00-10:00', duration: 30, status: 'Pending', visit_type: 'Regular', prison_id: 1 },
    { visit_id: 9, inmate_national_id: 'NID100012', visit_date: '2026-04-28', time_slot: '14:00-15:00', duration: 45, status: 'Approved', visit_type: 'Regular', prison_id: 1 },
    { visit_id: 10, inmate_national_id: 'NID100015', visit_date: '2026-04-29', time_slot: '11:00-12:00', duration: 30, status: 'Denied', visit_type: 'Regular', prison_id: 3 },
];

export const mockTransfers = [
    { transfer_id: 1, requesting_prison: 1, destination_prison: 2, reason: 'Overcrowding in Block A, inmate eligible for lower security', inmate_id: 1, inmate_name: 'Khaled Mahmoud', status: 'Pending', approval_date: null },
    { transfer_id: 2, requesting_prison: 1, destination_prison: 3, reason: 'Juvenile inmate transferred to youth facility', inmate_id: 21, inmate_name: 'Nour El-Din', status: 'Approved', approval_date: '2026-04-15' },
    { transfer_id: 3, requesting_prison: 2, destination_prison: 1, reason: 'Medical treatment required at main facility', inmate_id: 5, inmate_name: 'Amira Nabil', status: 'Pending', approval_date: null },
    { transfer_id: 4, requesting_prison: 4, destination_prison: 1, reason: 'Security reclassification - reduced risk', inmate_id: 23, inmate_name: 'Gamal Abdel', status: 'Pending', approval_date: null },
    { transfer_id: 5, requesting_prison: 1, destination_prison: 5, reason: 'Family proximity request approved', inmate_id: 12, inmate_name: 'Karim Adel', status: 'Approved', approval_date: '2026-04-20' },
    { transfer_id: 6, requesting_prison: 2, destination_prison: 4, reason: 'Overcrowding relief', inmate_id: 20, inmate_name: 'Ashraf Mahmoud', status: 'Pending', approval_date: null },
];

export const mockShifts = [
    { shift_id: 1, officer_id: 'OFF001', block_id: 1, shift_type: 'Morning', date: '2026-04-19', start_time: '06:00', end_time: '14:00' },
    { shift_id: 2, officer_id: 'OFF002', block_id: 2, shift_type: 'Morning', date: '2026-04-19', start_time: '06:00', end_time: '14:00' },
    { shift_id: 3, officer_id: 'OFF001', block_id: 1, shift_type: 'Afternoon', date: '2026-04-19', start_time: '14:00', end_time: '22:00' },
    { shift_id: 4, officer_id: 'OFF003', block_id: 3, shift_type: 'Morning', date: '2026-04-19', start_time: '06:00', end_time: '14:00' },
    { shift_id: 5, officer_id: 'OFF002', block_id: 2, shift_type: 'Night', date: '2026-04-19', start_time: '22:00', end_time: '06:00' },
    { shift_id: 6, officer_id: 'OFF004', block_id: 6, shift_type: 'Morning', date: '2026-04-20', start_time: '06:00', end_time: '14:00' },
    { shift_id: 7, officer_id: 'OFF005', block_id: 6, shift_type: 'Afternoon', date: '2026-04-20', start_time: '14:00', end_time: '22:00' },
    { shift_id: 8, officer_id: 'OFF006', block_id: 7, shift_type: 'Morning', date: '2026-04-20', start_time: '06:00', end_time: '14:00' },
    { shift_id: 9, officer_id: 'OFF007', block_id: 8, shift_type: 'Morning', date: '2026-04-20', start_time: '06:00', end_time: '14:00' },
    { shift_id: 10, officer_id: 'OFF008', block_id: 10, shift_type: 'Night', date: '2026-04-20', start_time: '22:00', end_time: '06:00' },
];

export const mockDoctors = [
    { national_id: 'DOC001', name: 'Dr. Nadia Mostafa', address: 'Cairo', phone: '01066666666', prison_id: 1 },
    { national_id: 'DOC002', name: 'Dr. Ramy Gamal', address: 'Alexandria', phone: '01077777777', prison_id: 2 },
    { national_id: 'DOC003', name: 'Dr. Hoda Salem', address: 'Giza', phone: '01088888888', prison_id: 3 },
    { national_id: 'DOC004', name: 'Dr. Ahmed Fathy', address: 'Luxor', phone: '01099999999', prison_id: 5 },
    { national_id: 'DOC005', name: 'Dr. Mona El-Sayed', address: 'Port Said', phone: '01100000000', prison_id: 6 },
];

export const mockMedicalVisits = [
    { visit_id: 1, inmate_id: 3, doctor_id: 'DOC001', date_time: '2026-04-17 23:00', diagnosis: 'Lacerations', description: 'Self-inflicted cuts treated and bandaged' },
    { visit_id: 2, inmate_id: 10, doctor_id: 'DOC001', date_time: '2026-04-18 10:00', diagnosis: 'Respiratory infection', description: 'Prescribed antibiotics and rest' },
    { visit_id: 3, inmate_id: 5, doctor_id: 'DOC002', date_time: '2026-04-19 14:00', diagnosis: 'Migraine', description: 'Pain medication administered' },
    { visit_id: 4, inmate_id: 15, doctor_id: 'DOC003', date_time: '2026-04-20 09:00', diagnosis: 'Anxiety', description: 'Referred to psychiatric evaluation' },
    { visit_id: 5, inmate_id: 20, doctor_id: 'DOC001', date_time: '2026-04-21 11:00', diagnosis: 'Sprained ankle', description: 'Rest and ice treatment recommended' },
];

export const mockLegalCases = [
    { case_id: 1, case_number: 'CR-2025-001', case_type: 'Armed Robbery', court_name: 'Cairo Criminal Court', sentence_duration: '3 years', inmate_id: 1 },
    { case_id: 2, case_number: 'CR-2024-112', case_type: 'Drug Trafficking', court_name: 'Cairo Criminal Court', sentence_duration: '5 years', inmate_id: 2 },
    { case_id: 3, case_number: 'CR-2025-033', case_type: 'Fraud', court_name: 'Giza Criminal Court', sentence_duration: '18 months', inmate_id: 3 },
    { case_id: 4, case_number: 'CR-2023-089', case_type: 'Murder', court_name: 'Cairo Criminal Court', sentence_duration: '10 years', inmate_id: 4 },
    { case_id: 5, case_number: 'CR-2025-015', case_type: 'Theft', court_name: 'Alexandria Court', sentence_duration: '6 months', inmate_id: 5 },
    { case_id: 6, case_number: 'CR-2024-203', case_type: 'Assault', court_name: 'Giza Criminal Court', sentence_duration: '2 years', inmate_id: 8 },
    { case_id: 7, case_number: 'CR-2023-156', case_type: 'Burglary', court_name: 'Cairo Criminal Court', sentence_duration: '4 years', inmate_id: 23 },
];

export const mockCells = [
    { cell_id: 1, block_id: 1, capacity: 4, current_occupancy: 4 },
    { cell_id: 2, block_id: 1, capacity: 4, current_occupancy: 4 },
    { cell_id: 3, block_id: 1, capacity: 4, current_occupancy: 3 },
    { cell_id: 4, block_id: 1, capacity: 4, current_occupancy: 4 },
    { cell_id: 5, block_id: 2, capacity: 3, current_occupancy: 2 },
    { cell_id: 6, block_id: 2, capacity: 3, current_occupancy: 3 },
    { cell_id: 7, block_id: 2, capacity: 3, current_occupancy: 1 },
    { cell_id: 8, block_id: 3, capacity: 3, current_occupancy: 3 },
    { cell_id: 9, block_id: 3, capacity: 3, current_occupancy: 2 },
    { cell_id: 10, block_id: 3, capacity: 3, current_occupancy: 2 },
    { cell_id: 11, block_id: 4, capacity: 4, current_occupancy: 4 },
    { cell_id: 12, block_id: 4, capacity: 4, current_occupancy: 4 },
    { cell_id: 13, block_id: 4, capacity: 4, current_occupancy: 3 },
    { cell_id: 14, block_id: 4, capacity: 4, current_occupancy: 4 },
    { cell_id: 15, block_id: 5, capacity: 3, current_occupancy: 2 },
    { cell_id: 16, block_id: 5, capacity: 3, current_occupancy: 3 },
    { cell_id: 17, block_id: 5, capacity: 3, current_occupancy: 2 },
    { cell_id: 18, block_id: 6, capacity: 3, current_occupancy: 2 },
    { cell_id: 19, block_id: 6, capacity: 3, current_occupancy: 3 },
    { cell_id: 20, block_id: 6, capacity: 3, current_occupancy: 2 },
    { cell_id: 21, block_id: 7, capacity: 5, current_occupancy: 5 },
    { cell_id: 22, block_id: 7, capacity: 5, current_occupancy: 5 },
    { cell_id: 23, block_id: 7, capacity: 5, current_occupancy: 4 },
    { cell_id: 24, block_id: 7, capacity: 5, current_occupancy: 5 },
    { cell_id: 25, block_id: 7, capacity: 5, current_occupancy: 5 },
    { cell_id: 26, block_id: 8, capacity: 5, current_occupancy: 5 },
    { cell_id: 27, block_id: 8, capacity: 5, current_occupancy: 5 },
    { cell_id: 28, block_id: 8, capacity: 5, current_occupancy: 4 },
    { cell_id: 29, block_id: 8, capacity: 5, current_occupancy: 5 },
    { cell_id: 30, block_id: 8, capacity: 5, current_occupancy: 5 },
    { cell_id: 31, block_id: 9, capacity: 4, current_occupancy: 4 },
    { cell_id: 32, block_id: 9, capacity: 4, current_occupancy: 4 },
    { cell_id: 33, block_id: 9, capacity: 4, current_occupancy: 3 },
    { cell_id: 34, block_id: 9, capacity: 4, current_occupancy: 4 },
    { cell_id: 35, block_id: 10, capacity: 3, current_occupancy: 3 },
    { cell_id: 36, block_id: 10, capacity: 3, current_occupancy: 3 },
    { cell_id: 37, block_id: 10, capacity: 3, current_occupancy: 3 },
    { cell_id: 38, block_id: 11, capacity: 3, current_occupancy: 2 },
    { cell_id: 39, block_id: 11, capacity: 3, current_occupancy: 2 },
    { cell_id: 40, block_id: 11, capacity: 3, current_occupancy: 2 },
    { cell_id: 41, block_id: 12, capacity: 4, current_occupancy: 4 },
    { cell_id: 42, block_id: 12, capacity: 4, current_occupancy: 4 },
    { cell_id: 43, block_id: 12, capacity: 4, current_occupancy: 3 },
    { cell_id: 44, block_id: 12, capacity: 4, current_occupancy: 4 },
    { cell_id: 45, block_id: 13, capacity: 4, current_occupancy: 4 },
    { cell_id: 46, block_id: 13, capacity: 4, current_occupancy: 4 },
    { cell_id: 47, block_id: 13, capacity: 4, current_occupancy: 3 },
    { cell_id: 48, block_id: 13, capacity: 4, current_occupancy: 4 },
    { cell_id: 49, block_id: 14, capacity: 4, current_occupancy: 4 },
    { cell_id: 50, block_id: 14, capacity: 4, current_occupancy: 4 },
    { cell_id: 51, block_id: 14, capacity: 4, current_occupancy: 3 },
    { cell_id: 52, block_id: 14, capacity: 4, current_occupancy: 4 },
];

// Helper functions to get data
export const getPrisons = () => mockPrisons;
export const getBlocks = () => mockBlocks;
export const getOfficers = () => mockOfficers;
export const getInmates = () => mockInmates;
export const getIncidents = () => mockIncidents;
export const getDisciplinaryLogs = () => mockDisciplinaryLogs;
export const getVisits = () => mockVisits;
export const getTransfers = () => mockTransfers;
export const getShifts = () => mockShifts;
export const getDoctors = () => mockDoctors;
export const getMedicalVisits = () => mockMedicalVisits;
export const getLegalCases = () => mockLegalCases;
export const getCells = () => mockCells;

// Detail view helpers
export const getPrisonDetail = (prisonId) => {
    const prison = mockPrisons.find(p => p.prison_id === parseInt(prisonId));
    if (!prison) return null;
    
    const blocks = mockBlocks.filter(b => b.prison_id === parseInt(prisonId));
    const features = {
        infirmary: prison.has_infirmary === 1,
        workshops: prison.has_workshops === 1,
        agricultural_ward: prison.has_agricultural_ward === 1,
        visitation_hall: prison.has_visitation_hall === 1,
        visitation_hall_capacity: prison.visitation_hall_capacity,
    };
    
    // Get cells for each block
    const block_cells = {};
    blocks.forEach(block => {
        block_cells[block.block_id] = mockCells.filter(c => c.block_id === block.block_id);
    });
    
    return { prison, features, blocks, block_cells };
};

export const getInmateDetail = (inmateId) => {
    const inmate = mockInmates.find(i => i.inmate_id === parseInt(inmateId));
    if (!inmate) return null;
    
    // Get legal case
    const legal_case = mockLegalCases.find(lc => lc.inmate_id === parseInt(inmateId));
    
    // Get incidents for this inmate
    const inmateIncidents = mockIncidents.filter(inc => 
        mockDisciplinaryLogs.some(dl => dl.incident_id === inc.incident_id && dl.inmate_id === parseInt(inmateId))
    );
    
    // Get disciplinary records
    const disciplinary = mockDisciplinaryLogs.filter(dl => dl.inmate_id === parseInt(inmateId));
    
    // Get medical visits
    const medical = mockMedicalVisits.filter(mv => mv.inmate_id === parseInt(inmateId));
    
    return { inmate, legal_case, incidents: inmateIncidents, disciplinary, medical };
};

export const getIncidentDetail = (incidentId) => {
    const incident = mockIncidents.find(i => i.incident_id === parseInt(incidentId));
    if (!incident) return null;
    
    // Get related data
    const prison = mockPrisons.find(p => p.prison_id === incident.prison_id);
    const block = mockBlocks.find(b => b.block_id === incident.block_id);
    const officer = mockOfficers.find(o => o.national_id === incident.reporting_officer);
    
    return {
        incident,
        prison: prison ? { name: prison.name } : null,
        block: block ? { name: block.name } : null,
        officer: officer ? { name: officer.name } : null,
    };
};

export const getBlocksWithCells = () => {
    const result = [];
    mockBlocks.forEach(block => {
        const cells = mockCells.filter(c => c.block_id === block.block_id);
        result.push({ ...block, cells });
    });
    return result;
};

// Dashboard data helpers
export const getDashboardData = (role) => {
    const prisons = getPrisons();
    const inmates = getInmates();
    const activeInmates = inmates.filter(i => i.status === 'active');
    const incidents = getIncidents();
    const visits = getVisits();
    const transfers = getTransfers();
    
     if (role === 'officer') {
         // Mock officer assigned to prison 1, block 1
         const assignedBlocks = mockBlocks.filter(b => b.prison_id === 1);
         const recentIncidents = incidents.filter(i => i.prison_id === 1).slice(0, 5);
         const activeSolitary = getDisciplinaryLogs()
             .filter(dl => dl.punishment_type === 'Solitary Confinement' && (!dl.end_date || new Date(dl.end_date) > new Date()))
             .slice(0, 5)
             .map(dl => {
                 const inmate = inmates.find(i => i.inmate_id === dl.inmate_id);
                 return { full_name: inmate?.full_name || 'Unknown', end_date: dl.end_date };
             });
         
         // Enrich shifts with names
         const myShifts = getShifts()
             .filter(s => s.officer_id === 'OFF001')
             .map(s => {
                 const officer = mockOfficers.find(o => o.national_id === s.officer_id);
                 const block = mockBlocks.find(b => b.block_id === s.block_id);
                 const prison = block ? mockPrisons.find(p => p.prison_id === block.prison_id) : null;
                 return {
                     ...s,
                     officer_name: officer ? officer.name : '—',
                     block_name: block ? block.name : '—',
                     prison_name: prison ? prison.name : '—',
                 };
             });
         
         // Enrich cells with block and prison names
         const enrichedCells = mockCells.map(cell => {
             const block = mockBlocks.find(b => b.block_id === cell.block_id);
             const prison = block ? mockPrisons.find(p => p.prison_id === block.prison_id) : null;
             return {
                 ...cell,
                 block_name: block ? block.name : '—',
                 prison_name: prison ? prison.name : '—',
             };
         });
         
         return { 
             assigned_blocks: assignedBlocks, 
             cells: enrichedCells, 
             recent_incidents: recentIncidents, 
             active_solitary: activeSolitary, 
             my_shifts: myShifts 
         };
     }
     
    if (role === 'manager') {
        // Mock manager for prison 2
        const prison = prisons.find(p => p.prison_id === 2);
        const blocks = mockBlocks.filter(b => b.prison_id === 2).map(b => ({
            ...b,
            occupancy_rate: Math.round((b.current_occupancy / b.capacity) * 100)
        }));
        const activeIncidents = incidents.filter(i => i.prison_id === 2 && i.status !== 'resolved').length;
        const pendingVisits = visits.filter(v => v.prison_id === 2 && v.status === 'Pending');
        const upcomingReleases = activeInmates
            .filter(i => i.assigned_prison === 2 && i.expected_release_date)
            .sort((a, b) => new Date(a.expected_release_date) - new Date(b.expected_release_date))
            .slice(0, 5);
         const pendingTransfers = transfers.filter(t => t.requesting_prison === 2 && t.status === 'Pending');
         
         const kpiData = [
             { title: 'Occupancy', value: `${prison.current_occupancy} / ${prison.total_capacity}`, icon: null, color: 'var(--text-secondary)' },
             { title: 'Active Incidents', value: activeIncidents.toString(), icon: null, color: 'var(--color-warning)' },
             { title: 'Pending Visits', value: pendingVisits.length.toString(), icon: null, color: 'var(--text-secondary)' },
             { title: 'Pending Transfers', value: pendingTransfers.length.toString(), icon: null, color: 'var(--text-secondary)' },
         ];
         
         // Get inmate names for transfers
         const getInmateName = (inmateId) => {
             const inmate = inmates.find(i => i.inmate_id === inmateId);
             return inmate ? inmate.full_name : 'Unknown';
         };
         
         return {
             prison,
             blocks,
             kpiData,
             active_incidents: { count: activeIncidents },
             pending_visits: pendingVisits,
             upcoming_releases: upcomingReleases,
             pending_transfers: pendingTransfers.map(t => ({
                 ...t,
                 inmate_name: getInmateName(t.inmate_id),
                 to_prison_name: prisons.find(p => p.prison_id === t.destination_prison)?.name || 'Unknown',
             })),
         };
    }
    
    if (role === 'super_admin') {
        const highRisk = inmates.filter(i => 
            mockDisciplinaryLogs.filter(dl => dl.inmate_id === i.inmate_id).length >= 2
        ).map(i => ({
            ...i,
            incident_count: mockDisciplinaryLogs.filter(dl => dl.inmate_id === i.inmate_id).length
        }));
        
        const alerts = prisons.filter(p => {
            const rate = (p.current_occupancy / p.total_capacity) * 100;
            return rate > 85;
        }).map(p => ({
            ...p,
            rate: Math.round((p.current_occupancy / p.total_capacity) * 100)
        }));
        
        const transferStats = {
            pending: transfers.filter(t => t.status === 'Pending').length,
            approved: transfers.filter(t => t.status === 'Approved').length,
            denied: transfers.filter(t => t.status === 'Denied').length
        };
        
        return {
            prisons,
            high_risk: highRisk,
            alerts,
            transfer_stats: transferStats
        };
    }
    
    return null;
};

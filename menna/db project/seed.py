"""
seed.py — Demo Data Seeder for CPMS
[NOT IN PRD] — Sample data for testing.

Usage:
    python seed.py          → Insert demo data
    python seed.py clear    → ERASE ALL DATA (reset database to empty)

All demo data is clearly marked and easily erasable.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, get_db
from auth import hash_password


def seed_data():
    """Insert demo data into the database."""
    init_db()
    db = get_db()

    print("Seeding demo data...")

    # ── 1. Super Admin ──
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("ADMIN001", "System Administrator", "01000000000", "HQ Cairo",
          "admin@cpms.gov", hash_password("admin123"), "super_admin", None))
    print("  ✓ Super Admin created: ADMIN001 / admin123")

    # ── 2. Prisons ──
    db.execute("""
        INSERT OR IGNORE INTO prisons (prison_id, name, location, type, security_level, total_capacity)
        VALUES (1, 'Cairo Central Prison', 'Cairo', 'Maximum Security', 'Maximum', 500)
    """)
    db.execute("""
        INSERT OR IGNORE INTO prisons (prison_id, name, location, type, security_level, total_capacity)
        VALUES (2, 'Alexandria Correctional Facility', 'Alexandria', 'Minimum Security', 'Medium', 300)
    """)
    db.execute("""
        INSERT OR IGNORE INTO prisons (prison_id, name, location, type, security_level, total_capacity)
        VALUES (3, 'Tanta Youth Detention', 'Gharbia', 'Juvenile', 'Minimum', 150)
    """)
    print("  ✓ 3 prisons created")

    # ── 3. Prison Features ──
    db.execute("INSERT OR IGNORE INTO prison_features VALUES (1, 1, 1, 0, 1, 50)")
    db.execute("INSERT OR IGNORE INTO prison_features VALUES (2, 1, 0, 1, 1, 30)")
    db.execute("INSERT OR IGNORE INTO prison_features VALUES (3, 0, 1, 0, 1, 20)")
    print("  ✓ Prison features set")

    # ── 4. Prison Managers ──
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("MGR001", "Ahmed Hassan", "01011111111", "Cairo",
          "ahmed@cpms.gov", hash_password("manager123"), "prison_manager", 1))
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("MGR002", "Fatima Ali", "01022222222", "Alexandria",
          "fatima@cpms.gov", hash_password("manager123"), "prison_manager", 2))
    print("  ✓ 2 prison managers created (password: manager123)")

    # Assign managers to prisons
    db.execute("UPDATE prisons SET manager_id = 'MGR001' WHERE prison_id = 1")
    db.execute("UPDATE prisons SET manager_id = 'MGR002' WHERE prison_id = 2")

    # ── 5. Officers ──
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("OFF001", "Mohamed Youssef", "01033333333", "Cairo",
          "mohamed@cpms.gov", hash_password("officer123"), "officer", 1))
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("OFF002", "Sara Ibrahim", "01044444444", "Cairo",
          "sara@cpms.gov", hash_password("officer123"), "officer", 1))
    db.execute("""
        INSERT OR IGNORE INTO users (national_id, name, phone, address, email, password, role, prison_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ("OFF003", "Omar Khaled", "01055555555", "Alexandria",
          "omar@cpms.gov", hash_password("officer123"), "officer", 2))
    print("  ✓ 3 officers created (password: officer123)")

    # ── 6. Blocks ──
    db.execute("INSERT OR IGNORE INTO blocks (block_id, prison_id, name, capacity, security_level, number_of_cells) VALUES (1, 1, 'Block A — Max Security', 100, 'Maximum', 4)")
    db.execute("INSERT OR IGNORE INTO blocks (block_id, prison_id, name, capacity, security_level, number_of_cells) VALUES (2, 1, 'Block B — Medium', 80, 'Medium', 3)")
    db.execute("INSERT OR IGNORE INTO blocks (block_id, prison_id, name, capacity, security_level, number_of_cells) VALUES (3, 2, 'Block A — General', 120, 'Medium', 4)")
    db.execute("INSERT OR IGNORE INTO blocks (block_id, prison_id, name, capacity, security_level, number_of_cells) VALUES (4, 2, 'Block B — Minimum', 80, 'Minimum', 3)")
    print("  ✓ 4 blocks created")

    # ── 7. Cells ──
    # Prison 1, Block A
    for i in range(1, 5):
        db.execute("INSERT OR IGNORE INTO cells (cell_id, block_id, prison_id, capacity) VALUES (?, 1, 1, 4)", (i,))
    # Prison 1, Block B
    for i in range(5, 8):
        db.execute("INSERT OR IGNORE INTO cells (cell_id, block_id, prison_id, capacity) VALUES (?, 2, 1, 3)", (i,))
    # Prison 2, Block A
    for i in range(8, 12):
        db.execute("INSERT OR IGNORE INTO cells (cell_id, block_id, prison_id, capacity) VALUES (?, 3, 2, 4)", (i,))
    # Prison 2, Block B
    for i in range(12, 15):
        db.execute("INSERT OR IGNORE INTO cells (cell_id, block_id, prison_id, capacity) VALUES (?, 4, 2, 3)", (i,))
    print("  ✓ 14 cells created")

    # ── 8. Shift Assignments ──
    db.execute("INSERT OR IGNORE INTO shift_assignments (shift_id, officer_id, block_id, shift_type, date, start_time, end_time) VALUES (1, 'OFF001', 1, 'Morning', '2026-04-19', '06:00', '14:00')")
    db.execute("INSERT OR IGNORE INTO shift_assignments (shift_id, officer_id, block_id, shift_type, date, start_time, end_time) VALUES (2, 'OFF002', 2, 'Morning', '2026-04-19', '06:00', '14:00')")
    db.execute("INSERT OR IGNORE INTO shift_assignments (shift_id, officer_id, block_id, shift_type, date, start_time, end_time) VALUES (3, 'OFF001', 1, 'Afternoon', '2026-04-19', '14:00', '22:00')")
    db.execute("INSERT OR IGNORE INTO shift_assignments (shift_id, officer_id, block_id, shift_type, date, start_time, end_time) VALUES (4, 'OFF003', 3, 'Morning', '2026-04-19', '06:00', '14:00')")
    print("  ✓ 4 shift assignments created")

    # ── 9. Inmates ──
    inmates_data = [
        (1, "Khaled Mahmoud", "1990-03-15", "Male", "Egyptian", "Carpenter", "NID100001", "2025-01-10", "2028-06-15", 1, 1, 1),
        (2, "Yasser Abdel-Fattah", "1985-07-22", "Male", "Egyptian", "Driver", "NID100002", "2024-11-01", "2029-11-01", 1, 1, 2),
        (3, "Mona El-Sayed", "1992-01-30", "Female", "Egyptian", "Teacher", "NID100003", "2025-03-01", "2026-09-01", 1, 2, 5),
        (4, "Hassan Ali", "1978-12-05", "Male", "Egyptian", "Farmer", "NID100004", "2023-06-20", "2033-06-20", 1, 1, 3),
        (5, "Amira Nabil", "1995-09-18", "Female", "Egyptian", "Nurse", "NID100005", "2025-02-14", "2026-08-14", 2, 3, 8),
        (6, "Tarek Samir", "1988-04-11", "Male", "Egyptian", "Mechanic", "NID100006", "2024-08-05", "2027-02-05", 2, 3, 9),
    ]
    for im in inmates_data:
        db.execute("""
            INSERT OR IGNORE INTO inmates (inmate_id, full_name, date_of_birth, gender, nationality,
                occupation, national_id, start_date, expected_release_date,
                assigned_prison, assigned_block, assigned_cell)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, im)
    print("  ✓ 6 inmates created")

    # Update occupancy counts
    for pid in [1, 2]:
        db.execute("UPDATE prisons SET current_occupancy = (SELECT COUNT(*) FROM inmates WHERE assigned_prison = ? AND status = 'active') WHERE prison_id = ?", (pid, pid))
    for bid in [1, 2, 3, 4]:
        db.execute("UPDATE blocks SET current_occupancy = (SELECT COUNT(*) FROM inmates WHERE assigned_block = ? AND status = 'active') WHERE block_id = ?", (bid, bid))
    for cid in range(1, 15):
        db.execute("UPDATE cells SET current_occupancy = (SELECT COUNT(*) FROM inmates WHERE assigned_cell = ? AND status = 'active') WHERE cell_id = ?", (cid, cid))
    print("  ✓ Occupancy counts updated")

    # ── 10. Legal Cases ──
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (1, 'CR-2025-001', 'Armed Robbery', 'Cairo Criminal Court', '3 years', 1)")
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (2, 'CR-2024-112', 'Drug Trafficking', 'Cairo Criminal Court', '5 years', 2)")
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (3, 'CR-2025-033', 'Fraud', 'Giza Criminal Court', '18 months', 3)")
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (4, 'CR-2023-089', 'Murder', 'Cairo Criminal Court', '10 years', 4)")
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (5, 'CR-2025-015', 'Theft', 'Alexandria Court', '6 months', 5)")
    db.execute("INSERT OR IGNORE INTO legal_cases (case_id, case_number, crime_type, court_name, sentence_duration, inmate_id) VALUES (6, 'CR-2024-078', 'Assault', 'Alexandria Court', '2.5 years', 6)")
    print("  ✓ 6 legal cases created")

    # ── 11. Incidents ──
    db.execute("INSERT OR IGNORE INTO incidents (incident_id, type, date_time, prison_id, block_id, cell_id, reporting_officer, description, action_taken) VALUES (1, 'Fight', '2026-04-15 14:30', 1, 1, 1, 'OFF001', 'Altercation between two inmates during yard time.', 'Inmates separated, both sent to cells.')")
    db.execute("INSERT OR IGNORE INTO incidents (incident_id, type, date_time, prison_id, block_id, cell_id, reporting_officer, description, action_taken) VALUES (2, 'Self-Harm', '2026-04-17 22:15', 1, 2, 5, 'OFF002', 'Inmate found with self-inflicted cuts.', 'Medical team called, inmate transferred to infirmary.')")
    db.execute("INSERT OR IGNORE INTO incident_inmates VALUES (1, 1)")
    db.execute("INSERT OR IGNORE INTO incident_inmates VALUES (1, 2)")
    db.execute("INSERT OR IGNORE INTO incident_inmates VALUES (2, 3)")
    print("  ✓ 2 incidents created")

    # ── 12. Disciplinary Logs ──
    db.execute("INSERT OR IGNORE INTO disciplinary_logs (log_id, inmate_id, incident_id, punishment_type, solitary_confinement_duration, imposed_by, date_imposed, end_date, notes) VALUES (1, 1, 1, 'Solitary Confinement', 7, 'OFF001', '2026-04-15', '2026-04-22', 'Instigated fight')")
    db.execute("INSERT OR IGNORE INTO disciplinary_logs (log_id, inmate_id, incident_id, punishment_type, solitary_confinement_duration, imposed_by, date_imposed, end_date, notes) VALUES (2, 2, 1, 'Loss of Privileges', NULL, 'OFF001', '2026-04-15', '2026-04-30', 'Involved in fight')")
    print("  ✓ 2 disciplinary records created")

    # ── 13. Doctors ──
    db.execute("INSERT OR IGNORE INTO doctors VALUES ('DOC001', 'Dr. Nadia Mostafa', 'Cairo', '01066666666', 1)")
    db.execute("INSERT OR IGNORE INTO doctors VALUES ('DOC002', 'Dr. Ramy Gamal', 'Alexandria', '01077777777', 2)")
    print("  ✓ 2 doctors created")

    # ── 14. Medical Visits ──
    db.execute("INSERT OR IGNORE INTO medical_visits (visit_id, inmate_id, doctor_id, date_time, diagnosis, description) VALUES (1, 3, 'DOC001', '2026-04-17 23:00', 'Lacerations', 'Self-inflicted cuts treated and bandaged')")
    print("  ✓ 1 medical visit recorded")

    # ── 15. Visit Time Slots ──
    db.execute("INSERT OR IGNORE INTO visit_time_slots (slot_id, prison_id, slot_label, start_time, end_time, max_visitors) VALUES (1, 1, 'Morning Slot 1', '09:00', '10:00', 5)")
    db.execute("INSERT OR IGNORE INTO visit_time_slots (slot_id, prison_id, slot_label, start_time, end_time, max_visitors) VALUES (2, 1, 'Morning Slot 2', '10:00', '11:00', 5)")
    db.execute("INSERT OR IGNORE INTO visit_time_slots (slot_id, prison_id, slot_label, start_time, end_time, max_visitors) VALUES (3, 1, 'Afternoon Slot', '14:00', '15:00', 5)")
    print("  ✓ 3 visit time slots created")

    # ── 16. Visit Requests ──
    db.execute("INSERT OR IGNORE INTO visits (visit_id, inmate_national_id, visit_date, time_slot, duration, status, visit_type, prison_id) VALUES (1, 'NID100001', '2026-04-20', '09:00-10:00', 30, 'Pending', 'Regular', 1)")
    db.execute("INSERT OR IGNORE INTO visitors (visitor_id, visit_id, national_id, full_name, relationship, phone, email) VALUES (1, 1, 'VIS001', 'Laila Mahmoud', 'Spouse', '01088888888', 'laila@email.com')")
    db.execute("INSERT OR IGNORE INTO visits (visit_id, inmate_national_id, visit_date, time_slot, duration, status, visit_type, prison_id) VALUES (2, 'NID100004', '2026-04-21', '14:00-15:00', 60, 'Pending', 'Legal', 1)")
    db.execute("INSERT OR IGNORE INTO visitors (visitor_id, visit_id, national_id, full_name, relationship, phone, email) VALUES (2, 2, 'VIS002', 'Adv. Sherif Mahmoud', 'Lawyer', '01099999999', 'sherif@law.com')")
    print("  ✓ 2 visit requests created")

    # ── 17. Transfer Request ──
    db.execute("INSERT OR IGNORE INTO transfers (transfer_id, requesting_prison, destination_prison, reason, inmate_id, status) VALUES (1, 1, 2, 'Overcrowding in Block A, inmate eligible for lower security', 1, 'Pending')")
    print("  ✓ 1 transfer request created")

    db.commit()
    db.close()
    print("\n✅ Seed data complete! Login credentials:")
    print("   Super Admin:     ADMIN001 / admin123")
    print("   Prison Manager:  MGR001 / manager123  (Cairo Central)")
    print("   Prison Manager:  MGR002 / manager123  (Alexandria)")
    print("   Officer:         OFF001 / officer123  (Cairo Central)")
    print("   Officer:         OFF002 / officer123  (Cairo Central)")
    print("   Officer:         OFF003 / officer123  (Alexandria)")


def clear_data():
    """ERASE ALL DATA — reset database to empty tables."""
    db = get_db()
    tables = [
        "incident_witnesses", "incident_staff", "incident_inmates",
        "medical_visits", "disciplinary_logs", "incidents",
        "visitors", "visits", "visit_time_slots",
        "transfers", "legal_cases", "inmates",
        "shift_assignments", "cells", "blocks",
        "prison_features", "doctors",
        "users", "prisons"
    ]
    for table in tables:
        db.execute(f"DELETE FROM {table}")
        print(f"  ✗ Cleared: {table}")

    db.commit()
    db.close()
    print("\n✅ All data erased. Database tables are empty.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        print("⚠️  Erasing ALL data...")
        clear_data()
    else:
        seed_data()

"""
database.py — SQLite database setup for CPMS
All tables map directly to the PRD data models (Sections 2–7).
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "cpms.db")


def get_db():
    """Get a database connection. Use as: db = get_db()"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # So we can access columns by name
    conn.execute("PRAGMA foreign_keys = ON")  # Enforce foreign keys
    return conn


def rows_to_dicts(rows):
    """Convert a list of sqlite3.Row objects to a list of plain dicts.
    Needed because Row objects are not JSON-serializable for Jinja2 |tojson."""
    return [dict(r) for r in rows]


def init_db():
    """Create all tables if they don't exist. Called once at startup."""
    db = get_db()
    cursor = db.cursor()

    # ──────────────────────────────────────────────
    # PRD 2.2.1 — Core Facility Information (Prisons)
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prisons (
            prison_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_id      TEXT,
            name            TEXT NOT NULL,
            location        TEXT NOT NULL,
            type            TEXT NOT NULL,
            security_level  TEXT NOT NULL,
            total_capacity  INTEGER NOT NULL,
            current_occupancy INTEGER DEFAULT 0
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 2.2.5 — Facility Features (Boolean Flags)
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prison_features (
            prison_id               INTEGER PRIMARY KEY,
            infirmary               INTEGER DEFAULT 0,
            workshops               INTEGER DEFAULT 0,
            agricultural_ward       INTEGER DEFAULT 0,
            visitation_hall         INTEGER DEFAULT 0,
            visitation_hall_capacity INTEGER DEFAULT 0,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 2.2.2 — Blocks
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blocks (
            block_id          INTEGER PRIMARY KEY AUTOINCREMENT,
            prison_id         INTEGER NOT NULL,
            name              TEXT,
            capacity          INTEGER NOT NULL,
            current_occupancy INTEGER DEFAULT 0,
            security_level    TEXT NOT NULL,
            number_of_cells   INTEGER DEFAULT 0,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 2.2.2 — Cells
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cells (
            cell_id           INTEGER PRIMARY KEY AUTOINCREMENT,
            block_id          INTEGER NOT NULL,
            prison_id         INTEGER NOT NULL,
            capacity          INTEGER NOT NULL,
            current_occupancy INTEGER DEFAULT 0,
            FOREIGN KEY (block_id) REFERENCES blocks(block_id),
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 2.2.3 + 2.2.4 — Super Admin & Officers
    # Combined into one "users" table with a role field.
    # Roles: super_admin, prison_manager, officer
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            national_id TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            phone       TEXT,
            address     TEXT,
            email       TEXT,
            password    TEXT NOT NULL,
            role        TEXT NOT NULL CHECK(role IN ('super_admin', 'prison_manager', 'officer')),
            prison_id   INTEGER,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 4.2.1 — Inmate Personal Information
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inmates (
            inmate_id             INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name             TEXT NOT NULL,
            date_of_birth         DATE,
            gender                TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
            nationality           TEXT,
            occupation            TEXT,
            national_id           TEXT UNIQUE,
            start_date            DATE,
            expected_release_date DATE,
            assigned_prison       INTEGER,
            assigned_block        INTEGER,
            assigned_cell         INTEGER,
            status                TEXT DEFAULT 'active' CHECK(status IN ('active', 'released', 'transferred')),
            FOREIGN KEY (assigned_prison) REFERENCES prisons(prison_id),
            FOREIGN KEY (assigned_block) REFERENCES blocks(block_id),
            FOREIGN KEY (assigned_cell)  REFERENCES cells(cell_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 4.2.2 — Legal Case Information
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS legal_cases (
            case_id           INTEGER PRIMARY KEY AUTOINCREMENT,
            case_number       TEXT,
            crime_type        TEXT,
            court_name        TEXT,
            sentence_duration TEXT,
            inmate_id         INTEGER NOT NULL,
            FOREIGN KEY (inmate_id) REFERENCES inmates(inmate_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 4.3 — Transfers
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transfers (
            transfer_id        INTEGER PRIMARY KEY AUTOINCREMENT,
            requesting_prison  INTEGER NOT NULL,
            destination_prison INTEGER NOT NULL,
            reason             TEXT,
            inmate_id          INTEGER NOT NULL,
            status             TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Denied')),
            approval_date      DATE,
            FOREIGN KEY (requesting_prison)  REFERENCES prisons(prison_id),
            FOREIGN KEY (destination_prison) REFERENCES prisons(prison_id),
            FOREIGN KEY (inmate_id)          REFERENCES inmates(inmate_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 5.2 — Visitor Data Model
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visitors (
            visitor_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            visit_id     INTEGER,
            national_id  TEXT,
            full_name    TEXT NOT NULL,
            relationship TEXT,
            phone        TEXT,
            email        TEXT,
            FOREIGN KEY (visit_id) REFERENCES visits(visit_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 5.2 — Visit Data Model
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visits (
            visit_id          INTEGER PRIMARY KEY AUTOINCREMENT,
            inmate_national_id TEXT NOT NULL,
            visit_date        DATE,
            time_slot         TEXT,
            duration          INTEGER,
            status            TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Denied')),
            denial_reason     TEXT,
            visit_type        TEXT DEFAULT 'Regular' CHECK(visit_type IN ('Regular', 'Legal')),
            prison_id         INTEGER,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 3.2 — Visit Time Slots (manager adds time slots)
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS visit_time_slots (
            slot_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            prison_id    INTEGER NOT NULL,
            slot_label   TEXT NOT NULL,
            start_time   TEXT NOT NULL,
            end_time     TEXT NOT NULL,
            max_visitors INTEGER DEFAULT 1,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 6.1 — Incident Reports
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            incident_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            type             TEXT NOT NULL,
            date_time        DATETIME,
            prison_id        INTEGER,
            block_id         INTEGER,
            cell_id          INTEGER,
            reporting_officer TEXT,
            description      TEXT,
            action_taken     TEXT,
            FOREIGN KEY (prison_id)        REFERENCES prisons(prison_id),
            FOREIGN KEY (block_id)         REFERENCES blocks(block_id),
            FOREIGN KEY (cell_id)          REFERENCES cells(cell_id),
            FOREIGN KEY (reporting_officer) REFERENCES users(national_id)
        )
    """)

    # PRD 6.1 — Inmates involved in incidents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_inmates (
            incident_id INTEGER,
            inmate_id   INTEGER,
            PRIMARY KEY (incident_id, inmate_id),
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
            FOREIGN KEY (inmate_id)   REFERENCES inmates(inmate_id)
        )
    """)

    # PRD 6.1 — Staff involved in incidents
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_staff (
            incident_id INTEGER,
            staff_id    TEXT,
            PRIMARY KEY (incident_id, staff_id),
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
            FOREIGN KEY (staff_id)    REFERENCES users(national_id)
        )
    """)

    # PRD 6.1 — Witnesses (inmates or staff)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_witnesses (
            incident_id INTEGER,
            witness_id  TEXT,
            PRIMARY KEY (incident_id, witness_id),
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 6.2 — Disciplinary Log
    # Cannot be deleted (enforced in application layer)
    # Solitary confinement max 30 days (PRD 10.5)
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disciplinary_logs (
            log_id                       INTEGER PRIMARY KEY AUTOINCREMENT,
            inmate_id                    INTEGER NOT NULL,
            incident_id                  INTEGER,
            punishment_type              TEXT NOT NULL,
            solitary_confinement_duration INTEGER CHECK(
                solitary_confinement_duration IS NULL OR solitary_confinement_duration <= 30
            ),
            imposed_by                   TEXT NOT NULL,
            date_imposed                 DATE,
            end_date                     DATE,
            notes                        TEXT,
            FOREIGN KEY (inmate_id)   REFERENCES inmates(inmate_id),
            FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
            FOREIGN KEY (imposed_by)  REFERENCES users(national_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 7.1 — Doctors
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            national_id TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            address     TEXT,
            phone       TEXT,
            prison_id   INTEGER NOT NULL,
            FOREIGN KEY (prison_id) REFERENCES prisons(prison_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 7.2 — Medical Visits (Visits Reporting)
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_visits (
            visit_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            inmate_id  INTEGER NOT NULL,
            doctor_id  TEXT NOT NULL,
            date_time  DATETIME,
            diagnosis  TEXT,
            description TEXT,
            FOREIGN KEY (inmate_id) REFERENCES inmates(inmate_id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(national_id)
        )
    """)

    # ──────────────────────────────────────────────
    # PRD 3.5.2 — Shift Assignment Data Model
    # ──────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shift_assignments (
            shift_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            officer_id TEXT NOT NULL,
            block_id   INTEGER NOT NULL,
            shift_type TEXT NOT NULL CHECK(shift_type IN ('Morning', 'Afternoon', 'Night')),
            date       DATE NOT NULL,
            start_time TEXT NOT NULL,
            end_time   TEXT NOT NULL,
            FOREIGN KEY (officer_id) REFERENCES users(national_id),
            FOREIGN KEY (block_id)   REFERENCES blocks(block_id)
        )
    """)

    db.commit()
    db.close()
    print("Database initialized: all tables created.")


if __name__ == "__main__":
    init_db()

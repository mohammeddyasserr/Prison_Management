import os
import sqlite3

# Resolve the absolute path for the migrations directory dynamically
DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
MIGRATIONS_DIR = os.path.join(DATABASE_DIR, "migrations")

# Using an absolute path to the base directory for the database
BASE_DIR = os.path.dirname(DATABASE_DIR)
DB_PATH = os.path.join(BASE_DIR, "prison.db")

# connect to DB
# This will automatically create the database file if it does not exist.
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 1) get executed migrations
cursor.execute("""
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
cursor.execute("SELECT file_name FROM migrations")
executed = {row[0] for row in cursor.fetchall()}  # set for fast lookup

# 2) get all migration files
if not os.path.exists(MIGRATIONS_DIR):
    os.makedirs(MIGRATIONS_DIR, exist_ok=True)
files = sorted(os.listdir(MIGRATIONS_DIR))

# 3) run pending migrations
for file in files:
    if file not in executed:
        print(f"Running {file}...")

        with open(os.path.join(MIGRATIONS_DIR, file), "r") as f:
            sql = f.read()

        try:
            for statement in sql.split(";"):
                if statement.strip():
                    cursor.execute(statement)

            # record migration
            cursor.execute(
                "INSERT INTO migrations (file_name) VALUES (?)",
                (file,)
            )
            conn.commit()
            print(f"Successfully ran {file} ✅")

        except Exception as e:
            conn.rollback()
            print(f"Error in {file}: {e}")
            break

print("All migrations are done ✅")

cursor.close()
conn.close()
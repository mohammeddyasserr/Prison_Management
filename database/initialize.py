import os
import sqlite3
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "prison.db")
DATABASE_DIR = os.path.join(BASE_DIR, "database")
SCHEMAS_DIR = os.path.join(DATABASE_DIR, "schemas")
SEEDS_DIR = os.path.join(DATABASE_DIR, "seeds")
MIGRATE_SCRIPT = os.path.join(DATABASE_DIR, "migrate.py")


def run_sql_file(cursor, file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        sql = f.read()

    for statement in sql.split(";"):
        if statement.strip():
            cursor.execute(statement)


def is_seed_executed(cursor, file_name):
    cursor.execute("SELECT 1 FROM seeds WHERE file_name = ?", (file_name,))
    return cursor.fetchone() is not None


def mark_seed_executed(cursor, file_name):
    cursor.execute("INSERT INTO seeds (file_name) VALUES (?)", (file_name,))


def main():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Run Schemas
    print("\n--- Running Schemas ---")
    if os.path.exists(SCHEMAS_DIR):
        schema_files = sorted(os.listdir(SCHEMAS_DIR))
        for file in schema_files:
            if file.endswith(".sql"):
                file_path = os.path.join(SCHEMAS_DIR, file)
                print(f"Running schema: {file}...")
                try:
                    run_sql_file(cursor, file_path)
                    conn.commit()
                    print(f"Successfully ran {file} [OK]")
                except Exception as e:
                    conn.rollback()
                    print(f"Error in {file}: {e}")
                    return
        print("All schemas executed successfully! [OK]")
    else:
        print(f"Schemas directory not found at {SCHEMAS_DIR}")

    # 2. Run migrate.py
    print("\n--- Running Migrations ---")
    if os.path.exists(MIGRATE_SCRIPT):
        subprocess.run(["python", MIGRATE_SCRIPT], check=True)
    else:
        print(f"migrate.py not found at {MIGRATE_SCRIPT}")
    
    # 3. Run Seeds
    print("\n--- Running Seeds ---")
    if os.path.exists(SEEDS_DIR):
        seed_files = sorted(os.listdir(SEEDS_DIR))
        for file in seed_files:
            if file.endswith(".sql"):
                file_path = os.path.join(SEEDS_DIR, file)
                
                if is_seed_executed(cursor, file):
                    continue
                
                print(f"Running seed: {file}...")
                try:
                    run_sql_file(cursor, file_path)
                    mark_seed_executed(cursor, file)
                    conn.commit()
                    print(f"Successfully ran {file} [OK]")
                except Exception as e:
                    conn.rollback()
                    print(f"Error in {file}: {e}")
                    return
        print("All seeds executed successfully! [OK]")
    else:
        print(f"Seeds directory not found at {SEEDS_DIR}")

    print("\nAll initialization tasks completed! [OK]")
    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()

import os
import mysql.connector

MIGRATIONS_DIR = "migrations"

# connect to DB
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="mohammed1234",
    database="prison_db"
)
cursor = conn.cursor()

# 1) get executed migrations
cursor.execute("SELECT file_name FROM migrations")
executed = {row[0] for row in cursor.fetchall()}  # set for fast lookup

# 2) get all migration files
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
                "INSERT INTO migrations (file_name) VALUES (%s)",
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
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    dbname=os.getenv("DB_NAME", "pillsync"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "")
)
conn.autocommit = True

with conn.cursor() as cur:
    print("Dropping old tables...")
    cur.execute("DROP TABLE IF EXISTS medication_logs, medication_schedules, medicines CASCADE;")
    print("Running migration ...")
    with open("app/db/migrations/002_medication_management.sql", "r") as f:
        cur.execute(f.read())
    print("Migration Re-applied successfully.")

conn.close()

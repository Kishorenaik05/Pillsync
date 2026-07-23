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

with conn.cursor() as cur:
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'medication_schedules';")
    columns = cur.fetchall()
    print("medication_schedules columns:", [c[0] for c in columns])
    
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'medicines';")
    columns = cur.fetchall()
    print("medicines columns:", [c[0] for c in columns])

conn.close()

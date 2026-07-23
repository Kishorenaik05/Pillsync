import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(
    host=os.getenv('DB_HOST','localhost'),
    port=os.getenv('DB_PORT', '5432'),
    dbname=os.getenv('DB_NAME','pillsync'),
    user=os.getenv('DB_USER', 'postgres'),
    password=os.getenv('DB_PASSWORD', '')
)
cur = conn.cursor()
cur.execute("SELECT id, email, role FROM users WHERE role = 'PATIENT' LIMIT 1")
row = cur.fetchone()

with open('db_test_out_py.txt', 'w', encoding='utf-8') as f:
    if not row:
        f.write('NO_USER\n')
    else:
        f.write(f'USERJSON: {{"id":"{row[0]}", "email":"{row[1]}", "role":"{row[2]}"}}\n')
        cur.execute("SELECT id FROM patient_profiles WHERE user_id = %s", (row[0],))
        profile = cur.fetchone()
        f.write(f'PROFILE: {profile}\n')

import requests
import psycopg2
import os
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"

conn = psycopg2.connect(
    host=os.getenv('DB_HOST','localhost'),
    port=os.getenv('DB_PORT', '5432'),
    dbname=os.getenv('DB_NAME','pillsync'),
    user=os.getenv('DB_USER', 'postgres'),
    password=os.getenv('DB_PASSWORD', '')
)
cur = conn.cursor()
cur.execute("""
    SELECT u.id, u.email, u.role 
    FROM users u 
    JOIN patient_profiles p ON u.id = p.user_id 
    WHERE u.role = 'PATIENT' LIMIT 1
""")
row = cur.fetchone()

if row:
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode = {"exp": expire, "sub": row[1], "role": row[2]}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {encoded_jwt}"}
    
    res = requests.get("http://localhost:8000/reminders/today", headers=headers)
    
    with open('test_reminders_py.txt', 'w', encoding='utf-8') as f:
        f.write(f"REMINDERS: {res.status_code} - {res.text}\n")

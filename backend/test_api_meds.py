import json
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
# Find a user with a profile
cur.execute("""
    SELECT u.id, u.email, u.role, p.id 
    FROM users u 
    JOIN patient_profiles p ON u.id = p.user_id 
    WHERE u.role = 'PATIENT' LIMIT 1
""")
row = cur.fetchone()

with open('api_test_out.txt', 'w', encoding='utf-8') as f:
    if not row:
        f.write('NO_USER_WITH_PROFILE\n')
    else:
        # Generate valid token
        expire = datetime.utcnow() + timedelta(minutes=60)
        to_encode = {"exp": expire, "sub": row[1], "role": row[2]}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        headers = {"Authorization": f"Bearer {encoded_jwt}"}
        
        # Test Create Medicine
        med_data = {
            "name": "Test Med API",
            "form": "Tablet",
            "strength": "100mg",
            "quantity_in_stock": 30
        }
        res_med = requests.post("http://localhost:8000/medicines/", json=med_data, headers=headers)
        f.write(f"CREATE MED STATUS: {res_med.status_code}\n")
        f.write(f"CREATE MED RESP: {res_med.text}\n")
        
        if res_med.status_code == 201:
            med_id = res_med.json()["id"]
            sch_data = {
                "frequency": "Daily",
                "time_of_day": "10:00",
                "start_date": "2023-01-01",
                "end_date": None
            }
            res_sch = requests.post(f"http://localhost:8000/medicines/{med_id}/schedules", json=sch_data, headers=headers)
            f.write(f"CREATE SCHED STATUS: {res_sch.status_code}\n")
            f.write(f"CREATE SCHED RESP: {res_sch.text}\n")

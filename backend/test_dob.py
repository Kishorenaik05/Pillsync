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
# Create a dummy user for the test
cur.execute("INSERT INTO users (email, hashed_password, role) VALUES ('testdob@example.com', 'foo', 'PATIENT') RETURNING id, email, role")
row = cur.fetchone()
conn.commit()

expire = datetime.utcnow() + timedelta(minutes=60)
to_encode = {"exp": expire, "sub": row[1], "role": row[2]}
encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
headers = {"Authorization": f"Bearer {encoded_jwt}"}

# Payload with empty string for DOB
data = {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "",
    "blood_group": "O+"
}

res = requests.post("http://localhost:8000/profiles/patient/me", json=data, headers=headers)
with open('test_dob_py.txt', 'w', encoding='utf-8') as f:
    f.write(f"DOB TEST: {res.status_code} - {res.text}\n")

# Cleanup dummy user
cur.execute("DELETE FROM users WHERE id = %s", (row[0],))
conn.commit()

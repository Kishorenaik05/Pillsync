import psycopg2

conn = psycopg2.connect(
    host="localhost", port=5432,
    database="pillsync",
    user="postgres",
    password="kishore"
)
cur = conn.cursor()

sql = """
ALTER TABLE patient_profiles
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30);
"""
cur.execute(sql)
conn.commit()
print("Migration 003 applied: phone + emergency contact columns added to patient_profiles")
conn.close()

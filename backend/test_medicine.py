import requests
import json

base_url = "http://localhost:8000"

def test_add_medication():
    # 1. Login
    login_res = requests.post(f"{base_url}/auth/login", data={"username": "test_new_user@example.com", "password": "password123"})
    if login_res.status_code != 200:
        print("Login failed:", login_res.text)
        return
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 1.5 Create Profile
    profile_data = {
        "first_name": "Test",
        "last_name": "User",
        "date_of_birth": "1990-01-01",
        "blood_group": "O+"
    }
    requests.post(f"{base_url}/profiles/patient/me", headers=headers, json=profile_data)
    
    # 2. Add Medication
    med_data = {
        "name": "Test Med 2",
        "form": "",
        "strength": "",
        "quantity_in_stock": 0
    }
    med_res = requests.post(f"{base_url}/medicines/", headers=headers, json=med_data)
    if med_res.status_code != 201:
        print("Add Medicine failed:", med_res.text)
        return
    print("Add Medicine success:", med_res.json())
    med_id = med_res.json()["id"]

    # 3. Add Schedule
    schedule_data = {
        "frequency": "Daily",
        "time_of_day": "08:00",
        "start_date": "2023-10-15",
        "end_date": None
    }
    sch_res = requests.post(f"{base_url}/medicines/{med_id}/schedules", headers=headers, json=schedule_data)
    if sch_res.status_code != 201:
        print("Add Schedule failed:", sch_res.text)
        return
    print("Add Schedule success:", sch_res.json())

if __name__ == "__main__":
    test_add_medication()

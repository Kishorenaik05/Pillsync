import requests

url = "http://localhost:8000/auth/login"
data = {
    "username": "test_new_user@example.com",
    "password": "password123",
}

try:
    response = requests.post(url, data=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print("Headers:", response.headers)
except Exception as e:
    print(f"Request failed: {e}")

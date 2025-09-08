#backend/auth/cvat_auth.py
import requests

def authenticate_with_cvat(username, password):
    """
    Authenticate with CVAT using username and password.
    """
    url = "http://localhost:8080/api/auth/login"

    payload = {
        'username': username,
        'password': password
    }

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        print(f"CVAT authentication failed: {response.text}")
        raise Exception("Invalid credentials or failed to authenticate with CVAT")

    return response.json()

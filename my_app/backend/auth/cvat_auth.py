import requests

def authenticate_with_cvat(username, password):
    """
    Authenticate with CVAT using username and password.
    """
    url = "https://cvat.ai/api/v1/auth/login"
    
    print(f"Sending authentication request to CVAT for user: {username}")  # Debugging log

    response = requests.post(url, json={'username': username, 'password': password})
    
    print(f"CVAT response status code: {response.status_code}")  # Debugging log
    print(f"CVAT response body: {response.text}")  # Debugging log

    if response.status_code != 200:
        raise Exception("Invalid credentials or failed to authenticate with CVAT")
    
    return response.json()

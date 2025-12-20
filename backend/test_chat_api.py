import requests
import json

url = "http://localhost:5000/api/chat-health"
payload = {
    "message": "Is it safe to go for a run?",
    "context": {
        "aqi": 250,
        "city": "Delhi"
    }
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

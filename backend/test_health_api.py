import requests
import json

url = "http://localhost:5000/api/analyze-aqi-health"
payload = {
    "aqi_data": {
        "aqi": 350,
        "city": "Delhi",
        "pm2_5": 210,
        "pm10": 300,
        "no2": 45,
        "o3": 20,
        "so2": 10,
        "co": 1.2
    }
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

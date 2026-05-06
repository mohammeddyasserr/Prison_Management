import urllib.request
import urllib.error
import json

payload = {
    "inmate_id": 1,
    "incident_id": None,
    "punishment_type": "Loss of Privileges",
    "solitary_days": None,
    "date_imposed": "2026-05-06",
    "notes": "",
    "imposed_by": "test"
}

req = urllib.request.Request(
    'http://127.0.0.1:8000/disciplinary', 
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Error HTTP", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)

import urllib.request
import json
import urllib.error

BASE_URL = 'http://127.0.0.1:5000/api/v1/lorry'

def make_request(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')

def test_fuel():
    print("Testing /expense/fuel (Expect 404):")
    status, res = make_request(f"{BASE_URL}/expense/fuel", {"km_start": 100, "km_end": 200, "diesel_liters": 10, "cost_per_liter": 90, "lorry_id": 1})
    print(status, res)
    
    print("\nTesting /fuel (Fix check):")
    status, res = make_request(f"{BASE_URL}/fuel", {"km_start": 100, "km_end": 200, "diesel_liters": 10, "cost_per_liter": 90, "trip_id": 1})
    print(status, res)

def test_maintenance():
    print("\nTesting /expense/maintenance:")
    status, res = make_request(f"{BASE_URL}/expense/maintenance", {"service_cost": 100, "tyres_cost": 200, "repairs_cost": 50, "lorry_id": 1})
    print(status, res)

def test_driver():
    print("\nTesting /expense/driver:")
    status, res = make_request(f"{BASE_URL}/expense/driver", {"driver_name": "Ramu", "monthly_salary": 10000, "bata": 500, "overtime": 200, "trip_id": 1})
    print(status, res)

def test_private():
    print("\nTesting /private:")
    status, res = make_request(f"{BASE_URL}/private", {
        "vendor_name": "Test Vendor", "lorry_number": "AP1234", "tonnes_loaded": 10, 
        "freight_rate_per_ton": 1000, "tollgate_fees": 100, "extra_charges": 50, 
        "maintenance_advances": 0, "cash_advances": 200
    })
    print(status, res)

if __name__ == '__main__':
    test_fuel()
    test_maintenance()
    test_driver()
    test_private()

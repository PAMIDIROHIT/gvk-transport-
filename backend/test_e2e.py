import requests

BASE_URL = "http://127.0.0.1:5000/api/v1"

def test_e2e():
    print("Running E2E Integration API tests...")

    # 1. Test Mine Purchase
    print("Testing /mine POST...")
    mine_payload = {
        "mine_name": "Test Mine",
        "material_name": "Iron Ore 60%",
        "tonnes": 100.0,
        "cost_per_ton": 800.0,
        "loading_charges": 500.0,
        "transport_hire": 2000.0,
        "gst_percentage": 18.0,
        "payment_status": "PAID"
    }
    r = requests.post(f"{BASE_URL}/mine", json=mine_payload)
    assert r.status_code == 201, f"Failed Mine POST: {r.text}"
    print("[PASS] Mine Purchase POST Passed")

    print("Testing /mine GET...")
    r = requests.get(f"{BASE_URL}/mine")
    assert r.status_code == 200, "Failed Mine GET"
    data = r.json()
    assert len(data) > 0, "No mine purchases returned"
    assert data[-1]['mine_name'] == "Test Mine", "Data mismatch in GET"
    # Cost = 100 * 800 = 80000.  GST = 14400. Extra = 2500. Total = 96900
    assert data[-1]['total_buying'] == 96900.0, "Total calculation mismatch"
    print("[PASS] Mine Purchase GET Passed")

    # 2. Test Factory Sales
    print("Testing /factory/sale POST...")
    sale_payload = {
        "factory_name": "Test Factory",
        "material_name": "Iron Ore 60%",
        "destination": "Testing Dept",
        "tonnes": 100.0,
        "selling_price_per_ton": 1500.0,
        "gst_percentage": 18.0,
        "due_date": "2026-03-10",
        "payment_received": 100000.0,
        "rent_deduction": 5000.0
    }
    r = requests.post(f"{BASE_URL}/factory/sale", json=sale_payload)
    assert r.status_code == 201, f"Failed Sale POST: {r.text}"
    print("[PASS] Factory Sale POST Passed")

    print("Testing /factory/sale GET...")
    r = requests.get(f"{BASE_URL}/factory/sale")
    assert r.status_code == 200, "Failed Sale GET"
    data = r.json()
    assert len(data) > 0, "No sales returned"
    assert data[-1]['factory_name'] == "Test Factory", "Data mismatch in GET"
    # Base = 150000. GST = 27000. total_amount = 177000
    assert data[-1]['total_sales_amount'] == 177000.0, f"Total sale calculation mismatch. Got {data[-1]['total_sales_amount']}"
    assert data[-1]['payment_pending'] == 77000.0, f"Pending calculation mismatch. Got {data[-1]['payment_pending']}"
    print("[PASS] Factory Sale GET Passed")

    # 3. Test Lorries
    print("Testing /lorry POST (Own)...")
    own_lorry = {
        "lorry_number": "TEST-123",
        "owner_name": "GVK",
        "lorry_type": "OWN",
        "emi_cost": 45000.0,
        "insurance_details": "valid",
        "permit_details": "valid"
    }
    r = requests.post(f"{BASE_URL}/lorry", json=own_lorry)
    assert r.status_code == 201, f"Failed Lorry POST: {r.text}"

    print("Testing /lorry POST (Rented)...")
    rented_lorry = {
        "lorry_number": "TEST-R-123",
        "owner_name": "Ramu",
        "lorry_type": "RENTED"
    }
    r = requests.post(f"{BASE_URL}/lorry", json=rented_lorry)
    assert r.status_code == 201, f"Failed Lorry POST: {r.text}"
    print("[PASS] Lorry POSTs Passed")

    print("Testing /lorry GET...")
    r = requests.get(f"{BASE_URL}/lorry")
    assert r.status_code == 200, "Failed Lorry GET"
    data = r.json()
    assert any(l['lorry_number'] == 'TEST-123' for l in data), "Own Lorry not found"
    assert any(l['lorry_number'] == 'TEST-R-123' for l in data), "Rented Lorry not found"
    print("[PASS] Lorry GET Passed")

    print("\n[SUCCESS] ALL E2E API TESTS PASSED")

if __name__ == "__main__":
    try:
        test_e2e()
    except AssertionError as e:
        print(f"[FAIL] TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()


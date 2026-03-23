import urllib.request
import json
import urllib.error

def make_request(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            print(response.status, response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(e.code, e.read().decode('utf-8'))

if __name__ == '__main__':
    print("\nTesting /expense :")
    make_request('http://10.254.88.229:5000/api/v1/expense/', {"description": "Test Tax", "taxes": 1500, "formalities": 500})

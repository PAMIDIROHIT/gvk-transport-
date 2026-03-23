import urllib.request
import urllib.error

def test_health():
    try:
        with urllib.request.urlopen('http://127.0.0.1:5000/api/v1/health') as response:
            print(response.status, response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(e.code)

if __name__ == '__main__':
    test_health()

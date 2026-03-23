import urllib.request
import urllib.error

def check_url(url):
    try:
        with urllib.request.urlopen(url) as response:
            print(f"200 {url}")
    except urllib.error.HTTPError as e:
        print(f"{e.code} {url}")
    except Exception as e:
        print(f"ERROR: {e} {url}")

if __name__ == '__main__':
    print("Testing against 10.254.88.229:")
    check_url('http://10.254.88.229:5000/')
    check_url('http://10.254.88.229:5000/api/v1/health')
    check_url('http://10.254.88.229:5000/api/v1/factory/sale')
    check_url('http://10.254.88.229:5000/api/v1/lorry/expense/driver')
    check_url('http://10.254.88.229:5000/api/v1/lorry/fuel')

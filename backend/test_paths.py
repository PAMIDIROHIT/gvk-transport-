import urllib.request
import urllib.error

def check_url(url):
    try:
        with urllib.request.urlopen(url) as response:
            print(f"200 {url}")
    except urllib.error.HTTPError as e:
        print(f"{e.code} {url}")

check_url('http://127.0.0.1:5000/')
check_url('http://127.0.0.1:5000/api/mine')
check_url('http://127.0.0.1:5000/api/lorry')
check_url('http://127.0.0.1:5000/api/factory/sale')
check_url('http://127.0.0.1:5000/api/v1/factory/sale')
check_url('http://127.0.0.1:5000/lorry')

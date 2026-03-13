import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# The main app instance used by Gunicorn or local runner
app = create_app()

if __name__ == '__main__':
    # Run locally on port 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

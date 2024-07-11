from app import create_app
from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Access email credentials from environment variables
email_user = os.getenv('EMAIL_USER')
email_password = os.getenv('EMAIL_PASSWORD')

app = create_app()

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0',port=5000)

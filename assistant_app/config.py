import os
from dataclasses import dataclass
from dotenv import load_dotenv


load_dotenv()


@dataclass
class AppConfig:
	base_url: str = os.getenv("BASE_URL", "http://localhost:8000")

	google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
	google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
	google_redirect_uri: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/oauth/google/callback")
	google_calendar_id: str = os.getenv("GOOGLE_CALENDAR_ID", "primary")

	plaid_env: str = os.getenv("PLAID_ENV", "sandbox")
	plaid_client_id: str = os.getenv("PLAID_CLIENT_ID", "")
	plaid_secret: str = os.getenv("PLAID_SECRET", "")


config = AppConfig()
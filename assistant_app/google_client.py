from typing import List, Optional, Tuple
import google.oauth2.credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from .config import config


SCOPES = [
	"https://www.googleapis.com/auth/calendar.events",
	"https://www.googleapis.com/auth/calendar",
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/gmail.readonly",
	"openid",
]


def generate_oauth_flow() -> Flow:
	flow = Flow.from_client_config(
		{
			"web": {
				"client_id": config.google_client_id,
				"client_secret": config.google_client_secret,
				"redirect_uris": [config.google_redirect_uri],
				"auth_uri": "https://accounts.google.com/o/oauth2/auth",
				"token_uri": "https://oauth2.googleapis.com/token",
			}
		},
		scopes=SCOPES,
	)
	flow.redirect_uri = config.google_redirect_uri
	return flow


def get_authorization_url(state: Optional[str] = None) -> str:
	flow = generate_oauth_flow()
	authorization_url, _ = flow.authorization_url(
		access_type="offline",
		include_granted_scopes="true",
		prompt="consent",
		state=state,
	)
	return authorization_url


def exchange_code_for_credentials(code: str) -> dict:
	flow = generate_oauth_flow()
	flow.fetch_token(code=code)
	creds = flow.credentials
	return {
		"token": creds.token,
		"refresh_token": creds.refresh_token,
		"token_uri": creds.token_uri,
		"client_id": creds.client_id,
		"client_secret": creds.client_secret,
		"scopes": creds.scopes,
	}


def schedule_calendar_event(
	credentials_dict: dict,
	title: str,
	description: Optional[str],
	start_iso: str,
	end_iso: str,
	attendees_emails: List[str],
	calendar_id: Optional[str] = None,
) -> str:
	credentials = google.oauth2.credentials.Credentials(**credentials_dict)
	service = build("calendar", "v3", credentials=credentials)

	event = {
		"summary": title,
		"description": description or "",
		"start": {"dateTime": start_iso},
		"end": {"dateTime": end_iso},
		"attendees": [{"email": email} for email in attendees_emails],
	}
	calendar = calendar_id or config.google_calendar_id
	created = service.events().insert(calendarId=calendar, body=event, sendUpdates="all").execute()
	return created.get("htmlLink", "")


def list_gmail_messages(credentials_dict: dict, query: str, max_results: int = 20) -> List[dict]:
	credentials = google.oauth2.credentials.Credentials(**credentials_dict)
	service = build("gmail", "v1", credentials=credentials)
	resp = service.users().messages().list(userId="me", q=query, maxResults=max_results).execute()
	return resp.get("messages", [])
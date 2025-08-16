from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse
from typing import Dict

from .schemas import (
	LinkTokenCreateRequest,
	LinkTokenCreateResponse,
	PlaidPublicTokenExchangeRequest,
	VendorSpendRequest,
	VendorSpendResponse,
	ScheduleMeetingRequest,
	OAuthStartResponse,
	MessageResponse,
)
from .plaid_client import PlaidService
from .google_client import get_authorization_url, exchange_code_for_credentials, schedule_calendar_event, list_gmail_messages

app = FastAPI(title="Office Assistant API")


# In-memory stores for demo purposes
USER_ID_TO_PLAID_ACCESS_TOKEN: Dict[str, str] = {}
USER_ID_TO_GOOGLE_CREDS: Dict[str, dict] = {}


@app.get("/health")
def health() -> MessageResponse:
	return MessageResponse(message="ok")


@app.post("/plaid/link_token", response_model=LinkTokenCreateResponse)
def create_link_token(payload: LinkTokenCreateRequest) -> LinkTokenCreateResponse:
	service = PlaidService()
	link_token, expiration = service.create_link_token(payload.user_id)
	return LinkTokenCreateResponse(link_token=link_token, expiration=expiration)


@app.post("/plaid/exchange")
def plaid_exchange_public_token(payload: PlaidPublicTokenExchangeRequest) -> MessageResponse:
	service = PlaidService()
	access_token, _ = service.exchange_public_token(payload.public_token)
	USER_ID_TO_PLAID_ACCESS_TOKEN[payload.user_id] = access_token
	return MessageResponse(message="Plaid access token stored for user")


@app.post("/finance/vendor_spend", response_model=VendorSpendResponse)
def get_vendor_spend(payload: VendorSpendRequest, user_id: str = Query(...)) -> VendorSpendResponse:
	access_token = USER_ID_TO_PLAID_ACCESS_TOKEN.get(user_id)
	if not access_token:
		raise HTTPException(status_code=400, detail="Plaid account not linked for this user")
	service = PlaidService()
	total, matches = service.get_transactions_total_for_vendor(
		access_token=access_token,
		vendor_query=payload.vendor_query,
		start_date=payload.start_date,
		end_date=payload.end_date,
		account_ids=payload.account_ids,
	)
	return VendorSpendResponse(total_spent=round(total, 2), matching_transactions=matches)


@app.get("/oauth/google/start", response_model=OAuthStartResponse)
def google_oauth_start(user_id: str = Query(...)) -> OAuthStartResponse:
	url = get_authorization_url(state=user_id)
	return OAuthStartResponse(authorize_url=url)


@app.get("/oauth/google/callback")
def google_oauth_callback(code: str, state: str) -> RedirectResponse:
	creds = exchange_code_for_credentials(code)
	USER_ID_TO_GOOGLE_CREDS[state] = creds
	return RedirectResponse(url="/oauth/success")


@app.get("/oauth/success")
def oauth_success() -> MessageResponse:
	return MessageResponse(message="OAuth linked successfully")


@app.post("/calendar/schedule")
def create_calendar_event(payload: ScheduleMeetingRequest, user_id: str = Query(...)) -> MessageResponse:
	creds = USER_ID_TO_GOOGLE_CREDS.get(user_id)
	if not creds:
		raise HTTPException(status_code=400, detail="Google not linked for this user")
	link = schedule_calendar_event(
		credentials_dict=creds,
		title=payload.title,
		description=payload.description,
		start_iso=payload.start_iso,
		end_iso=payload.end_iso,
		attendees_emails=payload.attendees_emails,
		calendar_id=payload.calendar_id,
	)
	return MessageResponse(message=f"Event created: {link}")


@app.get("/gmail/search")
def gmail_search(q: str = Query(..., description="Gmail search query"), user_id: str = Query(...)) -> Dict:
	creds = USER_ID_TO_GOOGLE_CREDS.get(user_id)
	if not creds:
		raise HTTPException(status_code=400, detail="Google not linked for this user")
	messages = list_gmail_messages(credentials_dict=creds, query=q, max_results=20)
	return {"count": len(messages), "messages": messages}


@app.get("/presets/amazon_business_spend_2021")
def preset_amazon_business_spend(user_id: str = Query(...)) -> VendorSpendResponse:
	# March 1, 2021 to Oct 31, 2021 inclusive
	payload = VendorSpendRequest(vendor_query="Amazon", start_date="2021-03-01", end_date="2021-10-31")
	return get_vendor_spend(payload, user_id)
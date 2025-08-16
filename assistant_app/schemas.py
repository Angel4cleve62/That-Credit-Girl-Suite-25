from typing import List, Optional
from pydantic import BaseModel, Field


class VendorSpendRequest(BaseModel):
	vendor_query: str = Field(..., description="Case-insensitive substring to match merchant names, e.g., 'Amazon Business' or 'Amazon'")
	start_date: str = Field(..., description="Inclusive start date in YYYY-MM-DD")
	end_date: str = Field(..., description="Inclusive end date in YYYY-MM-DD")
	account_ids: Optional[List[str]] = Field(default=None, description="Optional Plaid account IDs to restrict the search")


class VendorSpendResponse(BaseModel):
	total_spent: float = Field(..., description="Sum of amounts for matching outflow transactions in the given period")
	currency: str = Field(default="USD")
	matching_transactions: int = Field(...)


class LinkTokenCreateRequest(BaseModel):
	user_id: str = Field(...)


class LinkTokenCreateResponse(BaseModel):
	link_token: str
	expiration: str


class PlaidPublicTokenExchangeRequest(BaseModel):
	user_id: str
	public_token: str


class ScheduleMeetingRequest(BaseModel):
	title: str = Field(..., description="Event summary/title")
	description: Optional[str] = None
	start_iso: str = Field(..., description="Event start in ISO 8601, e.g., 2025-12-08T14:00:00-05:00")
	end_iso: str = Field(..., description="Event end in ISO 8601, e.g., 2025-12-08T15:00:00-05:00")
	attendees_emails: List[str] = Field(default_factory=list)
	calendar_id: Optional[str] = None


class OAuthStartResponse(BaseModel):
	authorize_url: str


class MessageResponse(BaseModel):
	message: str
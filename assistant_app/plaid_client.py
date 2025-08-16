from datetime import datetime
from dateutil.parser import isoparse
from typing import Dict, List, Optional, Tuple

from plaid import Configuration, ApiClient
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest as PlaidLinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions

from .config import config


class PlaidService:
	def __init__(self) -> None:
		env = config.plaid_env
		configuration = Configuration(
			host={
				"sandbox": "https://sandbox.plaid.com",
				"development": "https://development.plaid.com",
				"production": "https://production.plaid.com",
			}[env]
		)
		configuration.api_key["PLAID-CLIENT-ID"] = config.plaid_client_id
		configuration.api_key["PLAID-SECRET"] = config.plaid_secret
		self.api_client = plaid_api.PlaidApi(ApiClient(configuration))

	def create_link_token(self, user_id: str) -> Tuple[str, str]:
		request = PlaidLinkTokenCreateRequest(
			user=LinkTokenCreateRequestUser(client_user_id=user_id),
			client_name="Office Assistant",
			products=[Products("transactions"), Products("auth")],
			country_codes=[CountryCode("US")],
			language="en",
			redirect_uri=f"{config.base_url}/plaid/callback",
		)
		response = self.api_client.link_token_create(request)
		return response["link_token"], response["expiration"]

	def exchange_public_token(self, public_token: str) -> Tuple[str, str]:
		request = ItemPublicTokenExchangeRequest(public_token=public_token)
		response = self.api_client.item_public_token_exchange(request)
		return response["access_token"], response["item_id"]

	def get_transactions_total_for_vendor(
		self,
		access_token: str,
		vendor_query: str,
		start_date: str,
		end_date: str,
		account_ids: Optional[List[str]] = None,
	) -> Tuple[float, int]:
		# Fetch all transactions within range using pagination
		count = 500
		offset = 0
		total = 0.0
		matches = 0
		search_term = vendor_query.lower()

		while True:
			options = TransactionsGetRequestOptions(
				account_ids=account_ids or None,
				count=count,
				offset=offset,
			)
			request = TransactionsGetRequest(
				access_token=access_token,
				start_date=start_date,
				end_date=end_date,
				options=options,
			)
			response = self.api_client.transactions_get(request)
			transactions = response["transactions"]
			total_transactions = int(response.get("total_transactions", len(transactions)))

			for tx in transactions:
				name = (tx.get("name") or "").lower()
				merchant_name = (tx.get("merchant_name") or "").lower()
				amount = float(tx.get("amount") or 0)
				is_outflow = (tx.get("transaction_type") or "").lower() in {"place", "digital"} or (tx.get("payment_channel") or "").lower() in {"in_store", "online"}
				if search_term in name or search_term in merchant_name:
					if is_outflow:
						total += amount
						matches += 1

			if offset + len(transactions) >= total_transactions:
				break
			offset += len(transactions)

		return total, matches
# Office Assistant API

A minimal FastAPI service with connectors for Google (Gmail/Calendar) and Plaid (banking) to perform common assistant tasks:

- Link bank accounts via Plaid
- Query vendor spend totals over a date range (e.g., "How much did I send to Amazon Business between 2021-03-01 and 2021-10-31?")
- Google OAuth and schedule meetings on Google Calendar

## Prerequisites

- Python 3.11+
- Google Cloud OAuth client (Web application)
- Plaid keys (Sandbox for development)

## Setup

1. Copy environment template and fill values:

```bash
cp .env.example .env
```

2. Create a virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Run the API:

```bash
uvicorn assistant_app.main:app --reload --host 0.0.0.0 --port 8000
```

## Usage

- Health check: GET /health
- Plaid link token: POST /plaid/link_token {"user_id": "user-123"}
- Exchange Plaid public token: POST /plaid/exchange {"user_id":"user-123","public_token":"..."}
- Vendor spend query: POST /finance/vendor_spend?user_id=user-123 with body

```json
{
  "vendor_query": "Amazon",
  "start_date": "2021-03-01",
  "end_date": "2021-10-31"
}
```

- Start Google OAuth: GET /oauth/google/start?user_id=user-123 (open returned URL)
- Google OAuth callback: GET /oauth/google/callback?code=...&state=user-123
- Schedule event: POST /calendar/schedule?user_id=user-123 with body

```json
{
  "title": "Meeting with Amy Hubbard",
  "start_iso": "2025-12-08T10:00:00-05:00",
  "end_iso": "2025-12-08T11:00:00-05:00",
  "attendees_emails": ["amy@example.com"],
  "description": "Discuss Q4 planning"
}
```

Note: This demo stores tokens in-memory; replace with a secure database and proper token encryption before production.

## Security & Compliance

- Use per-user encrypted storage for tokens (e.g., KMS).
- Enforce OAuth scopes minimally required.
- Implement audit logging, access controls, and secret rotation.

## IRS e-file Software Approval (Modernized e-File)

High-level checklist for tax prep software approval with the IRS. Always verify current requirements on IRS resources before proceeding.

1. e-Services Account & Application
   - Create IRS e-Services accounts for principals and responsible officials.
   - Complete the e-File application to become an Authorized IRS e-file Provider (choose roles: Software Developer, Transmitter, ERO as applicable).
   - Expect suitability checks (credit, tax compliance, criminal background) that can take up to ~45 days.
   - Reference: IRS "Become an Authorized e-File Provider".

2. Publications and Specs
   - Review current year IRS MeF specifications:
     - Publication 4164: Modernized e-File (MeF) Guide for Software Developers and Transmitters.
     - Business and/or Individual Return XML Schemas and Style Guides.
     - State schemas if applicable.

3. Software ID & ATS (Assurance Testing System)
   - Register as Software Developer in the e-File application to obtain a Software ID.
   - Complete ATS testing:
     - Implement XML generation per schemas for each return type you support.
     - Use IRS-provided ATS test scenarios to generate returns.
     - Transmit to ATS endpoint; resolve rejects until accepted.
   - Maintain versioning and re-test as required each filing season or when schemas change.

4. EFIN/ETIN and Transmission
   - EFIN: Issued upon approval as an Authorized e-file Provider (firm-level identifier).
   - ETIN: Issued for MeF transmitters; required if you transmit directly to IRS.
   - If using a 3rd-party transmitter, you may not need your own ETIN but still must complete developer ATS for your Software ID.

5. Security, Policies, and Controls
   - Safeguards for Taxpayer Data: encryption at rest and in transit, access controls, incident response.
   - Implement MeF security protocols (TLS, certificates). Manage digital certificates for the MeF transmission channel.
   - Follow Pub 1345, Pub 3112 for participation rules and security.

6. Ongoing Compliance
   - Monitor IRS QuickAlerts and schema changes each season.
   - Re-certify and update your Software ID version as needed.

Useful starting points on irs.gov:
- Become an Authorized e-File Provider
- How Tax Preparation Software is Approved for Electronic Filing
- Publication 4164 (MeF) and current year schemas

This repository provides a foundation for an office assistant; it does not implement tax e-file transmission. For MeF, build a separate transmitter or integrate with an approved transmitter, implement full XML generation, and complete ATS.

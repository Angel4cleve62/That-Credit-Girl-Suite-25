# Feature Modules Overview

- Auth: POST `/api/auth/login` with `{ email }` returns a token for seed admin `admin@example.com`.
- Disputes: POST `/api/disputes/generate` creates a PDF dispute letter; POST `/api/disputes/complaint` for CFPB/BBB/FTC.
- Uploads: POST `/api/uploads` (multipart) saves to S3/MinIO under `{clientId}/...`.
- Tax: POST `/api/tax/transcripts/parse` -> returns 1040 JSON + explanation, with option `includeScheduleC`.
- CUSIP: POST `/api/cusip/lookup` bulk lookup via OpenFIGI (if API key set), with Google/EDGAR hints.
- Export: POST `/api/export/xlsx` or `/api/export/pdf` to download files.
- Admin: POST `/api/admin/users/:id/features` to set features; POST `/api/admin/users/:id/approve` to approve.

Access control: All protected routes require `Authorization: Bearer <token>`. Per-user feature flags enforce module access.

Environment: Copy `.env.example` to `.env`. Use `docker compose up -d` to start Postgres, Redis, MinIO, API, and Web.
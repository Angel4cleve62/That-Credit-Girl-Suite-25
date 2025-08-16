## Architecture Overview

- Web App (`apps/web`): Next.js UI with feature-gated modules, admin panel, dashboards, and branding toggle.
- API (`apps/api`): Express + TypeScript modular API with JWT auth, Stripe billing, feature flags, and domain routers.
- Background Jobs: Long-running tasks executed via API workers; Redis used for queues (future).
- Storage: Postgres for core data, MinIO (S3) for uploads, Redis for caching/queues.
- Security: RBAC + per-user feature flags. Trusted devices and manual approval supported.
- Delivery: Email/fax integrations via provider interfaces. Export to PDF/CSV/XLSX/ZIP.
- Learning: OCR + document parsing services to extract CUSIP/credit/tax/trust data.

### Domain Modules (API)
- Auth & Users
- Billing & Membership (Stripe)
- Features & Access
- Disputes (Metro 2/FCRA/FDCPA letters; CFPB/BBB/FTC complaints)
- Sovereign Tools (UCC forms, Trust docs, EIN matching)
- CUSIP & Securitization (OpenFIGI, EDGAR, FINRA, CBonds)
- Ownership Tracer (SPV/Trust discovery)
- Credit Tradeline & TDA Linking (guides + docs)
- Business & Grants (planner, templates)
- Tax Bot (transcript reader -> 1040/1040X, P&L; reconciliation)
- Uploads & Learning (OCR, ZIP ingestion, backups)
- Training (courses, onboarding)
- Dispute Delivery Center (email/fax, cover/labels)

### Access Control
- Roles: admin, staff, client.
- Feature flags per user. All API routes validate both role and feature access.

### Build & Deploy
- Docker Compose for local. Pin images for reproducibility.
- `.env` controls secrets and feature toggles.

### Notes
- External data sources require API keys and compliance; stubs included with provider abstractions.
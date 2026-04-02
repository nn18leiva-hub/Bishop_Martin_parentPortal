# Bishop Martin High School - Document Request Portal API (V2)

## Overview
This is the backend API for the Bishop Martin Document Request Portal. It manages document requests for Parents and Past Students, enforcing automated PDF slip generation and a multi-tiered administrative access framework.

## Key Features
- **Auto-Generated PDFs**: Automatically draws permission and absence slips based on JSON input, stamping the requester's digital signature seamlessly using `pdfkit`.
- **Global Auth & 4-Tier Roles**: A single JWT authentication loop (`/auth/login`) smartly routes traffic across:
  - **Parents & Past Students**: Enforces 18+ age constraints and restricts past students to transcripts.
  - **Viewers**: Fully sandboxed read-only access (for Principals).
  - **Admins**: Office workers who progress requests and verify bank payments/identities.
  - **Super Admins**: Manages the system and provisions office workers.
- **Dynamic Payment Logic**: Hard blocks document generation structurally depending on the cost class of the document.

## Developer Guide

### Setup using Docker (Recommended)
This system is natively containerized for plug-and-play scaling.
1. Make sure you have Docker Desktop installed.
2. Run `docker-compose up -d --build`.
3. The server will run on `http://localhost:3000`.

### Setup using Node.js Locally
1. Ensure PostgreSQL is running locally with a database named `parentportal`.
2. Connect to postgres and execute the scripts in `database/schema.sql` and `database/seed.sql`.
3. Create a `.env` file based on your local settings.
4. Run `npm install`.
5. Run `npm start`.

### Frontend Companion Start Guide
Please read `COMPREHENSIVE_GUIDE.md` included in this repository. It covers exactly how the Frontend Team should consume the endpoints, manage the multi-tier JWT routing, and formulate dynamic forms.

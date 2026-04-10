# Bishop Martin - Unified Document Portal (V2)

## Overview
This is the complete system for the Bishop Martin Document Request Portal. It is a 3-tier application (React Frontend, Node.js API, and PostgreSQL Database) designed for high-performance administrative workflows.

## Key Features
- **Elite Aesthetic**: Features an animated "Aura" login experience and a premium "Space-First" design system.
- **Auto-Generated PDFs**: Automatically generates signed documents based on JSON input using `pdfkit`.
- **Global Auth & 4-Tier Roles**: Multi-tier access for Parents, Viewers, Admins, and Super Admins.
- **Standardized Orchestration**: A unified Docker stack that runs on any device (Apple Silicon, Intel, etc.).

## 🚀 Quick Start (Recommended)
Run the entire portal on any device with one command:
1. Ensure Docker Desktop is installed.
2. Run `docker-compose up -d --build`.
3. Open **`http://localhost`** in your browser.

## Project Structure (Standardized)
- `/frontend`: React + Vite application.
- `/src`: Backend API logic.
- `/scripts`: Utility and testing scripts (Provisioning/Testing).
- `/database`: Schema and seeding logic.
- `/uploads`: Persistent storage for IDs, receipts, and generated PDFs.

### Setup using Node.js Locally
1. Ensure PostgreSQL is running locally with a database named `parentportal`.
2. Connect to postgres and execute scripts in `database/schema.sql` and `database/seed.sql`.
3. Create a `.env` file based on your local settings.
4. Run `npm install` and `npm start`.

---
Please read **`COMPREHENSIVE_GUIDE.md`** for detailed architecture and design philosophy.

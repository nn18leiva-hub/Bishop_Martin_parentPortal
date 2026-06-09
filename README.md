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

## 💻 PC Branch Visual & Functional Design Notes

This branch (`pc`) contains custom styling, visual enhancements, and consolidated access roles specifically designed for the **PC (desktop)** experience matching institutional design mockups.

### 👥 Staff Roles Consolidation
The access control system has been simplified from 4 tiers to 2 distinct staff tiers, backed by PostgreSQL check constraints:
1. **Principal** (role: `principal`): Full administrative control. Mapped from the legacy `super_admin` role.
2. **Staff Office** (role: `staff`): Standard operational access. Mapped from the legacy `admin` and `viewer` roles.

### 🛠️ Key Dashboards
- **Parent Requests Dashboard** (accessible at `/staff` or `/superadmin/requests`):
  - Used by **Staff Office** and **Principal** to manage, review, and verify document submissions from parents and guardians.
  - Features real-time requests counter cards (`PENDING VERIFICATION`, `PAYMENTS AWAITING APPROVAL`, etc.), status update actions, and receipt/identity verification modals.
- **Staff Registry Dashboard** (accessible at `/superadmin/settings` or `/staff/settings`):
  - Used to view, add, and delete staff accounts.
  - Fully visual and functional: both the **Principal** and **Staff Office** users have permission to use the "+ Add New Staff" modal to register new staff accounts in the database.
  - Populated with high-resolution portraits for `Dr. Robert Chen`, `Sarah J. Williams`, and `Marcus Thorne`.

### 🎨 Desktop Shell Features
- **Sidebar (PC Version)**:
  - Rendered with an elegant vector-based mortarboard cap inside a crimson square (`#7a0c2e`) branding block.
  - Active links highlight in solid maroon with white text and icons.
  - Features clean support and exit buttons at the bottom.
- **Duplicate Header Prevention**:
  - `AdminLayout.jsx` automatically detects pages carrying local header bars (such as the requests and registry dashboards) and suppresses the global topbar actions to prevent duplicate search inputs and icon groups on desktop.

### 🔑 Local Credentials
- **Principal**: `principal@bmhs.edu.bz` / `password123`
- **Staff Office**: `office@bmhs.edu.bz` / `password123`

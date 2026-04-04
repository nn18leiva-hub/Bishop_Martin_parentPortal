# Comprehensive System Guide (V2)
**Bishop Martin Document Request Portal**

This authoritative guide exhaustively documents every architectural decision, strict business rule, and operational flow powering the Document Request Portal (V2). It serves as the master blueprint for backend logic, front-end integrations, and staff procedures. 

---

## 1. The 4-Tier Hierarchy (User Roles & Permissions)
The system employs a strict, JSON Web Token (JWT)-enforced Role-Based Access Control (RBAC) model. The middleware rigorously checks roles before any route execution.

### Tier 1: Parents and Past Students (End-Users)
- **Account Creation**: Users self-register, defining their `user_type` explicitly as either `parent` or `past_student`.
- **Identity & Age Verification (Strict Rule)**: **EVERY** registering user (both parents and past students) must provide their valid Date of Birth (`dob`).
- **Past Student Restrictions (Strict Rule)**:
  - If a user selects `past_student`, the backend automatically calculates their age using the provided `dob`. 
  - The system will **block** the registration entirely if the calculated age is under 18.
  - Past students are systematically restricted: they are **ONLY permitted to request Transcripts**. All other document types are hidden and blocked for them at the API level.
- **SSN Verification Flow**:
  - The application uses a non-blocking queue model. Users can seamlessly create accounts and submit document requests immediately, *before* providing verified ID/SSN.
  - However, all requests from unverified users are initially flagged as `pending_verification` and held in stasis. They will not be processed or seen as actionable by staff.
  - Once the user uploads their SSN card (`POST /parent/upload-ssn-card`) and an Admin verifies it, the system automatically unpauses their held requests, transitioning them to standard `pending` status.

### Tier 2: Viewers (e.g., Principal)
- **Purpose**: A read-only analytical account meant for high-level administration/principals who need full visibility of the school's operational queues without the risk of structurally altering data.
- **Constraints**: Middlewares securely sandbox this role. They are strictly limited to `GET` requests across the board. Any attempt to execute `POST`, `PUT`, `PATCH`, or `DELETE` commands (e.g., trying to delete a request, approve an SSN, or modify staff) will result in an immediate `403 Forbidden` rejection from the server.

### Tier 3: Admins (e.g., Accounts Clerk, Office Staff)
- **Purpose**: The core workforce of the portal.
- **Capabilities**: They have standard operational power. This includes:
  - Viewing the massive data tables containing parent requests.
  - Visually verifying uploaded Bank Payment Image receipts and marking them as approved.
  - Visually verifying SSN cards and marking the parent's identity as "verified".
  - Updating document request statuses manually (e.g., moving a letter from `pending` -> `ready_for_pickup`).
- **Constraints**: They cannot access Super Admin functionality, meaning they cannot register new staff accounts, alter Tier 2 accounts, or physically delete historical records from the cluster.

### Tier 4: Super Admins (e.g., IT Technician / System Administrator)
- **Purpose**: The ultimate system override accounts.
- **Capabilities**: They inherit all Admin capabilities but have exclusive clearance to the `/superadmin` endpoint space.
  - Can register and provision new Admin or Viewer accounts (`POST /superadmin/staff`).
  - Can safely and permanently delete corrupted or fraudulent accounts via explicit database queries.

---

## 2. Document Generation Engine & Strict Request Rules

The behavior of every request is centrally coordinated by the `document_types` database matrix. This dictates if a document is "Automated" (`is_auto_generated: true/false`) or if it requires banking verification (`requires_payment: true/false`).

> [!CAUTION]
> ### The Universal Crucial Rule: Student Name & ID 
> **Regardless of the exact type of request—whether it is a free automated absence slip, a paid verification letter, or a past student transcript—the student's FULL NAME and STUDENT ID are explicitly and irrevocably REQUIRED in the payload.** 
> 
> The system will immediately reject any request payload missing these two core attributes. This is necessary because every request, manual or automated, relies on these identifiers for correct database linkage, PDF generation, and historical archiving. **Leave nothing out.**

### A. Simple / Manual Requests (Transcripts & General Letters)
- **Configuration**: `is_auto_generated: false`, `requires_payment: true`
- **Flow**:
  1. The user selects the document type (e.g., Transcript) from the front-end.
  2. The user inputs the mandatory **Student Name** and **Student ID**.
  3. The API logs a blank, passive request in the database.
  4. The office staff is tasked to physically type out the letter or print the transcript themselves from internal school management systems.
  5. Because these documents incur a fee, the system actively expects the parent to eventually hit the `POST /payment/upload-receipt` endpoint to upload photographic proof of their bank transfer. Until payment is uploaded and verified by an Admin, the request will not progress to `ready_for_pickup`.

### B. Automated Forms (Absence, Lateness, Standard Permissions)
- **Configuration**: `is_auto_generated: true`, `requires_payment: false`
- **Flow**:
  1. The user selects an automated slip (e.g., Lateness Slip).
  2. The user provides the mandatory **Student Name** and **Student ID**.
  3. The front-end renders a custom sub-form collecting `form_data` (e.g., "Reason for lateness: Missed the bus").
  4. The parent is required to use their touchscreen/mouse to physically draw their signature on an HTML canvas.
  5. The front-end packages the **Student Name**, **Student ID**, the JSON `form_data`, and a base64 string of the signature (`signature_image`) and fires it to the API.
  6. **The Backend PDF Engine Engine**: Our server intercepts these data points, immediately boots up `pdfkit`, and dynamically paints a perfectly formatted PDF. It stamps the Student Name, ID, Reason, and explicitly embeds the drawn signature onto the document's signature line. 
  7. The final PDF is saved directly to the school's active server directory, skipping manual data entry entirely.

---

## 3. Front-End Integration Blueprint

For the Front-End (React, Next.js, or HTML/JS) to interface properly and cleanly with our robust backend, strictly follow these structural blueprints:

### I. The Unified Authentication Protocol
A single, universal endpoint (`POST /auth/login`) handles all 5 tiers of users seamlessly.
1. The UI holds one identical login dialog asking for an `email` and `password`.
2. The user submits this payload.
3. The server hunts across the databases, resolves their identity, and injects a heavily customized JWT and metadata block.
   - Parent Payload Example: `{ "token": "ey...", "type": "parent" }`
   - Staff Payload Example: `{ "token": "ey...", "type": "staff", "role": "super_admin" }`
4. **Front-End Action**: The Javascript client must read this exact `type` and `role` string and instantly divert the traffic to the correct React Router tree (`if (res.type === 'parent') { navigate('/dashboard/parents') }`). **Do not build separate login menus.**

### II. Registration Screens (`POST /auth/register`)
- Requires a prominent dropdown selector for **Role**: ('Parent' or 'Past Student'). 
- If the user selects **'Past Student'**, the UI must conditionally reveal a Date Picker. **The backend validation will crash if `dob` is omitted or if they are under 18.**

### III. Parent & Past Student Dashboards
- **Crucial Component**: A clear form requesting the **Student Name** and **Student ID**, strictly enforced before activating the "Submit Request" button.
- **SSN Warning Banner**: If the `/user/me` endpoint determines `ssn_verified` is false, show a persistent UI banner reminding them to upload their ID to unlock their queued requests (`POST /parent/upload-ssn-card`).
- **Dynamic Render Logic**:
  - When the user selects a document from the dropdown. 
  - If the document is `is_auto_generated: true`: Reveal the reason input text boxes and the HTML Canvas Signature pad. Hide everything else.
  - If the document is `requires_payment: true`: Hide the signature pad. Show a screen detailing the School's Bank Details (`GET /payment/instructions`). Offer an image drop-zone for bank transfer receipts.
- **History List**: A clean, unified table fetching `GET /requests/my-requests`, visibly showing the status of their current requests (`pending_verification`, `pending`, `ready_for_pickup`).

### IV. Staff Dashboard (Office/Admin Portal)
- A powerful, highly-responsive Data Table populated from `GET /staff/requests`. 
- **Required UI Triggers**:
  - A button rendering a modal to view uploaded Bank Payment slips, with "Approve Payment" and "Reject Payment" buttons.
  - A button rendering a modal to view SSN cards, with an "Approve Identity" button.
  - A dropdown selector on each request row that patches the status to "Ready for Pickup" when the document is physically prepared, triggering the final notification to the parent.

### V. Super Admin Control Panel
- A conditionally rendered sidebar/panel that only exists if the JWT `role === 'super_admin'`. 
- Provides forms to input Name, Email, and Password to rapidly provision new `admin` or `viewer` accounts for office personnel (`POST /superadmin/staff`). 

---

## 4. Docker Deployment & Local Development

This application is fully containerized and uses Docker Compose to seamlessly orchestrate both the Node.js API and the PostgreSQL database. **Zero manual configuration is required.**

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed and running on your machine.
- (Optional but recommended) Git to clone the repository.

### How to Run Successfully
1. **Clone the project** OR **Navigate** to the project directory in your terminal:
   ```bash
   cd Bishop_Martin_parentPortal
   ```
2. **Start the containers**:
   Run the following command to automatically build the API image, pull the Postgres database, execute the database seed files, and run the server:
   ```bash
   docker-compose up --build -d
   ```
   *The `-d` flag runs everything in the background (detached mode).*

3. **Verify the Deployment**:
   - The API will be active and listening at `http://localhost:3000`.
   - You can test it by visiting `http://localhost:3000/api/health` in your browser.
   - The PostgreSQL database is securely bound to port `5432` internally.

### Clean up and Stopping
- To stop the server gracefully, run:
  ```bash
  docker-compose down
  ```
- All uploaded images (SSN cards, receipts) and generated PDFs will persist safely in your local `uploads` directory automatically thanks to volume binding!

---
_Leave literally nothing to assumption. This document dictates the definitive standard operating procedures across the portal's entire technology stack._

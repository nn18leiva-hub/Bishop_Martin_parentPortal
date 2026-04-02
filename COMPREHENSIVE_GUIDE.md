# Comprehensive System Guide (V2)
**Bishop Martin Document Request Portal**

This guide comprehensively details how the API logic flows, how roles are strictly enforced, and how the automatic templates operate behind the scenes.

---

## 1. The 4-Tier Hierarchy (User Roles)
The system uses JSON Web Tokens (JWT) to lock down routes based on exactly who is logged in.

1. **Parents and Past Students**: 
   - During registration, they select their `user_type` (`parent` or `past_student`).
   - *Strict Rule*: **TODOS LOS USUARIOS** (Padres y Ex-Alumnos) deben proveer obligatoriamente su fecha de nacimiento (`dob`).
   - *Strict Rule*: Si se selecciona "Ex-Alumno", el servidor usa el `dob` para bloquear automáticamente el registro de cualquier persona menor a 18 años.
   - *Strict Rule*: Ex-alumnos están bloqueados. **SOLO** pueden solicitar transcripciones (Transcripts).
   - Can register accounts and securely log in.
   - Identity verification is non-blocking. Users can submit requests *before* their SSN/identity is verified, but these requests will be paused indefinitely at `pending_verification`. Once the office verifies the user's identity, the system seamlessly unpauses these requests to standard `pending` processing automatically.

2. **Viewers (e.g., Principal)**:
   - This account is given to high-level school officials who need to monitor the system queue but shouldn't accidentally mess anything up. 
   - Middlewares physically sandbox this role, meaning they can only ever execute HTTP `GET` requests. If they try to click "Delete" or "Approve", the server stops them.

3. **Admins (e.g., Accounts Clerk, Office Staff)**:
   - These are the standard workers. They receive requests, verify bank payment images, mark parents as "verified", and update request statuses from `pending` to `ready_for_pickup`.
   - They cannot create or delete other staff accounts.

4. **Super Admins (e.g., IT Technician)**:
   - They possess all the powers of an Admin, but they also have the exclusive authority to reach the `/superadmin` endpoints. 
   - They can register new Admins, provision Viewers, or delete accounts from the database.

---

## 2. Document Generation Engine & Business Rules

The database (`document_types` table) controls how each specific document type acts when requested. It dictates whether a transaction is "Automated" or "Manual", and whether it "Needs Payment" or is "Free".

### A. Simple Requests (Transcripts & Letters)
- **`is_auto_generated: false`**, **`requires_payment: true`**
- When parents request these, the system simply creates a blank request in the database. 
- The office is expected to manually type out the letter or print the transcript.
- Because these cost money, the system expects the parent to go to the `POST /payment/upload-receipt` endpoint to prove they performed a bank transfer.

### B. Automated Forms (Absence, Lateness, Permissions)
- **`is_auto_generated: true`**, **`requires_payment: false`**
- These are free, so the payment gate logic is completely skipped.
- When parents enter "Reason for absence: Fever" on their phone, the Front-end creates a `form_data` JSON packet.
- The parent also draws their signature on their screen. The Front-end attaches this drawing as an image payload (`signature_image`).
- Our backend intercepts this, boots up `pdfkit`, and generates a beautifully formatted PDF Document. It types out their student's ID, the form data ("Reason: Fever"), and stamps their drawn signature exactly on the bottom line. It saves this PDF directly to the school's server automatically!

---

## 3. How the Front-End Team Should Use This

To bring this portal to life, the Front-End developers (React / HTML) need to build the following screens that hook directly into our APIs:

1. **Auth Screens**: 
   - A `Register` and `Login` page. 
   - Registration needs a dropdown for Role ('Parent' or 'Past Student'). If 'Past Student' is selected, a Date picker for `dob` must appear.

   > [!TIP]
   > ### The Unified Login Routing Strategy
   > **A single login endpoint (`POST /auth/login`) handles all 5 user tiers seamlessly.** 
   > 1. Everyone inputs their `email` and `password` on the exact same UI component.
   > 2. The backend dynamically hunts across the database modules to resolve who they are.
   > 3. The server then ejects a precise JWT login profile payload:
   >    - For a Parent: `{ "token": "...", "type": "parent" }`
   >    - For Staff: `{ "token": "...", "type": "staff", "role": "super_admin" }` (or `admin` / `viewer`)
   > 4. **Your Action**: Read this response. Use Javascript `if` blocks to divert traffic right out of the login portal (`if type === 'parent' -> navigate('/dashboard/padres')`).
   
2. **Parent Dashboard**:
   - Needs a drag-and-drop box to upload their SSN card (`POST /parent/upload-ssn-card`).
   - A Dropdown menu to select Document Types.
   - If a Slip is selected, they should display a dynamic Form Input and a Canvas to draw their signature.
   - If a Transcript is selected, they should hide the signature canvas and display the Bank Transfer Info (`GET /payment/instructions`).
   - A unified list of their historical request statuses (`GET /requests/my-requests`).

3. **Staff Dashboard (Office / Admin Portal)**:
   - A massive data-table pulling all requests (`GET /staff/requests`). The table should have buttons to approve the parent SSN, verify uploaded payment receipts, and a dropdown to switch the status to "Ready for Pickup". 

4. **Super Admin Dashboard**:
   - A hidden panel only visible if `role === 'super_admin'`. Allows the IT department to register new office workers into the DB (`POST /superadmin/staff`).

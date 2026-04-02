# Bishop Martin High School - Document Request Portal API

This repository contains the backend REST API for the **Document Request Portal** used by parents or guardians of students attending Bishop Martin High School.

## Overview
The system allows parents to:
- Register an account.
- Verify their identity using a securely uploaded image of their Social Security card.
- Request official school documents (e.g. Lateness Form, Absence Form, Enrolment Letter, Transcript).
- Upload bank transfer payment receipts.
- Track their request statuses.

It also provides staff with secure endpoints to review parents, verify manual bank payments, and update request statuses to ready for pickup.

## Tech Stack
- **Node.js & Express**: Backend routing and application logic.
- **PostgreSQL (pg)**: Robust relational database for retaining transaction and portal data.
- **JSON Web Tokens (JWT)**: Stateless authorization separating Staff and Parents.
- **Bcrypt**: Cryptographically hashes and securely stores all passwords in the database.
- **Multer**: Safely manages the interception of Multi-Part image forms handling SSN cards and transaction receipts.

---

## 🚀 Running the Project

### 1. Prerequisites
- **Node.js** environment installed.
- **PostgreSQL** running locally.

### 2. Environment Variables (.env)
In the project root directory, the `.env` manages connection configurations. Make sure it looks like this:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Loganito2
DB_NAME=parentportal
JWT_SECRET=super_secret_jwt_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Launch the Server
To run in standard mode:
```bash
npm start
```
To run in development mode with auto-reloads (Nodemon):
```bash
npm run dev
```

The server will accept incoming HTTP connections at **`http://localhost:3000`**.

---

## 🧪 Testing the Endpoints

### 1. Postman Collection
A **Postman Collection** is included out-of-the-box (`Bishop_Martin_API.postman_collection.json`).  
1. Open up your Postman client.
2. Import the JSON file from the project directory.
3. Replace the `Bearer YOUR_TOKEN_HERE` placeholder in the Headers with actual authorization keys generated dynamically upon calling the Login endpoint!

### 2. Integration Test Script
A fast, automated test scenario is integrated into the codebase. To verify your database is responding predictably across all modules, simply execute:
```bash
node test_endpoints.js
```

---

## 👥 Pre-Configured Users (Staff Accounts)
Seed defaults exist to grant immediate staff-level control to manage incoming parent portals.

The predefined test accounts share the same password `password123`:
1. **Accounts Clerk**: `clerk@bmhs.edu.bz`
2. **IT Technician**: `it@bmhs.edu.bz`
3. **Office Staff**: `office@bmhs.edu.bz`

Parents must be generated dynamically using the `POST /auth/register` API route to successfully associate their unique Database ID integer to subsequent SSN card uploads & request instances.

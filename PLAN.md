# Project Implementation Plan

## 1. Project Initialization
- [x] Create Project Directory `usj-pool-management-system`
- [x] Initialize Server (Node.js/Express)
- [x] Initialize Client (React.js/Vite)
- [x] Configure Tailwind CSS (v3)

## 2. Backend Architecture (Node/Express)
- [x] **Database**: Connect to MongoDB (Atlas or Local).
- [x] **Models**:
  - [x] `User`: Email, Password (hashed), Role (Student/Staff/Admin), Profile info.
  - [x] `Slot`: Date, Time, Capacity, CurrentBookings.
  - [x] `Booking`: UserID, SlotID, Status, QR Code Data.
- **Routes**:
  - [x] `/api/auth`: Login, Register.
  - [x] `/api/slots`: CRUD for pool slots.
  - [x] `/api/bookings`: Book, Cancel, View.

## 3. Frontend Architecture (React)
- **Tech**: Vite, React Router, Tailwind CSS.
- **Pages**:
  - [x] Landing/Login Page.
  - [x] Student Dashboard (Book slot, View History).
  - [x] Admin Dashboard (Manage Slots, View Reports).
  - [x] QR Scanner (for Staff).

## 4. Immediate Next Steps
1. [x] Confirm Tailwind CSS version (v3).
2. [x] Scaffold Client app (`npx create-vite`).
3. [x] Set up basic Express server in `server/index.js`.
4. [x] Complete Feature Implementation (Auth, Booking, Admin, Scanner).
5. [ ] **User Action Required**: Ensure MongoDB is running locally to proceed with testing.

## 5. Deployment (Vercel)
- [ ] **Backend (Vercel Functions)**:
  - [x] Create `server/vercel.json` for serverless configuration.
  - [x] Configure `server.js` to export `app` and avoid `app.listen` in production.
  - [x] Optimize `db.js` for serverless connection pooling.
  - [ ] Set up a new project on Vercel with `server` as root.
- [ ] **Frontend (Vercel)**:
  - [x] Configure `client/vercel.json` for SPA routing.
  - [ ] Set up a new project on Vercel with `client` as root.
  - [ ] Configure `VITE_API_BASE_URL` env var.

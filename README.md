# GatePass

GatePass is a full-stack institutional leave management system built for Thapar Institute of Engineering and Technology. It replaces the entire paper-based student leave process with a structured 3-tier digital workflow: a student submits a leave request, their parent verifies it through a secure email link, an admin approves or rejects it, and the student gets a QR code to present at the gate. The security guard scans it and the exit is logged. No paperwork, no manual entries, no chasing approvals over WhatsApp.



## 🛠️ Technologies

- React (Frontend)
- TypeScript
- Node.js + Express (Backend)
- Prisma (ORM)
- PostgreSQL
- JWT (Authentication)
- Nodemailer + Gmail SMTP (Email verification)
- QR Code Library



## ✨ Features

- Students submit leave requests with destination, dates, and reason — all in one form
- Parents receive a secure one-time email verification link that expires after use — no account needed
- Admin dashboard shows all pending requests that have cleared parental verification, ready for review
- Admins approve or reject requests with a single action — approved requests auto-generate a QR code
- Security guard scans the QR code at the gate — system logs the exit automatically
- 3-role JWT authentication — student, admin, and security guard each see only what they need
- Full audit trail of every request, approval, rejection, and gate scan stored in PostgreSQL



## 🔐 Three Roles, One System, Zero Manual Logging

Most hostel leave systems at colleges are either fully manual or half-digitized — someone still has to call the parent, someone still has to write in a register. Gate-Pass closes the entire loop digitally. The parent never needs an account. The security guard never needs to write anything down. Every approval and exit is in the database automatically.



## 🔧 Process

The project started from a real problem — the existing leave process at Thapar involved physical forms, manual parent calls, and handwritten gate registers. We mapped out all three user roles first (student, admin, guard) and designed the database schema and API routes before writing any frontend code.

The authentication system was the most critical piece. Rather than building a separate parent portal, I used a token-based email flow — when a student submits a request, the backend generates a signed JWT with an expiry, embeds it in a verification URL, and sends it to the parent's registered email via Nodemailer. The parent clicks the link, the token is validated, and the request moves to the admin queue. No parent account, no friction.

The admin dashboard pulls all requests that have cleared parental verification and lets admins approve or reject with a single API call. On approval, the backend generates a QR code tied to the request ID and stores it against the student's record.

The security guard interface is intentionally minimal — scan the QR, see the student's name, leave dates, and approval status, and the exit gets logged. Built it this way because the guards shouldn't need to navigate a complex UI.



## 📚 What I Learned

- **JWT-based multi-role auth** — designing a single auth system that serves three completely different user roles with different permissions and different views, all using the same token infrastructure
- **One-time token email flows** — generating expiry-based signed tokens, embedding them in URLs, and validating them on the backend without storing session state
- **Prisma + PostgreSQL** — modeling a relational schema with multiple roles, request states, and audit records; writing efficient queries for the admin dashboard
- **Nodemailer** — setting up Gmail SMTP for transactional emails and handling delivery edge cases
- **Role-based UI design** — building three entirely different interfaces (student, admin, guard) that share the same backend but show completely different things based on the JWT role claim



## 🌱 Overall Growth

Gate-Pass was the first project where I had to think seriously about a real user flow with multiple distinct actors. It's not just one user doing one thing — it's three different people interacting with the same system in sequence, and the system has to stay consistent throughout that chain. Designing that correctly, especially the email verification flow, taught me more about auth and system design than any tutorial.



## 🚀 Running the Project
```bash
git clone https://github.com/Rparakh24/gate-pass.git
cd gate-pass

# Backend
cd backend
npm install

# Create a .env file:
# JWT_SECRET=your_secret_key
# EMAIL=your_gmail_address
# PASSWORD=your_gmail_app_password
# DATABASE_URL=your_postgresql_connection_string

npx prisma generate
npx prisma migrate deploy

npm run dev  # runs on http://localhost:3000

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev  # runs on http://localhost:5173
```

# GatePass

GatePass is a full-stack institutional leave management system built for hostel and campus exit workflows. It replaces the paper-based process with a simple digital loop: a student submits a leave request, the parent verifies it through email, the admin approves it, and the student gets a QR gate pass. The guard scans the QR at the exit, confirms the student details, and the student then gets a return pass that can be downloaded and shown while coming back.



## 🛠️ Technologies

- React (Frontend)
- TypeScript
- Node.js + Express (Backend)
- Prisma (ORM)
- PostgreSQL with Neon
- JWT (Authentication)
- Brevo API (Email verification)
- Zod validation and rate limiting
- Web Push support
- QR Code + downloadable return pass



## ✨ Features

- Students submit leave requests with destination, dates, and reason in one form
- Parents receive a secure one-time email verification link. No parent account is needed
- Admin signup is protected with an access code from the backend `.env`
- Admin dashboard auto-refreshes, so new parent-approved requests appear without a manual refresh
- Approved students get a QR code for the exit gate
- Guards scan the QR, see verified student details, and mark the exit as done
- After exit validation, the student page changes from QR to a return pass
- Students can download the return pass as an image and show it while returning
- Mobile-first glass UI for student, parent, admin, and guard screens



## 🔐 Three Roles, One System, Zero Manual Logging

Most hostel leave systems are either manual or only partly digital. Someone still has to call the parent, refresh a page, or write in a register. GatePass keeps the flow simple for everyone. The student requests leave, the parent approves from an email link, the admin approves from a live dashboard, and the guard validates the QR at the gate.



## 🔧 Process

I built the project around one clear flow: student request, parent verification, admin approval, guard scan, and return pass. The parent uses a one-time email link, so no separate parent account is needed.

The admin dashboard stays updated automatically and admin signup is protected with `ADMIN_SIGNUP_SECRET`. At the gate, the guard scans the QR, confirms the student details, and marks the exit as done. After that, the student's QR changes into a downloadable return pass.



## 📚 What I Learned

- **Multi-role auth**: handling student, admin, and guard flows without mixing their screens or permissions
- **One-time email links**: sending parent verification links that expire and cannot be reused
- **Prisma + Neon PostgreSQL**: moving from local thinking to a hosted relational database setup
- **Safer APIs**: adding validation, rate limits, pagination, shared Prisma client, and clearer error messages
- **Live UI flows**: auto-updating the admin dashboard and student status screens without refreshes
- **Mobile-first UI**: making the app usable on phones since that is where students and guards will mostly use it



## 🌱 Overall Growth

GatePass helped me think beyond simple CRUD screens. The main challenge was keeping one continuous flow consistent across different people: student, parent, admin, and guard. Each person only sees a small part of the system, but the backend has to keep the full chain reliable. Building that loop taught me a lot about auth, validation, database state, and practical UI design.



## 🚀 Running the Project
```bash
git clone https://github.com/Rparakh24/gate-pass.git
cd gate-pass

# Backend
cd backend
npm install

# Create a .env file:
# DATABASE_URL=your_neon_pooled_connection_string
# DIRECT_URL=your_neon_direct_connection_string
# JWT_SECRET=your_secret_key
# ADMIN_SIGNUP_SECRET=your_demo_admin_code
# FRONTEND_URL=http://localhost:5173
# BREVO_API_KEY=your_brevo_api_key
# EMAIL_FROM=GatePass <your_verified_sender_email>
# VAPID_PUBLIC_KEY=your_vapid_public_key
# VAPID_PRIVATE_KEY=your_vapid_private_key
# VAPID_EMAIL=mailto:your_email@example.com

npx prisma generate
npx prisma migrate deploy

npm run dev  # runs on http://localhost:3000

# Frontend (separate terminal)
cd ../frontend
npm install

# Create a .env file:
# VITE_API_URL=http://localhost:3000
# VITE_FRONTEND_URL=http://localhost:5173

npm run dev  # runs on http://localhost:5173
```

## 🌍 Deployment

For hosting, use Render for the backend, Vercel for the frontend, and Neon for PostgreSQL.

Render backend settings:
```bash
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

Set the same backend environment variables on Render. For `FRONTEND_URL`, use your Vercel URL. For email, add `BREVO_API_KEY` and `EMAIL_FROM`.

Vercel frontend settings:
```bash
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Set these frontend environment variables on Vercel:
```env
VITE_API_URL=https://your-render-backend.onrender.com
VITE_FRONTEND_URL=https://your-vercel-app.vercel.app
```

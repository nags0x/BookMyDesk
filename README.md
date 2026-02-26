# SeatSync — Hybrid Seat Booking Management System

A full-stack seat booking system for organizations with hybrid work schedules. Built with React + Node.js/Express + MongoDB.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas connection string)
- npm or yarn

### 1. Clone & Install

```bash
# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

### 2. Configure Environment

```bash
# Copy env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MongoDB URI and JWT secret.

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173

## Demo Credentials

| Role   | Email             | Password |
|--------|-------------------|----------|
| Member | arjun@corp.io     | pass123  |
| Member | priya@corp.io     | pass123  |
| Admin  | admin@corp.io     | admin123 |

## Tech Stack

- **Frontend**: React 18, Vite, Zustand, React Query, React Router, Zod
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Auth**: JWT (localStorage) + bcryptjs
- **Styling**: Custom CSS (no framework dependency)
- **Scheduling**: node-cron (auto-absence marking, buffer allocation)

## Project Structure

```
seatsync/
├── frontend/          # React app
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page-level components
│       ├── hooks/         # Custom React hooks
│       ├── store/         # Zustand stores
│       ├── utils/         # Helper functions
│       └── styles/        # Global CSS
├── backend/           # Express API
│   ├── routes/        # API routes
│   ├── models/        # Mongoose schemas
│   ├── middleware/    # Auth & error middleware
│   ├── services/      # Business logic
│   └── config/        # DB & app config
└── README.md
```

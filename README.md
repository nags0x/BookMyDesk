# BookMyDesk — Hybrid Seat Booking Management System

A full-stack seat booking system for organizations with hybrid work schedules. Built with React + Node.js/Express + MongoDB.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Project Setup

```bash
# Install dependencies
npm run install:all

# Configure environment
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```
*Note: Update `backend/.env` with your `MONGODB_URI`.*

### 2. Startup

```bash
# Seed initial data (Admin and sample users)
npm run seed

# Start both servers (Root level)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001

## Business Logic & Rules

- **Batch System**: Users are in Batch 1 or Batch 2.
    - **Week 1**: B1 scheduled Mon-Wed, B2 scheduled Thu-Fri.
    - **Week 2**: B2 scheduled Mon-Wed, B1 scheduled Thu-Fri.
- **Seat Types**: 10 **Guaranteed** (for scheduled batch) and 10 **Buffer** (for everyone else).
- **Booking Windows**:
    - **Guaranteed**: Up to 14 days in advance.
    - **Buffer**: Opens at **3:00 PM** the day before; closes at **9:00 AM** the day of.
- **Check-in**: Must check in by **10:00 AM** or marked ABSENT (penalty applied to fairness score).

## Database Schema (MongoDB/Mongoose)

- **`User`**: Profile, email, fairness score, and batch/squad assignment.
- **`Booking`**: Records of `userId`, `date`, `seatType` (Guaranteed/Buffer), and `status` (Booked/CheckedIn/Absent).
- **`Inventory`**: Daily snapshots of total vs. booked seats.
- **`CycleConfig`**: Global rules (seat counts, deadline times, cycle start date).
- **`Holiday`**: Office-wide closures.

## Tech Stack

- **Frontend**: React 18 (Vite), Zustand (State), React Query (Data Fetching), Zod (Validation).
- **Backend**: Express.js, Mongoose (ODM), JWT (Auth), node-cron (Automated Attendance).

## Demo Credentials

| Role   | Email             | Password |
|--------|-------------------|----------|
| Member | arjun@corp.io     | pass123  |
| Member | priya@corp.io     | pass123  |
| Admin  | admin@corp.io     | admin123 |

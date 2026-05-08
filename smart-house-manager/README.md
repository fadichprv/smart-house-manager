# Smart Shared House Manager

A full-stack web application for managing shared house reservations, rooms, donations, and community features.

## Tech Stack

### Backend
- **Node.js** + **Express** — REST API
- **PostgreSQL** — Database
- **Socket.io** — Real-time updates
- **JWT** — Authentication
- **bcryptjs** — Password hashing

### Frontend
- **Next.js 14** (App Router) — React framework
- **TypeScript** — Type safety
- **TailwindCSS** — Styling (dark mode)
- **Framer Motion** — Animations
- **React Query** — Data fetching & caching
- **Recharts** — Charts
- **Socket.io Client** — Real-time

## Features

- 🔐 **Authentication** — JWT-based login/register
- 🏠 **Room Management** — Browse, filter, and book rooms
- 📅 **Reservations** — Create, view, cancel reservations with business rules
- 📆 **Calendar View** — Visual calendar of all reservations
- 💝 **Donations** — Community donation system with leaderboard
- 🔔 **Real-time Notifications** — Socket.io powered alerts
- 👑 **Admin Panel** — Full user/room/reservation management
- 🎨 **Dark Mode** — Beautiful glassmorphism UI

## Business Rules

| Feature | Normal User | Premium User | Admin |
|---------|-------------|--------------|-------|
| Max reservations/day | 1 | 3 | Unlimited |
| Max reservations/week | 3 | 10 | Unlimited |
| Max duration | 4 hours | 8 hours | 24 hours |
| Advance booking | 3 days | 14 days | 1 year |

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup
```bash
# Create database
createdb smart_house_db

# Run schema
psql smart_house_db < backend/database/schema.sql

# Run seed data
psql smart_house_db < backend/database/seed.sql
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smarthouse.com | password |
| Premium | alice@smarthouse.com | password |
| Normal | bob@smarthouse.com | password |

> **Note:** The seed data uses the bcrypt hash for "password". Update the seed.sql with proper hashes for production.

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password

### Rooms
- `GET /api/rooms` — List rooms
- `GET /api/rooms/:id` — Get room
- `POST /api/rooms` — Create room (admin)
- `PUT /api/rooms/:id` — Update room (admin)
- `DELETE /api/rooms/:id` — Delete room (admin)

### Reservations
- `GET /api/reservations/my` — My reservations
- `GET /api/reservations/calendar` — Calendar view
- `POST /api/reservations` — Create reservation
- `DELETE /api/reservations/:id` — Cancel reservation

### Donations
- `GET /api/donations/leaderboard` — Top donors
- `GET /api/donations/goal` — Monthly goal
- `POST /api/donations` — Make donation

### Admin
- `GET /api/admin/stats` — Dashboard stats
- `GET /api/admin/users` — All users
- `PUT /api/admin/users/:id/role` — Change role
- `PUT /api/admin/users/:id/toggle-status` — Toggle active

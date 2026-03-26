# Movie Ticket Booking App

A full-stack movie ticket booking web application built with React (Vite) + Tailwind CSS on the frontend and Node.js + Express + Prisma (SQLite) on the backend.

\---

## Project Structure

```
movie-booking/
├── backend/
│   ├── config/         # Prisma client instance
│   ├── controllers/    # Business logic (auth, movies, shows, seats, bookings, theaters)
│   ├── middleware/     # JWT auth, admin guard, error handler
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Sample data seeder
│   ├── routes/         # Express routers  ( check session status before opening login/signup page)
│   ├── app.js          # Express app setup
│   ├── server.js       # HTTP server entry point
│   ├── .env            # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/        # Axios instance with interceptors
    │   ├── components/ # Navbar, MovieCard, SeatGrid, Loader
    │   ├── context/    # AuthContext (JWT state)
    │   └── pages/      # All pages + admin sub-pages
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

\---

## Prerequisites

* **Node.js** v18 or higher
* **npm** v9 or higher

\---

cd backend
npm install
Start the backend

```bash
npm run dev
```

Backend runs on **http://localhost:5000**

\---

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

> The Vite dev server proxies `/api/\\\*` requests to `http://localhost:5000`, so no CORS issues during development.

\---

## &#x20;Demo Login Credentials

|Role|Email|Password|
|-|-|-|
|Admin|admin@cinebook.com|admin123|
|User|john@example.com|user123|

\---

## &#x20;API Endpoints

|Method|Endpoint|Auth|Description|
|-|-|-|-|
|POST|/api/auth/register|—|Register user|
|POST|/api/auth/login|—|Login|
|GET|/api/auth/profile|User|Get own profile|
|PUT|/api/auth/profile|User|Update profile|
|GET|/api/movies|—|List movies (filter/page)|
|GET|/api/movies/:id|—|Movie detail + shows|
|POST|/api/movies|Admin|Create movie|
|PUT|/api/movies/:id|Admin|Update movie|
|DELETE|/api/movies/:id|Admin|Deactivate movie|
|GET|/api/theaters|—|List theaters|
|POST|/api/theaters|Admin|Create theater|
|GET|/api/shows|—|List shows (filterable)|
|POST|/api/shows|Admin|Create show + seats|
|GET|/api/seats/show/:showId|—|Get seats for a show|
|POST|/api/bookings|User|Create booking|
|GET|/api/bookings/my|User|My bookings|
|GET|/api/bookings/all|Admin|All bookings|
|GET|/api/bookings/:id|User|Booking + QR code|
|PUT|/api/bookings/:id/cancel|User|Cancel booking|

\---

## 


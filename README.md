# ISMO Digital — Code Companion

Student document request portal for ISMO Tetouan.  
Built with **Express + MongoDB** (backend) and **React + Vite** (frontend).

---

## Quick start

### Prerequisites
- Node.js 18+
- MongoDB 6+ running locally **or** a MongoDB Atlas connection string

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env          # then edit MONGODB_URI & JWT_SECRET
npm run seed                   # load demo data (run once)
npm run dev                    # API on http://localhost:5000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev                    # UI on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Demo accounts (after seed)

| Role    | Email                          | Password   |
| ------- | ------------------------------ | ---------- |
| Admin   | admin@ismo.ma                  | admin123   |
| Student | 2001102300461@ofppt-edu.ma     | student123 |

---

## Architecture

```
project/
├── backend/    Express REST API — MongoDB/Mongoose — JWT auth — Multer uploads
└── frontend/   React 18 SPA — Vite — TailwindCSS — shadcn/ui — TanStack Query
```

Both services are fully independent.  
In development, Vite proxies `/api/*` and `/uploads/*` to the backend at `:5000` so there are no CORS issues and no hardcoded URLs in the frontend code.

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for full details.

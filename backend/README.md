# ISMO Digital — Backend Project

Express.js REST API backed by **MongoDB + Mongoose**.

## Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Runtime     | Node.js 18+                       |
| Framework   | Express 4                         |
| Database    | MongoDB 6+ via Mongoose 8         |
| Auth        | JWT (cookie + Authorization header) |
| Validation  | Zod                               |
| File upload | Multer (local disk)               |

## Project structure

```
backend/
├── config/
│   ├── db.js          # Mongoose connection
│   └── schemas.js     # Zod validation schemas
├── middleware/
│   └── auth.js        # JWT helpers + Express middleware
├── models/
│   ├── User.js        # Mongoose User model
│   └── Demande.js     # Mongoose Demande model
├── routes/
│   ├── auth.js        # /api/auth/*
│   ├── demandes.js    # /api/demandes/*
│   └── admin.js       # /api/admin/*
├── uploads/           # File storage (gitignored)
│   ├── justificatifs/
│   └── documents/
├── index.js           # Entry point
├── seed.js            # Database seeder
├── .env.example
└── package.json
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET

# 3. (Optional) Seed the database with demo data
npm run seed

# 4. Start development server (auto-reload)
npm run dev

# 5. Start production server
npm start
```

## Environment variables

| Variable      | Description                                     | Default                      |
| ------------- | ----------------------------------------------- | ---------------------------- |
| `MONGODB_URI` | MongoDB connection string                       | `mongodb://localhost:27017/ismo-digital` |
| `JWT_SECRET`  | Secret used to sign JWT tokens                  | insecure default (change!)   |
| `PORT`        | HTTP port                                       | `5000`                       |
| `CLIENT_URL`  | Allowed CORS origin (your frontend URL)         | `http://localhost:5173`      |

## API endpoints

### Auth
| Method | Path              | Auth | Description         |
| ------ | ----------------- | ---- | ------------------- |
| POST   | /api/auth/login   | —    | Login               |
| GET    | /api/auth/me      | ✓    | Get current user    |
| POST   | /api/auth/logout  | —    | Logout (clear cookie) |

### Student
| Method | Path               | Auth | Description             |
| ------ | ------------------ | ---- | ----------------------- |
| GET    | /api/demandes      | ✓    | Own requests            |
| POST   | /api/demandes      | ✓    | Submit new request      |
| GET    | /api/demandes/:id  | ✓    | Get request detail      |

### Admin
| Method | Path                              | Auth  | Description              |
| ------ | --------------------------------- | ----- | ------------------------ |
| GET    | /api/admin/demandes               | admin | All requests             |
| GET    | /api/admin/demandes/:id           | admin | Request + user detail    |
| PUT    | /api/admin/demandes/:id           | admin | Update status / comment  |
| POST   | /api/admin/demandes/:id/document  | admin | Upload final document    |
| GET    | /api/admin/statistiques           | admin | Aggregate stats          |
| GET    | /api/admin/students               | admin | All students             |
| POST   | /api/admin/students               | admin | Create student account   |
| DELETE | /api/admin/students/:id           | admin | Delete student           |

## Demo credentials (after seed)

| Role    | Email                             | Password   |
| ------- | --------------------------------- | ---------- |
| Admin   | admin@ismo.ma                     | admin123   |
| Student | 2001102300461@ofppt-edu.ma        | student123 |

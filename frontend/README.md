# ISMO Digital — Frontend Project

React 18 SPA for the ISMO Digital Document Center.

## Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | React 18 + Vite 5                       |
| Routing    | Wouter                                  |
| Data       | TanStack Query v5                       |
| Forms      | React Hook Form + Zod                   |
| UI         | shadcn/ui (Radix primitives + Tailwind) |
| Styling    | Tailwind CSS v3                         |
| Auth       | JWT cookie (managed by backend)         |

## Project structure

```
frontend/
├── public/
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (accordion, button, …)
│   │   ├── app-sidebar.jsx
│   │   ├── request-type-badge.jsx
│   │   └── status-badge.jsx
│   ├── hooks/
│   │   ├── use-mobile.jsx
│   │   └── use-toast.js
│   ├── lib/
│   │   ├── auth.jsx         # AuthContext + useAuth hook
│   │   ├── queryClient.js   # TanStack Query + apiRequest helper
│   │   ├── schema.js        # Zod schemas + label constants (no backend deps)
│   │   └── utils.js         # cn() helper
│   ├── pages/
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   ├── student-dashboard.jsx
│   │   ├── new-request.jsx
│   │   ├── my-requests.jsx
│   │   ├── request-details.jsx
│   │   ├── admin-dashboard.jsx
│   │   ├── admin-requests.jsx
│   │   ├── admin-request-detail.jsx
│   │   ├── admin-stats.jsx
│   │   ├── admin-students.jsx
│   │   └── not-found.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js           # Dev proxy: /api + /uploads → :5000
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional in dev)
cp .env.example .env
# VITE_API_URL is empty by default — the Vite proxy handles it.
# Only set it if deploying frontend separately from the backend.

# 3. Start dev server
npm run dev           # http://localhost:5173

# 4. Build for production
npm run build         # output → dist/
npm run preview       # preview the production build locally
```

## Environment variables

| Variable       | Description                                                        | Default |
| -------------- | ------------------------------------------------------------------ | ------- |
| `VITE_API_URL` | Backend origin for production deploys (e.g. `https://api.x.com`). | `""`    |

> In development, leave `VITE_API_URL` empty. The Vite dev server proxies
> `/api/*` and `/uploads/*` to `http://localhost:5000` automatically.

## Pages & access

| Path                    | Role    | Description                  |
| ----------------------- | ------- | ---------------------------- |
| `/login`                | Public  | Login form                   |
| `/`                     | Student | Student dashboard            |
| `/new-request`          | Student | Submit a new request         |
| `/my-requests`          | Student | List own requests            |
| `/request/:id`          | Student | Request detail               |
| `/admin`                | Admin   | Admin dashboard              |
| `/admin/requests`       | Admin   | All requests                 |
| `/admin/request/:id`    | Admin   | Request detail + actions     |
| `/admin/stats`          | Admin   | Statistics & charts          |
| `/admin/students`       | Admin   | Student management           |

## Demo credentials

| Role    | Email                          | Password   |
| ------- | ------------------------------ | ---------- |
| Admin   | admin@ismo.ma                  | admin123   |
| Student | 2001102300461@ofppt-edu.ma     | student123 |

> Run `npm run seed` in the **backend** directory first to create these accounts.

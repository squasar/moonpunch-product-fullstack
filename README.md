# MOON PUNCH Product Fullstack

A fullstack product showcase and management platform with a TypeScript/Express backend, PostgreSQL database, Prisma ORM, JWT authentication, email provider swapping, OAuth support, product comments, subscriptions, license generation, and a static frontend.

## 🚀 Project Summary

This repository contains:
- `backend/`: Express API server written in TypeScript
- `frontend/`: static front-end files for landing, authentication, product listings, and product pages
- `admin/`: custom admin template files used by the admin experience
- `moonpunch_db.sql`: database schema seed or export reference

The backend exposes secure API endpoints for auth, users, products, comments, subscriptions, licenses, and admin management.

## ✅ Built-in Features

- User registration, login, refresh, and logout
- JWT access and refresh token authentication
- Role-based authorization (`user`, `moderator`, `admin`)
- Admin-only product creation, publishing, updating, archiving, and media management
- Product comments, approval workflow, and ratings
- Subscription management for users and admin product subscriber views
- License generation, activation, and revocation
- Email sending adapter supporting Nodemailer, SendGrid, or Resend
- OAuth login support for Google, GitHub, and Steam
- Prisma schema with users, products, categories, comments, subscriptions, licenses, and sessions

## 📁 Repository Structure

- `backend/`
  - `src/`
    - `config/` — environment validation, Prisma database connection, Passport OAuth config
    - `controllers/` — request handlers for auth, users, products, comments, subscribers, licenses, admin
    - `middleware/` — JWT authentication, role guards, request validation
    - `routes/` — Express routes for all API groups
    - `services/email/` — email provider adapter and implementations
    - `utils/` — shared error handling, JWT helpers, license generation
  - `prisma/`
    - `schema.prisma` — database model definitions
    - `seed.ts` — initial data seed
    - `migrations/` — generated schema migration files
- `frontend/` — static HTML, CSS, JavaScript assets for the website UI
- `admin/` — admin template assets and dashboard files

## 🔧 Prerequisites

- Node.js 18+ / npm
- PostgreSQL database
- A code editor and terminal

## 🧩 Important Credentials

Use the built-in admin user for initial access:

- Email: `admin@moonpunch.com`
- Password: `changeme123!`

> Important: update this password after first login and never use admin credentials in production.

## 🛠️ Backend Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy the example `.env` and update the values:

```bash
cp .env.example .env
```

Open `backend/.env` and update the following keys:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_ACCESS_SECRET` — a strong secret for access tokens
- `JWT_REFRESH_SECRET` — a strong secret for refresh tokens
- `FRONTEND_URL` — front-end origin used by CORS and redirects
- Email settings for your chosen `EMAIL_PROVIDER`

### 3. Ensure your database exists

Make sure the database referenced by `DATABASE_URL` exists, for example `moonpunch_db`.

### 4. Run Prisma migrate and seed the database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start the backend server

```bash
npm run dev
```

The API will start on the port configured in `backend/.env` (default `3000`).

## 🌐 Frontend

The frontend is served as static files under `frontend/` and includes:

- `index.html` — main landing page
- `login.html` — login form
- `register.html` — user registration
- `product.html` — product detail page

There is no dedicated frontend build step included in this repository. You can serve `frontend/` from a local static server or use a tool like Live Server.

## 📦 Environment Variables

The backend requires the following environment variables:

- `PORT` — server port
- `NODE_ENV` — environment mode
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` — JWT access token secret
- `JWT_REFRESH_SECRET` — JWT refresh token secret
- `JWT_ACCESS_EXPIRY` — access token lifetime (default `15m`)
- `JWT_REFRESH_EXPIRY` — refresh token lifetime (default `7d`)
- `FRONTEND_URL` — allowed front-end origin
- `FROM_EMAIL` — sender email address
- `EMAIL_PROVIDER` — `nodemailer`, `sendgrid`, or `resend`

Email transport settings:

- For `nodemailer`:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
- For `sendgrid`:
  - `SENDGRID_API_KEY`
- For `resend`:
  - `RESEND_API_KEY`

OAuth settings (optional):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
- `STEAM_API_KEY`, `STEAM_CALLBACK_URL`

## 🧠 API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/redirect`
- `POST /api/auth/logout`
- `GET /api/auth/oauth/google`
- `GET /api/auth/oauth/callback/google`
- `GET /api/auth/oauth/github`
- `GET /api/auth/oauth/callback/github`
- `GET /api/auth/oauth/steam`
- `GET /api/auth/oauth/callback/steam`

### Users
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/:id`
- `GET /api/users` (admin only)
- `PATCH /api/users/:id/role` (admin only)
- `DELETE /api/users/:id` (admin only)

### Products
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products` (admin only)
- `PUT /api/products/:id` (admin only)
- `DELETE /api/products/:id` (admin only)
- `POST /api/products/:id/media` (admin only)
- `DELETE /api/products/:id/media/:mediaId` (admin only)

### Comments
- `GET /api/comments/product/:productId`
- `POST /api/comments/product/:productId`
- `PATCH /api/comments/:id/approve` (admin/moderator only)
- `DELETE /api/comments/:id`

### Subscribers
- `POST /api/subscribers/product/:productId`
- `DELETE /api/subscribers/product/:productId`
- `GET /api/subscribers/me`
- `GET /api/subscribers/product/:productId` (admin only)

### Licenses
- `GET /api/licenses/me`
- `POST /api/licenses/generate` (admin only)
- `POST /api/licenses/activate`
- `PATCH /api/licenses/:id/revoke` (admin only)

### Admin
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/analytics`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/role`
- `PUT /api/admin/users/:id/disable`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/publish`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/comments`
- `POST /api/admin/comments/:id/approve`
- `POST /api/admin/comments/:id/reject`
- `DELETE /api/admin/comments/:id`
- `GET /api/admin/licenses`
- `PUT /api/admin/licenses/:id/revoke`
- `GET /api/admin/subscribers`

## 📌 Important Notes

- The repository includes a default admin account for initial access.
- Make sure to update the `.env` file values before starting the server.
- Install all backend dependencies with `npm install` in `backend/`.
- Run Prisma migrations and seed data before using the app.
- The backend validates environment variables at startup and will fail if required values are missing.
- If you use `EMAIL_PROVIDER=sendgrid` or `EMAIL_PROVIDER=resend`, install the provider package manually if not already installed.

## 🎯 Quick Start

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your database, secrets, and email settings
npm run db:migrate
npm run db:seed
npm run dev
```

Then open the frontend files from `frontend/` with a static server or local file preview.

## 📝 Admin Credentials

- **Email:** `admin@moonpunch.com`
- **Password:** `changeme123!`

> Change the admin password immediately if you are deploying or sharing this project.

## 📚 Additional Information

- `backend/src/utils/license-gen.ts` generates license keys.
- `backend/src/services/email/` supports multiple email providers through a single adapter.
- `backend/src/config/auth.ts` configures Passport OAuth strategies.
- `backend/src/middleware/roles.ts` protects admin routes.
- `backend/src/index.ts` exposes the `GET /api/health` health check.

Enjoy exploring MOON PUNCH and customizing it for your product showcase workflow.

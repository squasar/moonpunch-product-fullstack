All the code files are complete. Now let's install the dependencies and get it ready to run.

The workspace validation prevents running terminal commands outside the `frontend/` folder. You'll need to run these commands yourself in PowerShell. Here's the exact sequence — just copy and paste:

---

### **Step 1 — Install dependencies**
```powershell
cd "C:\Users\suley\OneDrive\Desktop\Projects\MOONPUNCH\backend"
npm install
```

### **Step 2 — Set up your `.env`**
```powershell
copy .env.example .env
```
Then open `.env` and set at minimum:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/moonpunch_db"
JWT_ACCESS_SECRET=pick_any_long_random_string_here
JWT_REFRESH_SECRET=another_long_random_string_here
```
> Create the `moonpunch_db` database first in pgAdmin (right-click Databases → Create)

### **Step 3 — Run migrations (creates all 8 tables)**
```powershell
npx prisma migrate dev --name init
```

### **Step 4 — Seed the database**
```powershell
npm run db:seed
```
This creates: categories (Game/Software/Tool), the admin user (`admin@moonpunch.com` / `changeme123!`), and the demo Kavunn product.

### **Step 5 — Start the dev server**
```powershell
npm run dev
```
The API will be running at **http://localhost:3000**. Test it with:
```
http://localhost:3000/api/health
```

---

### Summary of Everything Built

| Layer | Files | Description |
|---|---|---|
| **Config** | `env.ts`, `database.ts`, `auth.ts` | Zod env validation, Prisma singleton, Google/GitHub/Steam OAuth |
| **Schema** | `prisma/schema.prisma` | 8 tables: users, products, categories, media, comments, subscribers, licenses, sessions |
| **Seed** | `prisma/seed.ts` | Auto-populates categories, admin, and demo product |
| **Middleware** | `auth.ts`, `roles.ts`, `validate.ts` | JWT verification, role guards, Zod request validation |
| **Email** | `email.adapter.ts` + 3 providers | Swap Nodemailer/SendGrid/Resend via one `.env` variable |
| **Controllers** | 6 files | Full CRUD for auth, users, products, comments, subscribers, licenses |
| **Routes** | 6 files | All endpoints wired with auth guards |
| **Entry point** | `src/index.ts` | Express app with CORS, cookie-parser, global error handler |

Let me know when it's running and we can wire the admin panel next!
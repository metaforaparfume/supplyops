# LANGKAH-LANGKAH MEMBUAT SupplyOps

## 📁 Struktur Folder Awal
```
C:\xampp\htdocs\ERP\
```

---

## LANGKAH 1 — Init Project Next.js

Buka **PowerShell/Terminal** di folder `C:\xampp\htdocs\ERP`, lalu:

```bash
# Hapus isi folder (kecuali file yg penting)
# Lalu jalankan:
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

> **Catatan**: Jika folder `ERP` punya huruf kapital, npm akan error. Solusi: buat di folder `supplyops-temp`, lalu copy semua isinya ke folder `ERP`.

---

## LANGKAH 2 — Install Semua Dependency

```bash
# Prisma ORM
npm install @prisma/client
npm install -D prisma

# NextAuth untuk login
npm install next-auth@4 bcryptjs
npm install -D @types/bcryptjs

# UI Components (shadcn)
npx shadcn@latest init -d
npx shadcn@latest add card table badge input select textarea dialog dropdown-menu form label separator tabs avatar sheet skeleton progress alert popover command sonner

# Chart untuk dashboard
npm install recharts

# Untuk menjalankan seed file
npm install -D tsx
```

---

## LANGKAH 3 — Setup Database MySQL (XAMPP)

1. **Start MySQL** dari XAMPP Control Panel (klik Start pada MySQL)
2. **Buat database** baru:
```bash
# Buka terminal, jalankan:
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE supplyops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. **Setup Prisma**:
```bash
npx prisma init --datasource-provider mysql
```

4. **Edit file `.env`** — isinya:
```
DATABASE_URL="mysql://root:@localhost:3306/supplyops"
NEXTAUTH_SECRET="supplyops-secret-key-2024-pbl"
NEXTAUTH_URL="http://localhost:3000"
```

---

## LANGKAH 4 — Buat Model Database (Prisma Schema)

**File: `prisma/schema.prisma`**

Buat 7 model:
- **User** — id, name, email (unique), password, role, createdAt, updatedAt
- **Order** — id, cpoRef (unique), wbsRef, boqDetails (JSON), status, customsStatus, lspStatus, deliveryStatus, notes, userId
- **PurchaseOrder** — id, poNumber (unique), orderId, status, releaseDate, notes
- **StockItem** — id, name, warehouse, qtySystem, qtyPhysical, unit, minStock, lastCountDate
- **StockMovement** — id, stockItemId, type, qtyChange, qtyBefore, qtyAfter, notes, userId
- **CallOff** — id, orderId, itemName, qty, date, status, notes, userId
- **ActivityLog** — id, activityType, referenceId, referenceType, description, userId

Relasi: relasi antar model pakai `@relation` dan `@default`.

Setelah selesai:
```bash
npx prisma migrate dev --name init
```

---

## LANGKAH 5 — Seed Data Dummy

**File: `prisma/seed.ts`**

Isi dengan data:
- 3 user (admin, officer, warehouse) — password di-hash pakai bcrypt
- 5 order dengan status berbeda (Draft, Clarified, PO Released, In Delivery, Closed)
- 3 Purchase Order
- 12 StockItem di 3 warehouse
- 2 StockMovement (reconciliation + scrap)
- 7 ActivityLog

**Tambahkan di `package.json`:**
```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

**Jalankan:**
```bash
npx prisma db seed
```

---

## LANGKAH 6 — Setup Koneksi Database

**File: `src/lib/prisma.ts`**
```typescript
import { PrismaClient } from "@prisma/client"
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## LANGKAH 7 — Buat Login (NextAuth)

**File: `src/lib/auth.ts`**
- Config NextAuth dengan `CredentialsProvider`
- Cari user di database, bandingkan password dengan bcrypt
- Simpan id + role di JWT token

**File: `src/app/api/auth/[...nextauth]/route.ts`**
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## LANGKAH 8 — Middleware (Proteksi Halaman)

**File: `src/middleware.ts`**
- Pakai `withAuth` dari next-auth/middleware
- Halaman `/login` bebas akses
- Halaman lain butuh login

---

## LANGKAH 9 — Layout & Sidebar

**File: `src/app/(dashboard)/layout.tsx`**
- Bungkus dengan `SessionProvider`
- Tampilkan Sidebar + main content

**File: `src/components/Sidebar.tsx`**
- 3 menu: Dashboard (`/dashboard`), Orders (`/orders`), Inventory (`/inventory`)
- Tampilkan nama user + role
- Tombol Logout

---

## LANGKAH 10 — Halaman Login

**File: `src/app/(auth)/login/page.tsx`**
- "use client" — form email + password
- Pakai `signIn` dari next-auth/react
- Redirect ke `/dashboard` setelah login
- Tampilkan 3 akun demo

---

## LANGKAH 11 — API Routes

Buat folder di `src/app/api/`:

### orders/route.ts
- `GET` — ambil semua order + relasi user, PO, callOffs
- `POST` — buat order baru + log activity

### orders/[id]/route.ts
- `GET` — ambil 1 order by id
- `PATCH` — update status order + log activity

### orders/[id]/po/route.ts
- `POST` — generate PO baru + update status order jadi "PO Released"

### inventory/route.ts
- `GET` — ambil semua stock item
- `POST` — adjustment/scrap stock + transaksi atomik + log activity

### inventory/reconciliation/route.ts
- `POST` — update qty fisik untuk banyak item + log activity

### dashboard/route.ts
- `GET` — kumpulkan data: orders, status counts, stock items, recent activity, low stock alerts

---

## LANGKAH 12 — Halaman Dashboard

**File: `src/app/(dashboard)/dashboard/page.tsx`**
- 4 KPI Cards (Total Orders, Total Stock Items, Discrepancies, Aging Items)
- Pie Chart distribusi status order (pakai Recharts)
- Bar Chart stock levels
- Table recent orders
- Timeline recent activity
- Low stock alerts (jika ada)

---

## LANGKAH 13 — Halaman Orders

### List Order — `orders/page.tsx`
- Table dengan kolom: CPO Ref, WBS, Status, Customs, LSP, Delivery, Officer, Date
- Tombol "View" untuk detail
- Tombol "+ New Order"

### New Order — `orders/new/page.tsx`
- Form: CPO Ref, WBS Ref, BoQ Items (dynamic list), Notes
- Submit ke POST `/api/orders`

### Order Detail — `orders/[id]/page.tsx`
- Status badges + Cards untuk Customs/LSP/Delivery
- Table BoQ items
- Table Purchase Orders
- Tombol aksi sesuai status:
  - Draft → "Mark as Clarified"
  - Clarified → "Generate PO"
  - PO Released → "Mark In Delivery"
  - In Delivery → "Close Order"

---

## LANGKAH 14 — Halaman Inventory

### List Inventory — `inventory/page.tsx`
- Low stock alert card (progress bar)
- Table semua item: name, warehouse, qtySystem, qtyPhysical, discrepancy
- Tombol "Reconciliation" + "Adjustment / Scrap"

### Adjustment/Scrap — `inventory/adjustment/page.tsx`
- Pilih item (dropdown), pilih tipe (adjustment/scrap), input qty, notes
- Submit ke POST `/api/inventory`

### Reconciliation — `inventory/reconciliation/page.tsx`
- Table semua item dengan input qty fisik
- Edit qty fisik per item
- Submit ke POST `/api/inventory/reconciliation`

---

## LANGKAH 15 — Update Root Layout & Halaman Utama

**File: `src/app/layout.tsx`** — bersihkan, set title "SupplyOps"

**File: `src/app/page.tsx`** — redirect ke `/login`

**File: `src/app/globals.css`** — ganti dengan CSS variables + tailwind directives

**File: `tailwind.config.ts`** — mapping warna ke CSS variables (background, foreground, card, primary, secondary, dll)

**File: `.eslintrc.json`** — nonaktifkan `@typescript-eslint/no-explicit-any`

---

## LANGKAH 16 — Build & Run

```bash
# Build production
npx next build

# Atau development
npm run dev
```

Akses di browser: `http://localhost:3000`

---

## AKUN DEMO

| Email | Password | Role |
|---|---|---|
| admin@supplyops.com | password123 | Admin/Manager |
| officer@supplyops.com | password123 | Supply Officer |
| warehouse@supplyops.com | password123 | Warehouse Staff |

---

## FLOW DEMO

1. Login sebagai **Supply Officer** (`officer@supplyops.com`)
2. Klik **Orders** → **+ New Order** → buat order baru
3. Klik **View** pada order → klik "Mark as Clarified" → klik "Generate PO"
4. Lanjutkan status sampai "Closed"
5. Buka **Inventory** → lihat stock, discrepancy, low stock alerts
6. Klik **Reconciliation** → edit qty fisik → Save
7. Klik **Adjustment / Scrap** → pilih item → scrap beberapa qty
8. Buka **Dashboard** → lihat chart dan activity timeline

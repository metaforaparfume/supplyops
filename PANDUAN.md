# PANDUAN PENGGUNAAN SupplyOps

SupplyOps — Supply Chain Operations Management System.

**URL:** https://supplyops-five.vercel.app

---

## DAFTAR ISI

1. [Login](#1-login)
2. [Dashboard](#2-dashboard)
3. [Order Management](#3-order-management)
4. [Inventory Management](#4-inventory-management)
5. [Alur Lengkap](#5-alur-lengkap)
6. [Pengembangan Lokal](#6-pengembangan-lokal)

---

## 1. LOGIN

### Akun Demo

| Email | Password | Role |
|---|---|---|
| `admin@supplyops.com` | `password123` | Admin/Manager |
| `officer@supplyops.com` | `password123` | Supply Officer |
| `warehouse@supplyops.com` | `password123` | Warehouse Staff |

Buka https://supplyops-five.vercel.app, masukin email & password, klik **Sign In**.

---

## 2. DASHBOARD

Setelah login, tampilan utama dashboard menampilkan:

**KPI Cards (atas):**
- **Total Orders** — jumlah semua order
- **Total Stock Items** — jumlah item inventory
- **Stock Discrepancies** — item yang qty fisiknya beda dengan sistem
- **Aging Items** — item yang stoknya berlebih (>3x minimal stok)

**Chart:**
- **Order Status** — pie chart sebaran status order (Draft, Clarified, PO Released, dll)
- **Stock Levels** — bar chart jumlah stok per item

**Tabel:**
- **Recent Orders** — 5 order terakhir
- **Activity Feed** — 10 aktivitas terbaru (urutan waktu)
- **Low Stock Alerts** — item yang stoknya di bawah minimal

---

## 3. ORDER MANAGEMENT

### 3.1 Melihat Daftar Order

- Klik **Orders** di sidebar kiri
- Tabel menampilkan: CPO Ref, WBS Ref, Status, Customs Status, LSP Status, Delivery Status, Officer, Tanggal
- Klik **View** untuk lihat detail order

### 3.2 Membuat Order Baru

1. Klik **Orders** → tombol **+ New Order**
2. Isi:
   - **CPO Reference** — nomor CPO (contoh: `CPO-2024-006`)
   - **WBS Reference** — kode WBS (contoh: `WBS-PROJ-D-006`)
   - **BoQ Items** — klik **Add Item** untuk tiap barang (nama, qty, unit)
   - **Notes** (opsional)
3. Klik **Submit**
4. Order muncul dengan status **Draft**

### 3.3 Mengubah Status Order (Alur)

Di halaman detail order (`/orders/[id]`):

| Tombol | Status Awal | Status Akhir |
|---|---|---|
| Mark as Clarified | Draft | Clarified |
| Generate PO | Clarified | PO Released |
| Mark In Delivery | PO Released | In Delivery |
| Close Order | In Delivery | Closed |

> **Generate PO** otomatis bikin nomor PO (`PO-YYYY-NNN`) dan tercatat di sistem.

### 3.4 Status Tambahan

Di halaman detail, ada 3 kolom status yang bisa diubah manual:
- **Customs Status:** Pending → Cleared
- **LSP Status:** Pending → In Transit → Delivered
- **Delivery Status:** Pending → Partial → In Progress → Completed

Ganti statusnya lewat dropdown, klik **Save**.

---

## 4. INVENTORY MANAGEMENT

### 4.1 Lihat Inventory

- Klik **Inventory** di sidebar
- Tabel menampilkan: Nama Item, Warehouse, Qty System, Qty Physical, Unit, Selisih, Last Count
- Item dengan selisih (system ≠ physical) ditandai badge merah
- **Low Stock** card menunjukkan item yang perlu restock

### 4.2 Adjustment / Scrap

1. Klik **Inventory** → **Adjustment / Scrap**
2. Pilih item dari dropdown
3. Pilih tipe:
   - **Adjustment** — qty bisa positif (nambah stok) atau negatif (ngurang stok)
   - **Scrap** — selalu ngurang stok (qty positif = barang rusak)
4. Isi jumlah dan alasan
5. Klik **Submit**

### 4.3 Reconciliation (Cocok Fisik)

1. Klik **Inventory** → **Reconciliation**
2. Edit kolom **Physical Qty** sesuai hitungan fisik
3. Isi notes (contoh: "Cycle count bulan Juli")
4. Klik **Save Reconciliation**
5. Sistem otomatis:
   - Update Qty System = Qty Physical
   - Catat selisih sebagai Stock Movement
   - Update Last Count Date

---

## 5. ALUR LENGKAP

### Dari Order Sampai Inventory

```
Supply Officer bikin order
       ↓
Order status: Draft
       ↓
Mark as Clarified
       ↓
Order status: Clarified
       ↓
Generate PO → PO otomatis terbit
       ↓
Order status: PO Released
       ↓
Mark In Delivery
       ↓
Order status: In Delivery
       ↓
Barang datang → Warehouse Staff lakukan Reconciliation
       ↓
Close Order
       ↓
Order status: Closed ✅
```

### Demo Cepat (5 Menit)

1. Login sebagai **officer@supplyops.com**
2. Bikin order baru di **Orders → + New Order**
3. Buka detail order → klik **Mark as Clarified**
4. Klik **Generate PO** → lihat PO muncul
5. Login sebagai **warehouse@supplyops.com**
6. Cek **Inventory → Reconciliation**, ubah qty beberapa item
7. Login sebagai **admin@supplyops.com**
8. Lihat perubahan di **Dashboard**

---

## 6. PENGEMBANGAN LOKAL

### Prasyarat

- Node.js 20+
- PostgreSQL (ata pakai Supabase)
- Git

### Setup

```bash
# Clone repo
git clone https://github.com/metaforaparfume/supplyops.git
cd supplyops

# Install dependencies
npm install

# Copy environment
cp .env.example .env
# Edit .env: isi DATABASE_URL dengan connection string PostgreSQL

# Push schema ke database
npx prisma db push

# Seed data
npx prisma db seed

# Jalankan development server
npm run dev
```

Buka http://localhost:3000

### Perintah Lain

```bash
npm run build    # Build untuk production
npm run lint     # Cek kode
npm run seed     # Seed ulang database
```

---

## STRUKTUR PROJECT

```
ERP/
├── prisma/              # Schema & seed database
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Halaman login
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      # Dashboard KPI
│   │   │   ├── orders/         # Manajemen order
│   │   │   └── inventory/      # Manajemen inventory
│   │   └── api/                # Backend API routes
│   ├── components/             # UI components
│   ├── lib/                    # Utility (auth, prisma)
│   └── middleware.ts           # Proteksi route
├── .env                        # Environment variables
├── .github/workflows/deploy.yml  # Auto-deploy CI/CD
└── PANDUAN.md                  # Panduan ini
```

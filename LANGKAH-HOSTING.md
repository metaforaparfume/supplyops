# LANGKAH-LANGKAH HOSTING SupplyOps

## 📦 Pilihan Hosting (Free Tier)

| Service | Fungsi | Biaya |
|---|---|---|
| **Vercel** | Host aplikasi Next.js | Gratis |
| **Neon** atau **Supabase** | Host database PostgreSQL | Gratis |

> **⚠️ Catatan**: Aplikasi saat ini pakai **MySQL (XAMPP)** untuk lokal. Untuk hosting, kita ganti ke **PostgreSQL (Supabase/Neon)** karena:
> 1. Vercel tidak support MySQL
> 2. Vercel free tier paling cocok dengan PostgreSQL
> 3. Supabase/Neon punya free tier tanpa kartu kredit

---

## LANGKAH 1 — Setup Database di Supabase (Free Tier)

### 1.1 Daftar Supabase
1. Buka https://supabase.com
2. Klik **Sign Up** → pilih **GitHub** (cepat)
3. Setelah masuk, klik **New Project**

### 1.2 Buat Project Baru
| Field | Isi |
|---|---|
| Name | `supplyops` |
| Database Password | Buat password kuat, simpan |
| Region | Pilih yang terdekat (Singapore) |
| Pricing Plan | **Free** |

Tunggu proses (1-2 menit) sampai selesai.

### 1.3 Ambil Connection String
1. Masuk ke **Project Settings** → **Database**
2. Cari **Connection String** → pilih **URI**
3. Copy string yang mirip:
   ```
   postgresql://postgres:xxxx@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
4. **Simpan string ini**, kita pakai nanti

---

## LANGKAH 2 — Setup Repository di GitHub

### 2.1 Buat Repository Baru
1. Buka https://github.com
2. Klik **"+"** (pojok kanan atas) → **New repository**
3. Isi:
   - Repository name: `supplyops`
   - Visibility: **Public** atau **Private**
   - Jangan centang apapun
4. Klik **Create repository**

### 2.2 Push Project ke GitHub
```bash
# Pindah ke folder project
cd C:\xampp\htdocs\ERP

# Init git
git init

# Buat .gitignore (pastikan sudah ada isinya)
# node_modules, .next, .env, prisma/migrations

# Add semua file
git add .

# Commit
git commit -m "Initial commit SupplyOps"

# Ganti USER dengan username GitHub kamu
git branch -M main
git remote add origin https://github.com/USER/supplyops.git
git push -u origin main
```

---

## LANGKAH 3 — Deploy ke Vercel

### 3.1 Masuk Vercel
1. Buka https://vercel.com
2. Login pakai **GitHub** (akun yang sama)

### 3.2 Import Repository
1. Klik **Add New...** → **Project**
2. Cari dan pilih repository `supplyops`
3. Klik **Import**

### 3.3 Konfigurasi Project
Pada halaman **Configure Project**, atur:

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** (otomatis terdeteksi) |
| Root Directory | `./` (biarkan default) |
| Build Command | `next build` (default) |
| Output Directory | `next start` (default) |
| Node.js Version | **20.x** |

### 3.4 Environment Variables
Klik **Environment Variables**, tambahkan:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste connection string dari Supabase (LANGKAH 1.3) |
| `NEXTAUTH_SECRET` | Ketik: `supplyops-production-secret-key` |
| `NEXTAUTH_URL` | Nanti diisi setelah deploy, sementara isi: `https://supplyops.vercel.app` |

### 3.5 Deploy
1. Klik **Deploy**
2. Tunggu proses (±2-3 menit)
3. Jika berhasil, akan muncul URL: `https://supplyops.vercel.app`

---

## LANGKAH 4 — Setup Database Production

### 4.1 Update Prisma untuk PostgreSQL
**File: `prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4.2 Install Driver PostgreSQL
```bash
npm install @prisma/client
npm install -D prisma
```

### 4.3 Generate Prisma Client
```bash
npx prisma generate
```

### 4.4 Push Schema + Seed Data ke Supabase
```bash
# Push schema (buat tabel-tabel)
npx prisma db push

# Seed data dummy
npx prisma db seed
```

> **Catatan**: Untuk `db push`, set `DATABASE_URL` di `.env` dulu dengan connection string Supabase.

### 4.5 Commit & Push Lagi
```bash
git add .
git commit -m "Switch to PostgreSQL for production"
git push
```

Vercel akan otomatis redeploy.

---

## LANGKAH 5 — Update NEXTAUTH_URL

### 5.1 Setelah Deploy Berhasil
1. Copy URL dari Vercel (misal: `https://supplyops.vercel.app`)
2. Buka **Vercel Dashboard** → project `supplyops` → **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` ke URL asli: `https://supplyops.vercel.app`

### 5.2 Redeploy
1. Buka tab **Deployments**
2. Cari deployment terakhir
3. Klik **...** → **Redeploy**
4. Tunggu selesai

---

## LANGKAH 6 — Verifikasi

Buka `https://supplyops.vercel.app` dan test:

1. ✅ Halaman login muncul
2. ✅ Login dengan demo accounts
3. ✅ Dashboard muncul dengan data
4. ✅ Bisa buat order baru
5. ✅ Inventory page bisa diakses
6. ✅ Reconciliation flow jalan

---

## 🚨 TROUBLESHOOTING (Jika Error)

### Error: "PrismaClient is not configured"
```
Penyebab: DATABASE_URL tidak terbaca di Vercel
Solusi: Pastikan Environment Variable DATABASE_URL sudah diisi dengan benar
```

### Error: "Database connection refused"
```
Penyebab: IP Supabase memblokir koneksi
Solusi: Di Supabase Dashboard → Authentication → Settings
→ Pastikan "Allow all IPs" aktif (untuk free tier)
```

### Error: "NextAuth redirect mismatch"
```
Penyebab: NEXTAUTH_URL tidak sesuai domain
Solusi: Update NEXTAUTH_URL di Vercel Env Variables sesuai domain asli
```

### Error di build: "Cannot find module"
```
Penyebab: Ada dependency yang kurang
Solusi: Pastikan `npm install` sukses, cek package.json
```

---

## ✅ CEKLIST SEBELUM PRESENTASI

- [ ] Login 3 role berbeda bisa
- [ ] Order flow lengkap: Draft → Closed
- [ ] PO bisa digenerate
- [ ] Inventory reconciliation bisa dijalankan
- [ ] Adjustment/scrap tercatat
- [ ] Dashboard menampilkan data real
- [ ] Semua link/navigasi berfungsi
- [ ] Tidak ada error di console browser

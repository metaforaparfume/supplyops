# SupplyOps - Supply Chain Operations

Aplikasi ERP Supply Chain Operations untuk manajemen order, inventory, dan cycle count.

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Auth**: NextAuth v4 (Credentials + bcryptjs)
- **UI**: Tailwind CSS + shadcn/ui (Base UI)
- **Charts**: Recharts
- **Desktop App**: Electron
- **Mobile App**: Capacitor (Android APK)

## Akun Demo

| Email | Password | Role |
|---|---|---|
| admin@supplyops.com | password123 | Admin/Manager |
| officer@supplyops.com | password123 | Supply Officer |
| warehouse@supplyops.com | password123 | Warehouse Staff |

## Menjalankan Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000

## Build untuk Production

### Web (Vercel)
Push ke branch `main` otomatis deploy ke https://supplyops-five.vercel.app

### Desktop App (Windows)
```bash
npm run build          # build Next.js
npx electron-builder --win   # build installer .exe
```
Hasil: `electron-dist/SupplyOps Setup 0.1.0.exe`

Atau pakai GitHub Actions:
1. Buka https://github.com/metaforaparfume/supplyops/actions
2. Klik **Build Windows Desktop App** → **Run workflow**
3. Download **SupplyOps-Windows** dari Artifacts

### Mobile APK (Android)
```bash
npx cap sync           # sync config ke Android project
npx cap open android   # buka Android Studio, klik Run
```
Atau pakai GitHub Actions:
1. Buka https://github.com/metaforaparfume/supplyops/actions
2. Klik **Build APK** → **Run workflow**
3. Download **SupplyOps-APK** dari Artifacts

> **Catatan APK**: APK akan nge-load halaman dari Vercel (butuh koneksi internet).
> Login pakai akun demo di atas setelah app terbuka.

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/login/        # Halaman login
│   ├── (dashboard)/
│   │   ├── dashboard/       # Dashboard utama (chart + activity)
│   │   ├── inventory/       # Manajemen stok
│   │   │   ├── cycle-count/ # Cycle count 3-round
│   │   │   ├── reconciliation/ # Quick reconcile
│   │   │   └── adjustment/  # Adjustment/scrap
│   │   └── orders/          # Manajemen order
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── processtracker.tsx    # Order process tracker
│   ├── cycle-count-panel.tsx # Cycle count workflow
│   └── Sidebar.tsx
└── lib/
    ├── auth.ts              # NextAuth config
    ├── orderstages.ts       # Stage definitions
    └── prisma.ts            # Prisma client
```

## Fitur

- **Order Management**: CPO/ESTA → WBS → BoQ → PO → Delivery → Closed
- **Cycle Count (3-Round)**: First Count → Recount → Final Count + Claim Letter + Credit Note
- **Quick Reconciliation**: Update physical qty langsung
- **Stock Adjustment/Scrap**: Adjust stok atau write-off
- **Dashboard**: Chart status order, stock levels, activity feed, low stock alerts
- **PWA**: Install ke home screen (mobile/desktop)

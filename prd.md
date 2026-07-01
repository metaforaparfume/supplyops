# PRODUCT REQUIREMENTS DOCUMENT
## SupplyOps — Supply Chain Operations Management System (Academic Prototype)

**Versi:** 1.0 (Revisi — Scope Tugas Kuliah)
**Konteks:** Project-Based Learning (PBL) — Smart Supply Chain & Logistics
**Sifat:** Prototype/demo, dibangun mirip tools bisnis nyata, tidak untuk penggunaan jangka panjang

---

## 1. Ringkasan Eksekutif

SupplyOps adalah prototipe sistem manajemen operasi supply chain yang mendigitalisasi sebagian proses dari AS-IS flow nyata (CPO/ESTA → Order → Warehouse → Inventory → Delivery). Karena ini adalah tugas kuliah dengan masa pakai singkat, sistem dibangun dengan filosofi **"terlihat dan berfungsi seperti tools bisnis sungguhan, tapi scope dipersempit ke modul yang paling representatif"** — bukan sistem 9-modul penuh seperti PRD awal.

Yang dinilai bukan cakupan fitur sebanyak-banyaknya, tapi:
- Kedalaman pemahaman proses bisnis (ditunjukkan lewat dokumentasi PRD ini)
- Kualitas eksekusi teknis pada modul yang dibangun
- Kemampuan demo end-to-end yang meyakinkan

---

## 2. Tujuan

- Menunjukkan pemahaman utuh terhadap proses supply chain nyata (referensi: AS-IS flow — CPO/ESTA, Order Prep, WH, Inventory, Customs, LSP, Finance)
- Membangun 2–3 modul inti secara fungsional penuh, bukan seluruh sistem secara dangkal
- Menyediakan dashboard yang membuat sistem terlihat "hidup" dan meyakinkan saat demo
- Menyelesaikan dalam waktu terbatas (skala mingguan, bukan bulanan) dengan biaya **Rp0**

---

## 3. Ruang Lingkup (Scope Revisi)

### 3.1 In Scope — Dibangun Fungsional Penuh

| Modul | Kenapa dipilih |
|---|---|
| **1. Order Management** | Jantung dari seluruh proses — paling mudah dijelaskan ke dosen/penguji, mencerminkan CPO/ESTA → PO → Call-off |
| **2. Inventory Management** | Modul paling "terasa ERP" — reconciliation, stock adjustment, scrap — menunjukkan kedalaman teknis |
| **3. Dashboard & KPI** | Menyatukan modul 1 & 2 secara visual, ini yang paling menjual saat presentasi/demo |

### 3.2 In Scope — Disimulasikan (Mock/Simplified)

| Area | Bagaimana disimulasikan |
|---|---|
| Customs, LSP, Warehouse fisik (GR/GI), Finance/TG5 | Ditampilkan sebagai **status/data dummy** yang mengalir ke dashboard, tanpa workflow input penuh. Tujuannya: sistem *terlihat* end-to-end tanpa perlu dibangun end-to-end. |

### 3.3 Out of Scope

- Integrasi nyata ke SAP/WMS
- Multi-user real-time collaboration
- Modul LSP Governance, Procurement P2P penuh, Finance settlement penuh (cukup disebut di roadmap sebagai visi jangka panjang — bagus untuk nilai tambah di laporan)

---

## 4. User Roles (Disederhanakan untuk Demo)

| Role | Fungsi di Sistem |
|---|---|
| **Supply Officer** | Input & kelola order, validasi clarified order |
| **Warehouse Staff** | Kelola stok, reconciliation, scrap |
| **Admin/Manager** | Lihat dashboard KPI, approve, lihat semua data |

*(Cukup 3 role untuk demo login berbeda — tidak perlu granular RBAC seperti sistem produksi.)*

---

## 5. Kebutuhan Fungsional

### 5.1 Order Management (Full Build)

| ID | Requirement |
|---|---|
| ORD-01 | Input CPO/ESTA & BoQ (form order masuk) |
| ORD-02 | Buat & lacak WBS/referensi proyek per order |
| ORD-03 | Buat Premium Proposal / rencana order berdasarkan stok & permintaan |
| ORD-04 | Checklist validasi "100% clarified order" |
| ORD-05 | Generate PO & lacak status (Draft → Released → In Delivery → Closed) |
| ORD-06 | Catat material call-off |

### 5.2 Inventory Management (Full Build)

| ID | Requirement |
|---|---|
| INV-01 | Lihat stok real-time per gudang/site |
| INV-02 | Reconciliation sederhana (bandingkan data sistem vs "fisik" input manual) |
| INV-03 | Cycle count bulanan (input selisih) |
| INV-04 | Stock adjustment & scrap request (mirip alur TG5, disederhanakan) |
| INV-05 | Alert stok menumpuk/aging |

### 5.3 Dashboard & KPI (Full Build)

| ID | Requirement |
|---|---|
| DSH-01 | Ringkasan status order (jumlah per status) |
| DSH-02 | Ringkasan level inventory & alert |
| DSH-03 | Timeline/log aktivitas terbaru (order dibuat, stok disesuaikan, dst) |
| DSH-04 | Visualisasi proses end-to-end (mock status Customs/WH/Delivery mengalir dari data Order) |

---

## 6. Model Data (Disederhanakan)

- **Order** — id, WBS_ref, BoQ_items, status, tanggal
- **PO** — id, order_ref, status, tanggal_release
- **StockItem** — id, nama, gudang, qty_sistem, qty_fisik
- **StockMovement** — id, stock_ref, tipe (adjustment/scrap/reconciliation), qty, tanggal, catatan
- **User** — id, nama, role
- **ActivityLog** — id, tipe_aktivitas, referensi, tanggal (untuk dashboard timeline)

Semua entitas lain (Customs, LSP, Finance) cukup jadi **field status statis/dummy** di tabel Order, bukan tabel terpisah — biar tetap simpel tapi tetap kelihatan "connected end-to-end" di dashboard.

---

## 7. Tech Stack (100% Gratis — Free Tier Semua)

| Layer | Pilihan | Biaya |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind + shadcn/ui | Gratis |
| Backend | Next.js API Routes | Gratis |
| Database | PostgreSQL via Neon/Supabase free tier | Gratis (cukup untuk data dummy skala kecil) |
| ORM | Prisma | Gratis |
| Auth | NextAuth.js (basic credential login, tanpa Clerk) | Gratis, tanpa limit user |
| Hosting | Vercel free tier | Gratis |
| File/AI/Email | **Di-skip** — tidak dibutuhkan untuk scope demo ini | Rp0 |

> Catatan: pakai NextAuth basic (bukan Clerk) supaya benar-benar tanpa risiko limit/biaya — cocok untuk kebutuhan sesaat seperti tugas kuliah.

---

## 8. Timeline Pengerjaan (Estimasi 4 Minggu)

| Minggu | Fokus |
|---|---|
| **Minggu 1** | Setup project (Next.js + Prisma + DB), buat skema data, seed dummy data, auth dasar |
| **Minggu 2** | Bangun modul Order Management (form input, list, status flow) |
| **Minggu 3** | Bangun modul Inventory Management (reconciliation, adjustment, scrap) |
| **Minggu 4** | Bangun Dashboard, hubungkan semua data, polish UI, siapkan demo & laporan |

---

## 9. Kriteria Sukses Demo

- Alur order dari input sampai status closed bisa didemokan tanpa error
- Dashboard menampilkan data real dari database (bukan hardcode statis)
- Reconciliation & scrap flow bisa dijalankan live saat presentasi
- Laporan/PRD ini dilampirkan untuk menunjukkan bahwa scope yang dibangun adalah bagian sadar dari sistem yang lebih besar (referensi Bagian 10)

---

## 10. Visi Jangka Panjang (Referensi — Tidak Dibangun)

Untuk menunjukkan pemahaman menyeluruh terhadap proses bisnis asli, berikut modul lain dari AS-IS flow yang **tidak dibangun** di prototype ini tapi relevan disebut di laporan sebagai roadmap:

- Customs & Trade Compliance (import/export declaration, lane classification)
- Logistics & Shipment Tracking (AWB, POD, ETA monitoring)
- Warehouse Management penuh (GR/GI, OBD)
- LSP & Vendor Governance
- Procurement (Local P2P)
- Finance & Reporting (WIP/NS, TG5 Settlement)

---

## 11. Glosarium

| Istilah | Keterangan |
|---|---|
| CPO/ESTA | Dokumen order/permintaan awal berisi BoQ detail |
| WBS | Work Breakdown Structure — struktur proyek untuk tracking |
| BoQ | Bill of Quantity |
| PO | Purchase Order |
| GR/GI | Goods Receipt / Goods Issue |
| TG5 | Form settlement kelebihan material untuk proses scrap |
| LSP | Logistics Service Provider |
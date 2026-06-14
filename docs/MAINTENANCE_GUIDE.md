# 🛠️ Panduan Maintenance YotaLeague

> **Dokumen ini adalah referensi utama untuk pemeliharaan jangka panjang aplikasi YotaLeague.**
> Simpan dan perbarui dokumen ini setiap kali ada perubahan konfigurasi.

**Versi Dokumen:** 1.0.0  
**Terakhir Diperbarui:** Juni 2026  
**Platform:** GitHub Pages + Supabase (Free Tier)

---

## Daftar Isi

1. [Monitoring Supabase](#1-monitoring-supabase)
2. [Database Maintenance](#2-database-maintenance)
3. [Update Club Roulette](#3-update-club-roulette)
4. [Mengelola GitHub Actions](#4-mengelola-github-actions)
5. [Deployment Update](#5-deployment-update)
6. [Rotate Supabase Credentials](#6-rotate-supabase-credentials)
7. [Incident Response](#7-incident-response)
8. [Upgrade Supabase Plan](#8-upgrade-supabase-plan)
9. [Service Worker & Cache Management](#9-service-worker--cache-management)
10. [Checklist Maintenance Bulanan](#10-checklist-maintenance-bulanan)

---

## 1. Monitoring Supabase

### 1.1 Cek Status Project di Dashboard

1. Buka **[dashboard.supabase.com](https://dashboard.supabase.com)**
2. Login dengan akun yang digunakan saat membuat project
3. Pilih project **YotaLeague** dari daftar
4. Perhatikan indikator status di pojok kiri atas:

| Indikator | Warna | Artinya |
|-----------|-------|---------|
| **Active** | 🟢 Hijau | Project berjalan normal |
| **Pausing** | 🟡 Kuning | Sedang dalam proses pause |
| **Paused** | 🔴 Merah | Project di-pause, database tidak bisa diakses |
| **Restoring** | 🔵 Biru | Sedang proses restore dari pause |

### 1.2 Tanda-tanda Project Akan Di-pause

> [!WARNING]
> Supabase Free Tier akan **otomatis meng-pause** project yang tidak aktif selama **7 hari berturut-turut**. Ini adalah kebijakan yang bisa berubah sewaktu-waktu — selalu cek [Supabase Docs](https://supabase.com/docs) untuk info terbaru.

Tanda-tanda yang perlu diwaspadai:

- **Email peringatan** dari Supabase ke alamat email pendaftaran (biasanya dikirim 3 hari sebelum pause)
- Subject email: *"Your Supabase project [nama] will be paused in X days"*
- Tidak ada aktivitas database sama sekali selama beberapa hari (GitHub Actions tidak berjalan)
- Workflow `wake-supabase` mengembalikan error atau tidak terjadwal

> [!TIP]
> Aktifkan notifikasi email di **Supabase Dashboard → Account → Notifications** agar selalu mendapat peringatan tepat waktu.

### 1.3 Cara Restore Project yang Ter-pause

Jika project sudah dalam status **Paused**, ikuti langkah berikut:

1. Buka **[dashboard.supabase.com](https://dashboard.supabase.com)**
2. Pilih project YotaLeague — akan muncul banner merah bertuliskan *"This project is paused"*
3. Klik tombol **"Restore project"**
4. Tunggu proses restore sekitar **1–5 menit**
5. Status akan berubah dari `Restoring` → `Active`
6. Setelah aktif, jalankan `wake-supabase` secara manual dari GitHub Actions untuk memastikan koneksi berjalan

> [!NOTE]
> Data **tidak hilang** saat project di-pause. Restore hanya mengaktifkan kembali server database yang sebelumnya dimatikan.

### 1.4 Mengecek GitHub Actions `wake-supabase` Berjalan Benar

1. Buka repository GitHub YotaLeague
2. Klik tab **"Actions"**
3. Di sidebar kiri, pilih workflow **"Wake Up Supabase"**
4. Pastikan ada run terbaru dengan status ✅ (hijau)
5. Jadwal saat ini: **setiap hari pukul 06:00 UTC (13:00 WIB)**

Jika workflow tidak muncul atau selalu merah:
- Cek apakah secret `SUPABASE_PROJECTS_JSON` sudah di-set (lihat [Bagian 4.4](#44-cara-update-secret-supabase_projects_json))
- Pastikan format JSON dalam secret benar

### 1.5 Memahami Log GitHub Actions

Buka detail run workflow dan perhatikan output setiap step. Berikut interpretasi kode HTTP yang akan muncul:

| HTTP Code | Simbol | Artinya | Tindakan |
|-----------|--------|---------|----------|
| `200` | ✅ | **OK** — Project aktif, tabel ditemukan, koneksi berhasil | Tidak ada. Normal. |
| `201` | ✅ | **Created** — Request berhasil (jarang muncul di sini) | Tidak ada. Normal. |
| `404` | ⚠️ | **Not Found** — Project aktif tapi nama tabel mungkin berubah | Cek nama tabel di Supabase. DB tetap aktif. |
| `401` | ❌ | **Unauthorized** — `anon_key` salah atau kadaluarsa | Update secret `SUPABASE_PROJECTS_JSON` dengan key yang valid. |
| `403` | ❌ | **Forbidden** — RLS Policy memblokir akses | Cek policy di Supabase → Authentication → Policies. |
| `503` / `500` | ❌ | **Server Error** — Supabase sedang bermasalah | Tunggu dan coba lagi. Cek [status.supabase.com](https://status.supabase.com). |

Contoh output log yang **sehat**:
```
📦 Found 1 Supabase project(s).
🗄️  Querying DATABASE via: https://xxxx.supabase.co/rest/v1/turnamen?limit=1
✅ https://xxxx.supabase.co — Database query responded HTTP 200 — project is ALIVE!
🔔 Auth health also pinged for https://xxxx.supabase.co
```

---

## 2. Database Maintenance

### 2.1 Struktur Tabel Database YotaLeague

Berikut ringkasan tabel yang ada di database:

| Tabel | Fungsi | Tipe Data Penting |
|-------|--------|-------------------|
| `tournaments` | Data utama turnamen | `id` (uuid), `nama`, `sistem`, `rr_type` |
| `tim` | Pemain dan tim per turnamen | `tournaments_id` (FK), `nama_pemain`, `nama_tim` |
| `state_turnamen` | Data pertandingan & klasemen | `data_pertandingan` (jsonb), `standings` (jsonb) |
| `log_activity` | Log riwayat input skor | `timestamp`, `deskripsi`, `skor`, `pemenang` |
| `club_roulette` | Data klub untuk fitur roulette | `nama`, `logo_url`, `kategori` |

### 2.2 Mengecek Ukuran Database

> [!IMPORTANT]
> Batas penyimpanan Supabase Free Tier adalah **500 MB**. Pantau ukuran database secara rutin untuk mencegah masalah.

Buka **Supabase Dashboard → Table Editor → SQL Editor**, lalu jalankan query berikut:

```sql
-- Cek ukuran per tabel
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size,
  pg_total_relation_size(quote_ident(table_name)) AS size_bytes
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

```sql
-- Cek total ukuran database
SELECT pg_size_pretty(pg_database_size(current_database())) AS total_size;
```

Interpretasi hasil:

| Total Ukuran | Status | Tindakan |
|---|---|---|
| `< 300 MB` | 🟢 Aman | Tidak perlu tindakan |
| `300–450 MB` | 🟡 Perhatian | Mulai bersihkan `log_activity` lama |
| `> 450 MB` | 🔴 Kritis | Segera bersihkan data atau pertimbangkan upgrade |

### 2.3 Membersihkan Log Activity Lama

Tabel `log_activity` adalah tabel yang paling cepat bertambah ukurannya. Lakukan pembersihan rutin:

```sql
-- Lihat berapa banyak log yang ada (preview sebelum hapus)
SELECT 
  COUNT(*) AS total_logs,
  MIN(timestamp) AS log_tertua,
  MAX(timestamp) AS log_terbaru
FROM log_activity;
```

```sql
-- Hapus log lebih dari 90 hari
DELETE FROM log_activity
WHERE timestamp < NOW() - INTERVAL '90 days';
```

```sql
-- (Opsional) Hapus log lebih dari 30 hari jika storage sudah kritis
DELETE FROM log_activity
WHERE timestamp < NOW() - INTERVAL '30 days';
```

> [!CAUTION]
> Selalu **preview** data yang akan dihapus terlebih dahulu sebelum menjalankan `DELETE`. Operasi ini **tidak bisa di-undo** kecuali ada backup.

### 2.4 Backup Data Sebelum Maintenance

Sebelum melakukan operasi besar (hapus data, ubah schema), selalu backup dulu dengan cara:

**Via SQL Editor di Supabase Dashboard:**

```sql
-- Export semua turnamen yang aktif
SELECT * FROM tournaments ORDER BY created_at DESC;
```

```sql
-- Export semua tim
SELECT 
  t.nama_pemain,
  t.nama_tim,
  tr.nama AS turnamen,
  t.created_at
FROM tim t
JOIN tournaments tr ON t.tournaments_id = tr.id
ORDER BY tr.created_at DESC;
```

```sql
-- Export state turnamen (salin output JSON ke file lokal)
SELECT 
  tr.nama AS turnamen,
  st.data_pertandingan,
  st.standings,
  st.updated_at
FROM state_turnamen st
JOIN tournaments tr ON st.tournaments_id = tr.id;
```

> [!TIP]
> Klik tombol **"Download CSV"** yang tersedia di SQL Editor Supabase untuk menyimpan hasil query ke file lokal dengan mudah.

**Via Supabase Dashboard (tanpa SQL):**
1. Masuk ke **Table Editor**
2. Pilih tabel yang ingin di-backup
3. Klik ikon **"Export to CSV"** di pojok kanan atas tabel

---

## 3. Update Club Roulette

### 3.1 Kategori yang Tersedia

Saat ini tabel `club_roulette` memiliki kategori berikut:

| Kategori | Jumlah Klub |
|----------|-------------|
| `Premier League` | 10 klub |
| `La Liga` | 5 klub |
| `Serie A` | 8 klub |
| `Bundesliga` | 2 klub |
| `Ligue 1` | 3 klub |
| `Saudi Pro League` | 2 klub |
| `MLS` | 1 klub |
| `Nation` | 18 tim nasional |

> [!NOTE]
> Kategori `All` bukan nilai yang disimpan di database, melainkan pilihan filter di UI aplikasi yang menampilkan semua kategori sekaligus.

### 3.2 Menambah Klub Baru via Table Editor

**Cara termudah — via Supabase Table Editor:**

1. Buka **Supabase Dashboard → Table Editor**
2. Pilih tabel **`club_roulette`**
3. Klik tombol **"Insert row"** (ikon `+` di toolbar)
4. Isi field:
   - `nama`: Nama klub (contoh: `Aston Villa`)
   - `logo_url`: URL logo dalam format SVG/PNG dari Wikipedia
   - `kategori`: Sesuaikan dengan liga klub (harus konsisten dengan nilai yang sudah ada)
5. Klik **"Save"**

**Cara via SQL Editor:**

```sql
-- Tambah satu klub
INSERT INTO club_roulette (nama, logo_url, kategori)
VALUES (
  'Aston Villa',
  'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg',
  'Premier League'
);
```

```sql
-- Tambah beberapa klub sekaligus
INSERT INTO club_roulette (nama, logo_url, kategori) VALUES
  ('Brighton', 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg', 'Premier League'),
  ('Fulham', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg', 'Premier League'),
  ('Brentford', 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg', 'Premier League');
```

### 3.3 Cara Update Logo URL yang Berubah

Logo dari Wikipedia/Wikimedia Commons bisa berubah URL-nya sewaktu-waktu. Jika logo tidak muncul di roulette:

1. Buka halaman Wikipedia klub tersebut
2. Temukan logo di infobox, klik kanan → **"Copy image address"**
3. Pastikan URL berakhiran `.svg` atau `.png`
4. Update via SQL:

```sql
-- Update logo satu klub
UPDATE club_roulette
SET logo_url = 'https://url-logo-baru.svg'
WHERE nama = 'Nama Klub';
```

```sql
-- Verifikasi perubahan
SELECT id, nama, logo_url, kategori 
FROM club_roulette 
WHERE nama = 'Nama Klub';
```

> [!WARNING]
> Hindari menggunakan URL gambar dari Google Images atau sumber tidak resmi. Prioritaskan **upload.wikimedia.org** atau **en.wikipedia.org** untuk stabilitas URL jangka panjang.

### 3.4 Menambah Kategori Baru

Karena kolom `kategori` hanya berupa teks bebas (bukan enum), menambah kategori baru sangat mudah:

```sql
-- Tambah kategori baru (Eredivisie misalnya)
INSERT INTO club_roulette (nama, logo_url, kategori) VALUES
  ('Ajax', 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg', 'Eredivisie'),
  ('PSV Eindhoven', 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg', 'Eredivisie'),
  ('Feyenoord', 'https://upload.wikimedia.org/wikipedia/en/c/c7/Feyenoord_logo.svg', 'Eredivisie');
```

Kategori baru akan **otomatis muncul** sebagai pilihan filter di UI tanpa perlu mengubah kode apapun, selama implementasi di `app.js` membaca kategori secara dinamis dari database.

### 3.5 Menghapus Klub

```sql
-- Hapus satu klub berdasarkan nama
DELETE FROM club_roulette WHERE nama = 'Nama Klub';

-- Hapus seluruh kategori
DELETE FROM club_roulette WHERE kategori = 'Nama Kategori';
```

---

## 4. Mengelola GitHub Actions

### 4.1 Memantau Workflow Runs

1. Buka repository GitHub YotaLeague
2. Klik tab **"Actions"** di navigation bar atas
3. Di panel kiri, tersedia dua workflow:
   - **"Wake Up Supabase"** — berjalan setiap hari otomatis
   - **"Deploy to GitHub Pages"** — berjalan setiap push ke `main`
4. Klik nama workflow untuk melihat daftar run
5. Klik run tertentu untuk melihat detail log setiap step

Status ikon yang perlu dipahami:

| Ikon | Status |
|------|--------|
| ✅ Lingkaran hijau | Berhasil |
| ❌ Lingkaran merah | Gagal — perlu investigasi |
| 🟡 Lingkaran kuning | Sedang berjalan |
| ⚫ Lingkaran abu-abu | Di-cancel atau di-skip |

### 4.2 Cara Jalankan `wake-supabase` Manual

Kadang perlu menjalankan workflow di luar jadwal, misalnya setelah restore project yang ter-pause:

1. Di tab **Actions**, pilih **"Wake Up Supabase"**
2. Klik tombol **"Run workflow"** (pojok kanan atas daftar runs)
3. Pilih branch `main`
4. Klik **"Run workflow"** (tombol hijau)
5. Refresh halaman — run baru akan muncul dengan status kuning (sedang berjalan)

### 4.3 Cara Update Jadwal Cron

Jadwal saat ini diatur di file `.github/workflows/wake-supabase.yml`:

```yaml
on:
  schedule:
    - cron: "0 6 * * *"   # Setiap hari pukul 06:00 UTC (13:00 WIB)
```

Format cron: `MENIT JAM HARI BULAN HARI_MINGGU`

Contoh jadwal alternatif:

```yaml
# Dua kali sehari: 06:00 dan 18:00 UTC
- cron: "0 6,18 * * *"

# Setiap hari Senin-Jumat pukul 06:00 UTC
- cron: "0 6 * * 1-5"

# Setiap 12 jam
- cron: "0 */12 * * *"
```

> [!TIP]
> Gunakan **[crontab.guru](https://crontab.guru)** untuk memverifikasi ekspresi cron sebelum di-commit.

Cara mengubah jadwal:
1. Edit file `.github/workflows/wake-supabase.yml` di VS Code atau langsung di GitHub
2. Ubah nilai `cron`
3. Commit dan push ke branch `main`
4. GitHub akan otomatis menggunakan jadwal baru

### 4.4 Cara Update Secret `SUPABASE_PROJECTS_JSON`

Secret ini berisi credentials semua project Supabase yang di-ping oleh workflow `wake-supabase`.

**Format JSON yang benar:**

```json
[
  {
    "url": "https://XXXXXXXXXXXX.supabase.co",
    "anon_key": "eyJ..."
  }
]
```

Untuk project ganda:

```json
[
  {
    "url": "https://PROJECT1.supabase.co",
    "anon_key": "eyJ..."
  },
  {
    "url": "https://PROJECT2.supabase.co",
    "anon_key": "eyJ..."
  }
]
```

**Cara update secret:**

1. Buka repository GitHub → **Settings**
2. Di sidebar kiri, pilih **"Secrets and variables" → "Actions"**
3. Temukan secret **`SUPABASE_PROJECTS_JSON`**
4. Klik **"Update"** (ikon pensil)
5. Paste nilai JSON baru
6. Klik **"Update secret"**
7. Jalankan `wake-supabase` secara manual untuk memverifikasi

---

## 5. Deployment Update

### 5.1 Cara Update Aplikasi

YotaLeague menggunakan **Continuous Deployment** otomatis via GitHub Actions. Cara deploy update:

```
Edit file lokal → git add → git commit → git push origin main → Deploy otomatis
```

Langkah detail:

```bash
# 1. Edit file yang diperlukan (app.js, style.css, index.html, dll.)

# 2. Tambahkan ke staging
git add .

# 3. Commit dengan pesan yang deskriptif
git commit -m "feat: tambah fitur pencarian tim di bracket"

# 4. Push ke main branch
git push origin main
```

Setelah push, workflow **"Deploy to GitHub Pages"** akan otomatis:
1. Checkout kode dari repository
2. Inject `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke `config.local.js`
3. Upload seluruh folder sebagai artifact GitHub Pages
4. Deploy ke URL GitHub Pages

**Estimasi waktu deploy:** 1–3 menit.

### 5.2 Memantau Status Deployment

1. Buka tab **"Actions"**
2. Pilih **"Deploy to GitHub Pages"**
3. Klik run paling baru
4. Pantau setiap step — jika semua hijau, deployment berhasil
5. Buka URL GitHub Pages untuk memverifikasi perubahan sudah live

### 5.3 Cara Rollback ke Versi Sebelumnya

Jika deployment terbaru menyebabkan masalah:

**Metode 1: Revert commit via Git (Direkomendasikan)**

```bash
# Lihat daftar commit terakhir
git log --oneline -10

# Revert commit terakhir (buat commit baru yang membatalkan perubahan)
git revert HEAD

# Atau revert commit tertentu berdasarkan hash
git revert abc1234

# Push revert — akan trigger deploy otomatis
git push origin main
```

**Metode 2: Rollback via GitHub UI**

1. Buka tab **"Actions" → "Deploy to GitHub Pages"**
2. Klik run yang sebelumnya berhasil (versi yang ingin dikembalikan)
3. Klik **"Re-run all jobs"** untuk re-deploy versi tersebut

> [!NOTE]
> Metode 2 akan deploy ulang artifact yang sama tanpa mengubah kode di repository. Cocok untuk rollback darurat yang cepat.

### 5.4 Update Credentials di GitHub Secrets

Jika `SUPABASE_URL` atau `SUPABASE_ANON_KEY` berubah:

1. Buka repository → **Settings → Secrets and variables → Actions**
2. Update secret yang relevan:
   - `SUPABASE_URL` — URL project Supabase
   - `SUPABASE_ANON_KEY` — Anon/public key Supabase
3. Trigger redeploy dengan push kosong:

```bash
git commit --allow-empty -m "chore: trigger redeploy after credential update"
git push origin main
```

---

## 6. Rotate Supabase Credentials

### 6.1 Kapan Perlu Rotate Credentials

Rotate (perbarui) credentials dalam situasi berikut:

| Situasi | Prioritas |
|---------|-----------|
| Anon key ter-expose di repository publik secara tidak sengaja | 🔴 **Segera — dalam 1 jam** |
| Mantan anggota tim yang tahu credentials sudah tidak aktif | 🟡 **Dalam 1 hari** |
| Kebijakan rotasi rutin (setiap 6–12 bulan) | 🟢 **Terjadwal** |
| Aktivitas mencurigakan di Supabase logs | 🔴 **Segera** |

> [!CAUTION]
> Merotasi `anon_key` akan **langsung memutus koneksi** aplikasi yang sedang live. Pastikan langkah update secret dan redeploy dilakukan **sesegera mungkin** setelah reset key.

### 6.2 Langkah-langkah Rotasi Credentials

```
LANGKAH 1: Reset key di Supabase
    ↓
LANGKAH 2: Salin key baru
    ↓
LANGKAH 3: Update GitHub Secret SUPABASE_ANON_KEY
    ↓
LANGKAH 4: Update GitHub Secret SUPABASE_PROJECTS_JSON
    ↓
LANGKAH 5: Update config.local.js di lokal
    ↓
LANGKAH 6: Trigger redeploy
    ↓
LANGKAH 7: Verifikasi aplikasi berjalan normal
```

**Langkah detail:**

**1. Reset Anon Key di Supabase**
   - Buka **Supabase Dashboard → Project Settings → API**
   - Di bagian **"Project API keys"**, temukan **"anon (public)"**
   - Klik **"Reset"** → konfirmasi dialog
   - Key lama akan langsung tidak valid

**2. Copy Key Baru**
   - Key baru langsung muncul di halaman yang sama
   - Salin seluruh nilai key (dimulai dengan `eyJ...`)

**3. Update GitHub Secret `SUPABASE_ANON_KEY`**
   - Buka repository → **Settings → Secrets and variables → Actions**
   - Update `SUPABASE_ANON_KEY` dengan key baru

**4. Update GitHub Secret `SUPABASE_PROJECTS_JSON`**
   - Update juga secret `SUPABASE_PROJECTS_JSON` dengan format:

```json
[
  {
    "url": "https://XXXXXXXXXXXX.supabase.co",
    "anon_key": "eyJ... (KEY BARU)"
  }
]
```

**5. Update `config.local.js` di Lokal**

```javascript
window.__APP_CONFIG__ = {
  supabaseUrl: "https://XXXXXXXXXXXX.supabase.co",
  supabaseAnonKey: "eyJ... (KEY BARU)"
};
```

> [!IMPORTANT]
> File `config.local.js` ada di `.gitignore` — **jangan di-commit** ke repository.

**6. Trigger Redeploy**

```bash
git commit --allow-empty -m "chore: redeploy after credential rotation"
git push origin main
```

**7. Verifikasi**
   - Tunggu deploy selesai (1–3 menit)
   - Buka aplikasi YotaLeague di browser
   - Coba buat turnamen baru dan input skor
   - Pastikan data tersimpan tanpa error di console browser

---

## 7. Incident Response

### 7.1 🚨 Skenario: Aplikasi Tidak Bisa Diakses

**Gejala:** URL GitHub Pages menampilkan halaman 404 atau error.

```
DIAGNOSIS BERTAHAP:

1. Cek GitHub Pages Status
   → Buka: Settings → Pages di repository
   → Pastikan GitHub Pages aktif dan branch = main
   → Cek: https://githubstatus.com untuk gangguan GitHub

2. Cek Workflow Deploy
   → Buka tab Actions → Deploy to GitHub Pages
   → Apakah run terakhir berhasil (✅)?
   → Jika gagal, baca log error dan perbaiki

3. Cek Supabase Project Status
   → Buka dashboard.supabase.com
   → Pastikan project dalam status Active
   → Jika Paused, lakukan restore (lihat Bagian 1.3)
```

**Tindakan Perbaikan:**

| Penyebab | Solusi |
|----------|--------|
| GitHub Pages belum diaktifkan | Aktifkan di Settings → Pages |
| Workflow deploy gagal | Baca log error, perbaiki kode, push ulang |
| Branch salah | Pastikan GitHub Pages menggunakan branch `main` |
| Gangguan GitHub | Tunggu hingga resolved, pantau githubstatus.com |

---

### 7.2 🚨 Skenario: Data Turnamen Hilang

**Gejala:** Turnamen yang sudah dibuat tidak muncul lagi di aplikasi.

```
DIAGNOSIS BERTAHAP:

1. Cek Supabase Table Editor
   → Buka dashboard.supabase.com → Table Editor → tournaments
   → Apakah data masih ada?
   → Jika ada: masalah di sisi frontend/autentikasi
   → Jika tidak ada: data terhapus atau project ter-restore dari snapshot

2. Cek Sesi Anonymous Auth
   → Supabase anonymous sessions bisa expire atau ter-reset
   → Buka: Supabase Dashboard → Authentication → Users
   → Cek apakah user_id yang sama masih ada

3. Cek RLS Policy
   → Pastikan policy "Public Access" masih aktif untuk semua tabel
   → Buka: Authentication → Policies
```

**Tindakan Perbaikan:**

```sql
-- Verifikasi data masih ada di database
SELECT id, nama, sistem, created_at FROM tournaments ORDER BY created_at DESC LIMIT 10;

-- Jika RLS policy bermasalah, re-enable:
CREATE POLICY "Public Access" ON tournaments FOR ALL USING (true) WITH CHECK (true);
```

---

### 7.3 🚨 Skenario: Kamera AR Tidak Bisa Diakses

**Gejala:** Fitur augmented reality tidak meminta izin kamera atau error saat diaktifkan.

```
DIAGNOSIS BERTAHAP:

1. Verifikasi HTTPS
   → Akses kamera HANYA bisa di HTTPS — bukan HTTP
   → GitHub Pages sudah HTTPS secara default ✅
   → Jika testing lokal: gunakan localhost (dianggap secure context)

2. Cek Izin Kamera di Browser
   → Di browser: klik ikon kunci (🔒) di address bar
   → Pastikan "Camera" diset ke "Allow"
   → Atau buka: chrome://settings/content/camera

3. Cek CDN face-api.js
   → Buka Developer Tools (F12) → Console
   → Cari error terkait "face-api" atau "Failed to load"
   → Jika CDN down, pertimbangkan self-host library

4. Cek Browser Compatibility
   → getUserMedia API tidak didukung di semua browser
   → Browser yang direkomendasikan: Chrome, Firefox, Edge (versi terbaru)
   → Safari memerlukan izin eksplisit dari pengguna
```

**Solusi Cepat:**
- Minta pengguna untuk menggunakan Chrome/Edge versi terbaru
- Minta pengguna clear cache dan reload halaman
- Pastikan tidak ada ekstensi browser yang memblokir kamera (adblocker, dll.)

---

### 7.4 🚨 Skenario: Score Tidak Tersimpan

**Gejala:** Input skor berhasil di UI tapi tidak muncul kembali setelah refresh.

```
DIAGNOSIS BERTAHAP:

1. Cek Console Browser (F12 → Console)
   → Cari error merah terkait Supabase atau network
   → Error umum: "JWT expired", "invalid API key", "row-level security violation"

2. Cek Network Tab (F12 → Network)
   → Filter: XHR/Fetch
   → Cari request ke supabase.co
   → Perhatikan response code dan body

3. Cek RLS Policy di Supabase
   → Buka: Authentication → Policies
   → Pastikan tabel state_turnamen dan log_activity punya policy "Public Access"

4. Verifikasi Credentials
   → Buka config.local.js (lokal) atau cek GitHub Secrets
   → Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY benar dan belum kadaluarsa
```

**Query Diagnostik:**

```sql
-- Cek apakah policy aktif untuk semua tabel
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 8. Upgrade Supabase Plan

### 8.1 Tanda-tanda Perlu Upgrade

| Indikator | Threshold Free Tier | Sumber Info |
|-----------|---------------------|-------------|
| Database size | > 500 MB | Supabase Dashboard → Reports |
| Bandwidth bulanan | > 5 GB | Supabase Dashboard → Reports |
| Compute hours | > 500 jam/bulan | Supabase Dashboard → Usage |
| Project sering ter-pause | Terjadi berulang | Email notifikasi |
| Butuh custom domain | — | Kebutuhan bisnis |

### 8.2 Pertimbangan Biaya vs Manfaat

**Supabase Pro Plan** (per Juni 2026): sekitar **$25/bulan**

Yang didapatkan dari upgrade:
- ✅ **Tidak ada auto-pause** — project selalu aktif
- ✅ Database hingga **8 GB** (bukan 500 MB)
- ✅ Bandwidth **250 GB/bulan** (bukan 5 GB)
- ✅ **Daily backups** otomatis dengan Point-in-Time Recovery
- ✅ Support via email
- ✅ Custom domains

**Pertimbangan untuk YotaLeague:**
- Jika ini project pribadi/komunitas kecil: Free Tier + `wake-supabase` sudah cukup
- Jika pengguna aktif > 100 orang dan data turnamen terus bertambah: pertimbangkan Pro Plan
- Jika ada kebutuhan uptime 24/7 tanpa risiko pause: upgrade sangat direkomendasikan

### 8.3 Alternatif: Self-host atau Platform Lain

Jika biaya menjadi pertimbangan utama:

```
Option 1: Supabase Self-hosted di VPS (DigitalOcean, Vultr, dll.)
  Biaya: $6–12/bulan untuk VPS
  Effort: Tinggi (setup Docker, maintenance server)
  Cocok untuk: Developer berpengalaman

Option 2: Pindah ke platform lain
  - PocketBase     → lebih ringan, mudah di-self-host
  - Railway        → free tier lebih generous untuk hobby projects
  - Neon           → PostgreSQL serverless, free tier TANPA auto-pause

Option 3: Tetap di Free Tier + optimasi
  - Agresif hapus data log lama
  - Kompres data JSON di kolom JSONB
  - Gunakan wake-supabase 2x sehari untuk jaminan aktif
```

---

## 9. Service Worker & Cache Management

### 9.1 Memahami Cache di YotaLeague

YotaLeague menggunakan Service Worker (`sw.js`) dengan strategi **Network-First**:
- Saat online: selalu ambil dari jaringan, cache sebagai backup
- Saat offline: ambil dari cache
- Cache name saat ini: **`yota-league-v3`**

File yang di-cache:

```javascript
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];
```

### 9.2 Force Update Service Worker untuk Pengguna Lama

Jika pengguna masih melihat versi lama aplikasi meski sudah di-deploy ulang:

**Cara 1: Update `CACHE_NAME` di `sw.js` (Direkomendasikan)**

```javascript
// Ubah dari:
const CACHE_NAME = "yota-league-v3";

// Menjadi (increment version):
const CACHE_NAME = "yota-league-v4";
```

Commit dan push perubahan ini. Service Worker baru akan:
1. Dideteksi oleh browser pengguna saat mereka membuka aplikasi
2. Install cache baru dengan nama `yota-league-v4`
3. Hapus cache lama (`yota-league-v3`) secara otomatis saat aktivasi
4. Pengguna mendapatkan versi terbaru setelah refresh

> [!IMPORTANT]
> Selalu increment `CACHE_NAME` setiap kali ada perubahan signifikan pada aset statis (CSS, JS, HTML). Ini memastikan semua pengguna mendapat versi terbaru.

**Cara 2: Unregister Service Worker dari DevTools**

Untuk troubleshooting di browser sendiri:
1. Buka `F12` → **Application** tab
2. Di sidebar kiri: **Service Workers**
3. Klik **"Unregister"** di sebelah Service Worker aktif
4. Refresh halaman — Service Worker terbaru akan terinstall ulang

**Cara 3: Clear semua cache dari DevTools**

1. Buka `F12` → **Application** tab
2. Di sidebar kiri: **Storage**
3. Klik **"Clear site data"**
4. Refresh halaman

### 9.3 Panduan Update `CACHE_NAME`

Lakukan update `CACHE_NAME` saat:

| Situasi | Perlu Update CACHE_NAME? |
|---------|--------------------------|
| Bug fix di `app.js` yang mempengaruhi pengguna | ✅ Ya — agar pengguna dapat perbaikan |
| Perubahan `style.css` signifikan | ✅ Ya |
| Tambah fitur baru | ✅ Ya |
| Update credential saja | ❌ Tidak perlu |
| Fix typo di komentar kode | ❌ Tidak perlu |
| Tambah klub baru ke database | ❌ Tidak perlu (data dari API, bukan cache) |

Konvensi penamaan `CACHE_NAME`:

```javascript
// Format: nama-aplikasi-v{nomor}
const CACHE_NAME = "yota-league-v4";   // Increment setiap release besar
const CACHE_NAME = "yota-league-v4.1"; // Untuk minor update
```

### 9.4 Panduan Troubleshooting Cache untuk Pengguna

Jika pengguna melaporkan aplikasi "stuck" di versi lama, berikan panduan berikut:

**Chrome/Edge:**
1. Tekan `Ctrl + Shift + Delete`
2. Pilih "Cached images and files"
3. Klik "Clear data"
4. Refresh halaman

**Atau via DevTools (lebih cepat):**
1. Buka DevTools (`F12`)
2. Klik kanan tombol Refresh di browser (bukan di DevTools)
3. Pilih **"Empty Cache and Hard Reload"**

---

## 10. Checklist Maintenance Bulanan

> Lakukan pemeriksaan ini setiap awal bulan. Estimasi waktu: **15–30 menit**.

### 🗄️ Database & Supabase

- [ ] **Cek status Supabase project** — Dashboard berwarna hijau (Active)?
- [ ] **Cek ukuran database** — Masih di bawah 400 MB?
  ```sql
  SELECT pg_size_pretty(pg_database_size(current_database())) AS total_size;
  ```
- [ ] **Review log_activity** — Hapus log yang sudah > 90 hari
  ```sql
  -- Preview dulu
  SELECT COUNT(*) FROM log_activity WHERE timestamp < NOW() - INTERVAL '90 days';
  -- Hapus jika sudah yakin
  DELETE FROM log_activity WHERE timestamp < NOW() - INTERVAL '90 days';
  ```
- [ ] **Backup data penting** — Export `tournaments` dan `state_turnamen` ke CSV

### ⚙️ GitHub Actions

- [ ] **Cek log `wake-supabase`** — Semua run bulan ini status ✅?
- [ ] **Cek tidak ada failed run** — Jika ada, investigasi penyebabnya
- [ ] **Pastikan jadwal cron masih aktif** — GitHub kadang menonaktifkan scheduled workflow jika tidak ada push selama 60 hari

> [!WARNING]
> GitHub Actions secara otomatis menonaktifkan **scheduled workflows** jika tidak ada aktivitas di repository selama **60 hari**. Lakukan minimal satu push atau run manual setiap 2 bulan.

### 🖼️ Konten & Aset

- [ ] **Cek logo klub** — Buka aplikasi, masuk ke Club Roulette, putar beberapa kali
  - Jika ada logo broken (ikon gambar rusak), update `logo_url` di database
  - Prioritas cek: logo yang menggunakan URL panjang dengan parameter `?utm_source=...`
- [ ] **Cek semua kategori roulette** — Pilih setiap kategori dan pastikan logo muncul

### 🚀 Deployment & Keamanan

- [ ] **Cek GitHub Pages deployment status** — Tab Actions → Deploy to GitHub Pages, run terakhir ✅?
- [ ] **Cek GitHub Dependabot alerts** — Tab Security → Dependabot alerts
  - Jika ada vulnerability kritis, prioritaskan penanganan
- [ ] **Review akses repository** — Settings → Collaborators (siapa saja yang punya akses?)
- [ ] **Cek apakah `config.local.js` ada di `.gitignore`**:
  ```bash
  git check-ignore -v config.local.js
  # Output yang benar: .gitignore:X:config.local.js config.local.js
  ```

### 📊 Smoke Test Aplikasi

- [ ] **Buka aplikasi dan lakukan smoke test:**
  - [ ] Buat turnamen baru → berhasil?
  - [ ] Tambah tim → tersimpan?
  - [ ] Input skor → tersimpan setelah refresh?
  - [ ] Putar Club Roulette → logo muncul?
  - [ ] Aplikasi terasa responsif (tidak lambat)?

---

## Referensi Cepat

### URL Penting

| Resource | URL |
|----------|-----|
| Aplikasi YotaLeague | `https://[username].github.io/YotaLeague` |
| Supabase Dashboard | `https://dashboard.supabase.com` |
| GitHub Repository | `https://github.com/[username]/YotaLeague` |
| GitHub Actions | `https://github.com/[username]/YotaLeague/actions` |
| GitHub Pages Settings | `https://github.com/[username]/YotaLeague/settings/pages` |
| Supabase Status | `https://status.supabase.com` |
| GitHub Status | `https://githubstatus.com` |

### File Konfigurasi Kritis

| File | Lokasi | Fungsi |
|------|--------|--------|
| `config.local.js` | Root project (di-gitignore) | Credentials lokal untuk development |
| `config.local.example.js` | Root project | Template credentials |
| `.github/workflows/wake-supabase.yml` | `.github/workflows/` | Jadwal ping Supabase harian |
| `.github/workflows/deploy.yml` | `.github/workflows/` | Pipeline deployment otomatis |
| `sw.js` | Root project | Service Worker & cache management |
| `db.sql` | Root project | Schema dan seed data database |

### GitHub Secrets yang Harus Terdefinisi

| Secret Name | Digunakan Oleh | Isi |
|-------------|---------------|-----|
| `SUPABASE_URL` | `deploy.yml` | URL project Supabase (misal: `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | `deploy.yml` | Anon/public key Supabase |
| `SUPABASE_PROJECTS_JSON` | `wake-supabase.yml` | JSON array berisi `url` dan `anon_key` semua project |

---

> [!NOTE]
> Dokumen ini harus diperbarui setiap kali terjadi perubahan konfigurasi besar, seperti:
> - Rotasi credentials
> - Perubahan jadwal cron
> - Penambahan tabel atau fitur baru
> - Perubahan nama secret GitHub

---

*Dibuat untuk project YotaLeague — Platform Turnamen Sepak Bola dengan Fitur AR*  
*Dokumen ini adalah bagian dari praktik dokumentasi open-source yang baik.*

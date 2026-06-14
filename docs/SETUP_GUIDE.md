# 🏆 YOTA LEAGUE — Panduan Setup Lengkap

> Dokumen ini adalah panduan resmi untuk meng-*install*, mengkonfigurasi, dan menjalankan **Yota League** — aplikasi manajemen turnamen eFootball berbasis Progressive Web App (PWA) dengan backend Supabase.

---

## 📋 Daftar Isi

1. [Prasyarat](#bagian-1-prasyarat)
2. [Setup Supabase](#bagian-2-setup-supabase)
3. [Setup GitHub Repository & Deploy](#bagian-3-setup-github-repository--deploy)
4. [Development Lokal](#bagian-4-development-lokal)
5. [Setup Club Roulette](#bagian-5-setup-club-roulette)
6. [Troubleshooting](#bagian-6-troubleshooting)
7. [Upgrade dari Versi Sebelumnya](#bagian-7-upgrade-dari-versi-sebelumnya)

---

## Bagian 1: Prasyarat

Sebelum memulai, pastikan semua prasyarat berikut telah terpenuhi.

### 1.1 Perangkat Lunak yang Dibutuhkan

| Komponen | Keterangan | Wajib? |
|---|---|---|
| **Browser Modern** | Chrome 90+, Firefox 90+, Edge 90+, atau Safari 15+ | ✅ Ya |
| **Akun GitHub** | Untuk hosting via GitHub Pages & CI/CD | ✅ Ya |
| **Akun Supabase** | Untuk database PostgreSQL & autentikasi | ✅ Ya |
| **Git** | Untuk clone & push kode (khusus kontributor/developer) | ⚙️ Developer |
| **VS Code + Live Server** | Untuk development lokal yang nyaman | 💡 Disarankan |

### 1.2 Browser yang Didukung

> [!NOTE]
> Fitur **Club Roulette** menggunakan Web API **`getUserMedia`** untuk mengakses kamera dan **face-api.js** untuk deteksi wajah. Pastikan browser yang digunakan mendukung kedua teknologi ini.

| Browser | Versi Minimum | Kamera (Roulette) | PWA Install |
|---|---|---|---|
| Google Chrome | 90+ | ✅ | ✅ |
| Microsoft Edge | 90+ | ✅ | ✅ |
| Mozilla Firefox | 90+ | ✅ | ⚠️ Terbatas |
| Safari (iOS/macOS) | 15+ | ✅ | ✅ |
| Samsung Internet | 14+ | ✅ | ✅ |

### 1.3 Akun yang Dibutuhkan

#### GitHub
1. Daftar di [github.com](https://github.com) jika belum punya akun.
2. Pastikan alamat email sudah terverifikasi.
3. GitHub Pages tersedia **gratis** untuk repository public maupun private.

#### Supabase
1. Daftar di [supabase.com](https://supabase.com) — **gratis** untuk project pertama.
2. Plan gratis Supabase (Free Tier) sudah lebih dari cukup untuk aplikasi ini.
3. Batas Free Tier yang relevan:

| Fitur | Free Tier |
|---|---|
| Database (PostgreSQL) | 500 MB |
| Bandwidth | 5 GB/bulan |
| Auth Users | 50.000 MAU |
| API Requests | Tidak terbatas |
| Project Aktif | 2 project |

> [!WARNING]
> Supabase Free Tier akan **mem-pause project** yang tidak aktif selama **lebih dari 7 hari**. Lihat [Bagian 3.4](#34-mencegah-supabase-ter-pause-otomatis) untuk solusi otomatis menggunakan GitHub Actions.

### 1.4 Instalasi Git (Untuk Developer/Kontributor)

#### Windows
1. Unduh Git dari [git-scm.com](https://git-scm.com/download/win).
2. Jalankan installer dengan pengaturan default (kecuali Anda tahu apa yang ingin diubah).
3. Verifikasi instalasi:
   ```powershell
   git --version
   # Output: git version 2.x.x.windows.x
   ```

#### macOS
```bash
# Via Homebrew (disarankan)
brew install git

# Atau via Xcode Command Line Tools
xcode-select --install
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt update && sudo apt install -y git
git --version
```

---

## Bagian 2: Setup Supabase

### 2.1 Membuat Akun dan Project Baru

1. Buka [supabase.com](https://supabase.com) dan klik **"Start your project"**.
2. Sign up menggunakan akun GitHub, Google, atau email.
3. Setelah login, klik tombol **"New project"**.
4. Isi detail project:

   | Field | Contoh Nilai | Keterangan |
   |---|---|---|
   | **Organization** | Personal | Pilih organisasi Anda |
   | **Project name** | `yota-league` | Nama project (huruf kecil, tanpa spasi) |
   | **Database Password** | `P@ssw0rd!YotaLeague` | Catat password ini — **sangat penting!** |
   | **Region** | `Southeast Asia (Singapore)` | Pilih region terdekat |

5. Klik **"Create new project"** dan tunggu ±2 menit hingga project selesai dibuat.

> [!IMPORTANT]
> Simpan **Database Password** di tempat yang aman. Password ini diperlukan jika Anda perlu mengakses database secara langsung (bukan via API). Supabase tidak akan menampilkannya lagi setelah project dibuat.

### 2.2 Menjalankan SQL Schema

> [!NOTE]
> Langkah ini akan membuat semua tabel yang dibutuhkan aplikasi beserta konfigurasi keamanan Row Level Security (RLS).

1. Di dashboard Supabase, buka **SQL Editor** dari menu sidebar kiri (ikon `</>` atau tulisan "SQL Editor").
2. Klik **"New query"** untuk membuka editor baru.
3. Salin **seluruh** SQL berikut dan tempel ke editor:

```sql
-- ============================================================
-- YOTA LEAGUE — DATABASE SCHEMA
-- Jalankan seluruh script ini sekali di SQL Editor Supabase
-- ============================================================

-- 1. Ekstensi UUID (Wajib untuk Supabase — biasanya sudah aktif)
create extension if not exists "uuid-ossp";

-- ============================================================
-- 2. TABEL UTAMA: TOURNAMENTS
-- Menyimpan informasi dasar setiap turnamen
-- ============================================================
create table if not exists tournaments (
  id          uuid        default uuid_generate_v4() primary key,
  nama        text        not null,
  sistem      text        not null, -- 'single', 'double', 'round_robin'
  rr_type     text,                 -- 'single' atau 'double' (khusus round_robin)
  created_at  timestamp with time zone default now()
);

-- ============================================================
-- 3. TABEL TIM
-- Menyimpan data pemain & tim untuk setiap turnamen
-- ============================================================
create table if not exists tim (
  id             uuid  default uuid_generate_v4() primary key,
  tournaments_id uuid  references tournaments(id) on delete cascade,
  nama_pemain    text  not null,
  nama_tim       text  not null,
  created_at     timestamp with time zone default now()
);

-- ============================================================
-- 4. TABEL STATE TURNAMEN
-- Menyimpan progres pertandingan & klasemen secara real-time
-- ============================================================
create table if not exists state_turnamen (
  id                 uuid  default uuid_generate_v4() primary key,
  tournaments_id     uuid  references tournaments(id) on delete cascade,
  data_pertandingan  jsonb default '[]',  -- Array objek pertandingan
  standings          jsonb default '[]',  -- Array klasemen Round Robin
  updated_at         timestamp with time zone default now()
);

-- ============================================================
-- 5. TABEL LOG AKTIVITAS
-- Menyimpan riwayat input skor sebagai audit trail
-- ============================================================
create table if not exists log_activity (
  id               uuid  default uuid_generate_v4() primary key,
  tournaments_nama text  not null,
  deskripsi        text,
  skor             text,
  pemenang         text,
  timestamp        timestamp with time zone default now()
);

-- ============================================================
-- 6. TABEL CLUB ROULETTE
-- Daftar klub yang tersedia untuk fitur Club Roulette
-- ============================================================
create table if not exists club_roulette (
  id        serial  primary key,
  nama      text    not null,
  logo_url  text,
  kategori  text    not null  -- 'Premier League', 'La Liga', 'Serie A', dll
);

-- ============================================================
-- KONFIGURASI KEAMANAN — ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS di semua tabel
alter table tournaments    enable row level security;
alter table tim            enable row level security;
alter table state_turnamen enable row level security;
alter table log_activity   enable row level security;
alter table club_roulette  enable row level security;

-- Buat Policy: Izinkan akses publik (Anon Key) untuk semua operasi
-- PENTING: Ini diperlukan agar website bisa baca/tulis database
-- tanpa backend server menggunakan Supabase Anon Key
create policy "Public Access" on tournaments
  for all using (true) with check (true);

create policy "Public Access" on tim
  for all using (true) with check (true);

create policy "Public Access" on state_turnamen
  for all using (true) with check (true);

create policy "Public Access" on log_activity
  for all using (true) with check (true);

create policy "Public Access" on club_roulette
  for all using (true) with check (true);
```

4. Klik tombol **"Run"** (atau tekan `Ctrl+Enter` / `Cmd+Enter`).
5. Pastikan muncul pesan **"Success. No rows returned"** di bagian bawah — ini normal.

> [!TIP]
> Jika muncul error seperti `relation "tournaments" already exists`, berarti tabel sudah pernah dibuat sebelumnya. Ini aman — klausa `create table if not exists` memastikan script tidak akan gagal jika dijalankan ulang.

#### Verifikasi Tabel Berhasil Dibuat

Setelah menjalankan SQL, verifikasi dengan membuka **Table Editor** dari sidebar. Anda harus melihat 5 tabel berikut:

| Tabel | Fungsi |
|---|---|
| `tournaments` | Menyimpan info dasar turnamen (nama, sistem, tipe) |
| `tim` | Menyimpan data pemain dan nama tim |
| `state_turnamen` | Menyimpan progres pertandingan & klasemen (JSON) |
| `log_activity` | Menyimpan riwayat input skor |
| `club_roulette` | Daftar klub untuk fitur roulette |

### 2.3 Mengisi Data Awal Club Roulette

Setelah tabel dibuat, jalankan query berikut untuk mengisi data klub awal. Buka **SQL Editor** baru dan jalankan:

```sql
-- Hapus data lama jika ada (opsional, untuk reset bersih)
delete from club_roulette;

-- Insert data klub
insert into club_roulette (nama, logo_url, kategori) values
  -- Premier League
  ('Arsenal',                 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',                                    'Premier League'),
  ('Liverpool',               'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',                                  'Premier League'),
  ('Manchester United',       'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',                    'Premier League'),
  ('Chelsea',                 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',                                    'Premier League'),
  ('Manchester City',         'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',                      'Premier League'),
  ('Tottenham',               'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',                            'Premier League'),
  ('Newcastle United',        'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',                         'Premier League'),
  ('Everton',                 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',                               'Premier League'),
  ('Wolverhampton Wanderers', 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Wolverhampton_Logo.png',                       'Premier League'),
  ('West Ham United',         'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',                       'Premier League'),
  -- La Liga
  ('Real Madrid',             'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',                               'La Liga'),
  ('Barcelona',               'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',                     'La Liga'),
  ('Atletico Madrid',         'https://upload.wikimedia.org/wikipedia/en/f/f9/Atletico_Madrid_Logo_2024.svg',                    'La Liga'),
  ('Sevilla',                 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',                              'La Liga'),
  ('Villarreal',              'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg',                        'La Liga'),
  -- Serie A
  ('Juventus',                'https://upload.wikimedia.org/wikipedia/commons/4/4e/Juventus_FC_-_logo_black_%28Italy%2C_2017%29.svg', 'Serie A'),
  ('Inter Milan',             'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',           'Serie A'),
  ('AC Milan',                'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',                        'Serie A'),
  ('Napoli',                  'https://upload.wikimedia.org/wikipedia/commons/4/4d/SSC_Napoli_2025_%28white_and_azure%29.svg',   'Serie A'),
  ('Atalanta',                'https://upload.wikimedia.org/wikipedia/id/a/a8/Atalanta_Bergamo_Logo.svg',                        'Serie A'),
  ('Lazio',                   'https://upload.wikimedia.org/wikipedia/commons/3/37/S.S._Lazio_logo.svg',                         'Serie A'),
  ('AS Roma',                 'https://upload.wikimedia.org/wikipedia/commons/1/1a/AS_Roma_1942_logo.svg',                       'Serie A'),
  ('Como 1907',               'https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_Como_1907_2019.png',                     'Serie A'),
  -- Bundesliga
  ('Borussia Dortmund',       'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',                  'Bundesliga'),
  ('Bayer Leverkusen',        'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',                     'Bundesliga'),
  -- Ligue 1
  ('Paris Saint-Germain',     'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',                     'Ligue 1'),
  ('Olympique Lyonnais',      'https://upload.wikimedia.org/wikipedia/en/1/1c/Olympique_Lyonnais_logo.svg',                      'Ligue 1'),
  ('AS Monaco',               'https://upload.wikimedia.org/wikipedia/en/c/cf/LogoASMonacoFC2021.svg',                           'Ligue 1'),
  -- Saudi Pro League
  ('Al Nassr',                'https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Al_Nassr_FC_Logo.svg/500px-Al_Nassr_FC_Logo.svg.png', 'Saudi Pro League'),
  ('Al Hilal',                'https://upload.wikimedia.org/wikipedia/commons/5/55/Al_Hilal_SFC_Logo.svg',                       'Saudi Pro League'),
  -- MLS
  ('Inter Miami CF',          'https://upload.wikimedia.org/wikipedia/id/5/5c/Inter_Miami_CF_logo.svg',                          'MLS'),
  -- Nation
  ('Brasil',        'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg',                          'Nation'),
  ('Argentina',     'https://upload.wikimedia.org/wikipedia/commons/e/e2/Argentine_Football_Association_logo.svg',     'Nation'),
  ('Prancis',       'https://en.wikipedia.org/wiki/French_Football_Federation#/media/File:French_Football_Federation_logo.svg', 'Nation'),
  ('Jerman',        'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg',                         'Nation'),
  ('Spain',         'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg',                           'Nation'),
  ('England',       'https://upload.wikimedia.org/wikipedia/commons/b/be/Flag_of_England.svg',                         'Nation'),
  ('Norway',        'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg',                          'Nation'),
  ('Swedia',        'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg',                          'Nation'),
  ('Denmark',       'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg',                         'Nation'),
  ('Netherlands',   'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg',                 'Nation'),
  ('Belgium',       'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg',                         'Nation'),
  ('Croatia',       'https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg',                         'Nation'),
  ('Italy',         'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg',                           'Nation'),
  ('Portugal',      'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg',                        'Nation'),
  ('Uruguay',       'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Uruguay.svg',                         'Nation'),
  ('Korea Selatan', 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg',                     'Nation'),
  ('Jepang',        'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg',                           'Nation'),
  ('Maroko',        'https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg',                         'Nation'),
  ('Mesir',         'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg',                           'Nation'),
  ('Nigeria',       'https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg',                         'Nation');
```

### 2.4 Mengaktifkan Anonymous Sign-In

Yota League menggunakan autentikasi anonim (tanpa perlu daftar akun) agar pengguna bisa langsung menyimpan data ke cloud.

1. Di dashboard Supabase, buka menu **Authentication** dari sidebar kiri.
2. Klik tab **"Providers"**.
3. Cari **"Anonymous"** di daftar provider (biasanya di bagian bawah).
4. Klik toggle untuk **mengaktifkan** ("Enable Anonymous sign-ins").
5. Klik **"Save"**.

> [!IMPORTANT]
> Tanpa Anonymous Sign-In diaktifkan, aplikasi **tidak akan bisa menyimpan data** ke Supabase. Anda akan melihat error `AuthSessionMissingError` atau `403 Forbidden` di console browser.

### 2.5 Mendapatkan URL dan API Key

Ini adalah langkah terpenting — Anda akan mendapatkan kredensial untuk menghubungkan aplikasi ke database.

1. Buka **Settings** → **API** dari sidebar Supabase.
2. Catat dua nilai berikut:

| Nilai | Lokasi | Contoh |
|---|---|---|
| **Project URL** | Bagian "Project URL" | `https://abcdefghijkl.supabase.co` |
| **anon public key** | Bagian "Project API keys" | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> [!CAUTION]
> Jangan pernah mengekspos atau meng-commit **service_role key** (yang ada di bawah anon key) ke repository publik. Key tersebut memiliki akses penuh ke database tanpa batasan RLS dan dapat menyebabkan kebocoran data yang serius. Gunakan hanya **anon public key** untuk aplikasi frontend.

---

## Bagian 3: Setup GitHub Repository & Deploy

### 3.1 Fork atau Clone Repository

#### Opsi A: Fork (Untuk Penggunaan Pribadi)

1. Buka repository Yota League di GitHub.
2. Klik tombol **"Fork"** di pojok kanan atas.
3. Pilih akun/organisasi tujuan, lalu klik **"Create fork"**.

#### Opsi B: Clone (Untuk Development Lokal)

```bash
# Clone repository
git clone https://github.com/USERNAME/YotaLeague.git

# Masuk ke direktori project
cd YotaLeague

# Verifikasi struktur file
ls -la
```

Struktur file yang benar:

```
YotaLeague/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Workflow deploy ke GitHub Pages
│       └── wake-supabase.yml   # Workflow anti-pause Supabase
├── app.js                      # Logika aplikasi utama (~2000 baris)
├── config.local.example.js     # Template konfigurasi lokal
├── config.local.js             # ⚠️ File ini di .gitignore — jangan di-commit!
├── db.sql                      # SQL schema database lengkap
├── favicon.ico                 # Icon aplikasi
├── icon-192.png                # Icon PWA 192x192
├── icon-512.png                # Icon PWA 512x512
├── index.html                  # Entry point HTML
├── manifest.json               # Manifest PWA
├── README.md                   # Dokumentasi singkat
├── style.css                   # Stylesheet utama
└── sw.js                       # Service Worker (offline support)
```

### 3.2 Menambahkan GitHub Secrets

GitHub Secrets digunakan oleh workflow CI/CD untuk menyimpan kredensial Supabase tanpa mengeksposnya ke repository publik.

1. Buka repository di GitHub.
2. Klik tab **"Settings"** (pojok kanan, ikon gear).
3. Di sidebar kiri, navigasi ke **"Secrets and variables"** → **"Actions"**.
4. Klik **"New repository secret"** untuk setiap secret berikut:

---

#### Secret 1: `SUPABASE_URL`

| Field | Nilai |
|---|---|
| Name | `SUPABASE_URL` |
| Value | `https://XXXXXXXXXXXX.supabase.co` _(Project URL dari Settings > API)_ |

---

#### Secret 2: `SUPABASE_ANON_KEY`

| Field | Nilai |
|---|---|
| Name | `SUPABASE_ANON_KEY` |
| Value | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` _(anon public key dari Settings > API)_ |

---

#### Secret 3: `SUPABASE_PROJECTS_JSON`

Secret ini digunakan oleh workflow `wake-supabase.yml` untuk mencegah project Supabase ter-pause. Formatnya adalah JSON array yang bisa berisi lebih dari satu project.

| Field | Nilai |
|---|---|
| Name | `SUPABASE_PROJECTS_JSON` |
| Value | _(lihat format di bawah)_ |

Format nilai untuk satu project:
```json
[
  {
    "url": "https://XXXXXXXXXXXX.supabase.co",
    "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
]
```

Format nilai untuk beberapa project sekaligus:
```json
[
  {
    "url": "https://project1xxx.supabase.co",
    "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_project1..."
  },
  {
    "url": "https://project2xxx.supabase.co",
    "anon_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_project2..."
  }
]
```

> [!TIP]
> Format `SUPABASE_PROJECTS_JSON` mendukung beberapa project — berguna jika Anda mengelola lebih dari satu instance Yota League (misalnya untuk beberapa komunitas berbeda) dari satu repository GitHub.

### 3.3 Mengaktifkan GitHub Pages

1. Di repository, buka **Settings** → **Pages** (dari sidebar kiri).
2. Di bagian **"Build and deployment"**, ubah **Source** menjadi **"GitHub Actions"**.
3. Klik **"Save"**.

> [!NOTE]
> Anda tidak perlu memilih branch secara manual. Opsi "GitHub Actions" berarti proses deploy dikontrol sepenuhnya oleh file `deploy.yml` di folder `.github/workflows/`.

### 3.4 Menjalankan Workflow Deploy Pertama Kali

Workflow `deploy.yml` akan otomatis berjalan setiap kali ada push ke branch `main`. Untuk menjalankan deploy pertama kali secara manual:

1. Buka tab **"Actions"** di repository.
2. Di sidebar kiri, klik workflow **"Deploy to GitHub Pages"**.
3. Klik tombol **"Run workflow"** → pilih branch `main` → klik **"Run workflow"** (hijau).
4. Tunggu hingga workflow selesai (biasanya 1–3 menit). Status akan berubah menjadi ✅ hijau.
5. URL aplikasi Anda akan tersedia di: `https://USERNAME.github.io/YotaLeague/`

#### Bagaimana Workflow Deploy Bekerja?

Berikut adalah alur kerja `deploy.yml` secara rinci:

```
1. Checkout kode dari branch main
        ↓
2. Inject GitHub Secrets ke config.local.js
   (file ini TIDAK ada di repository — dibuat saat deploy)
        ↓
3. Setup GitHub Pages environment
        ↓
4. Upload seluruh folder sebagai artifact
   (termasuk config.local.js yang baru dibuat)
        ↓
5. Deploy artifact ke GitHub Pages
        ↓
6. Aplikasi live di https://USERNAME.github.io/YotaLeague/
```

> [!IMPORTANT]
> Proses inject secrets di step 2 adalah mekanisme keamanan utama. File `config.local.js` yang berisi URL dan key Supabase dibuat *on-the-fly* saat build, sehingga kredensial tidak pernah tersimpan di repository.

### 3.5 Mencegah Supabase Ter-Pause Otomatis

Workflow `wake-supabase.yml` akan otomatis melakukan "ping" ke database Supabase setiap hari pada pukul **06:00 UTC (13:00 WIB)**.

Cara kerja workflow ini:
1. Membaca daftar project dari secret `SUPABASE_PROJECTS_JSON`.
2. Melakukan HTTP request ke endpoint REST API database (`/rest/v1/turnamen?limit=1`).
3. Melakukan ping tambahan ke endpoint health auth (`/auth/v1/health`).
4. Melaporkan status setiap project di log Actions.

Untuk menjalankan ping manual:
1. Buka tab **"Actions"** → klik workflow **"Wake Up Supabase"**.
2. Klik **"Run workflow"** → **"Run workflow"**.

---

## Bagian 4: Development Lokal

### 4.1 Clone dan Persiapan

```bash
# Clone repository (jika belum)
git clone https://github.com/USERNAME/YotaLeague.git
cd YotaLeague
```

### 4.2 Membuat File Konfigurasi Lokal

File `config.local.js` berisi kredensial Supabase untuk environment lokal. File ini sudah terdaftar di `.gitignore` sehingga **tidak akan pernah ter-commit** ke repository.

1. Salin file template:

   **Windows (PowerShell):**
   ```powershell
   Copy-Item config.local.example.js config.local.js
   ```

   **macOS/Linux:**
   ```bash
   cp config.local.example.js config.local.js
   ```

2. Buka `config.local.js` dengan editor teks dan isi dengan kredensial Supabase Anda:

```javascript
// config.local.js
// ⚠️ File ini ada di .gitignore — JANGAN di-commit ke repository!
window.__APP_CONFIG__ = {
  supabaseUrl: "https://XXXXXXXXXXXX.supabase.co",   // ← Ganti dengan Project URL Anda
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // ← Ganti dengan anon key Anda
};
```

> [!CAUTION]
> **Jangan pernah commit `config.local.js` ke repository!** File ini berisi kredensial rahasia. Meskipun anon key relatif aman untuk diekspos (karena dilindungi RLS), ini tetap merupakan praktik keamanan yang buruk. Selalu gunakan GitHub Secrets untuk production.

### 4.3 Membuka Aplikasi di Browser

#### Opsi A: Menggunakan VS Code Live Server (Disarankan)

1. Install ekstensi **"Live Server"** di VS Code (klik Extensions → cari "Live Server" oleh Ritwick Dey).
2. Klik kanan file `index.html` di VS Code → pilih **"Open with Live Server"**.
3. Browser akan otomatis terbuka di `http://127.0.0.1:5500/`.
4. Aplikasi akan auto-reload setiap kali Anda menyimpan perubahan.

> [!TIP]
> Live Server lebih disarankan daripada membuka via `file://` karena beberapa Web API (seperti `getUserMedia` untuk kamera di fitur Club Roulette) memerlukan konteks aman (HTTPS atau localhost).

#### Opsi B: Membuka Langsung via Browser

1. Klik dua kali file `index.html`.
2. Atau seret file ke jendela browser.
3. URL akan terlihat seperti: `file:///C:/path/to/YotaLeague/index.html`

> [!WARNING]
> Saat dibuka via `file://`, fitur kamera (Club Roulette) **mungkin tidak berfungsi** di beberapa browser karena pembatasan keamanan. Gunakan Live Server atau localhost untuk development penuh.

#### Opsi C: Menggunakan Python HTTP Server

Jika tidak menggunakan VS Code, Anda bisa menjalankan server sederhana:

```bash
# Python 3
python -m http.server 8080

# Lalu buka di browser:
# http://localhost:8080
```

### 4.4 Verifikasi Koneksi ke Supabase

Buka Developer Console browser (`F12` → tab "Console") dan periksa:

**✅ Tanda koneksi berhasil:**
```
Logged in anonymously: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**❌ Tanda ada masalah:**
```
❌ Config tidak ditemukan. Pastikan config.local.js ada untuk dev lokal.
```
→ Solusi: Pastikan `config.local.js` ada dan berisi URL + key yang benar.

```
Error: Failed to fetch
```
→ Solusi: Periksa koneksi internet atau status project Supabase (mungkin ter-pause).

### 4.5 Alur Pengembangan (Development Workflow)

```bash
# 1. Buat branch baru untuk fitur/fix
git checkout -b feature/nama-fitur

# 2. Lakukan perubahan kode...

# 3. Test di lokal menggunakan Live Server

# 4. Commit perubahan
git add .
git commit -m "feat: deskripsi singkat perubahan"

# 5. Push ke GitHub
git push origin feature/nama-fitur

# 6. Buat Pull Request ke branch main

# 7. Setelah merge ke main, workflow deploy.yml otomatis berjalan
```

#### Konvensi Pesan Commit

| Prefix | Kapan Digunakan |
|---|---|
| `feat:` | Menambah fitur baru |
| `fix:` | Memperbaiki bug |
| `docs:` | Mengubah dokumentasi |
| `style:` | Perubahan styling/CSS |
| `refactor:` | Refactoring kode tanpa mengubah fungsionalitas |
| `db:` | Perubahan schema database |

---

## Bagian 5: Setup Club Roulette

### 5.1 Cara Kerja Club Roulette

Club Roulette adalah fitur untuk mengacak klub secara visual menggunakan **Face Detection**. Alur kerjanya:

```
1. Pemain klik tombol "🎰 Club Roulette"
        ↓
2. Modal pilih kategori muncul
   (Premier League / La Liga / Serie A / Nation / All / dll)
        ↓
3. Setelah kategori dipilih, kamera aktif
        ↓
4. face-api.js mendeteksi wajah secara real-time
        ↓
5. Saat wajah terdeteksi, tombol "Mulai Gacha" muncul
        ↓
6. Animasi roulette berjalan — klub dipilih secara acak
        ↓
7. Nama klub & logo ditampilkan, otomatis diisi ke form input tim
```

### 5.2 Menambah Klub Baru via Supabase Dashboard

Untuk menambah klub baru tanpa perlu mengedit kode:

1. Buka dashboard Supabase → **Table Editor** → pilih tabel `club_roulette`.
2. Klik **"Insert row"** (tombol + di pojok kanan atas).
3. Isi kolom berikut:

| Kolom | Tipe | Deskripsi | Contoh |
|---|---|---|---|
| `nama` | text | Nama klub/tim | `Boca Juniors` |
| `logo_url` | text | URL gambar logo (SVG/PNG/WebP) | `https://upload.wikimedia.org/...` |
| `kategori` | text | Kategori liga/kompetisi | `Liga Argentina` |

4. Klik **"Save"**.

> [!TIP]
> Gunakan logo dari Wikimedia Commons (`upload.wikimedia.org`) untuk kualitas SVG terbaik yang ringan dan scalable. Hindari URL gambar dari sumber tidak stabil yang bisa mati sewaktu-waktu.

### 5.3 Menambah Klub via SQL

Cara yang lebih efisien untuk menambah banyak klub sekaligus:

```sql
-- Tambah satu klub
insert into club_roulette (nama, logo_url, kategori)
values (
  'Boca Juniors',
  'https://upload.wikimedia.org/wikipedia/commons/7/73/Boca_Juniors_logo.svg',
  'Liga Argentina'
);

-- Tambah beberapa klub sekaligus
insert into club_roulette (nama, logo_url, kategori)
values
  ('River Plate', 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg', 'Liga Argentina'),
  ('Flamengo',    'https://upload.wikimedia.org/wikipedia/commons/2/2b/Flamengo_braz_logo.svg',                        'Brasileirao'),
  ('Santos',      'https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_logo.png',                               'Brasileirao');
```

### 5.4 Kategori yang Tersedia (Default)

Kategori berikut sudah tersedia di aplikasi secara default:

| Kategori | Deskripsi | Jumlah Klub Default |
|---|---|---|
| `Premier League` | Liga Inggris | 10 |
| `La Liga` | Liga Spanyol | 5 |
| `Serie A` | Liga Italia | 8 |
| `Bundesliga` | Liga Jerman | 2 |
| `Ligue 1` | Liga Prancis | 3 |
| `Saudi Pro League` | Liga Arab Saudi | 2 |
| `MLS` | Major League Soccer (AS) | 1 |
| `Nation` | Tim nasional | 19 |
| `All` | Semua kategori | _(semua)_ |

> [!NOTE]
> Untuk menambah kategori baru (misalnya "Eredivisie" untuk Liga Belanda), cukup masukkan string kategori baru saat insert data. Tidak perlu mengubah kode — kategori baru akan otomatis tersimpan di database. Namun, untuk menambahkan **tombol kategori** di UI modal roulette, Anda perlu mengedit bagian `index.html` dan menambahkan elemen `<button>` baru di dalam `<div class="category-options">`.

### 5.5 Menghapus atau Mengedit Klub

**Via Supabase Dashboard:**
1. Buka **Table Editor** → `club_roulette`.
2. Klik baris yang ingin diedit/hapus.
3. Klik ikon pensil (edit) atau tempat sampah (hapus).

**Via SQL:**
```sql
-- Edit nama klub
update club_roulette
set nama = 'Wolverhampton Wanderers'
where nama = 'Wolves';

-- Edit logo
update club_roulette
set logo_url = 'https://url-logo-baru.svg'
where nama = 'Arsenal';

-- Hapus satu klub
delete from club_roulette where nama = 'Everton';

-- Hapus semua klub dari kategori tertentu
delete from club_roulette where kategori = 'MLS';

-- Reset semua data klub
delete from club_roulette;
```

### 5.6 Izin Kamera untuk Club Roulette

Agar fitur deteksi wajah berfungsi, pengguna harus memberikan izin akses kamera kepada browser.

**Chrome/Edge:**
1. Klik ikon kunci 🔒 di address bar.
2. Ubah izin "Camera" menjadi "Allow".
3. Refresh halaman.

**Firefox:**
1. Klik ikon kunci di address bar.
2. Klik tanda ">" di sebelah "Connection Secure".
3. Ubah izin kamera.

**Safari (iOS):**
1. Buka **Settings** → **Safari**.
2. Scroll ke bawah → pilih **"Camera"** → pilih **"Allow"**.

---

## Bagian 6: Troubleshooting

### 6.1 Supabase Project Ter-Pause

**Gejala:**
- Aplikasi terbuka tapi data tidak termuat.
- Console browser menampilkan error `Failed to fetch` atau timeout.
- Halaman loading terus tanpa hasil.

**Diagnosis:**
1. Buka [app.supabase.com](https://app.supabase.com).
2. Periksa apakah project menampilkan badge **"Paused"** (warna merah/abu-abu).

**Solusi:**
1. Di dashboard Supabase, klik project yang ter-pause.
2. Klik tombol **"Restore project"** (biasanya muncul di bagian atas).
3. Tunggu ±1–2 menit hingga project aktif kembali.
4. Refresh halaman aplikasi.

**Pencegahan jangka panjang:**
- Pastikan secret `SUPABASE_PROJECTS_JSON` sudah dikonfigurasi dengan benar (lihat [Bagian 3.2](#32-menambahkan-github-secrets)).
- Verifikasi workflow `wake-supabase.yml` berjalan sukses setiap hari di tab Actions.

### 6.2 Kamera Tidak Bisa Diakses

**Gejala:**
- Modal Club Roulette terbuka tapi layar kamera hitam/kosong.
- Muncul error `NotAllowedError: Permission denied`.
- Browser tidak meminta izin kamera sama sekali.

**Solusi berdasarkan penyebab:**

| Penyebab | Solusi |
|---|---|
| Izin kamera ditolak | Buka Settings browser → reset izin kamera untuk situs ini |
| Kamera digunakan aplikasi lain | Tutup Zoom, Teams, atau aplikasi lain yang memakai kamera |
| Dibuka via `file://` | Gunakan Live Server (`http://localhost`) |
| Browser tidak support | Coba Chrome atau Edge versi terbaru |
| HTTPS tidak aktif | Pastikan production menggunakan HTTPS (GitHub Pages otomatis HTTPS) |

**Cek via Console browser:**
```javascript
// Jalankan di Console browser untuk cek status kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log("✅ Kamera OK:", stream))
  .catch(err => console.error("❌ Error kamera:", err.name, err.message));
```

### 6.3 Wajah Tidak Terdeteksi

**Gejala:**
- Kamera aktif (gambar terlihat) tapi status tetap "Mendeteksi Wajah...".
- Tombol "🎰 Mulai Gacha" tidak muncul.

**Solusi:**

1. **Pencahayaan kurang:** Pastikan wajah mendapatkan cahaya yang cukup. Hindari backlight (cahaya dari belakang).
2. **Wajah terlalu jauh:** Dekatkan wajah ke kamera — idealnya jarak 30–60 cm.
3. **Sudut kamera:** Hadapkan wajah langsung ke kamera, hindari sudut ekstrem.
4. **Model face-api.js belum termuat:** Tunggu beberapa detik karena model AI diunduh dari CDN saat pertama kali digunakan. Periksa tab Network di DevTools untuk memastikan file model berhasil diunduh.
5. **Koneksi lambat:** Model face detection memerlukan beberapa file dari CDN. Pastikan koneksi internet stabil.

> [!NOTE]
> face-api.js menggunakan model machine learning yang diunduh dari CDN (jsDelivr atau unpkg) saat pertama kali fitur dibuka. Ukuran model sekitar 2–5 MB. Setelah cache browser terisi, loading akan jauh lebih cepat.

### 6.4 Data Tidak Tersimpan

**Gejala:**
- Skor berhasil diinput tapi hilang saat refresh.
- Turnamen tidak dilanjutkan saat buka kembali.
- Console menampilkan error database.

**Langkah diagnosis:**

1. **Periksa Console browser** (`F12`) untuk error spesifik.
2. **Periksa Anonymous Sign-In:**
   ```javascript
   // Di Console browser
   const { createClient } = supabase;
   const db = createClient(
     window.__APP_CONFIG__.supabaseUrl,
     window.__APP_CONFIG__.supabaseAnonKey
   );
   const { data: session } = await db.auth.getSession();
   console.log("Session:", session);
   // Harus ada session.session (bukan null)
   ```
3. **Periksa RLS Policy** di Supabase: buka **Authentication** → **Policies** dan pastikan setiap tabel memiliki policy "Public Access".
4. **Periksa status Supabase project** — mungkin ter-pause.

**Solusi umum:**

| Error | Solusi |
|---|---|
| `Session missing` | Aktifkan Anonymous Sign-In di Supabase (lihat [Bagian 2.4](#24-mengaktifkan-anonymous-sign-in)) |
| `new row violates row-level security` | Pastikan RLS policy "Public Access" sudah dibuat untuk semua tabel |
| `relation "x" does not exist` | Jalankan ulang SQL schema (lihat [Bagian 2.2](#22-menjalankan-sql-schema)) |
| `Failed to fetch` | Periksa URL Supabase di `config.local.js` — pastikan tidak ada typo |

### 6.5 Error 401 / 403 dari Supabase

**Error 401 Unauthorized:**

Penyebab paling umum: `SUPABASE_ANON_KEY` salah atau tidak terkonfigurasi.

**Cek produksi:**
1. Buka tab **Actions** di GitHub.
2. Klik run terbaru dari workflow "Deploy to GitHub Pages".
3. Klik step "Inject Supabase credentials ke config".
4. Pastikan output menampilkan `✅ config.local.js berhasil dibuat dari GitHub Secrets`.

**Cek di lokal:**
```javascript
// Di Console browser, cek apakah config terbaca dengan benar
console.log(window.__APP_CONFIG__);
// Harus tampil: { supabaseUrl: "https://...", supabaseAnonKey: "eyJ..." }
```

**Error 403 Forbidden:**

Penyebab: RLS (Row Level Security) aktif tapi policy belum dibuat.

Solusi: Jalankan query berikut di SQL Editor Supabase:
```sql
-- Periksa policy yang ada
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public';

-- Jika kosong atau tidak lengkap, buat ulang policy
create policy "Public Access" on tournaments
  for all using (true) with check (true);

create policy "Public Access" on tim
  for all using (true) with check (true);

create policy "Public Access" on state_turnamen
  for all using (true) with check (true);

create policy "Public Access" on log_activity
  for all using (true) with check (true);

create policy "Public Access" on club_roulette
  for all using (true) with check (true);
```

### 6.6 Aplikasi Tidak Ter-Deploy ke GitHub Pages

**Gejala:**
- URL `https://USERNAME.github.io/YotaLeague/` menampilkan 404.
- Workflow di Actions gagal (tanda ❌ merah).

**Langkah troubleshooting:**

1. **Pastikan GitHub Pages diaktifkan** dengan source "GitHub Actions" (bukan "Deploy from branch").
2. **Periksa log workflow** di tab Actions — klik run yang gagal dan baca pesan error.
3. **Error umum dan solusinya:**

| Error di Log Actions | Solusi |
|---|---|
| `Secret SUPABASE_URL not found` | Tambahkan secret `SUPABASE_URL` di Settings → Secrets |
| `Error: No artifacts found` | Periksa path di `upload-pages-artifact` di `deploy.yml` |
| `Resource not accessible by integration` | Aktifkan GitHub Pages di Settings → Pages |
| `Branch not found` | Pastikan branch yang dipush bernama `main` (bukan `master`) |

### 6.7 PWA (Progressive Web App) Tidak Bisa Di-Install

**Gejala:**
- Tidak muncul prompt "Add to Home Screen" di HP.
- Ikon install tidak muncul di address bar Chrome.

**Syarat agar PWA bisa di-install:**
1. ✅ Aplikasi diakses via **HTTPS** (GitHub Pages otomatis HTTPS).
2. ✅ File `manifest.json` valid dan dapat diakses.
3. ✅ Service Worker (`sw.js`) terdaftar dan aktif.
4. ✅ Setidaknya satu ikon berukuran 192x192 atau lebih besar.

**Cara manual install di Chrome Android:**
1. Buka aplikasi di Chrome.
2. Ketuk ikon menu ⋮ → pilih **"Add to Home screen"** atau **"Install App"**.

**Cara manual install di iPhone (Safari):**
1. Buka aplikasi di Safari.
2. Ketuk tombol Share (kotak dengan panah ke atas).
3. Scroll dan pilih **"Add to Home Screen"**.

---

## Bagian 7: Upgrade dari Versi Sebelumnya

### 7.1 Backup Data Sebelum Upgrade

> [!CAUTION]
> **Selalu backup data sebelum melakukan perubahan schema database.** Perubahan schema yang salah dapat menyebabkan hilangnya data permanen yang tidak bisa dipulihkan.

#### Backup Manual via SQL (Gratis, Tanpa Instalasi)

Jalankan query berikut di SQL Editor dan simpan hasilnya ke file lokal:

```sql
-- Export data turnamen aktif
select row_to_json(t) from tournaments t;

-- Export data tim
select row_to_json(t) from tim t;

-- Export state pertandingan (HATI-HATI: bisa besar)
select row_to_json(t) from state_turnamen t;

-- Export log aktivitas
select row_to_json(t) from log_activity t;

-- Export data klub roulette
select row_to_json(t) from club_roulette t;
```

Salin hasil query dan simpan ke file `.json` atau `.sql` di komputer lokal Anda.

#### Backup via Supabase CLI (Untuk Developer)

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke akun Supabase
supabase login

# Export schema (struktur tabel)
supabase db dump --schema public > backup_schema_$(date +%Y%m%d).sql

# Export data saja
supabase db dump --data-only > backup_data_$(date +%Y%m%d).sql
```

### 7.2 Mengecek Apakah Ada Perubahan Schema

Sebelum upgrade, bandingkan schema database Anda dengan versi terbaru dari `db.sql`:

```sql
-- Cek tabel yang ada di database Anda
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- Cek kolom dari setiap tabel (untuk mendeteksi kolom baru/hilang)
select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

### 7.3 Menerapkan Perubahan Schema dengan Aman

Jika ada kolom atau tabel baru di versi terbaru, gunakan perintah `ALTER TABLE` alih-alih menjalankan ulang schema penuh (yang bisa menghapus data):

```sql
-- ✅ Aman: Menambah kolom baru ke tabel yang ada
alter table tournaments
  add column if not exists rr_type text;

-- ✅ Aman: Menambah kolom dengan nilai default
alter table state_turnamen
  add column if not exists standings jsonb default '[]';

-- ✅ Aman: Menambah tabel baru yang belum ada
create table if not exists club_roulette (
  id        serial  primary key,
  nama      text    not null,
  logo_url  text,
  kategori  text    not null
);

-- Jangan lupa aktifkan RLS untuk tabel baru
alter table club_roulette enable row level security;

create policy "Public Access" on club_roulette
  for all using (true) with check (true);
```

> [!WARNING]
> **Jangan** menjalankan `drop table` atau `truncate` pada tabel yang sudah berisi data kecuali Anda sudah melakukan backup dan yakin data tersebut tidak diperlukan lagi.

### 7.4 Update Kode Aplikasi

Setelah schema diupdate:

1. **Pull perubahan terbaru** dari repository:
   ```bash
   git pull origin main
   ```

2. **Test di lokal** sebelum deploy ke production:
   ```bash
   # Buka dengan Live Server dan verifikasi semua fitur berfungsi
   # Periksa Console browser untuk error
   ```

3. **Deploy ke production** dengan push ke branch `main`:
   ```bash
   git push origin main
   # Workflow deploy.yml akan otomatis berjalan (~1-3 menit)
   ```

### 7.5 Rollback Jika Ada Masalah

Jika upgrade menyebabkan masalah, lakukan rollback:

**Rollback kode:**
```bash
# Lihat riwayat commit
git log --oneline -10

# Buat commit baru yang membalik perubahan commit tertentu
git revert <commit-hash>
git push origin main
```

**Rollback schema (jika ada kolom baru yang perlu dihapus):**
```sql
-- Hapus kolom yang baru ditambahkan (hanya jika aman)
alter table tournaments drop column if exists kolom_baru;

-- Hapus tabel yang baru dibuat (hanya jika kosong/tidak dibutuhkan)
drop table if exists tabel_baru;
```

---

## 📞 Bantuan & Sumber Daya

### Dokumentasi Resmi

| Sumber | URL |
|---|---|
| Supabase Documentation | [supabase.com/docs](https://supabase.com/docs) |
| Supabase JavaScript Client | [supabase.com/docs/reference/javascript](https://supabase.com/docs/reference/javascript/introduction) |
| GitHub Pages Documentation | [docs.github.com/pages](https://docs.github.com/en/pages) |
| GitHub Actions Documentation | [docs.github.com/actions](https://docs.github.com/en/actions) |
| face-api.js | [github.com/justadudewhohacks/face-api.js](https://github.com/justadudewhohacks/face-api.js) |
| html2canvas | [html2canvas.hertzen.com](https://html2canvas.hertzen.com/) |
| PWA Documentation (MDN) | [developer.mozilla.org/docs/Web/Progressive_web_apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) |

### Perintah Berguna (Quick Reference)

```bash
# Clone repository
git clone https://github.com/USERNAME/YotaLeague.git

# Buat branch baru
git checkout -b nama-branch

# Commit dan push
git add . && git commit -m "pesan commit" && git push origin nama-branch

# Sinkronisasi dengan upstream
git fetch origin && git pull origin main

# Cek status perubahan file
git status

# Lihat log commit
git log --oneline -10
```

```sql
-- Cek jumlah data di setiap tabel
select 'tournaments'    as tabel, count(*) as jumlah from tournaments    union all
select 'tim'            as tabel, count(*) as jumlah from tim            union all
select 'state_turnamen' as tabel, count(*) as jumlah from state_turnamen union all
select 'log_activity'   as tabel, count(*) as jumlah from log_activity   union all
select 'club_roulette'  as tabel, count(*) as jumlah from club_roulette;

-- Cek policy RLS yang aktif
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public'
order by tablename;

-- Reset semua data turnamen (HATI-HATI! Tidak bisa dikembalikan)
truncate table log_activity   restart identity cascade;
truncate table state_turnamen restart identity cascade;
truncate table tim            restart identity cascade;
truncate table tournaments    restart identity cascade;
```

---

> *Panduan ini dibuat untuk memastikan siapa pun — dari pengguna baru hingga developer berpengalaman — dapat men-setup dan menjalankan Yota League dengan lancar. Jika ada yang perlu diperbarui, silakan buat Issue atau Pull Request di repository.*

---

**Versi Dokumen:** 1.0.0
**Terakhir Diperbarui:** Juni 2026
**Kompatibel dengan:** Yota League v2.x

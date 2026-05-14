-- 1. Ekstensi UUID (Wajib untuk Supabase)
create extension if not exists "uuid-ossp";

-- 2. Tabel Turnamen (Informasi Utama Turnamen)
-- Menambahkan kolom 'rr_type' untuk menyimpan jenis Round Robin (single/double)
create table if not exists tournaments (
  id uuid default uuid_generate_v4() primary key,
  nama text not null,
  sistem text not null, -- 'single', 'double', 'round_robin'
  rr_type text,         -- 'single' atau 'double' (khusus untuk round_robin)
  created_at timestamp with time zone default now()
);

-- 3. Tabel Tim (Data Pemain & Tim)
create table if not exists tim (
  id uuid default uuid_generate_v4() primary key,
  tournaments_id uuid references tournaments(id) on delete cascade,
  nama_pemain text not null,
  nama_tim text not null,
  created_at timestamp with time zone default now()
);

-- 4. Tabel State Turnamen (Menyimpan Data Pertandingan & Klasemen)
-- Menambahkan kolom 'standings' untuk menyimpan poin klasemen Round Robin
create table if not exists state_turnamen (
  id uuid default uuid_generate_v4() primary key,
  tournaments_id uuid references tournaments(id) on delete cascade,
  data_pertandingan jsonb default '[]',
  standings jsonb default '[]',
  updated_at timestamp with time zone default now()
);

-- 5. Tabel Log Aktivitas (Riwayat Input Skor)
create table if not exists log_activity (
  id uuid default uuid_generate_v4() primary key,
  tournaments_nama text not null,
  deskripsi text,
  skor text,
  pemenang text,
  timestamp timestamp with time zone default now()
);

-- ==========================================
-- KONFIGURASI KEAMANAN (Row Level Security)
-- ==========================================

-- Aktifkan RLS di semua tabel
alter table tournaments enable row level security;
alter table tim enable row level security;
alter table state_turnamen enable row level security;
alter table log_activity enable row level security;

-- Buat Policy: Izinkan akses publik (Anon Key) untuk semua operasi
-- (Penting agar website bisa baca/tulis database tanpa backend server)
create policy "Public Access" on tournaments for all using (true) with check (true);
create policy "Public Access" on tim for all using (true) with check (true);
create policy "Public Access" on state_turnamen for all using (true) with check (true);
create policy "Public Access" on log_activity for all using (true) with check (true);
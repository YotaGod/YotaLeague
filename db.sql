-- 1. Ekstensi UUID (Wajib untuk Supabase)
create extension if not exists "uuid-ossp";

-- 2. Tabel Turnamen (Informasi Utama Turnamen)
-- Menambahkan kolom 'rr_type' untuk menyimpan jenis Round Robin (single/double)
create table if not exists tournaments (
  id uuid default uuid_generate_v4() primary key,
  nama text not null,
  sistem text not null, -- 'single', 'double', 'round_robin'
  rr_type text,         -- 'single' atau 'double' (khusus untuk round_robin)
  user_id uuid,
  created_at timestamp with time zone default now()
);

-- 3. Tabel Tim (Data Pemain & Tim)
create table if not exists tim (
  id uuid default uuid_generate_v4() primary key,
  tournaments_id uuid references tournaments(id) on delete cascade,
  nama_pemain text not null,
  nama_tim text not null,
  user_id uuid,
  created_at timestamp with time zone default now()
);

-- 4. Tabel State Turnamen (Menyimpan Data Pertandingan & Klasemen)
-- Menambahkan kolom 'standings' untuk menyimpan poin klasemen Round Robin
create table if not exists state_turnamen (
  id uuid default uuid_generate_v4() primary key,
  tournaments_id uuid references tournaments(id) on delete cascade,
  data_pertandingan jsonb default '[]',
  standings jsonb default '[]',
  user_id uuid,
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
-- TABEL CLUB ROULETTE (Fitur Baru)
-- ==========================================

create table if not exists club_roulette (
  id serial primary key,
  nama text not null,
  logo_url text,
  kategori text not null -- 'Premier League', 'La Liga', 'Serie A', 'Nation', 'All'
);

delete from club_roulette;

insert into club_roulette (nama, logo_url, kategori) values
  -- Premier League
('Arsenal', 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg', 'Premier League'),
('Liverpool', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg', 'Premier League'),
('Manchester United', 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg', 'Premier League'),
('Chelsea', 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg', 'Premier League'),
('Manchester City', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg', 'Premier League'),
('Tottenham', 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg', 'Premier League'),
('Newcastle United', 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg', 'Premier League'),
('Everton', 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg', 'Premier League'),
('Wolverhampton Wanderers', 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Wolverhampton_Logo.png', 'Premier League'),
('West Ham United', 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg', 'Premier League'),

  -- La Liga
('Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', 'La Liga'),
('Barcelona', 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', 'La Liga'),
('Atletico Madrid', 'https://upload.wikimedia.org/wikipedia/en/f/f9/Atletico_Madrid_Logo_2024.svg', 'La Liga'),
('Sevilla', 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg', 'La Liga'),
('Villarreal', 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg', 'La Liga'),

  -- Serie A
('Juventus', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Juventus_FC_-_logo_black_%28Italy%2C_2017%29.svg', 'Serie A'),
('Inter Milan', 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg', 'Serie A'),
('AC Milan', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', 'Serie A'),
('Napoli', 'https://upload.wikimedia.org/wikipedia/commons/4/4d/SSC_Napoli_2025_%28white_and_azure%29.svg', 'Serie A'),
('Como 1907', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_Como_1907_2019.png', 'Serie A'),
('Atalanta', 'https://upload.wikimedia.org/wikipedia/id/a/a8/Atalanta_Bergamo_Logo.svg', 'Serie A'),
('Lazio', 'https://upload.wikimedia.org/wikipedia/commons/3/37/S.S._Lazio_logo.svg', 'Serie A'),
('AS Roma', 'https://upload.wikimedia.org/wikipedia/commons/1/1a/AS_Roma_1942_logo.svg', 'Serie A'),

  -- Other
('Borussia Dortmund', 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', 'Bundesliga'),
('Bayer Leverkusen', 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg', 'Bundesliga'),
('Paris Saint-Germain', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg', 'Ligue 1'),
('Olympique Lyonnais', 'https://upload.wikimedia.org/wikipedia/en/1/1c/Olympique_Lyonnais_logo.svg', 'Ligue 1'),
('AS Monaco', 'https://upload.wikimedia.org/wikipedia/en/c/cf/LogoASMonacoFC2021.svg', 'Ligue 1'),
('Al Nassr', 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Al_Nassr_FC_Logo.svg/500px-Al_Nassr_FC_Logo.svg.png?_=20250524171932', 'Saudi Pro League'),
('Al Hilal', 'https://upload.wikimedia.org/wikipedia/commons/5/55/Al_Hilal_SFC_Logo.svg', 'Saudi Pro League'),
('Inter Miami CF', 'https://upload.wikimedia.org/wikipedia/id/5/5c/Inter_Miami_CF_logo.svg', 'MLS'),

  -- Nation (Tim Nasional)
('Brasil', 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg', 'Nation'),
('Argentina', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Argentine_Football_Association_logo.svg', 'Nation'),
('Prancis', 'https://en.wikipedia.org/wiki/French_Football_Federation#/media/File:French_Football_Federation_logo.svg', 'Nation'),
('Jerman', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Spain', 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg', 'Nation'),
('England', 'https://upload.wikimedia.org/wikipedia/commons/b/be/Flag_of_England.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Norway', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Swedia', 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Denmark', 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Netherlands', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg', 'Nation'),
('Belgium', 'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Croatia', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg', 'Nation'),
('Italy', 'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Portugal', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg', 'Nation'),
('Uruguay', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Uruguay.svg', 'Nation'),
('Korea Selatan', 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Jepang', 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original', 'Nation'),
('Maroko', 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg', 'Nation'),
('Mesir', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg', 'Nation'),
('Nigeria', 'https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg', 'Nation');

-- ==========================================
-- KONFIGURASI KEAMANAN (Row Level Security)
-- ==========================================

-- Aktifkan RLS di semua tabel
alter table tournaments enable row level security;
alter table tim enable row level security;
alter table state_turnamen enable row level security;
alter table log_activity enable row level security;
alter table club_roulette enable row level security;

-- Buat Policy: Izinkan akses publik (Anon Key) untuk semua operasi
-- (Penting agar website bisa baca/tulis database tanpa backend server)
create policy "Public Access" on tournaments for all using (true) with check (true);
create policy "Public Access" on tim for all using (true) with check (true);
create policy "Public Access" on state_turnamen for all using (true) with check (true);
create policy "Public Access" on log_activity for all using (true) with check (true);
create policy "Public Access" on club_roulette for all using (true) with check (true);
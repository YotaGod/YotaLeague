# Catatan Perubahan (CHANGELOG)

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini.

Format mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

---

## [Unreleased]

> Fitur-fitur berikut sedang dalam tahap perencanaan atau pengembangan aktif.

### 🚀 Direncanakan Ditambahkan
- **Manajemen multi-turnamen**: kemampuan menyimpan dan beralih antar beberapa turnamen secara bersamaan
- **Bracket print-ready**: ekspor bagan turnamen sebagai PDF atau gambar resolusi tinggi
- **Notifikasi real-time**: pemberitahuan push ketika ada update skor dari perangkat lain
- **Riwayat pertandingan**: arsip turnamen yang sudah selesai beserta statistiknya
- **Tema tampilan**: pilihan tema gelap/terang (dark/light mode) yang dapat disesuaikan pengguna
- **Statistik pemain**: rekap statistik individu seperti total kemenangan, kekalahan, dan gol
- **Mode Spektator**: tampilan read-only yang bisa dibagikan ke penonton tanpa akses edit

---

## [1.3.0] - 2026-06-10

### ✨ Ditambahkan
- **Sistem keamanan credentials**: kredensial Supabase kini di-inject secara aman melalui GitHub Actions menggunakan GitHub Secrets, sehingga tidak ada data sensitif yang tersimpan di repositori
- **File `config.local.js`**: file konfigurasi khusus untuk environment development lokal (sudah terdaftar di `.gitignore` sehingga tidak ikut ter-commit)
- **File `config.local.example.js`**: template konfigurasi lokal sebagai panduan bagi kontributor baru
- **Workflow `deploy.yml`**: GitHub Actions workflow untuk deployment otomatis ke GitHub Pages dengan injeksi konfigurasi saat build
- **Pembersihan riwayat git**: riwayat commit yang sebelumnya mengandung credentials yang terekspos telah dibersihkan dengan aman

### 🔄 Diubah
- `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dipindahkan dari `app.js` (hardcoded) ke `config.local.js` yang dibaca via `window.__APP_CONFIG__`
- Workflow `wake-supabase` diperbarui: metode ping diubah dari pengecekan endpoint `/auth/v1/health` menjadi query aktif ke database melalui PostgREST agar lebih efektif mencegah project ter-pause

### 🐛 Diperbaiki
- **GitHub Actions `wake-supabase` tidak efektif**: workflow sebelumnya hanya melakukan ping ke endpoint `/auth/v1/health` yang tidak cukup untuk mencegah Supabase free-tier project masuk status *paused*; kini diganti dengan query PostgREST yang benar-benar mengaktifkan koneksi database

---

## [1.2.0] - 2026-05-29

### ✨ Ditambahkan
- **Fitur AR Club Roulette**: pengacakan klub menggunakan teknologi face detection berbasis `face-api.js` untuk pengalaman yang lebih interaktif dan visual
- **Dual Face Roulette**: dukungan deteksi dua wajah secara bersamaan untuk pengacakan klub dua pemain sekaligus dalam satu sesi kamera
- **Visual bounding box**: kotak hijau muncul di sekitar wajah yang terdeteksi sebagai indikator visual bahwa wajah berhasil dikenali
- **Lock Target (buffer 10 frame)**: mekanisme buffer 10 frame sebelum sistem dianggap kehilangan tracking wajah, mencegah deteksi yang terlalu sensitif/berkedip-kedip
- **Tombol 'Mulai Gacha'**: tombol aksi untuk memulai animasi roulette setelah wajah berhasil terdeteksi
- **Animasi spinning overlay AR**: animasi putar club yang muncul sebagai overlay di atas layar kamera secara real-time

### 🔄 Diubah
- Tombol 'Kembali' diubah namanya menjadi **'Akhiri'** dan dilengkapi konfirmasi penghapusan data agar tidak terjadi penghapusan data yang tidak disengaja
- Modal kamera kini menggunakan **overlay system** sebagai pengganti spinner lama, menghasilkan tampilan yang lebih modern dan tidak menghalangi feed kamera
- Elemen `<video>` ditambahkan atribut `muted` untuk memastikan autoplay berjalan pada browser mobile yang menerapkan kebijakan ketat terhadap media dengan suara

### 🐛 Diperbaiki
- **`rouletteSpinner` tidak terdefinisi**: bug yang menyebabkan keseluruhan sistem face detection tidak dapat berjalan karena referensi ke variabel yang belum dideklarasikan
- **`faceDetected` dan `isRouletteSpinning` tidak terdefinisi**: error pada fungsi `handleCloseCameraModal` yang terjadi saat modal kamera ditutup sebelum variabel state inisialisasi
- **Race condition `video.play()`**: pada beberapa browser mobile, fungsi `video.play()` tidak dipanggil secara eksplisit setelah stream kamera terhubung sehingga layar tetap hitam; kini dipanggil secara langsung setelah stream tersedia
- **Threshold deteksi**: nilai ambang batas deteksi wajah disesuaikan untuk mendapatkan keseimbangan optimal antara kecepatan dan akurasi pada berbagai kondisi pencahayaan

---

## [1.1.0] - 2026-05-28

### ✨ Ditambahkan
- **Fitur kartu merah**: penyelenggara kini dapat mencatat nama pemain (karakter dalam game) yang terkena kartu merah pada setiap pertandingan
- **Panel Blacklist**: tampilan daftar pemain yang terkena kartu merah dari seluruh pertandingan, tampil jelas di halaman utama bracket
- **Input kartu merah di modal skor**: field input opsional di dalam modal input skor untuk mencatat pemain yang dikenai sanksi kartu merah
- **Log aktivitas dioptimalkan**: log kini hanya menampilkan entri terbaru dan tidak terus menumpuk, membuat tampilan lebih bersih dan efisien
- **Sistem real-time update via Supabase Realtime**: perubahan skor dan data turnamen kini tersinkronisasi secara langsung (real-time) ke semua perangkat yang membuka aplikasi
- **Tombol 'Akhiri Turnamen'**: tombol dengan dialog konfirmasi untuk menghapus seluruh data turnamen dari database dan memulai dari awal

### 🔄 Diubah
- Log aktivitas tidak lagi menampilkan entri yang sama secara berulang ketika terjadi update skor; duplikasi berhasil dicegah
- Pembersihan struktur kode: file dan folder yang tidak diperlukan dihapus untuk menjaga repositori tetap ringkas dan mudah dipelihara

### 🐛 Diperbaiki
- **Log menumpuk akibat subscription berganda**: Supabase Realtime subscription sebelumnya tidak di-unsubscribe dengan benar sehingga setiap update skor memicu penambahan log secara berlipat ganda; kini subscription dikelola dengan benar menggunakan satu channel per sesi

---

## [1.0.0] - 2026-05-15

### ✨ Ditambahkan

#### 🏗️ Setup & Konfigurasi Turnamen
- **Setup turnamen**: form pengisian nama turnamen, jumlah peserta, serta input nama pemain dan tim sebelum turnamen dimulai
- **Pilihan format kompetisi**: pengguna dapat memilih format turnamen yang sesuai sebelum membuat bracket

#### 🏆 Format Turnamen yang Didukung
- **Single Elimination**: format sistem gugur dengan penanganan otomatis peserta **BYE** untuk jumlah peserta yang tidak kelipatan pangkat 2 (misal 5 atau 7 tim)
- **Double Elimination**: format gugur ganda mendukung 4 dan 8 pemain dengan *Upper Bracket* dan *Lower Bracket* yang terstruktur
- **Round Robin Single Leg**: semua peserta saling berhadapan masing-masing sekali
- **Round Robin Double Leg**: semua peserta saling berhadapan dua kali (format kandang-tandang)

#### ⚙️ Mekanisme Permainan
- **Smart Shuffle**: algoritma penjadwalan cerdas yang memastikan seorang pemain tidak dijadwalkan bertanding secara berturut-turut tanpa jeda
- **Input skor**: modal input skor dengan validasi anti-seri khusus untuk format eliminasi (tidak boleh imbang)
- **Edit skor**: kemampuan mengubah skor pertandingan yang sudah diinput disertai kalkulasi ulang bracket secara otomatis
- **Klasemen real-time Round Robin**: kalkulasi dan tampilan klasemen secara langsung mencakup poin, selisih gol (GD), dan total memasukkan gol (MG)

#### 📤 Fitur Berbagi
- **Fitur Share / Match Graphic Poster**: generate kartu hasil pertandingan sebagai gambar menggunakan library `html2canvas`, siap dibagikan ke media sosial

#### ☁️ Persistensi & Sinkronisasi Data
- **Persistence via Supabase PostgreSQL**: seluruh data turnamen (pemain, bracket, skor, log) disimpan secara persisten di cloud database Supabase
- **Session recovery**: turnamen yang sedang berjalan dilanjutkan secara otomatis setelah pengguna me-refresh halaman

#### 📱 Progressive Web App (PWA)
- **PWA installable**: aplikasi dapat di-install langsung ke layar beranda perangkat Android maupun iOS layaknya aplikasi native
- **Service Worker offline-first**: strategi cache *Network-First* memastikan aplikasi tetap dapat diakses meski koneksi internet tidak stabil

#### 🔐 Otentikasi & Infrastruktur
- **Anonymous Authentication**: pengguna langsung dapat menggunakan aplikasi tanpa perlu mendaftar atau login menggunakan akun
- **GitHub Actions `wake-supabase`**: workflow terjadwal untuk melakukan ping ke Supabase secara berkala guna mencegah project free-tier masuk status *paused*

---

## Tautan Versi

[Unreleased]: https://github.com/YotaGod/YotaLeague/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/YotaGod/YotaLeague/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/YotaGod/YotaLeague/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/YotaGod/YotaLeague/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/YotaGod/YotaLeague/releases/tag/v1.0.0

<!-- Language Switcher -->
<div align="right">

🇮🇩 **Bahasa Indonesia** &nbsp;|&nbsp; [🇺🇸 English](./docs/README.en.md)

</div>

---

<div align="center">

<img src="./icon-192.png" alt="YotaLeague Logo" width="100" height="100">

# 🏆 YotaLeague

### Aplikasi Manajemen Turnamen eFootball/FIFA Berbasis Web (PWA)

*Platform turnamen e-sports yang profesional, modern, dan siap pakai — dari level tongkrongan hingga kompetisi daring resmi.*

<br>

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen?style=for-the-badge&logo=github)](https://pages.github.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

<br>

[🚀 Buka Aplikasi](#-demo) &nbsp;·&nbsp; [📖 Panduan Setup](./docs/SETUP_GUIDE.md) &nbsp;·&nbsp; [🐛 Laporkan Bug](../../issues) &nbsp;·&nbsp; [💡 Request Fitur](../../issues)

</div>

---

## 📋 Daftar Isi

- [🎯 Demo](#-demo)
- [📸 Screenshot & Preview](#-screenshot--preview)
- [✨ Fitur Lengkap](#-fitur-lengkap)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Struktur Project](#-struktur-project)
- [🎮 Cara Penggunaan](#-cara-penggunaan)
- [⚙️ Setup & Instalasi](#️-setup--instalasi)
- [🗄️ Database Schema](#️-database-schema)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)
- [🙏 Kredit](#-kredit)

---

## 🎯 Demo

> **🌐 Aplikasi Live:** [https://github.com/YotaGod/YotaLeague](https://github.com/YotaGod/YotaLeague)

---

## 📸 Screenshot & Preview

*(Screenshot preview UI premium YotaLeague akan ditambahkan di sini)*
- **Halaman Utama**: Desain gelap futuristik dengan pemilihan sistem gugur/klasemen.
- **Bracket Turnamen**: Bagan eliminasi interaktif yang responsif dan mudah digunakan.
- **AR Club Roulette**: Animasi interaktif deteksi wajah untuk memilih klub favorit secara acak.

---

## ✨ Fitur Lengkap

### 1. 🏆 Format Turnamen Lengkap
- **Single Elimination (Sistem Gugur)**: Bagan otomatis berbasis power-of-2 dengan penanganan peserta `BYE`.
- **Double Elimination (Gugur Ganda)**: Tersedia bagan Upper & Lower Bracket khusus untuk 4 & 8 pemain.
- **Round Robin (Liga)**: Pilihan Single Leg atau Double Leg (kandang-tandang) lengkap dengan klasemen real-time.

### 2. 🎰 AR Club Roulette (Face-Detection AI)
- Menggunakan `face-api.js` untuk deteksi wajah langsung melalui kamera.
- Mendukung **Dual Face Roulette** untuk mendeteksi dan mengundi klub bagi 2 pemain sekaligus.
- Green dashed bounding box yang interaktif dengan *lock target buffer* 10 frame (~2 detik).

### 3. 💾 Sinkronisasi Cloud Supabase & Real-Time
- Menggunakan Supabase Anonymous Auth untuk isolasi sesi tanpa repot login.
- Menyimpan status turnamen ke tabel Supabase secara otomatis saat skor di-input.
- Sistem real-time subscription untuk memastikan data selalu sinkron.

### 4. 📲 Progressive Web App (PWA) & Share Poster
- Aplikasi dapat di-install di Android & iOS dengan dukungkan offline support via Service Worker.
- Fitur ekspor grafis hasil pertandingan menggunakan `html2canvas` untuk diunduh dan dibagikan.

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3 (Custom Variables & Gradients), Modern JS (ES6+) |
| **BaaS / Database** | Supabase (Postgres, PostgREST API, Realtime Subscription, Anon Auth) |
| **AI / Computer Vision** | face-api.js (TinyFaceDetector model) |
| **Library Eksternal** | html2canvas (untuk export poster pertandingan) |
| **Deployment & CI/CD** | GitHub Pages & GitHub Actions (auto-deploy & wake-up keep alive) |

---

## 📁 Struktur Project

```text
YotaLeague/
├── .github/workflows/
│   ├── deploy.yml          # CI/CD deploy ke GitHub Pages
│   └── wake-supabase.yml   # Keep-alive Supabase gratisan
├── app.js                  # Logika utama aplikasi & Supabase integrations
├── style.css               # Gaya tampilan premium & responsif
├── index.html              # Struktur SPA utama
├── sw.js                   # Service Worker untuk offline support
├── manifest.json           # Konfigurasi instalasi PWA
├── db.sql                  # Skema database Supabase
├── config.local.example.js # Contoh konfigurasi API lokal
└── README.md               # Dokumentasi utama (Bahasa Indonesia)
```

---

## 🎮 Cara Penggunaan

1. **Akses Web**: Buka aplikasi dan klik install PWA jika membukanya via HP.
2. **Setup Turnamen**: Masukkan nama turnamen, pilih sistem (Single, Double, atau Round Robin).
3. **Undi Klub (Opsional)**: Klik tombol **Club Roulette** untuk mengundi klub menggunakan kamera wajah.
4. **Input Skor**: Klik pertandingan aktif untuk memasukkan hasil skor dan kartu merah (jika ada).
5. **Share Poster**: Klik hasil pertandingan lalu klik **Bagikan / Download** untuk mengunduh gambar poster.

---

## ⚙️ Setup & Instalasi

Silakan baca panduan lengkap pada [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) untuk melakukan setup lokal maupun konfigurasi deployment di GitHub Pages Anda.

---

## 🗄️ Database Schema

YotaLeague menggunakan Supabase dengan skema database yang terdiri dari 5 tabel utama:
1. `tournaments`: Menyimpan metadata utama turnamen.
2. `tim`: Menyimpan daftar pemain beserta klub yang dimainkan.
3. `state_turnamen`: Menyimpan data bracket/pertandingan & klasemen saat ini dalam bentuk data JSONB.
4. `log_activity`: Menyimpan riwayat aktivitas input skor (maksimal 50 log terakhir).
5. `club_roulette`: Menyimpan daftar klub sepak bola yang digunakan pada fitur roulette.

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Silakan fork repositori ini, lakukan perubahan pada branch baru, dan buat Pull Request. Pastikan Anda menulis deskripsi perubahan dengan jelas.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Lihat file [LICENSE](./LICENSE) untuk informasi lebih lanjut.

---

## 🙏 Kredit

Spesial terima kasih kepada:
- **Supabase** untuk backend instan yang luar biasa.
- **face-api.js** untuk library deteksi wajah yang andal.
- **html2canvas** untuk kemudahan export gambar.

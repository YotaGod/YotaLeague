# 🏆 YOTA LEAGUE (Bagan eFootball)

<p align="center">
  Sebuah aplikasi web progresif (PWA) interaktif untuk manajemen turnamen eFootball masa kini. YOTA LEAGUE didesain dengan antarmuka gelap yang premium, elegan, dan siap memfasilitasi berbagai jenis kompetisi dari level tongkrongan lokal hingga kompetisi daring profesional!
</p>

---

## 🌟 Keunggulan Utama

YOTA LEAGUE bukan sekadar papan skor biasa, melainkan platform manajemen turnamen lengkap dengan fitur canggih untuk memberikan pengalaman e-sports yang nyata:

- **📱 Dukungan PWA (Aplikasi Mobile Offline)**
  Yota League dapat di-install langsung ke layar beranda HP Anda (Android/iOS)! Berkat teknologi *Service Worker (Network-First)*, aplikasi ini sangat cepat, responsif, dan mampu berjalan layaknya aplikasi *native*.
  
- **📸 Share Match Graphic**
  Ingin pamer hasil pertandingan ke sosial media? Kami menyediakan fitur pembuatan grafis instan! Dengan satu klik, skor pertandingan akan diubah menjadi gambar visual yang keren dan siap dibagikan ke Instagram, WhatsApp, atau platform lainnya.

- **🚫 Sistem Blacklist (Kartu Merah)**
  Lacak pemain yang melanggar aturan dengan mudah. Sistem ini memungkinkan penyelenggara mendata pemain (karakter di dalam game) yang terkena kartu merah untuk setiap tim. Pemain yang masuk daftar *blacklist* akan terpampang jelas di layar!

- **🎲 Club Roulette dengan Face Detection!**
  Tidak tahu mau pakai klub apa? Fitur **Club Roulette** menggunakan kecerdasan buatan (*Face Detection*) untuk mengacak klub secara visual dan menyenangkan!

- **☁️ Auto-Save via Cloud Supabase**
  Tidak perlu takut data hilang karena tak sengaja me-*refresh* halaman! Seluruh *state* turnamen, susunan pemain, daftar pertandingan, hingga klasemen disimpan secara *real-time* ke cloud menggunakan autentikasi anonim (*Anon Sign-in*). Lanjutkan turnamen Anda kapan pun dan di mana pun.

---

## 📊 Mode Turnamen yang Didukung

Aplikasi ini sangat fleksibel dan dapat menyesuaikan dengan format kompetisi pilihan Anda:

1. **Single Elimination (Sistem Gugur)**
   Mendukung pengisian otomatis peserta "BYE" untuk menyeimbangkan bagan jika jumlah tim tidak kelipatan pangkat 2 (misal 5 atau 7 peserta).
   
2. **Double Elimination (Gugur Ganda)**
   Tidak langsung pulang setelah satu kali kalah! Tersedia *Upper Bracket* dan *Lower Bracket*. Sangat disarankan untuk turnamen dengan 4 atau 8 peserta agar bagan terstruktur dengan sempurna.
   
3. **Round Robin (Sistem Liga / Klasemen)**
   Semua saling berhadapan. Mendukung format **1 Leg** (bertemu sekali) atau **2 Leg** (kandang-tandang) lengkap dengan kalkulasi poin, selisih gol, hingga jumlah kemenangan!

---

## 🚀 Cara Penggunaan

1. **Akses Aplikasi**:
   Cukup buka web/aplikasinya. Anda akan otomatis masuk ke halaman "Setup Turnamen Baru". Jika diakses melalui HP, browser akan menawarkan opsi untuk *"Add to Home Screen"* (Install Aplikasi).
2. **Setup Peserta**:
   Masukkan nama turnamen, pilih mode kompetisi, dan input nama tim. (Gunakan *Club Roulette* jika butuh inspirasi).
3. **Mulai Kompetisi**:
   Klik pada pertandingan mana saja yang berstatus "Klik untuk input skor".
4. **Input Skor & Kartu Merah**:
   Ketik skor pertandingan dan masukkan nama pemain yang kena kartu merah (jika ada).
5. **Bagikan (Share)**:
   Gunakan tombol *Share* untuk mencetak gambar hasil pertandingan dan kirimkan ke teman-teman.

---

## 🛠 Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3 (Vanilla & Custom Animations), JavaScript (ES6+).
- **Backend/DB**: Supabase (PostgreSQL, REST API, Anon Auth).
- **Infrastruktur**: Progressive Web App (Manifest & Service Worker API).
- **Ekstra**: `html2canvas` (Untuk *screenshot* Match Graphic), `face-api.js` (Face Detection Roulette).

---

> *Dibuat khusus untuk mewujudkan turnamen eFootball yang profesional, tertata, dan menyenangkan!*

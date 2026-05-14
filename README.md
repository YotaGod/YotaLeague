# Bagan eFootball

Sebuah aplikasi berbasis web interaktif untuk mengatur, melacak, dan menampilkan jadwal serta hasil turnamen eFootball. Aplikasi ini didesain dengan antarmuka bergaya gelap yang modern, elegan, dan siap digunakan untuk memfasilitasi berbagai jenis kompetisi lokal maupun daring.

## Deskripsi Singkat

Bagan eFootball mempermudah penyelenggara atau pemain untuk mengatur jalannya turnamen tanpa perlu mencatat manual. Aplikasi ini dapat mengkalkulasi skor, memajukan pemenang ke ronde berikutnya secara otomatis, dan menyusun klasemen jika menggunakan sistem liga. Seluruh data pertandingan disimpan secara aman di cloud (Supabase) sehingga Anda tidak perlu khawatir kehilangan riwayat pertandingan.

## Fitur Utama

- **Beberapa Sistem Turnamen**:
  - Single Elimination (Sistem Gugur Biasa). Mendukung pengisian otomatis peserta "BYE" untuk menyesuaikan bagan jika jumlah tim tidak kelipatan pangkat 2.
  - Double Elimination (Sistem Gugur Ganda). Dilengkapi dengan Upper Bracket dan Lower Bracket untuk tim yang pernah kalah.
  - Round Robin (Sistem Liga). Memungkinkan sistem satu leg (bertemu sekali) atau dua leg (kandang-tandang).
- **Tampilan Responsif dan Modern**: Dibangun menggunakan HTML dan CSS murni dengan desain ala game, kartu pertandingan yang informatif, dan ringkasan skor agregat untuk pertandingan sistem dua leg.
- **Riwayat Log Aktivitas**: Memudahkan pencatatan semua aktivitas input skor sehingga riwayat turnamen tercatat dengan rapi.
- **Penyimpanan Terpusat**: Terintegrasi langsung dengan Supabase untuk manajemen database seketika (real-time).
- **Reset Cepat**: Mendukung penghapusan seluruh data turnamen saat ini untuk memulai kompetisi baru dari awal.

## Struktur File

- `index.html`: Kerangka utama dari antarmuka aplikasi.
- `style.css`: File styling berisi variabel warna, tema lapangan sepak bola, tipografi modern, dan desain hierarki komponen.
- `app.js`: Otak dari aplikasi yang mengatur logika turnamen (pembuatan bagan, validasi input, kalkulasi klasemen, pengacakan pemain, dan komunikasi dengan Supabase).

## Persyaratan Sistem

- Browser modern seperti Google Chrome, Mozilla Firefox, Safari, atau Microsoft Edge.
- Koneksi internet aktif (untuk memuat font dan berkomunikasi dengan database Supabase).

## Cara Penggunaan

1. **Konfigurasi Database**:
   Buka file `app.js` dan pastikan Anda telah memasukkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sesuai dengan proyek Supabase Anda. Anda juga harus memastikan bahwa tabel-tabel berikut telah dikonfigurasi di sisi database:
   - `turnamen`
   - `tim`
   - `state_turnamen`
   - `log_activity`
   
2. **Menjalankan Aplikasi**:
   Cukup buka file `index.html` menggunakan peramban web (browser). Anda bisa menggunakan fitur "Live Server" pada VS Code untuk pengalaman yang lebih baik.

3. **Membuat Turnamen Baru**:
   - Di halaman utama, masukkan nama turnamen.
   - Pilih jenis kompetisi yang ingin dijalankan.
   - Tentukan jumlah peserta.
   - Masukkan nama peserta dan tim eFootball yang digunakan.
   - Klik "Buat & Mulai".

4. **Memasukkan Skor**:
   Setelah bagan turnamen dihasilkan, klik pada area kotak pertandingan mana saja yang berstatus "Klik untuk input skor". Masukkan hasil pertandingan. Aplikasi akan segera memperbarui posisi bagan peserta secara otomatis.

## Catatan

Untuk memastikan integrasi Double Elimination stabil secara visual dan sistematis tanpa terputus, sistem disarankan berjalan optimal untuk 4 dan 8 peserta. Jika di luar itu, sistem akan merekomendasikan transisi ke mode Single Elimination. Mode Round Robin dan Single Elimination tidak membatasi jumlah peserta.

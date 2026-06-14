# 🗺️ ROADMAP — YotaLeague

> **Terakhir diperbarui:** Juni 2026  
> **Maintainer:** [@YotaGod](https://github.com/YotaGod)  
> **Repository:** [YotaGod/YotaLeague](https://github.com/YotaGod/YotaLeague)

---

## 🌟 Visi Jangka Panjang

> *Menjadi aplikasi turnamen eFootball **mobile-first** terlengkap yang bisa digunakan komunitas gaming Indonesia dan internasional **tanpa perlu install apapun**.*

YotaLeague lahir dari kebutuhan nyata komunitas eFootball Indonesia yang sering mengadakan turnamen kasual — dari warnet, kamar kos, hingga event komunitas besar. Visi kami sederhana namun ambisius: **setiap orang yang punya HP dan internet sudah bisa langsung pakai, tanpa hambatan teknis apapun**.

Kami percaya bahwa **Progressive Web App (PWA)** adalah masa depan aplikasi komunitas gaming — ringan, cepat, bisa diakses di mana saja, dan tidak butuh ruang penyimpanan berlebih.

---

## 📊 Status Legend

| Simbol | Keterangan |
|--------|-----------|
| ✅ | **Selesai** — Fitur sudah live dan dapat digunakan |
| 🔄 | **Dalam Progress** — Sedang aktif dikerjakan |
| 📌 | **Direncanakan** — Sudah ada spesifikasi, belum dikerjakan |
| 💡 | **Ide / Under Research** — Konsep awal, sedang dikaji |
| ❌ | **Dibatalkan** — Tidak akan diimplementasikan |

---

## 📈 Progress Keseluruhan

```
Foundation (v1.x)      ████████████████████  100%  ✅
UX Improvements (v1.4) ░░░░░░░░░░░░░░░░░░░░    0%  📌
Roulette Enh. (v1.5)   ░░░░░░░░░░░░░░░░░░░░    0%  📌
Multi-Tournament (v2.0) ░░░░░░░░░░░░░░░░░░░░   0%  📌
Social Features (v2.1) ░░░░░░░░░░░░░░░░░░░░    0%  💡
Adv. Analytics (v2.2)  ░░░░░░░░░░░░░░░░░░░░    0%  💡
Platform (v3.0)        ░░░░░░░░░░░░░░░░░░░░    0%  💡
```

---

## 🗓️ Timeline Rilis

| Versi | Nama | Target Rilis | Status | Fokus Utama |
|-------|------|-------------|--------|-------------|
| **v1.x** | Foundation | ~~Sudah Rilis~~ | ✅ Selesai | Core tournament engine |
| **v1.4** | UX Improvements | Q3 2026 | 📌 Planned | Kenyamanan pengguna |
| **v1.5** | Roulette Enhancement | Q3 2026 | 📌 Planned | Fitur AR & klub |
| **v2.0** | Multi-Tournament | Q4 2026 | 📌 Planned | Skalabilitas turnamen |
| **v2.1** | Social Features | Q1 2027 | 💡 Research | Komunitas & sharing |
| **v2.2** | Advanced Analytics | Q2 2027 | 💡 Research | Data & statistik |
| **v3.0** | Platform | Long-term | 💡 Vision | Ekosistem lengkap |

---

## ✅ v1.x — Foundation *(Selesai)*

> **Status:** Selesai dan live di production  
> **Deploy:** GitHub Pages  
> **Backend:** Supabase

Versi pertama YotaLeague membuktikan bahwa konsep PWA untuk manajemen turnamen eFootball adalah hal yang benar-benar bisa diwujudkan. Semua fitur inti sudah tersedia dan digunakan oleh komunitas.

### 🏆 Manajemen Turnamen

- ✅ **Tournament Setup** — Buat turnamen baru dengan mudah
- ✅ **Format Single Elimination** — Bracket gugur langsung
- ✅ **Format Double Elimination** — Bracket dengan winner & loser bracket
- ✅ **Format Round Robin** — Sistem liga, semua lawan semua
- ✅ **Score Input & Editing** — Isi dan edit skor pertandingan
- ✅ **Bracket Visualizer** — Tampilkan bracket secara visual

### 🎰 AR Club Roulette

- ✅ **AR Club Roulette** — Ambil klub secara acak menggunakan kamera AR
- ✅ **Integrasi Kamera** — Deteksi marker via browser camera

### 🛠️ Infrastruktur & Teknis

- ✅ **Progressive Web App (PWA)** — Bisa di-install di HP, offline-capable
- ✅ **Supabase Persistence** — Data tersimpan di cloud, tidak hilang saat refresh
- ✅ **GitHub Pages Deployment** — Hosting gratis, reliable, dan cepat
- ✅ **Keamanan Credentials** — API keys terlindungi, tidak exposed di frontend
- ✅ **Mobile-First Design** — Dioptimalkan untuk layar HP

---

## 📌 v1.4 — UX Improvements *(Q3 2026)*

> **Status:** Direncanakan  
> **Target:** Agustus–September 2026  
> **Prioritas:** Tinggi — langsung dirasakan pengguna

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Belum dimulai
```

Versi ini berfokus pada **pengalaman pengguna** yang lebih mulus, intuitif, dan nyaman. Feedback dari komunitas menjadi fondasi utama rencana ini.

### 🎨 UI/UX Enhancements

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| 🖱️ **Drag & Drop Reorder** | Urutkan ulang pemain sebelum draw dimulai | 🔴 Tinggi |
| 🌙 **Dark/Light Mode Toggle** | Pilih tema sesuai preferensi, tersimpan otomatis | 🔴 Tinggi |
| ✨ **Animasi Bracket Smooth** | Transisi bracket yang lebih hidup dan tidak janky | 🟡 Sedang |
| 🔔 **Browser Notification** | Notifikasi hasil pertandingan via browser push | 🟡 Sedang |
| 🖨️ **Print-Friendly Bracket** | Cetak bracket turnamen dalam format yang rapi | 🟢 Rendah |
| 🔡 **Ukuran Font Adjustable** | Aksesibilitas: sesuaikan ukuran teks (A-/A+) | 🟡 Sedang |

### 🎯 Goals v1.4

- Mengurangi friction dalam setup awal turnamen
- Meningkatkan retensi pengguna yang kembali untuk turnamen berikutnya
- Mempersiapkan groundwork UI untuk fitur-fitur v2.x

---

## 📌 v1.5 — Roulette Enhancement *(Q3 2026)*

> **Status:** Direncanakan  
> **Target:** September–Oktober 2026  
> **Prioritas:** Tinggi — fitur unggulan YotaLeague

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Belum dimulai
```

AR Club Roulette adalah fitur yang paling membedakan YotaLeague dari aplikasi turnamen lainnya. Versi ini membawa roulette ke level berikutnya.

### 🎰 Fitur Roulette Baru

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| 🛠️ **Admin Panel Klub** | Tambah/edit/hapus klub tanpa buka Supabase Dashboard | 🔴 Tinggi |
| 🖼️ **Custom Klub + Logo** | Upload logo klub sendiri untuk komunitas atau turnamen khusus | 🔴 Tinggi |
| 📜 **Riwayat Hasil Roulette** | Lihat klub apa yang pernah keluar per sesi | 🟡 Sedang |
| 🎲 **Mode Roulette Non-AR** | Tanpa kamera — random sederhana untuk HP yang tidak support AR | 🟡 Sedang |
| 🏅 **Filter Klub by Rating/Tier** | Pilih hanya S-tier, A-tier, atau campuran sesuai kebutuhan turnamen | 🟡 Sedang |

### 🎯 Goals v1.5

- Memberikan kontrol penuh kepada admin turnamen atas konten roulette
- Memastikan semua pengguna (termasuk yang HP-nya tidak support AR) bisa menikmati roulette
- Menjadikan roulette sebagai fitur yang bisa dikustomisasi per komunitas

---

## 📌 v2.0 — Multi-Tournament *(Q4 2026)*

> **Status:** Direncanakan  
> **Target:** Oktober–Desember 2026  
> **Prioritas:** Tinggi — perubahan arsitektur signifikan

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Belum dimulai
```

**Lompatan terbesar dalam sejarah YotaLeague.** Dari satu turnamen per sesi menjadi platform manajemen turnamen yang sesungguhnya. Versi ini memerlukan refactor arsitektur database dan UI yang cukup besar.

### 🏗️ Core Features

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| 📁 **Multi-Tournament Manager** | Kelola beberapa turnamen sekaligus dalam satu dashboard | 🔴 Tinggi |
| 📚 **History Turnamen** | Arsip turnamen yang sudah selesai, bisa dilihat kembali | 🔴 Tinggi |
| 📊 **Statistik Lintas Turnamen** | Win rate, average goals, clean sheet per pemain | 🔴 Tinggi |
| 🏟️ **Bracket 16/32 Pemain** | Single Elimination yang lebih besar untuk event besar | 🟡 Sedang |
| 🌍 **Format Grup + Knockout** | Format ala Piala Dunia: fase grup lalu babak gugur | 🟡 Sedang |

### 📐 Arsitektur v2.0

```
YotaLeague v2.0 Data Model
┌─────────────────────────────────────┐
│           USER SESSION              │
│  ┌──────────┐    ┌──────────────┐   │
│  │Tournament│───▶│   Matches    │   │
│  │    #1    │    │  Bracket     │   │
│  └──────────┘    │  Scores      │   │
│  ┌──────────┐    └──────────────┘   │
│  │Tournament│    ┌──────────────┐   │
│  │    #2    │───▶│   Players    │   │
│  └──────────┘    │  Stats       │   │
│  ┌──────────┐    │  History     │   │
│  │Tournament│    └──────────────┘   │
│  │    #3    │                       │
│  └──────────┘                       │
└─────────────────────────────────────┘
```

### 🎯 Goals v2.0

- Mengubah YotaLeague dari "aplikasi untuk satu turnamen" menjadi "platform manajemen turnamen"
- Mendukung event komunitas skala menengah (16-32 pemain)
- Memberikan data yang bermakna kepada pemain dan penyelenggara

---

## 💡 v2.1 — Social Features *(Q1 2027)*

> **Status:** Ide / Under Research  
> **Target:** Januari–Maret 2027  
> **Prioritas:** Sedang — bergantung pada adopsi v2.0

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Masih dikaji
```

Komunitas adalah jantung dari gaming. Versi ini membawa dimensi sosial ke dalam YotaLeague — bukan hanya untuk mencatat skor, tapi untuk **merayakan momen**.

### 🤝 Fitur Sosial

| Fitur | Deskripsi | Catatan |
|-------|-----------|---------|
| 🔗 **Share Bracket Publik** | Bagikan bracket turnamen via link unik yang bisa dilihat siapa saja | Tanpa login |
| 🏆 **Community Leaderboard** | Papan peringkat pemain terbaik di komunitas | Perlu analisis privasi |
| 💬 **Komentar per Match** | Tambahkan komentar, trash-talk halus, atau highlight per pertandingan | Moderasi ringan |
| 👍 **Reaction Hasil** | Emoji reaction untuk merayakan kemenangan atau kekalahan dramatis | Fun feature |

### ⚠️ Pertimbangan

- Fitur sosial memerlukan sistem moderasi konten yang sederhana
- Share publik harus opt-in, bukan default — privasi komunitas tetap dijaga
- Leaderboard perlu validasi data agar tidak mudah di-abuse

---

## 💡 v2.2 — Advanced Analytics *(Q2 2027)*

> **Status:** Ide / Under Research  
> **Target:** April–Juni 2027  
> **Prioritas:** Sedang — untuk komunitas yang data-driven

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Masih dikaji
```

Data adalah cerita. Versi ini mengubah angka-angka skor menjadi **wawasan yang bermakna** tentang performa setiap pemain.

### 📊 Fitur Analitik

| Fitur | Deskripsi | Tech Stack Kandidat |
|-------|-----------|---------------------|
| 📈 **Grafik Performa** | Visualisasi performa pemain per pertandingan (line chart) | Chart.js / Recharts |
| ⚔️ **Head-to-Head Stats** | Statistik historis antar dua pemain tertentu | Supabase Query |
| 📥 **Export Excel/CSV** | Unduh seluruh data turnamen untuk analisis mandiri | SheetJS |
| 🎛️ **Dashboard Statistik** | Halaman khusus dengan berbagai chart & metrik turnamen | D3.js / Recharts |

### 🔮 Metrik yang Akan Dilacak

```
Per Pemain:
  • Total pertandingan dimainkan
  • Win / Draw / Loss record
  • Total gol dicetak & kebobolan
  • Goal difference
  • Win rate (%)
  • Klub yang paling sering dipakai
  • Rata-rata gol per pertandingan

Per Turnamen:
  • Pertandingan paling banyak gol
  • Top scorer
  • Pertandingan paling dramatis (selisih tipis)
  • Clean sheet terbanyak
```

---

## 💡 v3.0 — Platform *(Long-Term Vision)*

> **Status:** Under Research / Visi Jangka Panjang  
> **Target:** 2028+  
> **Prioritas:** Rendah sekarang, fundamental untuk masa depan

```
Progress: ░░░░░░░░░░░░░░░░░░░░  0% — Masih dalam visi
```

Ini adalah **grand vision** YotaLeague — dari aplikasi komunitas eFootball menjadi **platform manajemen turnamen gaming** yang sesungguhnya.

### 🚀 Fitur Platform

| Fitur | Deskripsi | Kompleksitas |
|-------|-----------|-------------|
| 🎮 **Multi-Game Support** | Tambahkan game lain: FIFA, PES versi lama, Street Football, dll | 🔴 Sangat Tinggi |
| 👤 **Akun Pengguna** | Sistem autentikasi proper (bukan hanya anonymous Supabase) | 🟡 Tinggi |
| 📋 **Tournament Template** | Buat dan bagikan template format turnamen ke komunitas lain | 🟡 Sedang |
| 🤖 **Discord Bot API** | API publik agar Discord Bot bisa posting hasil otomatis | 🟡 Tinggi |
| 📱 **Mobile App Native** | React Native atau Capacitor untuk app store (opsional) | 🔴 Sangat Tinggi |

### 🤔 Kenapa Masih "Research"?

Multi-game support memerlukan abstraksi data model yang fundamental berbeda dari apa yang ada sekarang. Akun pengguna membawa kompleksitas keamanan, privasi (GDPR/UU PDP), dan biaya infrastruktur yang signifikan. Fitur-fitur ini hanya masuk akal jika komunitas YotaLeague sudah besar dan aktif.

---

## ❌ Fitur yang Tidak Akan Diimplementasikan

> *Transparansi adalah bagian dari open source yang baik. Berikut adalah fitur-fitur yang sudah diputuskan **tidak akan** masuk ke YotaLeague, beserta alasannya.*

| Fitur | Alasan Tidak Diimplementasikan |
|-------|-------------------------------|
| ❌ **Real-time Multiplayer** | Terlalu kompleks untuk PWA sederhana — memerlukan WebSocket server dedicated, latency management, dan state sync yang sangat sulit dikelola tanpa infrastruktur besar. Bukan scope proyek ini. |
| ❌ **Live Streaming Integration** | Memerlukan integrasi dengan Twitch/YouTube API yang membutuhkan OAuth, review apps, dan maintenance intensif. Di luar visi inti YotaLeague. |
| ❌ **Monetisasi / Premium Features** | YotaLeague adalah dan akan tetap **gratis sepenuhnya**. Fitur premium akan menciptakan fragmentasi komunitas dan bertentangan dengan semangat open source. |

---

## 🤝 Cara Berkontribusi ke Roadmap

YotaLeague adalah proyek open source yang hidup dari kontribusi komunitas. Suaramu menentukan fitur apa yang dikerjakan selanjutnya!

### 📣 Ajukan Fitur Baru

```
1. Buka GitHub Issues
   → Label: 'feature-request'
   → Jelaskan: use case, mengapa berguna, dan contoh konkret

2. Vote fitur yang kamu inginkan
   → Klik 👍 pada Issue yang sudah ada
   → Fitur dengan vote terbanyak = prioritas lebih tinggi

3. Diskusi terbuka di GitHub Discussions
   → Tab: Ideas & Feature Requests
   → Diskusikan ide sebelum jadi Issue formal
```

### 🛠️ Kontribusi Kode

```
1. Fork repository ini
2. Buat branch: git checkout -b feature/nama-fitur
3. Commit perubahan: git commit -m "feat: deskripsi fitur"
4. Push ke branch: git push origin feature/nama-fitur
5. Buat Pull Request — jelaskan apa yang berubah dan mengapa
```

### 📋 Pedoman Kontribusi

- Baca `CONTRIBUTING.md` terlebih dahulu sebelum berkontribusi
- Semua fitur baru harus mobile-first dan tidak merusak UX yang sudah ada
- Performance tetap menjadi prioritas — YotaLeague harus tetap ringan
- Ikuti code style yang sudah ada (ESLint config tersedia)

---

## 🗒️ Catatan Versi

| Tanggal | Perubahan Roadmap |
|---------|-------------------|
| Juni 2026 | Roadmap awal dipublikasikan, dokumentasi v1.x dilengkapi |

---

<div align="center">

**Dibuat dengan ❤️ untuk komunitas eFootball Indonesia**

[🐛 Report Bug](https://github.com/YotaGod/YotaLeague/issues) · [💡 Request Feature](https://github.com/YotaGod/YotaLeague/issues) · [💬 Diskusi](https://github.com/YotaGod/YotaLeague/discussions)

*"Dari komunitas, untuk komunitas."*

</div>

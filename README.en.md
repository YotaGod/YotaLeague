<!-- Language Switcher -->
<div align="right">

[🇮🇩 Bahasa Indonesia](./README.md) &nbsp;|&nbsp; 🇺🇸 **English**

</div>

---

<div align="center">

<img src="./icon-192.png" alt="YotaLeague Logo" width="100" height="100">

# 🏆 YotaLeague

### Web-Based PWA Tournament Manager for eFootball/FIFA

*A professional, modern, and ready-to-use e-sports tournament management platform — perfect for local community hangouts and official online competitions.*

<br>

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen?style=for-the-badge&logo=github)](https://pages.github.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

<br>

[🚀 Launch App](#-demo) &nbsp;·&nbsp; [📖 Setup Guide](./SETUP_GUIDE.md) &nbsp;·&nbsp; [🐛 Report Bug](../../issues) &nbsp;·&nbsp; [💡 Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [🎯 Demo](#-demo)
- [📸 Screenshots & Preview](#-screenshots--preview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🎮 User Guide](#-user-guide)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🗄️ Database Schema](#️-database-schema)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Credits](#-credits)

---

## 🎯 Demo

> **🌐 Live Application:** [https://github.com/YotaGod/YotaLeague](https://github.com/YotaGod/YotaLeague)

---

## 📸 Screenshots & Preview

*(Screenshots of YotaLeague's premium UI will be displayed here)*
- **Dashboard**: A futuristic dark-themed landing page to choose between elimination brackets and leagues.
- **Tournament Bracket**: Fully responsive and interactive elimination tree with automatic advancement.
- **AR Club Roulette**: Visual real-time face detection camera overlay for drawing clubs.

---

## ✨ Key Features

### 1. 🏆 Versatile Tournament Formats
- **Single Elimination**: Bracket generator handling any player count, including `BYE` slots.
- **Double Elimination**: Standard Upper & Lower Bracket flows optimized for 4 and 8 players.
- **Round Robin (League)**: Supporting single and double legs with auto-updated standings (points, GD, GF/GA).

### 2. 🎰 AR Club Roulette (Face-Detection AI)
- Leverages `face-api.js` for real-time face detection.
- Includes **Dual Face Roulette** mode to draw clubs for 2 players simultaneously in front of the camera.
- Premium UI indicators like green dashed bounding boxes and a 10-frame lock target buffer.

### 3. 💾 Supabase Cloud Sync & Real-Time Data
- Built with Supabase Anonymous Auth for session persistence without login screens.
- Auto-saves tournament states, match histories, and rankings in real-time.
- Multi-client subscription sync using Supabase Realtime.

### 4. 📲 PWA & Result Poster Generator
- Fully installable on Android and iOS devices, featuring offline caching via a Service Worker.
- Custom sharing poster generator powered by `html2canvas` for quick social media sharing.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Frontend** | Pure HTML5, CSS3 (Custom Variables & Animations), Vanilla JS (ES6+) |
| **BaaS / Database** | Supabase (Postgres, PostgREST API, Realtime Subscription, Anon Auth) |
| **AI / Vision** | face-api.js (TinyFaceDetector model via CDN) |
| **Libraries** | html2canvas (Match Poster export) |
| **CI/CD** | GitHub Pages & GitHub Actions (Automatic Deployment & Wake-up cron) |

---

## 📁 Project Structure

```text
YotaLeague/
├── .github/workflows/
│   ├── deploy.yml          # CI/CD deployment to GitHub Pages
│   └── wake-supabase.yml   # Keep-alive script for Supabase free tier
├── app.js                  # Main application logic & Supabase integration
├── style.css               # Premium CSS styles & responsive layout
├── index.html              # Core single page application HTML
├── sw.js                   # Service Worker for offline support
├── manifest.json           # PWA configuration
├── db.sql                  # Database schema & initial clubs seed
├── config.local.example.js # Template for local environment variables
└── README.en.md            # English documentation
```

---

## 🎮 User Guide

1. **Launch App**: Open the link and click install if you are on a mobile browser.
2. **Setup Tournament**: Input the tournament name, choose your system, and add players.
3. **AR Club Roulette (Optional)**: Open roulette, align faces to camera, and press **Gacha** to roll random clubs.
4. **Log Scores**: Click any active match to log scores, card penalties (red cards), and winners.
5. **Download Poster**: Click a completed match, customize or check preview, and click **Share / Download**.

---

## ⚙️ Setup & Installation

Please check the detailed guide inside [SETUP_GUIDE.md](./SETUP_GUIDE.md) to set up your local development environment and deploy to GitHub Pages.

---

## 🗄️ Database Schema

YotaLeague operates serverless using a 5-table PostgreSQL database schema on Supabase:
1. `tournaments`: Stores tournament metadata.
2. `tim`: Stores player names and their drafted teams.
3. `state_turnamen`: Stores bracket nodes and league standings in JSONB format.
4. `log_activity`: Stores history logs of the last 50 matches.
5. `club_roulette`: Database of soccer clubs & national flags used by the AR Roulette.

---

## 🤝 Contributing

Contributions are welcome! Please fork this repository, create a new feature branch, commit your changes, and open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🙏 Credits

Special thanks to:
- **Supabase** for the amazing PostgreSQL BaaS.
- **face-api.js** for browser-based AI face detection.
- **html2canvas** for the DOM-to-image library.

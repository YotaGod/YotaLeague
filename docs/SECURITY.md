# Security Policy - YotaLeague

## 🛡️ Security Overview

YotaLeague is designed as a serverless Progressive Web App (PWA). Because the application runs entirely on the client side and interfaces directly with a Supabase PostgreSQL backend, standard client-side security practices and strict database policies are critical. This document details our security model, credential management, database security policies, and how to report vulnerabilities.

---

## 🔒 Credentials & Secrets Management

To run YotaLeague, the application requires a Supabase API URL and an Anonymous Public Key (`anon`). 

### 1. The Supabase Public Anon Key
- **Design Intent**: The Supabase `anon` key is designed to be exposed to the client side. It allows users to authenticate anonymously and perform database queries.
- **Safety**: Exposing the `anon` key is secure **only** when Row Level Security (RLS) is enabled and correctly configured on the database. 
- **Caution**: The `service_role` key must **NEVER** be committed to version control or included in frontend bundles. The `service_role` key bypasses all RLS policies.

### 2. Injection via GitHub Secrets
To prevent credentials from leaking in the git repository:
1. Credentials are Git-ignored locally in `config.local.js` (copied from `config.local.example.js`).
2. In production, the credentials are stored securely in **GitHub Secrets** (`SUPABASE_URL` and `SUPABASE_ANON_KEY`).
3. The GitHub Actions deployment pipeline (`deploy.yml`) reads these secrets and injects them into `config.local.js` dynamically during the build step before deploying to GitHub Pages.

---

## 🗄️ Database & Row Level Security (RLS)

All 5 database tables used by YotaLeague have Row Level Security enabled. 

### Current Security Policy
The default policy defined in `db.sql` grants **public read and write access** to all tables:
```sql
create policy "Public Access" on tournaments for all using (true) with check (true);
```
*Note: This simplifies onboarding for local development and community setups where data is non-critical.*

### Recommended Policy (Production)
For deployments storing sensitive tournament information or preventing anonymous users from modifying or deleting others' data, implement user-scoped RLS policies. For example, to restrict tournament access to the user who created it:
```sql
alter table tournaments enable row level security;

create policy "Users can modify their own tournaments" on tournaments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 💻 Client-Side Security & Privacy

### 1. Camera Access and Face Detection
- The **Club Roulette** feature uses `face-api.js` to run real-time face detection.
- **Local Processing**: All camera frames are processed locally in the user's browser. No video data or images are ever uploaded to Supabase or any third-party server.
- **Explicit Consent**: The camera stream is only activated when the user explicitly clicks the "Club Roulette" button and chooses a category.

### 2. Code Safety
- The codebase avoids using dangerous JavaScript evaluation methods (e.g., `eval()`, `document.write()`).
- Input validations (e.g., checks to ensure scores are valid numbers and prevent negative numbers) are performed client-side prior to database transmission.

---

## 🌐 Infrastructure & CI/CD Security

- **HTTPS Enforced**: Deployed via GitHub Pages, which enforces SSL/TLS encryption for all communication.
- **PWA Service Worker**: Modern browsers strictly require HTTPS to load Service Workers and handle caching, protecting users from Man-in-the-Middle (MitM) attacks.
- **GitHub Actions Security**: Log masking is automatically applied by GitHub to prevent repository secrets from appearing in workflow execution logs.

---

## 🛑 Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it immediately:

1. **Do not create a public issue**.
2. Email the maintainer or submit a report via a private GitHub Security Advisory.
3. Provide detailed steps to reproduce the vulnerability, including payload examples or environment configurations.

We aim to acknowledge receipt of reports within 48 hours and provide a resolution plan within 7 days.

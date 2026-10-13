# Dilshaj Ashrafi — Full-Stack Personal Portfolio & System Engine

A complete, production-ready Full-Stack website and engineering showcase for **Dilshaj Ashrafi** — Full-Stack AI Engineer, Developer, and Problem Solver.

---

## 🌟 Full-Stack Architecture

### 1. Backend (`app.py`, `database.py`, `mailer.py`)
- **Server Framework**: Flask 3.1.3 (Python)
- **Database**: SQLite 3 (`data/portfolio.db`) with persistent tables for messages, project likes, subscribers, and analytics.
- **Gmail Notifications**: Direct SMTP notification delivery straight to `dilshajashrafi87@gmail.com` on form submissions.
- **Static File Serving**: Serves the single-page application and all assets on `http://localhost:5000`.

#### REST API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, engine health, and uptime |
| `GET` | `/api/stats` | Aggregated metrics: page views, messages, project likes |
| `POST` | `/api/contact` | Submits, persists message to SQLite, and dispatches to Gmail |
| `GET` | `/api/projects/likes` | Retrieves live project like counters |
| `POST` | `/api/projects/like` | Real-time project like incrementation |
| `POST` | `/api/subscribe` | Newsletter & tech project updates signup |
| `POST` | `/api/terminal` | Evaluates dynamic CLI queries via backend engine |

---

### 2. Frontend Features & Live Links
- **Hero & Profile**:
  - Precision 3:4 portrait card with your framed photo.
  - Typewriter effect cycling through your core engineering titles.
  - Live backend connection status pill: `🟢 Full-Stack Engine Online (Flask + SQLite)`.
- **Connected Profiles**:
  - **GitHub**: [github.com/DilshajAshrafi](https://github.com/DilshajAshrafi)
  - **Instagram**: [@dilshaj_ashrafi2](https://www.instagram.com/dilshaj_ashrafi2?xtok=dmtpa2gyejkwY24z)
  - **Email**: `dilshajashrafi87@gmail.com`
  - **Phone**: `+91 9296806950`
- **Featured Projects**:
  - **Kisaan Sathi (Smart Farmer AI Platform)**:
    - **Live Production URL**: [https://kissansathiindia.vercel.app/](https://kissansathiindia.vercel.app/)
    - Interactive ❤️ Like button updating SQLite database in real-time.
    - Deep-dive technical modal.
  - **Autonomous AI Assistant & Knowledge Engine**
  - **Data Science & Mathematical Modeling Suite**
  - **High-Performance C Systems Suite**
- **Interactive Terminal ("Dilshaj CLI")**:
  - In-browser UNIX terminal supporting: `about`, `skills`, `projects`, `kisaan`, `stats`, `db`, `contact`, `clear`.
- **Direct Gmail Delivery Form**:
  - Automatically records form submissions into SQLite and delivers them straight to `dilshajashrafi87@gmail.com`.

---

## 📧 How to Enable Automatic Background Gmail Delivery

If you want the Python server to deliver emails to your Gmail automatically in the background without needing browser tabs:
1. Open your Google Account: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is turned ON.
3. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Create an App Password (name it `Portfolio`). Google gives you a 16-character code (e.g. `abcd efgh ijkl mnop`).
5. Open `.env` in this directory and paste it:
   ```env
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
6. Save `.env`. Now every submission sends straight into your Gmail inbox!

---

## 🚀 How to Run the System

### Method 1: One-Click Launcher (Windows)
Double-click [`start.bat`](file:///c:/Users/Dilshaj-Ashrafi/Documents/webpage%202/start.bat).

### Method 2: Command Line
```powershell
python app.py
```
Then visit: [http://localhost:5000](http://localhost:5000)

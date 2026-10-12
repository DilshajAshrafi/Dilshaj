# Dilshaj Ashrafi — Full-Stack Personal Portfolio & System Engine

A complete, production-ready Full-Stack website and engineering showcase for **Dilshaj Ashrafi** — Full-Stack AI Engineer, Developer, and Problem Solver.

---

## 🌟 Full-Stack Architecture

### 1. Backend (`app.py` & `database.py`)
- **Server Framework**: Flask 3.1.3 (Python)
- **Database**: SQLite 3 (`data/portfolio.db`) with ACID compliance
- **CORS & Middleware**: Dynamic origin headers and automated audit logging
- **Static File Serving**: Serves the entire SPA frontend on `http://localhost:5000`

#### REST API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, engine health, and uptime |
| `GET` | `/api/stats` | Aggregated metrics: page views, messages, project likes |
| `POST` | `/api/contact` | Submits and persists contact form messages into SQLite |
| `GET` | `/api/projects/likes` | Retrieves live project like counters |
| `POST` | `/api/projects/like` | Real-time project like incrementation |
| `POST` | `/api/subscribe` | Newsletter & tech project updates signup |
| `POST` | `/api/terminal` | Evaluates dynamic CLI queries via the backend engine |
| `POST` | `/api/admin/auth` | Verifies admin passcode (`dilshaj2026`) |
| `GET` | `/api/admin/overview` | Returns complete message inbox & analytics |
| `POST` | `/api/admin/messages/<id>/read` | Marks a message as read in SQLite |
| `DELETE` | `/api/admin/messages/<id>` | Permanently deletes a message |

---

### 2. Frontend (`index.html`, `css/style.css`, `js/main.js`)
- **Hero & Profile**:
  - Precision 3:4 portrait card with your framed photo.
  - Typewriter effect cycling through your core engineering titles.
  - Live backend connection status pill: `🟢 Full-Stack Engine Online (Flask + SQLite)`.
- **Social & Profile Links**:
  - **GitHub**: [github.com/DilshajAshrafi](https://github.com/DilshajAshrafi)
  - **Instagram**: [@dilshaj_ashrafi2](https://www.instagram.com/dilshaj_ashrafi2?xtok=dmtpa2gyejkwY24z)
  - **Email**: `dilshajashrafi@gmail.com`
  - **Phone**: `+91 8292992959`
- **Interactive Project Showcase**:
  - Live ❤️ Like buttons on every card that increment real-time counters in the SQLite database.
  - In-depth modal case study previews.
  - Direct GitHub repository links.
- **Interactive Terminal ("Dilshaj CLI")**:
  - Live in-browser UNIX terminal supporting: `about`, `skills`, `projects`, `kisaan`, `stats`, `db`, `admin`, `contact`, `clear`.
- **Admin Message Portal**:
  - Secure in-browser modal for Dilshaj to review incoming contact form submissions, mark them as read, or reply via email.
  - Access via "🔐 Admin" in the header/footer, or by typing `admin` in the CLI!
  - **Passcode**: `dilshaj2026`

---

## 📁 Directory Structure

```
webpage 2/
├── app.py                   # Full-Stack Flask Backend Application
├── database.py              # SQLite database models, queries & storage
├── data/
│   └── portfolio.db         # Persistent SQLite database file
├── index.html               # Main semantic HTML5 markup & SPA client
├── css/
│   └── style.css            # Responsive design system, themes & animations
├── js/
│   └── main.js              # Full-Stack API client & interactive animations
├── assets/
│   ├── dilshaj-ashrafi.jpeg # Profile portrait
│   ├── dilshaj-portrait-3x4.jpg # 3:4 ratio framed portrait
│   └── favicon.svg          # Brand monogram DA favicon
├── start.bat                # 1-click Windows launcher
├── start.ps1                # 1-click PowerShell launcher
└── README.md                # Documentation & API specs
```

---

## 🚀 How to Run the Full-Stack System

### Method 1: One-Click Launcher (Windows)
Double-click [`start.bat`](file:///c:/Users/Dilshaj-Ashrafi/Documents/webpage%202/start.bat).
This will initialize the database, start the Flask backend, and open your browser automatically.

### Method 2: Command Line
```powershell
python app.py
```
Then visit: [http://localhost:5000](http://localhost:5000)

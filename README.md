# 🚀 LernX Platform & Resume Builder Studio

> **Modern, Glassmorphic EdTech Platform featuring an Interactive ATS-Friendly Resume Builder & Career Suite.**

![LernX Platform](https://img.shields.io/badge/LernX-v1.0.0-6366f1?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-19.2.6-61dafb?style=for-the-badge&logo=react)
![Theme](https://img.shields.io/badge/Theme-Light%20%7C%20Dark-a855f7?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

---

## ✨ Features & Highlights

### 📝 1. Resume Builder Module (`/resume`)
* **Split-View Realtime Builder**: 10 glass accordion form sections (Personal Info, Education, Skills, Experience, Projects, Certifications, Achievements, Languages, Interests, Declaration) updating a live A4 paper preview instantly.
* **8 Professional Templates**: Modern, Minimal, Executive, Corporate, Classic, Creative, Developer, Student.
* **Customization Controls**: 7 Color presets, 5 Google font families, live zoom, and **1-click client-side PDF Export** via `html2pdf.js`.
* **AI ATS Resume Checker**: File drag & drop, sequential loading status messages, 82% score circle gauge, category breakdowns, missing keyword detection, and priority suggestions.

### 🌐 2. Complete EdTech Learning Suite
* **Interactive Courses & Details** (`/courses`, `/course/:id`)
* **LMS Video & Interactive Player** (`/player/:courseId`)
* **Events & Tech Workshops** (`/events`)
* **User Profile & Verifiable Certificates** (`/profile`, `/certificate`)

### ☀️ 3. Global Theme Engine
* **Universal Light & Dark Mode**: One-click circular glass theme toggle `[ ☀️ | 🌙 ]` in the Navbar.
* **Adaptive Glassmorphism UI**: High-contrast, premium styling across all modules.

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/rohith-1806/updated_learnX.git

# 2. Navigate to project directory
cd updated_learnX

# 3. Install dependencies
npm install

# 4. Start local development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Built With

* **Frontend Framework**: React 19, React Router v7
* **Animations**: Framer Motion
* **Icons**: Lucide React & Custom SVGs
* **PDF Export**: html2pdf.js
* **Styling**: Pure Modular Vanilla CSS Variables

---

## 📂 Project Architecture

```text
src/
├── components/
│   ├── Navbar.jsx / Navbar.css          # Floating Navbar with Global Theme Toggle
│   ├── Resume/                          # Resume Studio Components
│   │   ├── ResumeDashboard.jsx           # Hero Header & Quick Action Cards
│   │   ├── ResumeBuilder.jsx             # Split-View Form & Live Preview
│   │   ├── ResumeFormAccordion.jsx       # 10 Form Accordions
│   │   ├── ResumePreview.jsx             # Real-Time A4 Document Renderer
│   │   ├── ResumeTemplates.jsx           # 8-Template Gallery
│   │   ├── AtsChecker.jsx                # ATS Scanner & Score Dashboard
│   │   ├── ResumeTheme.css               # Light & Dark Theme CSS Variables
│   │   └── dummyData.js                  # Initial Data & ATS Models
│   └── common/                          # Loaders & UI Helpers
├── context/
│   ├── AuthContext.jsx                   # User Session State
│   └── ThemeContext.jsx                  # Global Light/Dark Theme Context
└── App.jsx                               # App Router & Routes
```

---

<p align="center">
  Developed with ❤️ for <b>LernX Platform</b>
</p>

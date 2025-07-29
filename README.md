# Symptom Tracker App

The Symptom Tracker App is a full-stack web application that allows users to log health symptoms, view trends over time, receive AI-generated insights using Google's Gemini API, and export reports as PDF. Inspired by Truveta's mission to empower clinicians and patients with data-driven tools, this app simulates a self-monitoring solution to help identify symptom patterns, promote informed care decisions, and reduce inefficiencies in health tracking. It was developed to prepare for a Fullstack Software Engineer role listing at Truveta, showcasing expertise in full-stack development, AI integration, data visualization, and containerization.

---

## Project Summary

This project builds a responsive tool for tracking symptoms like headaches or fatigue, with severity ratings and notes. Key innovations include aggregated trend charts for visual analysis, real-time AI insights from Gemini (e.g., "High severity—consult a doctor"), and caching for performance. The backend handles CRUD operations with PostgreSQL and Redis, while the frontend uses React with Vite for fast development. Dockerized for easy deployment. Total development time: ~4-6 hours, using AI for code generation and prompt engineering.

---
<img width="513" height="712" alt="image" src="https://github.com/user-attachments/assets/2ed570c0-56de-4249-8b27-3a8ae9a32f1b" />

---

## Features

- **Symptom Logging:** Enter type, severity (1-10), notes; auto-timestamps.
- **CRUD Operations:** Edit/delete logs with cache invalidation.
- **Trends Visualization:** Line chart of average severity by date using Chart.js.
- **AI Insights:** Gemini analyzes recent symptoms for recommendations (e.g., "Monitor triggers").
- **PDF Export:** Generate reports of all logs using jsPDF.
- **Caching:** Redis optimizes queries for trends and lists.
- **Responsive UI:** Tailwind CSS with dark mode support.
- **Error Handling:** Basic validation and API error responses.

---

## Tech Stack

| Component  | Technologies                                             |
|------------|---------------------------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, Chart.js, jsPDF, Axios       |
| Backend    | Node.js, Express, PostgreSQL (pg), Redis, @google/generative-ai (Gemini) |
| DevOps     | Docker, Docker Compose, Git                              |
| Other      | AI prompt engineering for insights, nvm for Node management |

---

## Prerequisites

- Node.js (v22+ via nvm)  
- npm  
- PostgreSQL and Redis (local or Docker)  
- Google Gemini API key (from AI Studio)  
- Docker (for containerization)  

---

## Installation (Local Development)

### Clone the repo:
```bash
git clone https://github.com/Butlchr17/SymptomTracker.git
cd SymptomTracker
```

### Backend setup:
```bash
cd backend
npm install
```

Create \`.env\` file:
```
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/symptom_tracker
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_key
POSTGRES_PASSWORD=your_postgres_password
```

Create DB and schema:
```bash
createdb symptom_tracker
psql -d symptom_tracker -f db-init.sql
```

Start backend server:
```bash
node server.js
```

---

### Frontend setup:
```bash
cd ../frontend
npm install
npm run dev
```

Access frontend at: [http://localhost:5173/](http://localhost:5173/)  
Test: Log symptoms, view trends/insights.

---

## Docker Setup

Update root \`.env\` with required variables (e.g., \`POSTGRES_PASSWORD\`, \`GEMINI_API_KEY\`).

Run:
```bash
docker compose --env-file .env up --build
```

Access at: [http://localhost/](http://localhost/)  
Stop containers and clear data:
```bash
docker compose down -v
```

---

## Usage

- **Log Symptom:** Fill form and submit — appears in list.
- **Edit/Delete:** Buttons on each log.
- **View Trends:** Chart updates automatically.
- **AI Insight:** Refreshes with Gemini analysis.
- **Export PDF:** Button downloads logs.

---

## Development Notes

- **AI Integration:** Gemini-2.0-flash for insights; prompt: _"Analyze recent symptoms and provide recommendation."_
- **Agile Practices:** Step-by-step commits, simulated code reviews.
- **Challenges:** DB init in Docker, Tailwind v4 config — resolved with volume mounts and manual setups.
- **Portfolio:** Demonstrates Truveta skills: full-stack, cloud (Docker), AI coding assistants.

---

## Extensions

- User authentication (JWT).  
- Mobile app (React Native).  
- Real-time alerts (WebSockets).  
- Deploy to AWS (ECS with RDS/ElastiCache).

---

## License

MIT License — free to use and modify.

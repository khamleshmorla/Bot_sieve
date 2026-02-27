# BotSieve — AI Social Media Bot Detector

**BotSieve** is a real-time AI-powered platform that detects coordinated bot attacks, fake virality, and disinformation campaigns on social media.

## Features

- 🤖 **Bot Detection** — Heuristic scoring of account behavior patterns
- 📊 **Sentiment Analysis** — Real-time mood timeline via VADER NLP
- 🔗 **Cluster Detection** — DBSCAN-based bot network visualization 
- 🔥 **Spike Detection** — Z-score anomaly detection on post frequency
- 📋 **Explainability** — Why each trend was flagged (transparent AI)
- 📄 **Copy-Paste Detection** — TF-IDF similarity scanning for duplicate posts

## Tech Stack

**Frontend**: React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Framer Motion · Recharts  
**Backend**: Python · FastAPI · scikit-learn · VADER · pandas · uvicorn

## Quick Start

### Frontend

```bash
cd BotSieve-main
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## How It Works

1. Enter a hashtag or topic in the search bar
2. BotSieve's backend analyzes posting patterns, account behavior, and content similarity
3. The dashboard displays bot scores, sentiment trends, cluster maps, and suspicious accounts
4. The Explainability panel shows exactly **why** a trend was flagged

## Architecture

```
BotSieve-main/
├── src/             # React frontend
│   ├── components/  # Dashboard widgets
│   ├── services/    # API client
│   ├── hooks/       # TanStack Query hooks
│   └── pages/       # App pages
└── backend/         # FastAPI backend
    ├── routers/     # API endpoints
    └── services/    # ML analysis pipeline
```

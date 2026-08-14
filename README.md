# 🔍 ResearchAI — Academic Paper Assistant

ResearchAI is a web application that helps researchers, students, and academics search, organize, and analyze academic literature. It integrates with the Semantic Scholar API to provide fast paper discovery, and layers on top of it with tools for building collections, generating summaries, drafting literature reviews, and identifying research gaps.

## 📖 About the Project

Finding and organizing relevant academic papers is one of the most time-consuming parts of research. ResearchAI streamlines this process by combining a clean paper search interface with AI-assisted analysis tools, so users can go from "what has already been published on this topic?" to a structured literature review much faster.

The application is built as a full-stack project with a React (Vite) frontend and a Node.js/Express backend that proxies and manages requests to the Semantic Scholar API, including rate-limit handling and retry logic to keep searches reliable.

## ✨ Features

- **Paper Search** — Search millions of academic papers via Semantic Scholar, with filters for year range, field of study, open access, and sort order.
- **Papers Collected** — Save papers of interest to a personal collection for later reference.
- **Summaries** — Generate concise, digestible summaries of collected papers.
- **Literature Review** — Draft structured literature reviews from a user's paper collection.
- **Gap Analysis** — Identify potential gaps or under-explored areas across a collected set of papers.
- **Reliable API handling** — Built-in request throttling and exponential backoff to gracefully handle Semantic Scholar's rate limits.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| External API | Semantic Scholar Graph API |
| Styling | CSS |
| Deployment | Render |

## 🗂️ Project Structure

```
ai-research-assistant/
├── dist/               # Production build output (generated)
├── public/             # Static assets
├── src/                # React frontend source
├── server.js           # Express backend / Semantic Scholar API proxy
├── vite.config.js       # Vite configuration
├── package.json
└── .env                 # Environment variables (not committed)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- A free [Semantic Scholar API key](https://www.semanticscholar.org/product/api) (recommended, for higher rate limits)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/ai-research-assistant.git
cd ai-research-assistant
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
SEMANTIC_SCHOLAR_API_KEY=your_api_key_here
PORT=3001
```

### Running Locally

Run the backend and frontend in two terminals:

```bash
# Terminal 1 — Backend API proxy
node server.js

# Terminal 2 — Vite dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns, e.g. 5174 if 5173 is busy).

### Building for Production

```bash
npm run build
```

This outputs static files to `dist/`, which `server.js` serves automatically in production.

## 🌐 Deployment

This project is deployed on [Render](https://render.com) as a single web service that builds the frontend and runs the Express backend.

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
node server.js
```

**Environment Variables (set in Render dashboard):**
```
SEMANTIC_SCHOLAR_API_KEY=your_api_key_here
```

## 🔑 API Usage

ResearchAI uses the following Semantic Scholar Graph API endpoints:

- `paper/search` — main paper search
- `paper/{paper_id}` — full paper details (abstract, authors, fields of study)
- `paper/{paper_id}/citations` — citation graph
- `paper/{paper_id}/references` — reference list

Requests are throttled to respect Semantic Scholar's rate limits, with exponential backoff retry on `429` responses.

## 📄 License

This project is for educational/bootcamp purposes.

## 🙋 Notes

Built as part of a bootcamp project, using the Antigravity IDE for development.

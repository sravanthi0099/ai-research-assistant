import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const S2_BASE = 'https://api.semanticscholar.org/graph/v1';
const FIELDS = 'paperId,title,abstract,year,venue,authors,citationCount,referenceCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationTypes,externalIds';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let lastRequestTime = 0;

async function s2Fetch(url, retries = 3) {
  // Ensure at least 1 second between requests to respect rate limits
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await delay(1000 - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  for (let attempt = 0; attempt < retries; attempt++) {
    const headers = { 'User-Agent': 'AIResearchAssistant/2.0' };

    // Attach API key if one is configured in .env
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }

    const res = await fetch(url, { headers });

    if (res.status === 429) {
      const waitTime = Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited (429). Retrying in ${waitTime / 1000}s... (attempt ${attempt + 1}/${retries})`);
      await delay(waitTime);
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Semantic Scholar API error ${res.status}: ${text}`);
    }
    return res.json();
  }
  throw new Error('Rate limited by Semantic Scholar. Please wait a moment and try again.');
}

// ===== API Routes =====

// Search papers
app.get('/api/search', async (req, res) => {
  try {
    const { query, offset = 0, limit = 10, year, fieldsOfStudy, openAccess } = req.query;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    let url = `${S2_BASE}/paper/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}&fields=${FIELDS}`;
    if (year) url += `&year=${year}`;
    if (fieldsOfStudy) url += `&fieldsOfStudy=${fieldsOfStudy}`;
    if (openAccess === 'true') url += `&openAccessPdf`;

    const data = await s2Fetch(url);
    res.json(data);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get paper details
app.get('/api/paper/:paperId', async (req, res) => {
  try {
    const url = `${S2_BASE}/paper/${req.params.paperId}?fields=${FIELDS}`;
    const data = await s2Fetch(url);
    res.json(data);
  } catch (err) {
    console.error('Paper detail error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get citations
app.get('/api/paper/:paperId/citations', async (req, res) => {
  try {
    const { offset = 0, limit = 20 } = req.query;
    const url = `${S2_BASE}/paper/${req.params.paperId}/citations?offset=${offset}&limit=${limit}&fields=${FIELDS}`;
    const data = await s2Fetch(url);
    res.json(data);
  } catch (err) {
    console.error('Citations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get references
app.get('/api/paper/:paperId/references', async (req, res) => {
  try {
    const { offset = 0, limit = 20 } = req.query;
    const url = `${S2_BASE}/paper/${req.params.paperId}/references?offset=${offset}&limit=${limit}&fields=${FIELDS}`;
    const data = await s2Fetch(url);
    res.json(data);
  } catch (err) {
    console.error('References error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get recommendations
app.get('/api/recommendations', async (req, res) => {
  try {
    const { paperIds } = req.query;
    if (!paperIds) return res.status(400).json({ error: 'paperIds required' });
    const ids = paperIds.split(',');
    const url = `${S2_BASE}/paper/${ids[0]}/references?limit=10&fields=${FIELDS}`;
    const data = await s2Fetch(url);
    res.json(data);
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== Serve static frontend in production =====
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA catch-all — serve index.html for all non-API routes
// Express 5 doesn't support '*' wildcard in app.get; use middleware instead
app.use((req, res, next) => {
  // Only serve index.html for GET requests that aren't API calls
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ResearchAI Server running at http://localhost:${PORT}`);
  console.log(`   API proxy: http://localhost:${PORT}/api`);
  console.log(`   Frontend:  Serve via Vite dev server or build to dist/`);
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
    console.log(`   Semantic Scholar API key: loaded ✅`);
  } else {
    console.log(`   Semantic Scholar API key: NOT SET (using unauthenticated rate limits) ⚠️`);
  }
});
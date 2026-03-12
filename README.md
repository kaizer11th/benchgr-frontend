# BenchGR Frontend

React + Vite frontend for BenchGR GPU Benchmark Leaderboard.

## Deploy to Vercel

1. Push this folder as its own GitHub repo (e.g. `benchgr-frontend`)
2. Go to vercel.com → New Project → import `benchgr-frontend`
3. Vercel auto-detects Vite — don't change any settings
4. Add environment variable:
   - `VITE_API_URL` → your backend Vercel URL (e.g. https://benchgr-backend.vercel.app)
5. Deploy

## Local dev
```bash
npm install
npm run dev
```

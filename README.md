## TechMaa-AI Website (Static Frontend + Optional API)
Techmaa AI Innovations company project - website frontend modifications implemented.

### Frontend (pages)

The website pages are plain HTML in `frontend/`. Start a simple static server from that folder:

```bash
cd "TechMaa-AI-repo/frontend"
python3 -m http.server 5173
```

Open `http://localhost:5173/index.html`.

### Public API (optional, used by some pages/forms)

The frontend JavaScript calls a public API at `http://localhost:4000/api/public`.

Start it:

```bash
cd "TechMaa-AI-repo/techmaa-backend"
npm install
npm run dev   # or: npm start
```

#### MongoDB (optional)

If you want submissions/content persisted, create `techmaa-backend/.env`:

```bash
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/techmaa
JWT_SECRET=change-me
```

If `MONGO_URI` is not set, the API still starts and serves **sample jobs/posts** and stores submissions **in memory** (for local preview).


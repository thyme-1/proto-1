## Resident Dashboard Prototype (Retirement Home)

A deployable **senior-friendly resident dashboard** built with Next.js (App Router) + Tailwind.

### What’s included

- **Full-screen dashboard (`/`)**
  - Large **clock + date**
  - **Today’s meals** (breakfast/lunch/dinner)
  - **Today’s events / activities**
  - **Auto-rotating photo slideshow** (placeholder images in `public/photos/`)
  - **Highlights** the *next upcoming* event for today
  - Minimal, calm animations + respects “reduced motion” settings

- **Admin editor (`/admin`)**
  - Edits meals, events, and photo URLs
  - **Password-protected** via `ADMIN_PASSWORD`

### Data storage (MVP)

- Source-of-truth JSON: `data/dashboard.json`
- At build/dev time, it’s copied to: `public/data/dashboard.json`
  - This lets the UI load it client-side via `fetch("/data/dashboard.json")` (deployment-safe).
- Admin “Save” stores edits as a **local override in the browser’s localStorage** (works on static hosting).
  - To bundle changes for everyone, use **Download JSON** in `/admin` and replace `data/dashboard.json`.

### Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

### Deploy on Vercel

- Push this repo to GitHub.
- In Vercel, **Import Project** from GitHub.
- Add environment variable:
  - **`ADMIN_PASSWORD`**: your chosen password
- Deploy.

### Example live URL (placeholder)

`https://YOUR-VERCEL-DEPLOYMENT-URL.vercel.app`


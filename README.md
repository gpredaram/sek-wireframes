# SEK · Wireframes

Static wireframes (HTML + CSS + vanilla JS) for the SEK sites. No build, no
framework: served as-is. Deployed to Vercel in production.

🔗 **Production:** https://sek-wireframes-gpredarams-projects.vercel.app

## Structure

```
.
├── index.html                 # index / TOC: links to pages and modules
├── pages/
│   ├── bienvenida.html
│   ├── sek-education-group/    # SEK Education Group (simple 2-level menu)
│   │   └── la-institucion.html
│   └── sek-schools/            # SEK International Schools (overlaid double menu)
│       └── future-learning-model.html
├── modules/                   # standalone per-module HTMLs (agnostic names)
│   └── sek-<type>-NNN.html
├── shared/
│   ├── styles.css             # VISUAL SOURCE OF TRUTH — never duplicate styles
│   └── wireframe.js           # shared JS — never duplicate functions
├── vercel.json                # static, cleanUrls, cache headers
└── CLAUDE.md                  # project rules (read before generating any HTML)
```

## Key rules

- **No inline styles** — everything in `shared/styles.css`.
- **No duplicated JS functions** — everything in `shared/wireframe.js`.
- **Mobile-first**, 3 breakpoints: `<768px` · `768–1199px` · `≥1200px`.
- Grayscale, no visible annotations, gray placeholders (never emojis).
- Always import the shared assets by depth:
  - from `pages/<site>/`: `../../shared/`
  - from `modules/`: `../shared/`
- Full detail and Notion specs → [`CLAUDE.md`](./CLAUDE.md).

## Run locally

No build. Open `index.html` in the browser, or serve the folder statically:

```bash
python3 -m http.server 8000   # then http://localhost:8000
```

## Deployment

The repo is connected to Vercel: **every `push` to `main` redeploys automatically.**

```bash
git add -A && git commit -m "..."
git push origin main          # Vercel deploys on its own
```

The production URL does not change between deployments.
Test to see and upload.

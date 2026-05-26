# premxai.com v2

Personal portfolio for Prem Babu Kanaparthi. Inference Engineer — low-latency LLM serving, multi-model routing, cost-efficient production AI.

## Stack

- Next.js 16 (App Router) · React 19
- Tailwind CSS v4 (CSS-first `@theme`)
- Framer Motion (used sparingly)
- TypeScript
- Vercel Analytics
- Geist Sans / Geist Mono

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Structure

```
app/
  layout.tsx              # root + fonts + nav/footer
  page.tsx                # home (hero, selected work, experience, contact)
  globals.css             # design tokens (Tailwind v4 @theme)
  work/
    page.tsx              # all projects, grouped by category
    emotion-engine/       # research case study
    llm-routing/          # production case study
    packai/               # tooling case study
  about/                  # bio, education, stack
components/               # nav, footer, project-card, prose, section, metric
data/                     # site, projects, experience
lib/cn.ts                 # tailwind-merge helper
public/                   # resume.pdf, profile.png, og-image.png
```

## Content

All content lives in `data/*.ts`. Add a project by appending to `projects` in `data/projects.ts`. Set `hasCaseStudy: true` and create a directory at `app/work/<slug>/page.tsx` to get a dedicated page.

## Design

- Single warm-orange accent on near-black background.
- Mono font for metadata, sans for body and titles.
- Subtle radial-dot background grid.
- Hover states use a single underline + accent color shift; no aggressive motion.

## Deploy

Push to Vercel. Set the production domain to `premxai.com`.

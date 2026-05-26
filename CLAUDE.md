# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config extending `next/core-web-vitals` + `next/typescript`)

There is no test suite. Type errors surface via `tsc` during `next build` (no separate typecheck script).

## Architecture

This is a content-driven personal portfolio (Next.js 16 App Router, React 19, TypeScript, Tailwind v4). The structure splits cleanly into three layers — **data** (source of truth), **app routes** (pages), and **components** (presentation). Almost all updates should be a `data/*.ts` edit, not a component edit.

### Content as data

All site content lives in `data/*.ts` and is imported by pages:

- `data/site.ts` — name, role, tagline, email, social links. Used by `app/layout.tsx` for global metadata and the hero.
- `data/projects.ts` — the `projects` array. `featuredProjects` is the filtered subset shown on the home page.
- `data/experience.ts`, `data/publications.ts`, `data/skills.ts` — analogous lists rendered by home-page sections.

**Adding a project**: append to `projects` in `data/projects.ts`. It appears automatically on `/work` (grouped by `category`, ordered per `categoryOrder` in [app/work/page.tsx](app/work/page.tsx)). To surface it on the home page set `featured: true`. To give it a dedicated case study, set `hasCaseStudy: true` and create `app/work/<slug>/page.tsx` — `ProjectCard` then routes to `/work/<slug>` instead of the external `demo`/`repo` URL.

### Routes

- `app/page.tsx` — home (Hero, FeaturedWork, Experience, Publications, Contact composed inline as local functions).
- `app/work/page.tsx` — all projects, grouped by category.
- `app/work/<slug>/page.tsx` — long-form case studies. Each one uses `<CaseStudyHeader>` (which renders the project hero/thumb by looking up the slug in `projects`) followed by content composed from `<Section>`, `<Prose>`, `<Metric>`.
- `app/about/page.tsx` — bio.

### Styling system (Tailwind v4, CSS-first)

[app/globals.css](app/globals.css) is the single source of design truth. It uses `@theme` to expose tokens to Tailwind (`--color-bg`, `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`, `--color-accent`, `--color-border-strong`, etc.) which are themselves bound to plain CSS variables defined under `:root, [data-theme="dark"]` and `[data-theme="light"]`.

Two important conventions:

1. **Use the design tokens, not raw colors.** Components reference them as `text-[color:var(--color-fg-muted)]`, `bg-[color:var(--color-accent)]`, etc. Don't introduce new hex values in components — add a token in `globals.css` first.
2. **Theming is controlled by `next-themes` via the `data-theme` attribute** (configured in [components/theme-provider.tsx](components/theme-provider.tsx), default `dark`, `enableSystem={false}`). Light mode is fully defined in `globals.css`; any new color must have both dark and light variants there. The theme toggle uses a View Transitions circular wipe (`html.theme-wiping` + `theme-wipe-{x,y,r}` CSS vars set on click — see the `theme-wipe-in` keyframes in `globals.css`).

`container-page` and `container-prose` (defined as `@layer components`) are the standard width wrappers. `section-label` is the small mono uppercase label style used for `// section` headers. Class merging uses the [lib/cn.ts](lib/cn.ts) helper (`clsx` + `tailwind-merge`).

### Layout shell

[app/layout.tsx](app/layout.tsx) wires Geist fonts as CSS variables, applies the `ThemeProvider`, and renders `<Nav>` / `<main>` / `<Footer>`. Two decorative components — `<GradientDescentBackground>` and `<SkillsMarquee>` — are wrapped in `<HomeOnly>`, a client component that reads `usePathname()` and returns `null` off the home route. When adding a home-only flourish, follow that pattern rather than mounting it from `app/page.tsx`.

### Path alias

`@/*` resolves to the repo root ([tsconfig.json](tsconfig.json)) — use `@/components/...`, `@/data/...`, `@/lib/...` rather than relative paths.

### Public assets

`public/resume.pdf`, `public/profile.png`, `public/og-image.png`, `public/mountains.png`. The mountains image is reused for both themes via a CSS `filter: invert(...)` flip in light mode (`.mountains-image` rule in `globals.css`).

## Conventions

- Framer Motion is in deps but used sparingly — prefer CSS transitions and the existing hover patterns (single underline / accent color shift) over new animation primitives.
- Mono font (`var(--font-mono)`) for metadata, dates, labels, and small UI text; sans for body and titles.
- All external links use `target="_blank" rel="noopener noreferrer"`.

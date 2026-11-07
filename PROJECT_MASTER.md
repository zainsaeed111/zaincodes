# ZainCodes — PROJECT_MASTER.md

> **Single source of truth for the ZainCodes website upgrade.** This document consolidates the eight audit/planning documents supplied by the owner. It is designed to live at the repository root as `PROJECT_MASTER.md`. The sections below include both operational instructions for Cursor and the full original audit material for traceability.
>
> **Baseline:** audit dated 2026-11-06. Findings reflect that snapshot of the codebase; recheck actual source before editing. The app was **not** implemented or tested merely by generating this file.

## 0. Permanent working agreement (read on EVERY Cursor session)

1. **One markdown document only:** `PROJECT_MASTER.md` is the one authoritative planning, guidelines, decisions, progress, testing, issue tracking and changelog document for this upgrade. Do **not** create separate phase reports, `.md` changelogs, architecture decision files, or new audit docs. Keep all status updates in this same file. Existing `README.md` or third-party docs required by tooling are not part of this project planning rule; do not gratuitously alter them.
2. **Inspect before changing:** Read this document and the actual relevant repository code. If the two disagree, code is evidence of present behavior; record the discrepancy here before proceeding. Never assume an older report is live fact.
3. **Work incrementally:** Execute only the active authorized phase and its dependencies. Do not implement all ten phases in one uncontrolled pass. Prefer small, verifiable slices; avoid big-bang rewrites.
4. **Safety first:** Preserve all existing data, content, projects, slugs and working user flows. Make a rollback point/commit and data export prior to schema changes. Never reset production DB, force-push, delete assets or overwrite remote content without explicit owner approval. Never place secret values in docs, logs, commits or client bundles.
5. **Implementation is required:** Do not just generate another strategy or documentation. Once prerequisites are available, make working code changes, run available checks, and report actual outputs. Distinguish PASS / FAIL / BLOCKED / NOT RUN. No unverified claims.
6. **Security gate:** New privileged operations must have server-enforced authentication, authorization and validation before they are made accessible. Immediately flag any previously exposed credentials for owner rotation/revocation. Do not reproduce credentials.
7. **Admin-first dynamic content:** All owner-managed public content should use real centralized persistence and protected admin management; do not build new localStorage or browser GitHub-token CMS mechanisms.
8. **Design gate:** 'Editorial Engineering' visual direction: original, calm, premium, meaningful motion, no neon/glow/glass template look, distinct web/mobile presentations and genuinely excellent responsive behavior.
9. **SEO gate:** prioritize indexable, original, human-readable pages for web development, full-stack development, and mobile app development. Do not claim search engine ranking is guaranteed.
10. **Every work session:** read this document → select next incomplete dependency-ready task → inspect relevant code → implement → run tests → update *only this document* (status, decisions, changed code paths, test evidence, blockers, next task) → concise summary to owner. If a needed service credential or deployment decision is missing, finish safely executable work and mark the external step BLOCKED rather than inventing completion.
11. **Do not silently change architecture:** Current recommended direction is incremental Next.js App Router + Postgres + object storage, *subject to actual deployment/credentials check*. A different approach requires a written tradeoff and decision here.
12. **Do not create fake content:** Do not invent project results, client testimonials, career claims, fake screenshots, fake articles, SEO outcomes, contact-delivery success, or a resume PDF. Preserve and clearly identify placeholders until real assets arrive.
13. **For this document:** On repository integration, consolidate any lingering `docs/upgrade-plan/01-...08-...md` information into here first. Only then archive/remove the redundant planning markdown files **after confirming content parity and owner permission**. Avoid multiple competing planning sources.

## 0.1 Snapshot: highest-risk verified findings

- React 19 + CRA (`react-scripts`) + React Router 7 + custom CSS; no real backend or database in the audited snapshot.
- Browser-only admin auth; client-side default password material and forgeable `sessionStorage` session.
- GitHub PAT handling in browser/localStorage / potential bundled `REACT_APP_*` secret; client pushes to production branch.
- Resume stored as Base64 only in uploader's browser; public fallback is a placeholder stub.
- Contact form displays simulated success but does not actually deliver messages.
- Project admin field-name remapping can drop links and case-study content; content sync can overwrite real edits.
- Eight existing projects, mostly placeholder/Unsplash media, one screenshot each; limited mobile gallery controls.
- No blog CMS, primary service landing pages, sitemap or route-specific server-rendered metadata.

## 0.2 Product outcomes / definition of done

The successful website will have: secure server auth and protected CRUD; durable CMS-managed hero/about/services/skills/experience/education/projects/categories/blog/resume/contact/social/footer/SEO; accessible media gallery and differentiated web/mobile mockups; premium custom visual design and motion; a real contact channel and configured WhatsApp action; crawlable service, case-study and blog pages with proper SEO; accessible responsive UX; and documented test results. **A polished UI without working backend/security does not meet this definition.**

## 0.3 Phase board (Cursor must update this in place)

| Phase | Scope | Status | Gate |
|---|---|---|---|
| 1 | Audit and architecture | VERIFIED COMPLETE (owner authorized Phase 2) | Owner accepts architecture; verify live stack/deployment |
| 2 | Secure backend, database, auth and data migration | VERIFIED COMPLETE (local foundation) | No browser secrets, server auth enforced, seeded content verified |
| 3 | Admin CMS, media, resume and publishing | IN PROGRESS (local CRUD live) | Persisted admin change appears for clean public visitor |
| 4 | Premium design system | IN PROGRESS (container/spacing/buttons/light theme refined) | Consistent tokens, non-generic UI, reduced motion |
| 5 | Homepage, real CTAs, loader, WhatsApp | IN PROGRESS (balanced hero + nav theme toggle) | Responsive hero, real WhatsApp/contact paths |
| 6 | Web/mobile project galleries, case studies | IN PROGRESS (DB taxonomy + shareable filters + full-width grid) | Gallery matrix & media management pass |
| 7 | Crawlable service pages and technical SEO | IN PROGRESS (7 service SSR pages incl. custom/desktop) | Unique SSR metadata, sitemap, schema, no thin pages |
| 8 | Blog CMS and publish workflows | VERIFIED COMPLETE (local + live Neon) | Draft private; published indexable; content sanitized |
| 9 | Performance, accessibility and responsiveness | IN PROGRESS (responsive CSS + error pages; Lighthouse NOT RUN) | Evidence-backed Lighthouse/axe/device checks |
| 10 | E2E QA and safe launch | IN PROGRESS (Vercel + CF live; R2 still skipped) | Staging sign-off, rollback verified, live smoke tests |

Statuses: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `VERIFIED COMPLETE`. Never mark complete on implementation alone.

### Local development (authoritative)

| App | Command | URL | Notes |
|---|---|---|---|
| Legacy CRA portfolio (unchanged) | `npm run start` or `npm run dev:cra` from repo root | `http://localhost:3000` (CRA default) | Do not remove; comparison baseline |
| New Next.js foundation | `npm run dev:web` from root, or `npm run dev` inside `web/` | **`http://localhost:3001`** | Hot reload via Next/Turbopack |
| Admin smoke UI | same Next server | **`http://localhost:3001/admin`** | Server auth only |
| Public projects API | same | `http://localhost:3001/api/projects` | No secrets |

**Database (local):** PGlite file DB at `web/.data/pglite` (Postgres-compatible). Docker was **not** available on this machine; system PostgreSQL 17 is running on `:5432` but credentials were unknown, so PGlite is the zero-config local path. `docker-compose.yml` is prepared for optional Postgres on host port **5433** when Docker is installed — never production.

**Seed:** `npm run seed:web` (upsert from `src/data/portfolioData.json`, safe/repeatable).  
**Backup:** `npm run backup:web` → `backups/pglite-*`.  
**Tests:** `npm run test:web` (Vitest).  
**Smoke:** `npm run smoke:web` (requires Next on `:3001`).  
**Admin bootstrap credentials:** stored only in gitignored `web/.env.local` (`ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`). Do not commit.  
**Storage:** local driver `web/.data/uploads` via `/api/media/...` and `/api/resume`. Cloudflare R2 adapter ready; **BLOCKED** on free path (R2 API needs card). Uploads on Vercel are **not durable** across instances — CMS text/projects/blog use Neon.  
**Cloudflare Workers:** Live at `https://zaincodes.zaincodes.workers.dev` (OpenNext + Hyperdrive + Neon). Keep-alive cron Worker `zaincodes-keepalive` every 5m.  
**Production (Vercel):** `https://www.zaincodes.tech` (aliased) — Neon Postgres, admin CMS dynamic via `revalidatePath`, Hobby daily cron + CF keep-alive for Neon wake.

## 0.4 Immediate implementation order (start here, not from scratch)

1. **Safety preparation** — inspect repo and hosting configuration; note current git state; make a local checkpoint/branch, record route/project counts; backup existing `src/data/portfolioData.json`; avoid committing or printing secrets; if credential exposure is possible, prominently request owner revoke/rotate GitHub PAT and default admin credentials.
2. **Decision check** — confirm deployment target from actual config or report uncertainty; make the incremental Next.js + Postgres + storage solution work on a **preview/staging** environment instead of replacing production at once. If hosted service credentials are absent, build secure local scaffolding and mark cloud verification blocked.
3. **Phase 2 in slices** — scaffold SSR app without deleting CRA; DB schema + non-destructive migrations; JSON seed mapping for all eight projects and case-study fields; protected auth and APIs; tests that anonymous writes return 401/403; no PAT in frontend build. Preserve a rollback route.
4. Only after Phase 2 tests pass, progress to Phase 3. Build real admin persistence and file uploads before cosmetic frontend work. Keep the gallery/resume/contact public journeys functional as they migrate.
5. Continue phases 4–10 in the board order. Phase 7 SEO architecture should influence routing from the start, even though its content launch comes later.

## 0.5 Required evidence on each completed slice

Update this document with: date; phase/task; why; actual changed **source-code** files; data migration or environment *key names only*; build/lint/test command and observed result; browser/manual verification and result; impact/risks; rollback reference; next action. Use this compact template:

```text
### YYYY-MM-DD — Phase N / task
Status: IN PROGRESS | BLOCKED | VERIFIED COMPLETE
Changed code files: ...
Implementation: ...
Tests: [PASS/FAIL/BLOCKED/NOT RUN] command + actual result
Data/SEO/Security checks: ...
Risks / external actions: ...
Rollback: ...
Next: ...
```

## 0.6 Open decisions / external prerequisites

- Hosting of record: Vercel vs Netlify vs both **unconfirmed by audit**.
- Database provider, storage bucket, email delivery and bot protection: not yet provisioned in supplied audit.
- Existing browser-exposed GitHub PAT/default admin credential: **owner action** required to rotate/revoke; do not paste values into Cursor.
- True project screenshots and resume asset: supplied audit says most images are placeholders and public resume is a stub; user-provided real media is required for factual portfolio quality.
- Design direction: proposed `Editorial Engineering` is a baseline; keep brand ZainCodes as hero signal and follow first-viewport rules.
- SEO page plan must be supported by actual services and case studies; SEO placement/rank cannot be guaranteed.
- **Local DB choice:** PGlite active; optional Docker Compose Postgres ready but Docker not installed. Owner may later provide local Postgres password to switch off PGlite.
- **Cloud object storage / email / Turnstile:** not provisioned — marked BLOCKED; local storage + auth foundations work without them.
- Owner permission still pending to archive/remove `docs/upgrade-plan/*.md`.

## 0.7 Unified change log (append entries here only)

### 2026-11-08 — Portfolio container + compact filter UI regression fix
Status: VERIFIED COMPLETE (local only — not deployed)
Root cause: `.pg-shell` on the same node as `.container` forced `max-width:100%` / full width, killing gutters.
Changed code files: `globals.css`, `ProjectsIndex.tsx`, `WorkShowcase.tsx`, `project-taxonomy.ts` (`shortTypeLabel`)
Implementation: Shared container max 1320px + `calc(100% - 2*gutter)` with gutters 18→28→48–64px. Removed MAIN CATEGORY / 01–02 / repeated Client·Freelance on cards. Compact All/Client/Freelance segment + short type chips (dropdown &lt;900px); subtle Copy link. Same 2-col grid when filtering; single match stays one track (~half width), 16:10 banners.
Verify (CDP 1440): containerLeft≈58, width≈1309, 2×643 cols; `?type=web` single card 643 / ratio 1.6. No production deploy.
Next: owner visual check; deploy only on approval.

### 2026-11-08 — Two-level DB taxonomy + shareable filters + full-width gallery
Status: VERIFIED COMPLETE (local only — not deployed)
Changed code files:
- `web/src/db/schema.ts`, `web/src/db/client.ts` (SCHEMA v6: `project_types`, `project_type_links`, `needs_group_review`; additive migrations always re-run)
- `web/src/lib/project-taxonomy.ts`, `web/src/lib/project-types.ts`, `web/src/lib/content.ts`
- `web/src/app/api/admin/projects/route.ts`, `[id]/route.ts`, `api/admin/project-types/route.ts`
- `web/src/components/ProjectsIndex.tsx`, `WorkShowcase.tsx`, `admin/page.tsx`, `projects/page.tsx`
- `web/src/app/globals.css` (full-width `.pg-grid--gallery`, compact `.pg-filters`; removed only-child half-width cap)
- `web/tests/project-taxonomy.test.ts`, `web/scripts/migrate-taxonomy.mjs`
Implementation: Default mains Client & Company / Freelance & Personal; 7 default DB subcategories + custom; multi-select type links; safe legacy remap (web→web-development, android/flutter/mobile→mobile-app-development) without inventing ownership; unassigned stays in All Projects + admin review flag; shareable `/projects?group=&type=` (aliases web/mobile/full-stack/ai); filtered pages `noindex` + canonical `/projects`; homepage featured + filter chips; CMS `revalidatePath` on save.
Verify: Vitest 29 PASS; `/api/projects` count=8 with typeSlugs; CDP 1440 → container 1425, 2 cols ~700px, banner 16:10 (1.6); `?group=client-company&type=mobile` → 2 projects; `?type=ai` empty state; mobile 1-col. No production deploy.
Next: owner can refine multi-subcategory assignments / featured flags in Admin; deploy only on approval.

### 2026-11-07 — Main category + separate subcategory lanes
Status: SUPERSEDED by 2026-11-08 DB taxonomy + full-width gallery

### 2026-11-07 — Fix project gallery left-column collapse
Status: SUPERSEDED by 2026-11-08 full-width `.pg-grid--gallery` (removed only-child half-width cap)
Root cause: (1) per-discipline lanes each made a 2-col grid so single-item lanes left an empty right column; (2) `aspect-ratio` + `max-height` on `.pbanner-stage` could shrink banner width.
Changed code files: `WorkShowcase.tsx`, `ProjectsIndex.tsx`, `globals.css`
Implementation: One continuous `repeat(2, minmax(0, 1fr))` grid per Client/Personal chapter; discipline tags on cards + chapter legend; listing banners forced to 16:10 with `width:100%` and no max-height; Reveal wrappers `.pg-grid-item { width:100% }`; 1-col ≤768px.
Verify (CDP): 1440 → container 1280, Client grid children 2 at 628px each (Campus left / Baby SOS right), stages 16:10 (~627×392); 390 → 1 column. Vitest 23 PASS; `npm run build` PASS.
Next: none for layout; deploy only on approval.

### 2026-11-07 — Digital Craft UI + restore Client/Personal chapters
Status: VERIFIED COMPLETE (local only — not deployed)
Changed code files:
- `WorkShowcase.tsx`, `ProjectsIndex.tsx`, `project-taxonomy.ts` (chapters restored; empty contexts hidden)
- `ServicesShowcase.tsx` (compact index + shared preview)
- `SkillsShowcase.tsx` (editorial lanes, no %, related links)
- `CategoryGlyph.tsx`, `globals.css` (cool-white light tokens, smaller banners via `--banner-max-h*`)
- Case study eyebrow restored to `Client/Personal · discipline`
Implementation: Categories/subcategories returned using real `workContext` + discipline lanes. Thumbnail banners capped (~148–220px). Light mode cool-white/ink/ZainCodes-blue. Services interactive board. Skills denser.
Tests: [PASS] vitest 23; production `npm run build` PASS; home/projects show Client & Personal chapters, no empty chapter copy; banner sizes reduced via CSS max-height.
Next: deeper Hero/About/Contact/Blog polish if owner wants; deploy only on approval.

### 2026-11-07 — Banner-first admin-controlled project showcase
Status: VERIFIED COMPLETE (local only — not deployed)
Changed code files:
- `web/src/db/schema.ts`, `web/src/db/client.ts` (v5 showcase columns)
- `web/src/lib/showcase.ts`, `web/src/lib/project-showcase-schema.ts`, `web/src/lib/content.ts`, `web/src/lib/project-taxonomy.ts`
- `web/src/components/ProjectBanner.tsx`, `WorkShowcase.tsx`, `ProjectsIndex.tsx`
- `web/src/app/portfolio/[slug]/page.tsx`, `web/src/app/admin/page.tsx`
- `web/src/app/api/admin/projects/route.ts`, `[id]/route.ts`
- `web/src/app/globals.css` (`.pg-*` / `.pbanner-*`)
- `web/tests/showcase.test.ts`, `web/tests/foundation.test.ts` (cleanup draft tmp projects)
Implementation: Removed phone/chapter empty UI. Flat 2-col banner gallery. Modes A–D (static/slideshow/video/custom), scroll webpage preview, admin Media & Showcase Settings persisted to DB. Case-study hero uses `ProjectBanner`.
Tests: [PASS] `npm test` → 23 passed (incl. 5 showcase). Unauthorized admin PATCH/POST → 401. Authenticated PATCH showcaseMode slideshow→static persists; public API reflects. `/api/projects` count=8. Home + `/projects` + case study: no “Nothing in this chapter”, no phone frames, `pg-grid`/`pbanner` present.
Data/SEO/Security: schema v5 columns via ensureSchema; admin writes guarded; no production deploy.
Risks: scrolling preview is CSS animation (pause on hover/reduced-motion); inline muted video only for direct uploads when autoplay+in-view.
Rollback: revert listed files; columns are additive/defaulted.
Next: owner uploads real banners/videos in Admin; approve deploy when ready.

### 2026-11-07 — Fix empty /projects chapters
Status: SUPERSEDED by banner-first showcase
Changed code files: `web/src/app/projects/page.tsx` (server `listPublishedProjects`), `web/src/components/ProjectsIndex.tsx`
Implementation: `/projects` was client-fetch-only so chapters rendered empty when JS/fetch lagged. Now SSR loads published projects into ProjectsIndex.
Verify: browser `/projects` shows Client (Campus Insight, Baby SOS) + Personal chapters with device frames.

### 2026-11-07 — Premium modular showcase + light theme (local)
Status: VERIFIED COMPLETE (local build PASS; no prod deploy)
Changed code files: `web/src/lib/project-taxonomy.ts` (`resolvePreviewFrame`, `presentationKind`), `web/src/components/ProjectMediaPreview.tsx`, `web/src/components/WorkShowcase.tsx`, `web/src/app/projects/page.tsx`, `web/src/app/portfolio/[slug]/page.tsx`, `web/src/app/globals.css` (light neutrals, `wk-*` modular layouts, device frames, case study)
Implementation: Killed stretched banner default. Auto phone/browser/stack frames by discipline. Showcase uses phone rail / web feature+grid / product rows. Light theme warmer editorial neutrals + stronger contrast. Case study hides empty link blocks; constrained hero media. CMS unchanged.
Tests: `npm run build` PASS. Local preview `http://localhost:3001`.
Next: owner review locally; deploy only when approved.

### 2026-11-07 — Editorial work showcase redesign
Status: SUPERSEDED by modular showcase pass
Changed code files: `web/src/components/WorkShowcase.tsx`, `web/src/app/projects/page.tsx`, `web/src/app/globals.css` (`wk-*` system)
Implementation: Removed nested card/gradient patch UI. Typography-led chapters (Client / Personal), quiet discipline labels, media-first lead + hairline stack rows. Admin taxonomy unchanged (dynamic).
Next: owner visual check on live home + /projects.

### 2026-11-07 — Work sections premium polish (no filter bar)
Status: SUPERSEDED by editorial redesign
Changed code files: `web/src/app/globals.css` (context/discipline premium + responsive), `web/src/components/WorkShowcase.tsx`, `web/src/app/projects/page.tsx`, admin projects help copy
Implementation: Kept section alignment; upgraded depth/hover/mobile. Admin remains source of truth for workContext + category + categoryIcon (revalidate on save).
Next: owner can add custom disciplines anytime from admin.

### 2026-11-07 — Premium resume + project taxonomy showcase
Status: VERIFIED COMPLETE (local smoke; deploy next)
Changed code files: `web/src/lib/project-taxonomy.ts`, `web/src/components/WorkTaxonomyFilters.tsx`, `web/src/components/WorkShowcase.tsx`, `web/src/app/projects/page.tsx`, `web/src/components/AboutSection.tsx`, `web/src/components/SiteHeader.tsx`, `web/src/db/schema.ts`, `web/src/db/client.ts` (v3 + `work_context`), admin/API project routes, `web/src/app/globals.css`
Implementation: Dual filters — Built for (client/company vs personal/freelance) + Discipline (web/mobile/desktop/fullstack/backend). Admin CMS fields wired. Premium resume CTA. Schema migrate `work_context`.
Tests: local `/api/projects` 200 with workContext; seed 8 projects.
Next: Vercel prod deploy after local confirm.

### 2026-11-07 — Vercel production + Neon keep-alive + dynamic admin
Status: VERIFIED COMPLETE (live smoke; free path)
Changed code files: `web/next.config.ts` (skip OpenNext Hyperdrive init on Vercel), `web/src/db/client.ts`, `web/vercel.json` (Hobby-safe daily cron), `web/scripts/vercel-set-env.mjs`, `web/src/lib/cms-revalidate.ts`, `web/src/app/api/cron/keep-alive/route.ts`, `web/workers/keep-alive.js`, `.github/workflows/keep-alive.yml`
Implementation: Linked Vercel project `zaincodes`; pushed Neon/auth/CRON env; prod deploy aliased to `www.zaincodes.tech`. Neon free cannot disable suspend — CF Worker cron `*/5` pings `/api/health` on Vercel + Workers. Admin CMS writes revalidate public paths (no redeploy for content).
Live checks: `/` `/blog` `/admin` `/api/health` `/api/content/home` `/api/projects` **200** (postgres). Keep-alive Worker deployed `zaincodes-keepalive.zaincodes.workers.dev` schedule `*/5 * * * *`.
Risks: image/resume uploads still local driver (not durable on Vercel); R2 remains blocked without card. Hobby Vercel cron is once/day only — 5-min keep-alive is CF Worker (and optional GH Actions when pushed).
Rollback: Vercel dashboard → previous deployment; CF Workers → prior version; Neon data intact.
Next: optional durable media (R2 when free/card ok); push GH keep-alive workflow; Lighthouse Phase 9.

### 2026-11-07 — Free Neon DB + Cloudflare blog wire
Status: VERIFIED COMPLETE (free Neon + Hyperdrive + Workers; no card/R2)
Changed code files: `web/src/db/client.ts` (Neon HTTP + schema skip), `web/src/lib/blog/sanitize.ts` (Workers-safe, no jsdom), `web/wrangler.jsonc` (Hyperdrive), `web/scripts/cf-with-neon-env.mjs`, `web/scripts/migrate-neon.mjs`
Implementation: Created free Neon project `zaincodes`; migrated+seeded; Hyperdrive `zaincodes-db`; Worker secrets DATABASE_URL; redeployed.
Live checks: `/` `/blog` `/api/health` **200** (postgres); `/admin` after sanitizer fix. Image uploads still local-driver (R2 skipped).
Next: optional R2 only if owner accepts $0 enable; rotate Neon password if URI leaked in agent logs.
Rollback: remove Hyperdrive binding; unset DATABASE_URL secret; local PGlite remains.

### 2026-11-07 — Free Cloudflare Workers deploy (no paid / no card)
Status: VERIFIED COMPLETE (Workers live; durable DB/R2 intentionally skipped)
Changed code files: `web/wrangler.jsonc` (no R2), `web/open-next.config.ts` (avoid cloudflare:sockets), `web/scripts/register-workers-subdomain.mjs`
Implementation: Registered free `workers.dev` subdomain `zaincodes`; OpenNext deploy; secrets AUTH_SECRET + admin bootstrap uploaded. No R2 purchase, no credit card.
Tests: Live `https://zaincodes.zaincodes.workers.dev/` → **200**; `/api/health` → **503** (expected without durable Postgres on Workers FS).
Limits: Blog/admin durable persistence still local (`localhost:3001` PGlite). Workers free host is for public site presence; full CMS durability needs free Neon later (optional, not paid CF R2).
Next: optional free Neon DATABASE_URL only when owner wants durable cloud CMS — still no card/R2 required for basic Workers hosting.
Rollback: `npx wrangler delete zaincodes`

### 2026-11-07 — Cloudflare Agent Setup (Cursor)
Status: VERIFIED COMPLETE (skills + MCP config; restart required for MCP tools)
Changed code files: `.cursor/mcp.json`, project `.agents/skills/*` (22 Cloudflare skills), user `~/.cursor/mcp.json`, user `~/.agents/skills/*`
Implementation: Followed https://developers.cloudflare.com/agent-setup/prompt.md for Cursor — skills via `npx skills add cloudflare/skills`, MCP `https://mcp.cloudflare.com/mcp`. Optional `cf` CLI not installed (ask owner).
Tests: 22 project skills present; MCP JSON written. Cloudflare MCP tools not in current session until agent restart + OAuth.
Next: restart Cursor agent; enable R2 in dashboard; then continue Workers deploy.
Rollback: remove `.cursor/mcp.json` / `.agents/skills` / user copies.

### 2026-11-07 — Cloudflare Workers + R2 setup (R2 not enabled)
Status: BLOCKED — Wrangler OAuth OK; R2 product not enabled on account
Changed code files: `web/wrangler.jsonc`, `web/open-next.config.ts`, `web/next.config.ts` (OpenNext init), `web/package.json` (+`cf:*` scripts, `@opennextjs/cloudflare`, `wrangler`), `web/scripts/setup-cloudflare-r2.mjs`, `web/.env.example`, `web/.gitignore`, root `package.json` cf scripts
Implementation: OpenNext Cloudflare Workers deploy path + R2 bucket names `zaincodes-media` / preview; R2 setup script; local CRA/Next unchanged on `:3001`.
Tests: `wrangler login` **PASS** (account `503153818e90769583cd4c7538028c6c`); `wrangler r2 bucket create` **FAIL** API 10042 “Please enable R2 through the Cloudflare Dashboard”. Deploy not run.
Blockers: (1) Owner opens Chrome R2 overview and enables R2 (2) Neon/Supabase `DATABASE_URL` (3) R2 API token → `S3_*` secrets (4) `npm run cf:setup-r2` + `npm run cf:deploy`
Next: owner enables R2 in dashboard; then create buckets + secrets + deploy.
Rollback: remove OpenNext/wrangler deps and cf configs; keep local PGlite.

### 2026-11-07 — Launch verification + durability adapters (pre-approval)
Status: BLOCKED for production (local PASS; durable hosting not provisioned)
Changed code files: `web/src/db/client.ts` (Postgres via `DATABASE_URL`), `web/src/lib/storage/s3.ts`, `web/src/lib/storage/index.ts`, `web/src/lib/blog/revalidate.ts`, `web/src/lib/log.ts`, `web/src/app/api/health`, `web/src/app/error.tsx`, `global-error.tsx`, `not-found.tsx`, `blog/error.tsx`, blog admin unpublish + API revalidation, `robots.ts`, `sitemap.ts` dynamic, `vercel.json` (removed CRA SPA rewrite), `web/vercel.json`, `.env.example`, `scripts/launch-acceptance.mjs`, `globals.css` blog responsive
Implementation: Dynamic DB-backed publish with `revalidatePath` (no redeploy for posts); error boundaries so blog failures don’t crash site; health endpoint; S3/R2 + Postgres adapters ready when credentials exist; local still PGlite+local disk.
Tests: Vitest blog **10/10 PASS**; curl E2E draft→preview→publish→sitemap→unpublish→404 **PASS**; home/services/portfolio/category/robots **200**; `npm run build` **PASS**; `/api/health` reports `productionPersistenceReady:false` on local.
GitHub/preview: release branch prepared locally; **no production merge/deploy**; durable Neon/R2 (or equivalent) **not configured**.
Blockers: Owner must provision free-tier Postgres + object storage + set Vercel Root Directory=`web` + env vars before READY.
Next: owner creates Neon+R2 (or approved free tiers), adds env on Vercel preview, approve push/preview; then re-run acceptance against preview.
Rollback: keep using local PGlite; revert release branch.

### 2026-11-07 — Phase 8 Blog CMS + SEO + traffic (local)
Status: VERIFIED COMPLETE (local only; no production deploy)
Changed code files: `web/src/db/client.ts`, `web/src/db/schema.ts`, `web/src/lib/blog/*`, `web/src/components/admin/Blog*.tsx`, `web/src/app/admin/page.tsx`, `web/src/app/blog/**`, `web/src/app/api/admin/blog/**`, `web/src/app/api/admin/integrations/**`, `web/src/app/api/blog/**`, `web/src/app/sitemap.ts`, `web/src/app/globals.css`, `web/tests/blog.test.ts`, `.env.example`
Implementation: TipTap editor (ChatGPT paste sanitize, formatting, image upload, autosave); drafts/preview/schedule/revisions/restore/duplicate; categories+tags; public `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, RSS, sitemap, BlogPosting JSON-LD, slug redirects; SEO checklist in admin; GSC/GA4 stay **disconnected** until OAuth; traffic + setup panels; monetization config off by default; schema migrate `phase8-blog-cms-v2`.
Tests: Vitest blog **10/10 PASS**; live API create draft → publish → public 200; draft slug **404**; upload kind=blog **ok**; preview admin **200**; integrations `gsc/ga4=disconnected`, monetization `enabled=false`; `npm run build` **PASS**.
Local URLs: `http://localhost:3001/blog`, `/blog/paste-test-clean-architecture`, `/admin` (Blog / Blog traffic / Blog setup), `/blog/rss.xml`, `/sitemap.xml`.
Blockers: Google OAuth not authorized (expected); no production deploy.
Next: Phase 9 CWV/a11y; authorize GSC/GA4 when owner provides Google Cloud OAuth env.
Rollback: hide `/blog` nav; leave data; revert listed files.

### 2026-11-07 — Footer social icons + theme toggle fix
Status: VERIFIED COMPLETE (local)
Changed code files: `SiteFooter.tsx`, `SocialGlyph.tsx`, `ThemeProvider.tsx`, `ThemeToggle.tsx`, `ContactSection.tsx`, `admin/page.tsx` (social form), `globals.css`
Implementation: Footer icon row from CMS social links; admin name/URL rows instead of JSON; theme button is circular and toggles light↔dark in one click (no system no-op).
Tests: `/` **200** with `footer-social`, GitHub/LinkedIn present.
Next: CWV still open.

### 2026-11-07 — About editorial + hero availability status
Status: VERIFIED COMPLETE (local)
Changed code files: `AboutSection.tsx`, `HeroStage.tsx`, `page.tsx`, `globals.css`, `schema.ts`/`client.ts` (`badge_enabled`), `api/admin/content`, `admin/page.tsx`, `portfolioData.json`, `seed.ts`
Implementation: Removed About service cards; credibility strip from CMS data; inline conversation CTA + resume text link; hero availability badge editable + enable/disable; default copy “Available for Web, Full-Stack & Mobile Projects”.
Tests: `/` **200**; HTML has availability badge, `about-cred`, `about-cta-inline`; no `about-pillars`.
Next: CWV still open.

### 2026-11-07 — Services editorial rows redesign
Status: VERIFIED COMPLETE (local UI + CMS fields)
Changed code files: `ServicesShowcase.tsx`, `globals.css` (svc-rail/svc-row), `schema.ts` + `client.ts` (capabilities/href), `api/admin/services`, `admin/page.tsx`, `page.tsx`, `seed.ts`
Implementation: Removed card grid. Five full-width interactive rows (number, title, summary, middot capabilities, hover preview art, arrow CTA). CMS fields for title/summary/capabilities/href/status/sortOrder. Light+dark + mobile stack. Homepage soft-fails if DB warming.
Tests: `/` **200**; HTML has `svc-rail`/`svc-row`/`svc-preview`, no `svc-grid`/`svc-card`; restored PGlite from backup after lock abort then re-seeded.
Next: CWV still open.
Rollback: prior ServicesShowcase + CSS in git history.

### 2026-11-07 — Admin project media uploads (cover / multi shots / video)
Status: DONE (local :3001)
Changed code files: `admin/page.tsx` (upload UI), `api/admin/uploads`, `lib/storage/*`, `lib/media.ts` (relative `/api/media` video), `globals.css`
Implementation: Projects admin can **upload** cover image, **multiple screenshots**, and **mp4/webm video** (or still paste URLs). Files stored under `.data/uploads/projects` and served via `/api/media/...`. Save still persists cover/video/screenshots on the project record.
Tests: login + `POST /api/admin/uploads` kind=projects → **ok** with public `/api/media/...` URL; media GET **200**.
Next: CWV; owner uploads real banners from CMS.
Rollback: revert listed files; delete `.data/uploads/projects` if needed.

### 2026-11-07 — Admin CMS click/delete + hydration fix
Status: DONE (local :3001)
Changed code files: `admin/page.tsx` (edit form above list, Delete + confirm, FormData login), `admin/layout.tsx`, `PageLoader`, `SiteHeader`, `ThemeProvider`, `admin-client`, `api/auth/login`, `globals.css` (btn-danger), `next.config.ts` (allowedDevOrigins)
Implementation: Hydration/error overlay was blocking admin clicks. Fixed path/theme SSR mismatch; project Edit opens form at top; Delete on each row + in form; login/session cookie on response. Verified in browser: login → Projects Edit/Save/Create/Delete → Services tab loads.
Tests: PATCH/POST/DELETE projects **200**; Projects count 8↔9↔8; Services editor visible.
Next: CWV; optional remaining homepage WorkShowcase hydration warning.
Rollback: revert listed files.

### 2026-11-07 — Banner fill + admin password sync
Status: DONE (local :3001)
Changed code files: `globals.css` (banner img absolute cover, tighter radii), `ProjectMediaPreview.tsx` (broken-image → placeholder), `scripts/seed.ts` (sync admin password from `.env.local`)
Implementation: Fixed half-filled banners (`object-fit: cover` via absolute stage fill); less round corners on work tiles/banners; missing/broken thumbs show branded placeholder; admin password reset to match `ADMIN_BOOTSTRAP_PASSWORD`.
Tests: login `admin@zaincodes.local` → **ok**; `/` **200** with `ppm-banner`.
Next: CWV; upload real wide banners in admin.
Rollback: revert listed files; re-seed password if needed.

### 2026-11-07 — Project showcase store-style banners
Status: DONE (local :3001)
Changed code files: `ProjectMediaPreview.tsx`, `WorkShowcase.tsx`, `projects/page.tsx`, `portfolio/[slug]/page.tsx`, `admin/page.tsx`, `api/admin/projects*`, `db/schema.ts`, `db/client.ts`, `lib/content.ts`, `globals.css`
Implementation: Default project preview is Play/App Store–style feature **banner** (~2:1, balanced height — not tiny phone mockups). Cover image = banner; video shows play + lightbox when set. Admin **Preview style** select: `banner` (default) | `phone` | `browser` | `stack`. Schema column `preview_style` with migrate-on-boot.
Tests: `/` `/projects` → **200**; `/api/projects` ok count 8, all `previewStyle: banner`; homepage HTML `ppm-banner`×15, `ppm-phone`/`ppm-browser`×0. Column migrated on existing PGlite.
Next: CWV/a11y; owner uploads real wide (~2:1) banner assets via admin cover URL.
Rollback: drop `preview_style` usage; revert listed files.

### 2026-11-07 — Premium UI correction & responsive quality pass
Status: SUPERSEDED in part by store-style banners (CWV still open)
Changed code files: `globals.css` (container ~1280px, spacing tokens, button system, light theme, skills matrix, svc-grid, case hero, nav-end), `HeroStage.tsx`, `SkillsShowcase.tsx`, `ServicesShowcase.tsx`, `SiteHeader.tsx`, `TechIcon.tsx`, `JourneySection.tsx`, `WorkShowcase.tsx`, `projects/page.tsx`, `portfolio/[slug]/page.tsx`, `page.tsx`, `lib/services-content.ts`, `lib/url.ts`, `scripts/seed.ts`, `scripts/publish-services.ts`
Implementation: Unified gutters/container; balanced hero without weak chips; compact skills matrix (no empty orbit panel); five CMS services + Custom Software + Desktop SEO pages; case-study grid alignment; theme toggle in nav-end beside Resume; light-mode contrast pass; `isPublicUrl` hides `#` fake links; buttons standardized (primary/secondary/outline/icon + focus/disabled).
Tests: `npm run build` **PASS**; `/` `/services/custom-software-development` `/services/desktop-application-development` `/portfolio/foxtinn-hotel-operations` → **200**; homepage HTML contains `skills-matrix`, `svc-grid`, `svc-card-5`, `nav-end`, `theme-toggle`, `hero-position-line`; admin PUT published 7 services (5 primary + Flutter/Android).
Data/SEO/Security: Services upserted via authenticated admin API + CSRF; seed includes new slugs; anonymous writes unchanged.
Risks: Phase 9 Lighthouse/axe evidence still NOT RUN; production untouched.
Next: responsive visual QA across 320–1440 + light/dark; CWV/a11y evidence; keep `:3001`.
Rollback: revert listed files; CRA untouched.

### 2026-11-07 — Ultimate portfolio media + services/work pass
Status: SUPERSEDED by premium UI correction & responsive quality pass
Changed code files: `ServicesShowcase`, `WorkShowcase`, `AboutSection`, `HeroStage`, `ProjectMediaPreview`, `lib/media.ts`, `projects/page.tsx`, `portfolio/[slug]/page.tsx`, `admin/page.tsx` (videoUrl), `page.tsx`, `globals.css`
Implementation: Compact service rows (no SEO jargon / giant cards); editorial About; media-first work/projects with auto slideshow, swipe, pause, reduced-motion; YouTube/Vimeo/Drive/direct video parse + lightbox; case study hero+gallery+nav+CTA; branded empty media placeholder; admin video + multi-screenshot fields.
Tests: `/` `/projects` `/portfolio/*` → **200**; svc-row, ppm frames, about-editorial, work-tech confirmed.
Next: seed richer multi-screenshot sets when owner supplies real assets; continue CWV pass.
Rollback: prior WorkShowcase/ServicesShowcase in git history.

### 2026-11-07 — Skills/Journey/Contact/Footer + dual theme
Status: SUPERSEDED by ultimate portfolio media pass
Changed code files: theme + skills/journey/contact/footer set
Implementation: Dual theme + skills without % + journey + contact/footer.
Tests: **200**
Next: see newer entry.

### 2026-11-07 — Homepage + case study UI correction
Status: SUPERSEDED by skills/journey/theme entry
Changed code files: `HeroStage.tsx`, `ServicesShowcase.tsx`, `WorkShowcase.tsx`, `page.tsx`, `portfolio/[slug]/page.tsx`, `globals.css`
Implementation: Hero/services/work/case study premium pass.
Tests: **200** on key routes.
Next: see newer entry.

### 2026-11-07 — Premium UI correction (brand + motion)
Status: SUPERSEDED by homepage UI correction below / above
Changed code files: `web/public/brand/*`, `BrandLogo`, `HeroStage`, `MagneticButton`, `Reveal`, `PageLoader`, `SiteHeader/Footer`, `ProjectGallery`, `globals.css`, `layout.tsx`, `page.tsx`, `projects/page.tsx`; added `motion`
Implementation: Restored original ZainCodes SVG logo; Outfit/Manrope; brand palette; motion primitives.
Tests: Home/projects **200**.
Next: see newer UI correction entry.

### 2026-11-07 — Phases 3–8 local product slice
Status: IN PROGRESS
Changed code files: `web/src/app/**` (public pages, admin CMS, APIs), `web/src/components/*`, `web/src/lib/admin-client.ts`, `web/src/lib/services-content.ts`, `web/scripts/seed.ts`, `web/scripts/smoke-api.mjs`, `web/src/app/globals.css`
Implementation: Premium public shell; differentiated galleries (browser / stack / Android / Flutter phones); admin CRUD for hero/about/contact/settings/social/projects/services/blog/resume; 5 crawlable service pages; contact honeypot+DB store; WhatsApp FAB; resume upload/download; sitemap/robots/JSON-LD.
Tests: Smoke **15/15 PASS** on `:3001`. Contact POST stores locally. Vitest DB cases FAIL while Next holds PGlite lock (non-DB unit tests PASS).
Data/SEO/Security checks: Services published via admin API; anonymous admin writes 401/403; CSRF create+delete project works.
Risks / external actions: Email delivery BLOCKED (no RESEND_API_KEY); cloud storage BLOCKED; no production deploy.
Rollback: leave CRA intact; revert `web/` on branch `phase-2/local-foundation`.
Next: Phase 9 Lighthouse/axe evidence; blog categories/tags UI; email delivery when RESEND_API_KEY provided; keep localhost:3001.

- 2026-11-07 — Consolidated eight owner-supplied planning/audit documents into a single working master. **No application code changes or test passes implied.**
- 2026-11-07 — Installed authoritative `PROJECT_MASTER.md` at repository root. Confirmed section parity with `docs/upgrade-plan/01`–`08` (all eight topics present). Redundant `docs/upgrade-plan/*.md` files **retained pending owner permission** to archive/remove. Application source unchanged. Phase 2 not started.
- 2026-11-07 — **Phase 2 foundation slice:** branch `phase-2/local-foundation`; backup `backups/phase-2-2026-11-07/portfolioData.json`; Next.js app in `web/` on port **3001**; PGlite schema+seed (8 projects, case-study fields preserved); server auth (bcrypt + httpOnly JWT cookie); protected admin API returns 401 when anonymous. Smoke script **6/6 PASS**. CRA left intact. No production deploy.

### 2026-11-07 — Phase 2 / local foundation slice
Status: SUPERSEDED by full Phase 2 completion entry below

### 2026-11-07 — Phase 2 / foundation complete
Status: VERIFIED COMPLETE
Changed code files: `web/src/db/*`, `web/src/lib/auth.ts`, `web/src/lib/csrf.ts`, `web/src/lib/http.ts`, `web/src/lib/rate-limit.ts`, `web/src/lib/content.ts`, `web/src/lib/storage/*`, `web/src/app/api/**`, `web/scripts/*`, `web/tests/foundation.test.ts`, `web/vitest.config.ts`, root scripts/gitignore, `PROJECT_MASTER.md`
Implementation: hardened revocable sessions + CSRF + rate limits; full CMS-ready schema (projects/blog/services/resume/seo/settings/contact/experience/education/media/sessions); local storage adapter + upload/resume/media APIs; upsert seed preserving all 8 project case-study fields; DB backup script; consistent API errors; server-side content reads; no GitHub token usage in `web/`
Tests: [PASS] `npm test` 8/8; [PASS] `npm run smoke` 14/14; [PASS] `npm run build`; [PASS] `npm run backup:db`
Data/SEO/Security checks: anonymous mutations 401; CSRF failure 403; logout revokes session; resume upload validates PDF magic bytes; CRA untouched; production untouched
Risks / external actions: revoke historical GitHub PAT / CRA default password still recommended; cloud storage/email/Turnstile BLOCKED pending credentials; Docker Postgres optional
Rollback: CRA `:3000`; restore from `backups/pglite-*`; keep using JSON seed source
Next: Phase 3 — full admin CMS CRUD UI against these APIs (still local-only)

- 2026-11-07 — Phase 2 foundation completed and verified locally (auth hardening, schema, storage, APIs, tests, backup). Preview `http://localhost:3001`. No production deploy.

---

# Consolidated source materials (full content, preserved for reference)

The following sections preserve the source audit and planning text, with cross references retargeted to this single document. Where a source says "Phase 1 complete," that means the original **audit deliverables** existed, not that the owner approved Phase 2 or that implementation has started.


---

## 1. Current Codebase Audit

**Status:** Phase 1 audit only — no application source was modified.  
**Inspected:** 2026-11-06  
**Evidence rule:** Findings marked **Verified** were read from source. Items marked **Assumption** were inferred and should be confirmed before implementation.

---

### 1. Technology stack (Verified)

| Layer | Technology | Evidence |
|-------|------------|----------|
| UI framework | React `19.2.0` | `package.json` |
| Build tooling | Create React App via `react-scripts` `5.0.1` | `package.json` scripts |
| Routing | `react-router-dom` `7.10.1` (`BrowserRouter`) | `src/App.js` |
| Styling | Vanilla CSS + CSS custom properties | `src/index.css`, component `*.css` |
| Fonts | Google Fonts: Outfit, Inter, Fira Code | `src/index.css` `@import` |
| Data “CMS” | Bundled JSON + `localStorage` + GitHub Contents API | `src/data/portfolioData.json`, `src/utils/githubSync.js`, `src/App.js` |
| Auth | Client-side salted SHA-256 + `sessionStorage` | `src/utils/security.js` |
| Hosting configs | Vercel + Netlify | `vercel.json`, `netlify.toml`, `public/_redirects` |
| Image tooling | `sharp` (devDependency) + `scripts/compress-portrait.js` | `package.json` |
| Tests | CRA Jest defaults only | `src/App.test.js`, `src/setupTests.js` |

**Not present (Verified):** Next.js, TypeScript, Tailwind, Express/API server, database client, sitemap generator, blog module, WhatsApp FAB, CSP headers, structured data / JSON-LD in `public/index.html`.

---

### 2. Directory architecture (Verified)

```
zaincodes/
├── public/                 # Static SPA shell, assets, robots.txt, placeholder resume.pdf
├── src/
│   ├── App.js / App.css    # Router, loader, theme sync, data init
│   ├── index.js / index.css
│   ├── assets/             # Logo SVGs/PNG
│   ├── components/         # All UI + AdminPanel
│   ├── data/portfolioData.json
│   ├── hooks/usePortfolioData.js
│   └── utils/              # githubSync, security, resumeHelper, mediaHelper
├── scripts/compress-portrait.js
├── vercel.json / netlify.toml
├── CONTEXT.md / README.md
└── .env.local              # Gitignored; key name REACT_APP_GITHUB_TOKEN only inspected
```

---

### 3. Routes and pages (Verified — `src/App.js`)

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `HomePage` → Hero, About, Portfolio, Skills, Contact | Single-page sections |
| `/projects` | `ProjectsShowcase` | Full gallery + search |
| `/showcase` | `ProjectsShowcase` | Duplicate alias |
| `/portfolio/:slug` | `ProjectDetail` | Case study |
| `/admin` | Lazy `AdminPanel` | No Navigation/Footer |

SPA rewrites: `vercel.json`, `netlify.toml`, `public/_redirects`.

---

### 4. Content model (Verified — `src/data/portfolioData.json`)

Top-level keys: `heroData`, `aboutData`, `skillsData`, `contactData`, `socialLinks`, `portfolioProjects`, `resumeLink`, `siteTheme`.

**Projects:** 8 items. Categories present: `android`, `flutter`, `web`.  
**Project fields:** `id`, `slug`, `title`, `category`, `image`, `thumbnail`, `description`, `longDescription`, `problem`, `solution`, `architecture`, `technologies`, `features`, `highlights`, `screenshots`, `playStoreLink`, `githubLink`, `liveLink`.

**About extras in JSON:** `experience`, `education`, `location`, `email`, `phone`, `company`, `techStack` — but `About.js` only renders subtitle/intro/techStack + **hardcoded** principles/process. Experience/education are **not rendered** on the public About UI.

**Skills mismatch:** Admin/JSON drive category skill bars via `skillsData`, while `Skills.js` also hardcodes a featured `majorSkills` trio (Android / Flutter / Spring Boot).

**Images:** Project `image` / `thumbnail` / `screenshots` currently point at Unsplash URLs (stock imagery), not real product screenshots. Each project has only **1** screenshot entry (often same as cover).

---

### 5. Data flow (Verified)

1. On mount (`App.js`), seed `localStorage` from bundled JSON if keys missing.
2. Fetch `raw.githubusercontent.com/.../portfolioData.json` via `fetchLatestGitHubData()` and overwrite localStorage.
3. Public components poll/`storage`-listen via `usePortfolioData` (~1.2s interval).
4. Admin writes to localStorage and optionally `pushToGitHub()` (Contents API PUT to `main`).

**Persistence reality:**

| Capability | Mechanism | Global for all visitors? |
|------------|-----------|--------------------------|
| Text content | JSON in repo (after GitHub sync + redeploy/raw fetch) | Partially yes |
| Resume PDF upload | Base64 in **uploader’s** `localStorage` | **No** |
| GitHub token | `localStorage` + `REACT_APP_*` env | N/A (admin only, but exposed) |
| Theme | `localStorage` `siteTheme` | Per-browser until synced |
| Contact submissions | Simulated `setTimeout` success | **Nothing persisted** |

---

### 6. Admin capabilities (Verified — `AdminPanel.js`)

Tabs: Hero, About, Skills, Contact (+ social CRUD), Projects, Resume, Settings & Security.

**Can manage today:** hero copy/stats/avatar URL; about subtitle/intro; skill categories; contact email/phone/location; social links; project CRUD (URL-based media); resume Base64 upload + external link; theme; password change; GitHub token; JSON export/import.

**Cannot manage today:** blog; SEO metadata; footer copy; dedicated services pages; experience/education editors; WhatsApp-specific settings; site-wide settings beyond theme; binary image uploads to durable storage; screenshot upload/reorder UI (newline URL list only); problem/solution/architecture fields in project form (**dropped on save** — see §9).

---

### 7. UI / UX observations (Verified)

#### Strengths
- Design tokens exist (`:root` / `.light-theme` in `src/index.css`).
- Case study structure on `ProjectDetail` (problem/solution/architecture) is solid when data is present.
- Device mockups: phone for android/flutter, browser chrome for web.
- Lazy-loaded admin bundle.
- Profile WebP (~54KB) exists alongside large PNG (~1.9MB).

#### Weaknesses (aligned with premium, non-generic goals)
- **Dark cyber / indigo–cyan–purple neon** aesthetic with glass cards, glow orbs, particle canvas (`Background3D.js`) reads as common AI-portfolio template language.
- Typography uses **Inter** (explicitly a “default stack” risk) plus Outfit; CONTEXT.md is outdated (claims Poppins).
- Hero packs **stats strip + floating badges + holographic rings + scanlines** into first viewport — exceeds “brand / one headline / one sentence / one CTA / one image” discipline.
- Heavy emoji usage for icons (nav, social, categories, admin).
- Portfolio/showcase use dense **card grids** with auto-rotating image carousels; visual height can feel oversized (`pf-card-visual` ~250px + body content).
- Web vs mobile presentation differs mainly by mockup frame on detail page; listing cards treat all categories similarly.
- Contact form **fakes** success with no delivery (`Contact.js` `setTimeout`).
- No floating WhatsApp CTA.
- Loader is bubble animation + marketing copy; fine, but theme sync uses 1s polling intervals that are wasteful.
- `CONTEXT.md` is **stale** relative to current SEO meta and content (documents placeholder CRA titles that are already replaced in `index.html`).

---

### 8. Gallery / slideshow (Verified)

| Feature | Home cards | Showcase | Project detail |
|---------|------------|----------|----------------|
| Multi-image | Yes (normalizeScreenshots) | Yes | Yes |
| Auto-rotate | Yes | Yes | No |
| Thumbnails | Dots only | Dots | Thumbnail strip |
| Lightbox | No | No | Click-to-expand modal |
| Keyboard | No | No | **No** (no keydown handlers) |
| Touch swipe | No | No | **No** |
| Category-specific layout | Filter chips only | Filter + stats strip | Phone vs browser mockup |
| Admin image upload/reorder | URL text only | — | — |

Data limitation: most projects have a single screenshot URL → slideshow rarely demonstrates real multi-screen flows.

---

### 9. Critical product bugs / integrity issues (Verified)

1. **Admin save remaps/drops project fields** (`AdminPanel.js` `handleSubmit`): writes `liveUrl` / `githubUrl` while public UI mostly reads `liveLink` / `githubLink` / `playStoreLink`. Omits `problem`, `solution`, `architecture`, and can collapse Play Store vs live links. Editing then syncing can **corrupt** `portfolioData.json`.
2. **openEditProject** loads `proj.githubUrl` but JSON stores `githubLink` → GitHub field often empty in editor.
3. **`usePortfolioData` stale-overwrite heuristics** force bundled JSON over localStorage when contact email / project count / hero greeting differ — can fight legitimate admin edits until GitHub sync wins.
4. **social key split:** Admin saves `socialData`; App seeds `socialLinks`; hook reads both — fragile.
5. **Resume:** upload stays local; public fallback `public/resume.pdf` is a **tiny stub PDF** (810 bytes) with placeholder text lines, not a real CV.
6. **Contact form** does not send email or store leads.

---

### 10. SEO baseline (Verified)

- Static meta in `public/index.html`: title/description/canonical/OG basic tags — **mobile-developer positioning**, weak for primary commercial intents (Web / Full Stack / Mobile as service lines).
- No `og:image`, no Twitter card tags, no JSON-LD.
- No `sitemap.xml` (`public/` confirmed absent).
- `robots.txt` allows all (`Disallow:` empty).
- CSR SPA: crawlers get shell + JS-dependent content; project routes share one HTML document.
- `ProjectDetail` sets `document.title` client-side only.

---

### 11. Security snapshot

See [Security Findings](#2-security-findings). Highest severity: client-only admin auth; hardcoded default password material; GitHub PAT in browser/`localStorage`/`REACT_APP_*`; write access to production repo from the frontend.

---

### 12. Deployment / env (Verified)

- Dual deploy configs (Vercel preferred given `.vercel` folder presence — **Assumption:** production is Vercel at `zaincodes.tech`).
- Security headers present in `vercel.json` (HSTS, XFO SAMEORIGIN, nosniff, etc.); Netlify uses `X-Frame-Options: DENY` (inconsistency).
- `.env.local` gitignored; contains `REACT_APP_GITHUB_TOKEN` (value **not** recorded in this audit).

---

### 13. Blog

**Verified:** No blog routes, components, or data keys exist.

---

### 14. Assumptions to validate with owner

1. Production host of record (Vercel vs Netlify vs both).
2. Whether GitHub PAT currently used in production admin workflows should be revoked immediately (recommended: yes).
3. Whether Unsplash images are temporary placeholders pending real screenshots.
4. Target brand positioning: mobile-first (current copy) vs full-stack + web + mobile (SEO brief).
)


---

## 2. Security Findings

**Scope:** Static review of repository source and config. No live penetration test, no secret values displayed, no production credentials rotated by this audit.  
**Legend:** **Critical / High / Medium / Low / Info**. Status: **Verified** unless noted.

---

### Executive summary

Admin authentication and content persistence are implemented **entirely in the browser**. A GitHub Personal Access Token with repo write scope is designed to live in the frontend environment and/or `localStorage`. This is not a securable architecture for an admin CMS. Treat current `/admin` as a **publicly attackable control plane** over the Git repository and published site content.

---

### Critical

#### C1 — Client-only admin authentication
**Evidence:** `src/utils/security.js`, `src/components/AdminPanel.js`  
**Issue:** Password verification uses Web Crypto SHA-256 with a **public salt** and hash comparison in the browser. Session is a JSON blob in `sessionStorage` (`admin_session`) with a client-set expiry. Anyone can:

- Read the default hash / salt from the shipped JS bundle.
- Forge `sessionStorage` to set `authenticated: true`.
- Bypass the UI entirely and call the same GitHub sync code paths if a token is present.

**Impact:** Unauthorized access to admin UI and any privileged client actions.  
**Remediation:** Server-side auth (session cookies HttpOnly/Secure/SameSite, or Auth provider). Never trust client-only gates for privileged operations.

#### C2 — Hardcoded default password material in source
**Evidence:** `src/utils/security.js`  
**Issue:** Default password string and salted hash are present in source comments and verification logic. The default password is also documented in `CONTEXT.md`.  
**Impact:** Trivial first-login compromise for any deployment that still uses the default.  
**Remediation:** Rotate immediately; remove defaults from client bundles; bootstrap first admin via secure server onboarding.

#### C3 — GitHub PAT usable from the browser
**Evidence:** `src/utils/githubSync.js`, `AdminPanel.js` Settings tab, `.env.local` key name `REACT_APP_GITHUB_TOKEN`  
**Issue:** Token is read from `localStorage` or `process.env.REACT_APP_GITHUB_TOKEN` (CRA inlines `REACT_APP_*` into the client bundle). Admin UI can store/display the token. Token is sent directly from the browser to `api.github.com` to **PUT** `src/data/portfolioData.json` on `main`.  
**Impact:** Full repository content write (and potentially broader access depending on PAT scopes). Token theft via XSS, shared machine, DevTools, or leaked build artifacts. Compromised content → site defacement / supply-chain risk if build pipelines trust the repo.  
**Remediation:**

1. **Revoke** any PATs that were pasted into Admin or embedded in builds (owner action).
2. Remove client GitHub write path entirely.
3. Use server-side CMS APIs with least-privilege credentials never shipped to browsers.

#### C4 — Frontend can mutate production content branch
**Evidence:** `pushToGitHub` targets branch `main` and path `src/data/portfolioData.json`  
**Issue:** Content updates = direct commits to production branch from arbitrary browsers holding a token.  
**Impact:** No review, no RBAC, no audit beyond Git history authorship of the token owner.  
**Remediation:** Authenticated backend mutations; optional draft/publish workflow; protect `main`.

---

### High

#### H1 — Brute-force lockout is client-side only
**Evidence:** `checkLoginAttempts` / `recordFailedLogin` in `localStorage` key `admin_login_security`  
**Issue:** Attacker clears storage or uses another browser/profile; lockout evaporates.  
**Remediation:** Server-side rate limiting + account lockout + CAPTCHA/Turnstile after N failures.

#### H2 — XSS sanitization is incomplete
**Evidence:** `sanitizeInput` strips a few patterns (`<script>`, `javascript:`, `onload=`, `onerror=`).  
**Issue:** Not a real HTML sanitizer. Many vectors remain if unsanitized fields are ever rendered as HTML. Currently most fields render as React text children (**partial mitigation**), but URLs (`href`, `src`, iframe embeds via `mediaHelper`) remain injection surfaces (e.g., `javascript:` variants, malicious embed hosts).  
**Remediation:** Never use `dangerouslySetInnerHTML` without a vetted sanitizer; validate URLs against allowlists; sanitize on server.

#### H3 — Contact form is a fake endpoint with no abuse controls
**Evidence:** `src/components/Contact.js` — success after `setTimeout`, no network call.  
**Issue:** No spam protection needed today because nothing is sent; when a real endpoint is added, missing CAPTCHA/rate limits will enable abuse. Also trains users with false “request received” messaging.  
**Remediation:** Server endpoint + Turnstile/hCaptcha + rate limit + email/CRM delivery; honest error states.

#### H4 — Resume Base64 in localStorage
**Evidence:** `resumeHelper.js`, Admin resume tab  
**Issue:** Large data URLs in localStorage (quota ~5MB); only available on the admin’s browser; no authZ on “download” beyond knowing the site. Not a cross-tenant leak today, but encourages insecure patterns and fails availability.  
**Remediation:** Authenticated multipart upload to object storage; public signed or CDN URL for the latest published resume.

#### H5 — Import JSON without schema validation
**Evidence:** `handleImport` in `AdminPanel.js`  
**Issue:** Arbitrary JSON overwrites portfolio keys in localStorage and can be synced to GitHub.  
**Remediation:** Zod/JSON Schema validation server-side; size limits; reject unknown keys.

---

### Medium

#### M1 — No Content-Security-Policy
**Evidence:** `vercel.json` / `netlify.toml` headers omit CSP.  
**Impact:** XSS impact amplified (inline scripts, third-party fonts/embeds).  
**Remediation:** Strict CSP compatible with fonts, YouTube/Vimeo embeds, analytics.

#### M2 — Inconsistent clickjacking headers
**Evidence:** Vercel `X-Frame-Options: SAMEORIGIN` vs Netlify `DENY`.  
**Remediation:** Align on `DENY` or CSP `frame-ancestors 'none'` unless embedding is required.

#### M3 — Admin route discoverable and unthrottled at edge
**Evidence:** `/admin` public route in `App.js`  
**Remediation:** Still allow login page, but protect APIs; optional IP allowlist for admin; no privileged secrets in SPA.

#### M4 — Field-name corruption can be abused for content integrity
**Evidence:** Admin project save field remap (see audit §9)  
**Impact:** Accidental or malicious sync can delete case-study fields from the canonical JSON.  
**Remediation:** Fix schema; server validation; backups.

#### M5 — Third-party media trust
**Evidence:** Unsplash URLs, arbitrary screenshot/video URLs, iframe embeds  
**Impact:** Hotlink breakage; privacy; possible malicious media hosts.  
**Remediation:** Self-host media; allowlist embed providers.

---

### Low / Info

#### L1 — Password minimum length 6
**Evidence:** `updateAdminPassword`  
**Remediation:** ≥12 chars + complexity or passphrase policy; prefer passwordless/SSO for single-admin sites.

#### L2 — Session sliding expiry purely client-side
**Evidence:** `validateSession` refreshes `expiresAt` locally  
**Remediation:** Server sessions with absolute + idle timeouts.

#### L3 — Security theater copy
**Evidence:** Admin login UI claims “Secured with Salted SHA-256 & Brute-Force Shield”  
**Impact:** False sense of security.  
**Remediation:** Replace with real server auth; honest UX.

#### I1 — Secrets handling in this audit
`.env.local` is gitignored. Only the **key name** `REACT_APP_GITHUB_TOKEN` was confirmed. **No secret values are reproduced in this document.**

#### I2 — `CONTEXT.md` documents the default password
Treat as credential disclosure in-repo documentation; scrub after rotation.

---

### Recommended secure target architecture (summary)

| Concern | Current | Target |
|---------|---------|--------|
| Auth | Client hash | Server session / Auth.js / Clerk / Supabase Auth |
| CMS writes | GitHub PAT from browser | Authenticated API → DB |
| Media / resume | localStorage / URLs | S3-compatible object storage (R2/S3/Supabase Storage) |
| Contact | Fake | API + provider (Resend/Postmark) + bot protection |
| Secrets | `REACT_APP_*` | Server-only env vars |
| Admin UI | Public SPA gate | Same UI allowed, but APIs enforce auth |

---

### Immediate owner actions (no code changes in Phase 1)

1. Revoke any GitHub PATs used with this admin sync feature; audit recent commits to `portfolioData.json`.
2. Change admin password everywhere this default may have been used; assume compromise if site was public.
3. Confirm whether production builds ever baked `REACT_APP_GITHUB_TOKEN` into JS (Vercel env → client). If yes, rotate and remove that env from frontend builds.
4. Do not add more privileges to the existing client token pattern while waiting for Phase 2.
)


---

## 3. Design Guidelines

**Purpose:** Guardrails for Phase 4–6 UI work so the portfolio feels human-designed, original, and commercially credible — not a cyber-glass AI template.  
**Inputs:** Live components under `src/components/*`, tokens in `src/index.css`, owner brief (premium / sophisticated / controlled motion / excellent mobile).

---

### 1. Brand positioning

**ZainCodes** is the hero-level brand signal. Personal name “Zain Saeed” supports trust but must not erase the product brand in the first viewport.

**Commercial promise (aligned with SEO brief):** Web development, full-stack systems, and mobile applications (Android / Flutter) delivered as engineered products — not generic “I build apps” freelancing copy.

**Tone:** Precise, calm, senior. Prefer concrete outcomes (shipped products, architectures, platforms) over neon hype (“cyber”, “holographic”, “99.9% crash-free” badges without proof).

---

### 2. What to stop doing (anti-patterns observed)

Verified in current UI:

| Anti-pattern | Where seen | Guidance |
|--------------|------------|----------|
| Purple/indigo + cyan neon gradients + glow | `index.css` tokens, cards, CTAs | Replace with a restrained 1–2 accent system |
| Glassmorphism everywhere | `.glass-card` usage across About/Contact/Skills | Use glass sparingly or not at all; prefer solid surfaces |
| Particle / orb canvas backgrounds | `Background3D.js` | Remove or reduce to optional subtle grain; never compete with content |
| Floating emoji badges on hero media | `Hero.js` | Remove overlays on portrait (owner rule: no hero overlays) |
| Stats strip in first viewport | Hero trust row | Move proof below fold or into About |
| Dense rounded “pill” clusters | Filters, tech stacks, social | Limit pills; prefer text + subtle separators |
| Oversized screenshot cards | Portfolio / Showcase grids | Smaller media plane; editorial layouts by category |
| Emoji-as-icon system | Nav, Footer, Admin, categories | SVG icon set (Lucide or custom) |
| Inter as primary body | `index.css` | Keep Inter only if rebranded intentionally; prefer a distinctive pairing |
| Duplicate marketing sections | Showcase stats + home portfolio | One job per section |

---

### 3. Visual direction (recommended)

Pick **one** coherent direction (proposal):

**“Editorial Engineering”**
- Surfaces: warm-neutral or cool-ink backgrounds with **subtle** paper/noise texture — not flat pure black cyber void, not cream/terracotta cliché.
- Accent: single brand accent (e.g. deep teal **or** ink-blue **or** copper) + neutral grayscale. Avoid multi-neon rainbow.
- Typography:
  - Display: distinctive geometric or neo-grotesk **other than** Inter/Roboto/Arial (e.g. Outfit kept *or* swapped for something more unique like Satoshi/Geist/Cabinet — finalize in Phase 4).
  - Body: readable humanist sans with clear hierarchy.
  - Mono: reserved for code snippets / slugs only.
- Imagery: **real project screenshots** in device frames; portrait as photographic, not hologram.
- Motion: 2–3 intentional motions sitewide (e.g. nav reveal, section fade-in, gallery crossfade). No perpetual particle fields.

Define CSS variables in `:root` for: `--bg`, `--fg`, `--muted`, `--accent`, `--border`, `--radius`, `--space-*`, `--font-display`, `--font-body`. Deprecate unused glow tokens.

---

### 4. First viewport (Home) composition rules

Must contain **only**:

1. Brand (ZainCodes / Logo)
2. One headline
3. One supporting sentence
4. One CTA group (max 2 actions)
5. One dominant visual (portrait **or** product still — edge-to-edge or full bleed plane preferred over inset card)

**Forbidden in first viewport:** stats, schedules, floating badges, promo chips, trust metrics, secondary feature grids.

Navigation may remain chrome but should not carry the brand alone.

---

### 5. Section rules (homepage)

| Section | One job | Notes |
|---------|---------|-------|
| Hero | Introduce brand + primary CTA | See §4 |
| About | Who / philosophy / credibility | Render experience & education from CMS; drop redundant glass principle cards if they repeat Skills |
| Services (new) | Commercial offerings | Web / Full Stack / Mobile — link to SEO pages |
| Work | Featured projects | Max 3–6 featured; “View all” → `/projects` |
| Skills | Capability proof | Admin-driven; remove hardcoded major card duplication |
| Contact | Convert | Real form + WhatsApp deep link |
| Footer | Orient + legal + social | CMS-managed short blurb |

---

### 6. Project gallery design system

#### 6.1 Website / full-stack projects
- Landscape browser frame or framed desktop UI.
- Editorial 12-column layout: large primary screenshot + short case blurb.
- Avoid square card sameness with mobile apps.

#### 6.2 Flutter / Android apps
- Phone mockups (existing `device-mockup-phone` is a good base — refine chrome, reduce glow).
- Horizontal swipe gallery of 4–8 real screens preferred over stacked huge cards.
- Thumbnails under stage; lightbox for focus.

#### 6.3 Shared gallery behaviors (target)
- Featured image + ordered gallery
- Thumbnail nav, lightbox, keyboard (←/→/Esc), touch swipe
- Responsive `srcset` / Next Image (post-migration)
- Controlled max stage height (e.g. clamp 320–520px) so case studies don’t dominate scroll

#### 6.4 Admin media UX
- Upload, delete, drag-reorder — not newline URL paste as primary UX
- Separate cover vs gallery

---

### 7. Navigation & WhatsApp

- Slim sticky nav; clear Work dropdown; Resume download must always resolve to a real PDF.
- Floating WhatsApp button: fixed, accessible, `wa.me/{E.164}` from CMS phone; does not cover primary CTAs; hide on `/admin`.

---

### 8. Motion guidelines

| Do | Don’t |
|----|-------|
| Short ease-out fades (200–400ms) | Infinite neon pulses on every badge |
| Gallery crossfade / swipe | Auto-rotate carousels with no pause-on-focus |
| Subtle parallax optional, reduced-motion aware | Canvas particles on every page |
| Respect `prefers-reduced-motion` | 3D tilt that fights mobile scroll |

---

### 9. Responsive & accessibility

- Mobile-first: hero stacks portrait below copy; tap targets ≥44px.
- Contrast: WCAG AA for text; neon-on-dark fails often today — fix with muted accents.
- Replace emoji icons with labeled SVGs + `aria-label`s.
- Focus rings visible in both themes.
- Forms: real validation messages, not only browser defaults.

---

### 10. Admin UI

Admin can remain utilitarian (density over marketing). Prefer clarity, schema-aligned forms, and media managers. Do not spend Phase 4 polish budget making Admin “premium neon.”

---

### 11. Loader

Keep brand wordmark + short line; avoid bubble gimmicks if they feel toy-like. Prefer indeterminate bar or quiet fade. Cap artificial delay (current dual loader paths in `App.js` — 1500ms timeout + async init — should not block longer than needed).

---

### 12. Acceptance for design phases

- Brand test: removing nav, page still reads as ZainCodes.
- First viewport passes §4 checklist.
- No purple-glow glass card template look.
- Web and mobile galleries feel intentionally different.
- Lighthouse a11y ≥ 90 on key templates (Phase 9).
)


---

## 4. Admin CMS Architecture

**Goal:** Fully dynamic content management without rebuilding working UI patterns unnecessarily. Preserve existing portfolio JSON content during migration.

---

### 1. Current admin surface (Verified)

Route: `/admin` → `src/components/AdminPanel.js` (lazy).

| Tab | Persists to | Synced to GitHub JSON? | Notes |
|-----|-------------|------------------------|-------|
| Hero | `localStorage.heroData` | Yes (if token) | Includes stats + avatar URL |
| About | `aboutData` | Yes | Only subtitle/intro fields editable; experience/education in JSON unused |
| Skills | `skillsData` | Yes | Category CRUD |
| Contact | `contactData` + `socialData` | Contact + socialLinks | Phone labeled “WhatsApp” but no wa.me config |
| Projects | `portfolioProjects` | Yes | URL media; **field remap bug** |
| Resume | `resumeFileData` (Base64) + `resumeLink` | Only link/name string | File **not** global |
| Settings | theme, password hash, GitHub token, import/export | Theme + resumeLink | Token in localStorage |

**Hardcoded (not admin-managed):** About principles/process, Skills `majorSkills`, Footer tagline/capabilities, Navigation labels, Hero floating badges, Contact platform options, much of ProjectsShowcase marketing copy, SEO meta in `index.html`.

**No blog CMS.** No SEO meta CMS. No services CMS. No footer CMS.

---

### 2. Target content domains

Admin must manage:

| Domain | Entities |
|--------|----------|
| Site | Theme, brand name, logo, WhatsApp number, social links, footer blurb, contact details |
| Home | Hero, about blocks, services teaser, featured project IDs |
| Taxonomies | Project categories, skill groups, blog categories/tags |
| Projects | Full case study fields + ordered media |
| Resume | Single published PDF asset |
| Blog | Posts with draft/publish + SEO fields |
| SEO | Per-page title, description, canonical, OG image; defaults |
| Experience / Education | Structured entries (currently string blobs in JSON) |

---

### 3. Recommended CMS approach (reuse-first)

**Do not** continue GitHub-Contents-as-CMS from the browser.  
**Do** keep the Admin React UI concept and expand it against a real API.

#### Preferred stack (pairs with architecture decision in `06` / roadmap)

- **Database:** Postgres (Neon / Supabase / Vercel Postgres)
- **ORM / validation:** Prisma or Drizzle + Zod
- **Auth:** Server sessions (Auth.js) or Supabase Auth — single admin role initially
- **Media:** Cloudflare R2 or Supabase Storage / S3
- **Admin UI:** Evolve current `AdminPanel` into authenticated app section (or `/admin` Next.js route group)
- **Optional later:** Sanity/Payload if editorial needs explode — **not required** for current content volume

#### Why not “only JSON in Git” going forward?
Binary resume/images, auth, rate limits, and draft/publish need a server. Git sync can remain an **optional export** for backup, not the write path.

---

### 4. Information architecture (logical model)

```
SiteSettings (singleton)
HeroContent
AboutContent
Service (n)
SkillCategory → SkillItem
ExperienceEntry
EducationEntry
ProjectCategory
Project → ProjectImage (ordered) → optional ProjectVideo
BlogCategory / BlogTag
BlogPost → BlogPostTag
ResumeAsset (singleton current)
SeoMeta (polymorphic: pageKey | projectId | postId)
SocialLink
```

Map existing `portfolioData.json` → seed migration script (Phase 2/3).

---

### 5. Admin UX modules (target)

1. **Dashboard** — draft counts, last publish, resume status
2. **Homepage** — Hero / About / Services / Featured
3. **Projects** — list, edit, media manager (upload, reorder, delete), category
4. **Skills / Experience / Education**
5. **Blog** — rich text (TipTap/MDX), featured image, SEO panel, draft/publish
6. **Resume** — replace PDF, preview, publish
7. **Contact & Social** — email, phone, WhatsApp E.164, social links
8. **SEO & Settings** — defaults, robots, verification codes (non-secret)
9. **Security** — change password / passkeys; no PAT fields

Preserve Export JSON as backup download from **server** snapshot.

---

### 6. What to keep vs replace

| Keep / evolve | Replace |
|---------------|---------|
| Admin tabbed UX patterns | Client password hash auth |
| Project case study field concepts | Browser GitHub PAT sync |
| Theme toggle concept | Base64 resume in localStorage |
| Media helper embed parsing (server-validate URLs) | Fake contact submit |
| Portfolio/Showcase/Detail React presentations | Unsplash-as-source-of-truth |

---

### 7. Publishing model

- **Draft → Published** for Blog and optionally Projects.
- Public site reads **published** only.
- Admin preview via authenticated preview route or `?preview=` token (short-lived).

Resume: uploading creates a new object; “Publish” flips `ResumeAsset.currentId`.

---

### 8. Migration of existing content

1. Treat `src/data/portfolioData.json` as seed source of truth for text projects.
2. Download Unsplash stand-ins only as temporary; plan real screenshot upload sprint.
3. Fix field names during seed (`githubLink`/`liveLink`/`playStoreLink` canonical).
4. Convert `aboutData.experience` / `education` strings into structured entries where possible.
5. Do **not** migrate `resumeFileData` from anyone’s localStorage (unavailable centrally).

---

### 9. Risks

- Admin save bugs could corrupt JSON before migration — export backup first.
- Dual-write (localStorage + DB) during transition can confuse — use feature flag: `DATA_SOURCE=json|api`.
- Rich text XSS — sanitize server-side (DOMPurify on SSR or schema-limited blocks).
)


---

## 5. SEO Strategy

**Disclaimer:** This plan improves crawlability, relevance, and conversion architecture. It does **not** promise rankings, traffic volume, or first-page positions.

---

### 1. Current state (Verified)

| Item | Status |
|------|--------|
| Framework | CRA SPA — HTML shell + CSR |
| `public/index.html` meta | Mobile-developer title/description; canonical `https://zaincodes.tech/` |
| OG | Basic title/description/url; **no `og:image`** |
| Twitter cards | Missing |
| JSON-LD | Missing in HTML |
| `robots.txt` | Allow all |
| `sitemap.xml` | **Missing** |
| Per-route meta | Only `document.title` on project detail (client) |
| Blog | None |
| Service pages | None |
| Internal links | Home sections + `/projects` + `/portfolio/:slug` |
| Indexable body | Dependent on JS execution |

`CONTEXT.md` SEO section is outdated relative to current `index.html` (Verified divergence).

---

### 2. Commercial keyword intent map

#### Primary (service / commercial)

| Intent | Suggested URL | Page type | Notes |
|--------|---------------|-----------|-------|
| Web Development | `/services/web-development` | Service | Custom sites, React/Next delivery |
| Full Stack Development | `/services/full-stack-development` | Service | APIs + web + mobile backends |
| Mobile App Development | `/services/mobile-app-development` | Service | Umbrella Android + Flutter |

#### Secondary

| Intent | Suggested home |
|--------|----------------|
| Flutter Development | `/services/flutter-development` **or** section + case studies filtered to Flutter (avoid thin duplicates) |
| Android Development | `/services/android-development` **or** strong mobile page section |
| React Development | Fold into Web Development with clear H2; only separate if unique proof/content |
| Custom Website Development | Alias/redirect → Web Development |
| Software Development | Soft landing → Full Stack or Home; avoid thin page |

**Anti-stuffing rule:** Do not create near-duplicate service pages that only swap a keyword. Prefer **3 strong primary service pages** + optional Flutter/Android children **only when** unique case studies and process content exist.

#### Supporting content

| Asset | Role |
|-------|------|
| Home `/` | Brand + hub links to services & featured work |
| `/projects` | Portfolio index (filterable) |
| `/portfolio/[slug]` | Case study (proof) |
| `/blog` + `/blog/[slug]` | Educational / topical content with internal links |
| `/about` (optional dedicated) | E-E-A-T / person entity |

---

### 3. Technical SEO priorities

1. **Move to SSR/SSG-capable framework** (see architecture recommendation) so service pages, case studies, and blog ship meaningful HTML.
2. **Unique title + meta description + canonical** per indexable URL.
3. **`sitemap.xml`** including home, services, projects, published posts; submit in Search Console (**Assumption:** Search Console not yet verified).
4. Keep `robots.txt` open for public pages; `Disallow: /admin`.
5. **JSON-LD:** `Person` / `ProfessionalService` on home; `Service` on service pages; `CreativeWork` or `SoftwareApplication` on case studies; `BlogPosting` on articles; `BreadcrumbList` where useful.
6. **OG image** defaults + per-project/post images.
7. Heading hierarchy: one `h1` per page; services use clear `h2` for offerings/process/FAQ.
8. Internal linking: Home → Services → relevant case studies → Contact; Blog → Services.
9. Performance / CWV: compress hero assets (Profile.png still ~1.9MB unused risk), optimize project images, reduce main-thread canvas work.

---

### 4. Content guidelines (quality)

- Write for humans hiring a developer/agency partner.
- Case studies: problem → approach → stack → outcome (honest; no fake metrics).
- Service pages: who it’s for, process, deliverables, tech, FAQs, CTA — 800–1500 words quality over filler.
- Blog: answer real questions (e.g. Flutter vs native for MVP); link to services; no doorway pages.

Preserve existing project narrative fields (`problem`, `solution`, `architecture`) — they are SEO-relevant body content once crawlable.

---

### 5. URL structure

```
/
/projects
/portfolio/[slug]
/services/web-development
/services/full-stack-development
/services/mobile-app-development
/services/flutter-development          # only if differentiated
/services/android-development          # only if differentiated
/blog
/blog/[slug]
/admin                                 # noindex
```

Redirect `/showcase` → `/projects` (canonicalize duplicate).

---

### 6. Metadata ownership

Admin SEO module stores defaults + overrides. Build pipeline injects into SSR head. Until migration, CRA can only approximate via `react-helmet-async` (**limited** vs true SSR).

---

### 7. Measurement

- Google Search Console + Analytics (privacy-aware).
- Track queries for primary service terms, CTR, and conversions (contact / WhatsApp clicks).
- Reassess content quarterly; expand Flutter/Android pages only with evidence of demand + unique assets.
)


---

## 6. Database and API Plan

---

### 1. Architecture recommendation (decision)

#### Options compared

| Criteria | A. CRA + separate backend | B. Incremental Next.js + API routes/DB | C. Headless CMS only (Sanity etc.) |
|----------|---------------------------|----------------------------------------|-----------------------------------|
| SEO | Weak unless add prerender service | Strong (SSR/SSG) | Strong if paired with Next/Astro |
| Security | Good if APIs done right | Good (server env, route handlers) | Good (vendor auth) |
| Dev complexity | Medium–high (two apps) | Medium (one app eventually) | Medium (new editorial model) |
| Deployment | CRA host + API host | Vercel-native (fits existing `vercel.json`) | CMS cloud + frontend |
| Migration risk | Lower UI rewrite; SEO debt remains | Moderate; phased routes | Content remodel |
| Cost | Low–medium | Low–medium (Neon free tier viable) | CMS fees at scale |
| Code reuse | Highest short-term | High (React components port) | UI rewrite against CMS SDK |
| Admin | Custom against API | Custom against API (current Admin evolves) | Vendor studio + less custom gallery UX |
| Long-term scale | OK | Excellent for marketing site + blog | Excellent editorial; overkill now |

#### Decision: **Option B — Incremental Next.js (App Router) + Postgres + object storage**

**Justification (not popularity):** Primary commercial SEO goals require indexable service/blog/case-study HTML. The project already targets Vercel. Security requires server-side auth and uploads. Existing React section components and CSS can be ported incrementally. A pure CRA+API path (A) fixes CMS/security but leaves the core SEO problem unsolved without a second prerender stack — higher long-term complexity for this use case. A hosted CMS-only path (C) is unnecessary for ~8 projects and one admin.

**Non-goal:** Big-bang rewrite. Port route-by-route; keep JSON fallback until DB seed verified.

---

### 2. Data store

**Postgres** tables (logical):

```
users                 # admin accounts
site_settings         # singleton JSON + typed columns
hero_content
about_content
services
skill_categories
skills
experience_entries
education_entries
social_links
project_categories
projects
project_images        # project_id, url, alt, sort_order, is_cover
blog_categories
blog_tags
blog_posts
blog_post_tags
resume_assets         # storage_key, filename, mime, bytes, is_current
seo_entries           # entity_type, entity_id, title, description, canonical, og_image
contact_messages      # optional lead store
```

Indexes: `projects.slug` unique, `blog_posts.slug` unique, `projects.category`, `blog_posts.status`.

---

### 3. Object storage

Bucket prefixes:

- `resumes/{uuid}.pdf`
- `projects/{projectId}/{uuid}.webp`
- `blog/{postId}/{uuid}.webp`
- `brand/...`

Public read for published assets; write only via authenticated API (presigned upload or server proxy). Validate: PDF magic bytes + `application/pdf`; images MIME + max dimensions/size.

---

### 4. API surface (initial)

All mutating routes: authenticated, CSRF-safe cookies, rate-limited.

#### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

#### Public read
- `GET /api/content/home` (aggregated)
- `GET /api/projects` / `GET /api/projects/[slug]`
- `GET /api/blog` / `GET /api/blog/[slug]`
- `GET /api/resume` → redirect or file stream for current PDF
- `POST /api/contact` (Turnstile + rate limit + email)

#### Admin
- CRUD mirrors of entities above
- `POST /api/admin/projects/[id]/images` (upload / reorder / delete)
- `POST /api/admin/resume` (replace + publish)
- `POST /api/admin/media/presign` (optional)

Prefer **Server Components / loaders** reading DB directly for public pages; expose JSON APIs mainly for Admin SPA client and contact.

---

### 5. Resume implementation (stack-fit)

1. Admin selects PDF ≤ ~5–10MB.
2. Server validates MIME + `%PDF` header.
3. Store in R2/S3; mark previous `is_current=false`.
4. Public `Download Resume` hits `/api/resume` or stable CDN URL `/resume.pdf` rewritten to current object.
5. Response headers: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Zain_Saeed_Resume.pdf"`.
6. Remove Base64 `localStorage` path after cutover.

---

### 6. Contact + WhatsApp

- API persists optional lead + sends email via Resend/Postmark.
- WhatsApp: CMS `whatsappE164` → `https://wa.me/{number}?text=...` floating button + contact CTA.
- Bot protection: Cloudflare Turnstile.

---

### 7. Environment variables (server-only)

Examples of **names only**: `DATABASE_URL`, `AUTH_SECRET`, `STORAGE_*`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, `ADMIN_BOOTSTRAP_EMAIL`.  
Never use `REACT_APP_` / `NEXT_PUBLIC_` for secrets or GitHub write tokens.

---

### 8. Backup & rollback

- Nightly DB dump + storage versioning.
- JSON export endpoint for disaster recovery (compatible with current mental model).
- Feature flag `CONTENT_SOURCE=json|database` during migration.

---

### 9. Field canonicalization (fix existing bugs)

Canonical project link fields:

- `playStoreLink`
- `liveLink`
- `githubLink`
- `videoUrl`
- `screenshots[]` / `project_images`

Deprecate `liveUrl` / `githubUrl` dual writes. Preserve `problem`, `solution`, `architecture`, `highlights`, `features`, `technologies` on every update.
)


---

## 7. Implementation Roadmap

**Rule:** Phase 1 (this audit) is complete when docs are accepted. **Do not start Phase 2 until the owner authorizes it.**

---

### Phase 1 — Audit and architecture

| Item | Detail |
|------|--------|
| **Objective** | Inspect real codebase; document findings; choose architecture |
| **Existing files affected** | Documentation only under `docs/upgrade-plan/` |
| **New files** | `01`–`08` markdown deliverables |
| **DB/API** | None |
| **Features** | Audit + plan |
| **Dependencies** | None |
| **Risks** | Stale docs if code changes before Phase 2 |
| **Tests** | N/A |
| **Acceptance** | Owner reviews chat report + docs; architecture decision recorded |
| **Rollback** | Delete `docs/upgrade-plan/` if unwanted |

---

### Phase 2 — Security, backend and database foundation

| Item | Detail |
|------|--------|
| **Objective** | Establish Next.js App Router scaffold (or parallel `apps/web`), Postgres, auth, remove client GitHub write path |
| **Existing files affected** | Eventually retire `src/utils/githubSync.js` client writes; `src/utils/security.js` client auth; `AdminPanel` token UI; env usage of `REACT_APP_GITHUB_TOKEN`. Initial work may live in new Next app directory. |
| **New files/components** | DB schema/migrations; auth route handlers; middleware protecting `/admin` APIs; seed script from `portfolioData.json` |
| **DB/API** | Tables in [Database and API Plan](#6-database-and-api-plan); login/logout/me |
| **Features** | Secure admin session; content read APIs; revoke PAT workflow (owner) |
| **Dependencies** | Next.js, DB client, auth library, hosting Postgres |
| **Risks** | Dual-repo confusion during migration; downtime if cut over early |
| **Tests** | Auth unit/integration; unauthorized write rejected |
| **Acceptance** | No GitHub PAT in browser; admin login server-validated; seed loads 8 projects |
| **Rollback** | Keep CRA deploy as production until Next preview promoted; DB unused |

---

### Phase 3 — Fully dynamic admin CMS

| Item | Detail |
|------|--------|
| **Objective** | Admin manages all required domains against DB |
| **Existing files affected** | `AdminPanel.js` / CSS (port & expand); forms for experience/education/services/SEO/footer |
| **New files** | Admin media manager; blog editor shell; SEO forms; settings without PAT |
| **DB/API** | Full CRUD; image reorder endpoints |
| **Features** | Homepage, about, services, skills, experience, education, projects+images, categories, resume upload, contact/WhatsApp/social, SEO, footer, site settings |
| **Dependencies** | Phase 2; object storage |
| **Risks** | Field mapping bugs (must fix legacy `githubUrl` issues during port) |
| **Tests** | CRUD happy paths; publish/draft; resume replace |
| **Acceptance** | Checklist in § “Required admin management” all green on staging |
| **Rollback** | Feature flag `CONTENT_SOURCE=json` |

---

### Phase 4 — Premium design system and UI guidelines

| Item | Detail |
|------|--------|
| **Objective** | Implement [Design Guidelines](#3-design-guidelines) tokens and primitives |
| **Existing files affected** | `src/index.css` (or global Next CSS), shared button/nav/typography components, remove/replace glow-heavy utilities |
| **New files** | Design tokens doc in CSS; icon components; layout primitives |
| **DB/API** | None |
| **Features** | New visual language; reduced-motion support |
| **Dependencies** | Owner approval of visual direction |
| **Risks** | Over-refactoring CSS; brand drift |
| **Tests** | Visual regression (manual + optional Chromatic) |
| **Acceptance** | Passes brand/first-viewport rules; no neon-glass template look |
| **Rollback** | Theme CSS feature branch revert |

---

### Phase 5 — Homepage, navigation, animation, loader, WhatsApp

| Item | Detail |
|------|--------|
| **Objective** | Rebuild home composition per guidelines; real CTAs |
| **Existing files affected** | `Hero.js/css`, `Navigation.js/css`, `About.js/css`, `Footer.js/css`, `App.js` loader, `Contact.js`, new WhatsApp FAB component |
| **New files** | `WhatsAppButton`, optional `ServicesTeaser` |
| **DB/API** | Consume CMS home payload |
| **Features** | Slim hero; refined motion; WhatsApp; honest contact wiring start |
| **Dependencies** | Phases 3–4 partially |
| **Risks** | SEO copy vs mobile-only messaging conflict — resolve with owner |
| **Tests** | Responsive screenshots; WhatsApp link format |
| **Acceptance** | First viewport checklist; WhatsApp opens correct chat; resume downloads globally |
| **Rollback** | Revert UI branch; keep APIs |

---

### Phase 6 — Premium web/mobile galleries and case studies

| Item | Detail |
|------|--------|
| **Objective** | Distinct web vs mobile showcases; full gallery UX |
| **Existing files affected** | `Portfolio.js/css`, `ProjectsShowcase.js/css`, `ProjectDetail.js/css`, `mediaHelper.js` |
| **New files** | `GalleryLightbox`, swipe/keyboard hooks, `WebProjectLayout`, `MobileProjectLayout` |
| **DB/API** | Ordered `project_images` |
| **Features** | Featured + multi-image, thumbs, lightbox, swipe, keyboard, mockups, admin upload/delete/order |
| **Dependencies** | Phase 3 media; Phase 4 tokens |
| **Risks** | Large images hurting LCP — require compression pipeline |
| **Tests** | Keyboard gallery; mobile swipe; category layouts |
| **Acceptance** | Web and mobile look intentionally different; gallery controls complete; card size restrained |
| **Rollback** | Fall back to prior detail page |

---

### Phase 7 — Technical SEO and commercial service pages

| Item | Detail |
|------|--------|
| **Objective** | Indexable service pages + meta/sitemap/schema |
| **Existing files affected** | `public/index.html` → Next `metadata` API; `robots.txt`; routing |
| **New files** | `/services/*` pages; `sitemap.ts`; JSON-LD components; canonical redirects (`/showcase`→`/projects`) |
| **DB/API** | SEO entries; services content |
| **Features** | Primary service pages; internal linking; CWV-conscious media |
| **Dependencies** | Next SSR; Phase 3 SEO fields |
| **Risks** | Thin content if rushed — gate publish on quality checklist |
| **Tests** | View-source contains H1/body; Lighthouse SEO; sitemap valid |
| **Acceptance** | Unique meta per URL; sitemap live; `/admin` noindex; no keyword-stuffed duplicates |
| **Rollback** | Unpublish service routes via config |

---

### Phase 8 — Blog CMS and SEO content improvements

| Item | Detail |
|------|--------|
| **Objective** | Working blog with admin editing and article schema |
| **Existing files affected** | Nav/Footer links; sitemap generation |
| **New files** | Blog list/detail; TipTap/MDX editor; tag/category UI |
| **DB/API** | Blog tables |
| **Features** | List, article pages, rich content, categories/tags, featured image, draft/publish, SEO fields, canonical, `BlogPosting` JSON-LD, internal links |
| **Dependencies** | Phases 2–3, 7 |
| **Risks** | XSS in rich text; thin posts |
| **Tests** | Draft not public; published in sitemap; schema valid |
| **Acceptance** | Full blog checklist; existing site content preserved |
| **Rollback** | Hide `/blog` from nav; leave data |

---

### Phase 9 — Performance, responsive optimization, accessibility

| Item | Detail |
|------|--------|
| **Objective** | CWV, a11y, responsive polish |
| **Existing files affected** | Image pipeline; remove/disable `Background3D` on low-end; font loading; CSS |
| **New files** | Optimized image components; a11y utilities |
| **DB/API** | None |
| **Features** | WebP/AVIF, lazy loading, reduced motion, contrast fixes, emoji→SVG completion |
| **Dependencies** | Stable UI from 4–8 |
| **Risks** | Design regressions |
| **Tests** | Lighthouse perf/a11y; axe; device matrix |
| **Acceptance** | Agreed Lighthouse thresholds; no critical a11y violations on key pages |
| **Rollback** | Revert perf PRs selectively |

---

### Phase 10 — End-to-end QA, deployment, launch verification

| Item | Detail |
|------|--------|
| **Objective** | Production cutover confidence |
| **Existing files affected** | Deploy configs (`vercel.json` evolve); remove dead CRA paths when ready |
| **New files** | Runbooks; monitoring checklists |
| **DB/API** | Prod migrations; backup verify |
| **Features** | E2E flows: admin publish → public see; resume; contact; WhatsApp; SEO files |
| **Dependencies** | All prior |
| **Risks** | DNS/cache stale HTML; env misconfig |
| **Tests** | Full suite in [Testing and Acceptance Criteria](#8-testing-and-acceptance-criteria) |
| **Acceptance** | Owner sign-off; Search Console sitemap submitted; PAT absent; stub resume gone |
| **Rollback** | DNS/previous Vercel deployment instant rollback; DB restore from snapshot |

---

### Suggested detailed implementation order (within Phases 2–10)

1. Backup repo + export current `portfolioData.json`.
2. Owner revokes GitHub PATs / rotates credentials.
3. Stand up Next + DB + auth on preview URL.
4. Seed content; read-only public pages from DB.
5. Port Admin mutations; kill client `pushToGitHub`.
6. Resume storage + global download.
7. Contact API + WhatsApp.
8. Design system + homepage composition.
9. Galleries + media manager.
10. Service pages + sitemap/schema.
11. Blog.
12. Perf/a11y pass.
13. Production cutover + verification.
)


---

## 8. Testing and Acceptance Criteria

---

### 1. Test strategy overview

| Layer | Tools / method | When |
|-------|----------------|------|
| Unit | Jest/Vitest — auth helpers, slugify, media normalize, validators | Phases 2–8 |
| Integration | API route tests (authz, contact rate limit, resume MIME) | Phases 2–3, 5 |
| Component | React Testing Library for gallery keyboard/lightbox | Phase 6 |
| E2E | Playwright: public + admin critical paths | Phases 5–10 |
| Manual | Design QA, SEO view-source, mobile devices | Phases 4–10 |
| Security | Checklist from [Security Findings](#2-security-findings) | Phase 2 + 10 |
| Perf/a11y | Lighthouse CI, axe | Phase 9–10 |

---

### 2. Critical E2E flows

1. **Public home loads** without console errors; brand visible in first viewport.
2. **Project case study** opens by slug; problem/solution/architecture visible when seeded.
3. **Gallery:** next/prev, thumbnail select, lightbox open/Esc close, keyboard arrows, touch swipe on mobile viewport.
4. **Resume:** download returns PDF with correct content-type and sensible filename on a clean browser (no admin localStorage).
5. **Contact:** valid submit delivers email/lead; invalid blocked; bot token required in staging/prod.
6. **WhatsApp:** FAB uses CMS number; hidden on admin.
7. **Admin auth:** wrong password fails; session required for mutations; logout clears access.
8. **Project media admin:** upload, reorder, delete reflected on public page after publish.
9. **Blog:** draft not reachable logged-out; published in list + sitemap.
10. **SEO:** service page view-source contains unique title and primary H1 text.

---

### 3. Phase acceptance criteria (condensed)

#### Phase 1
- [x] Eight docs present under `docs/upgrade-plan/`
- [ ] Owner acknowledges architecture choice (Next incremental)

#### Phase 2
- [ ] No `REACT_APP_GITHUB_TOKEN` / localStorage PAT write path in production build
- [ ] Server login required for admin APIs
- [ ] DB seeded from existing JSON (8 projects)

#### Phase 3
- [ ] All CMS domains in owner brief editable in admin
- [ ] Project save preserves problem/solution/architecture/links
- [ ] Resume replace is globally visible

#### Phase 4
- [ ] Design guidelines §2 anti-patterns removed from primary templates
- [ ] Tokens documented in CSS

#### Phase 5
- [ ] First viewport composition rules met
- [ ] WhatsApp + contact real behaviors

#### Phase 6
- [ ] Distinct web vs mobile presentation
- [ ] Gallery feature matrix complete (see below)

#### Phase 7
- [ ] Primary service pages live with quality content
- [ ] sitemap.xml + robots admin disallow + JSON-LD on key templates

#### Phase 8
- [x] Blog list/detail + admin editorial + article schema (local verified)

#### Phase 9
- [ ] Agreed CWV/a11y thresholds on `/`, one service, one case study, one blog post

#### Phase 10
- [ ] Production checklist signed; rollback drill documented

---

### 4. Gallery feature matrix (Phase 6 gate)

| Feature | Required |
|---------|----------|
| Featured screenshot | Yes |
| Multiple images | Yes |
| Slideshow / stage nav | Yes |
| Thumbnail navigation | Yes |
| Lightbox | Yes |
| Mobile swipe | Yes |
| Keyboard controls | Yes |
| Responsive images | Yes |
| Device mockups by category | Yes |
| Admin upload / delete / order | Yes |
| Restrained stage height (not huge grids) | Yes |

---

### 5. Security acceptance (launch)

- [ ] Default password materials removed from client bundles
- [ ] No GitHub write token in frontend
- [ ] Admin APIs return 401 without session
- [ ] Upload MIME/size validation verified
- [ ] CSP baseline deployed (or tracked exception list)
- [ ] Contact rate limited + bot protected

---

### 6. SEO acceptance (launch)

- [ ] `/showcase` redirects to `/projects`
- [ ] Unique title/description per indexable route
- [ ] Canonical URLs correct
- [ ] Sitemap includes published projects/posts/services
- [ ] `noindex` on `/admin`
- [ ] `og:image` present on home + articles + case studies
- [ ] No thin keyword-duplicate service pages

---

### 7. Regression watchlist (known current bugs)

Must not reappear after CMS port:

1. Admin remapping `githubLink` → `githubUrl` / dropping case-study fields  
2. Resume only in uploader’s localStorage  
3. Contact fake success  
4. Social `socialData` vs `socialLinks` split  
5. `usePortfolioData` heuristics overwriting newer CMS data  

---

### 8. Rollback verification

Before cutover: take DB snapshot + note Vercel deployment ID.  
After cutover: confirm prior deployment can be reinstated within 15 minutes; DNS TTL understood.
)

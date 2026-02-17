# CLAUDE.md — Project Guide for AI Assistants

## Project Identity

**Niche Directory Builder** — a system for building SEO-driven niche online directories
that monetize through lead generation. Demo niche: Mobile Pet Grooming (nationwide US).

Repository: `github.com/az9713/niche-directory-builder`

## Architecture Overview

Two independent subsystems connected through Supabase:

```
Python Pipeline (steps 2-8)  --->  Supabase (PostgreSQL)  <---  Next.js Frontend
     writes data via                                          reads data via
     service_role key                                         anon key (public)
```

## Project Structure

```
pipeline/          Python data enrichment pipeline (pandas + Crawl4AI + Claude API)
  utils/           Shared helpers: crawler.py, llm.py, csv_utils.py
  step2-8          Sequential scripts, each reads previous step's CSV
  data/            Intermediate CSVs (gitignored)
frontend/          Next.js 16 + TypeScript + Tailwind CSS v4
  src/app/         Pages: home (/), browse (/groomers), detail (/groomer/[slug])
  src/components/  10 components (Header, Footer, SearchBar, etc.)
  src/lib/         Supabase client, DB queries, TypeScript types
supabase_schema.sql  Complete DB schema (run in Supabase SQL Editor)
docs/              Methodology documentation (6 reference files)
```

## Key Conventions

### Pipeline
- Python 3.10+, pandas for data, Crawl4AI for crawling, Anthropic SDK for LLM
- Each step: reads input CSV → enriches → writes output CSV
- One enrichment type per step (never extract multiple categories at once)
- Claude model: `claude-haiku-4-5-20251001` for all text classification
- Website content truncated to 4000 chars before sending to LLM
- Batch crawling: 5 URLs concurrent, 15s timeout per URL
- LLM classification: 10 concurrent requests via asyncio semaphore

### Frontend
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 (uses `@import "tailwindcss"` — NO tailwind.config.js)
- Supabase client-side queries (anon key, RLS enforced)
- SSG for detail pages (`generateStaticParams`), revalidate=3600
- Client-side filtering on browse page (URL params synced)
- Color palette: emerald-600 primary, gray-50/white backgrounds

### Database
- `listings` table: 40+ columns (core, 11 services, features, images, service area)
- `leads` table: contact form submissions (name, email, phone, pet_type, message)
- RLS: listings = public read; leads = anon insert only
- FTS: tsvector on name + city + state with GIN index
- Upsert on `slug` column (unique constraint)

## Environment Variables

### Pipeline (`pipeline/.env`)
```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Common Tasks

### Run pipeline step
```bash
cd pipeline && python step{N}_{name}.py
```

### Run frontend dev server
```bash
cd frontend && npm run dev
```

### Production build
```bash
cd frontend && npm run build
```

## Adapting to a New Niche

1. Change search queries in `pipeline/step1_outscraper/README.md`
2. Update classification keywords in `step3_verify.py` (CLASSIFICATION_PROMPT)
3. Update service categories in `step4_services.py` (SERVICE_PROMPT, BOOLEAN_SERVICES)
4. Update features in `step6_features.py` (FEATURES_PROMPT, BOOLEAN_FEATURES)
5. Update frontend branding, filters, labels, SERVICE_LABELS in components
6. Update `supabase_schema.sql` column names if service/feature columns change
7. Update TypeScript types in `frontend/src/lib/types.ts`

## Do NOT

- Do not combine multiple enrichment types into a single pipeline step
- Do not remove the placeholder fallback in `frontend/src/lib/supabase.ts` (needed for build)
- Do not add `tailwind.config.js` — Tailwind v4 uses CSS-based config
- Do not use `service_role` key in frontend code (use anon key only)
- Do not skip Step 3 verification — it's the quality gate for the entire directory

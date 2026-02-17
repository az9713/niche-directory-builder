# Developer Guide

A step-by-step guide for developers who want to understand, run, modify, or extend this
project. Written for developers with experience in compiled languages (C, C++, Java) who
may be new to the Python/JavaScript/web ecosystem.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Concepts You Need to Know](#2-concepts-you-need-to-know)
3. [Initial Setup (One Time)](#3-initial-setup-one-time)
4. [Running the Data Pipeline](#4-running-the-data-pipeline)
5. [Setting Up Supabase](#5-setting-up-supabase)
6. [Running the Frontend](#6-running-the-frontend)
7. [Deploying to Production](#7-deploying-to-production)
8. [Understanding the Codebase](#8-understanding-the-codebase)
9. [Modifying for a New Niche](#9-modifying-for-a-new-niche)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### Software to Install

| Software | Version | What It Is | Install From |
|----------|---------|------------|--------------|
| Python | 3.10+ | Pipeline language | python.org |
| Node.js | 20+ | JavaScript runtime for frontend | nodejs.org |
| npm | 10+ | Node.js package manager (comes with Node.js) | (bundled) |
| Git | 2.0+ | Version control | git-scm.com |

### Verify Installation

Open a terminal and run:

```bash
python --version    # Should show 3.10 or higher
node --version      # Should show 20 or higher
npm --version       # Should show 10 or higher
git --version       # Should show 2.x
```

**Windows users:** Use Git Bash, WSL, or PowerShell. The commands in this guide
use Unix-style paths (`/`) but the project works on Windows too.

### Accounts You Need

| Service | URL | Cost | What It Does |
|---------|-----|------|-------------|
| Anthropic | console.anthropic.com | Pay-per-use (~$2-5) | Claude API for AI classification |
| Outscraper | outscraper.com | Pay-per-use (~$5-15) | Google Maps data scraping |
| Supabase | supabase.com | Free tier | PostgreSQL database hosting |
| Vercel | vercel.com | Free tier | Frontend hosting (optional) |
| GitHub | github.com | Free | Code hosting (optional) |

---

## 2. Concepts You Need to Know

If you come from C/C++/Java, here are the web/Python concepts used in this project.

### Python Concepts

**Virtual Environment (venv):** Like a sandboxed installation of Python. Each project
gets its own copy of libraries so they don't conflict. Think of it like a separate
`lib/` directory per project.

```bash
python -m venv .venv              # Create a virtual environment
source .venv/bin/activate         # Activate it (Linux/Mac)
.venv\Scripts\activate            # Activate it (Windows)
pip install -r requirements.txt   # Install libraries into it
```

**pandas:** A Python library for working with tabular data (like a spreadsheet).
A `DataFrame` is a 2D table with named columns. Think of it as a `std::vector`
of rows where each row is a named struct.

```python
import pandas as pd
df = pd.read_csv("data.csv")     # Read CSV into DataFrame
df = df[df["state"] == "TX"]     # Filter rows (like SQL WHERE)
df["slug"] = df["name"].apply(make_slug)  # Add computed column
df.to_csv("output.csv")          # Write back to CSV
```

**asyncio:** Python's built-in library for concurrent I/O. Used for crawling
multiple websites at once. Think of it as lightweight threads for I/O-bound work.

**dotenv:** Reads `.env` files into environment variables. Like loading a config file
at startup.

### JavaScript/TypeScript Concepts

**npm (Node Package Manager):** Like `pip` for Python or `maven` for Java. Installs
dependencies listed in `package.json` into a `node_modules/` directory.

```bash
npm install          # Install all dependencies from package.json
npm run dev          # Run the "dev" script from package.json
npm run build        # Run the "build" script
```

**TypeScript:** JavaScript with static types. Like Java's type system applied to
JavaScript. Files end in `.ts` or `.tsx` (for files with HTML-like syntax).

**React:** A UI library where you write HTML-like code (`JSX/TSX`) in JavaScript
functions. Each function that returns JSX is a "component" — like a custom HTML tag.

```tsx
// A React component (like a class with a render method, but simpler)
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
```

**Next.js (App Router):** A framework built on React that adds:
- File-based routing: `src/app/about/page.tsx` → URL `/about`
- Server components: Components that render on the server (like server-side PHP)
- Client components: Components with `'use client'` that run in the browser
- SSG (Static Site Generation): Pre-render pages at build time
- ISR (Incremental Static Regeneration): Re-render static pages on a timer

**Tailwind CSS:** A utility-first CSS framework. Instead of writing CSS classes,
you apply small utility classes directly in HTML:

```html
<!-- Traditional CSS: class="card" with separate CSS file -->
<!-- Tailwind: all styles inline as classes -->
<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
```

**Supabase:** A hosted PostgreSQL database that auto-generates a REST API.
You query it from JavaScript like this:

```typescript
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('state', 'TX')
  .order('rating', { ascending: false });
```

This generates the SQL: `SELECT * FROM listings WHERE state = 'TX' ORDER BY rating DESC`

---

## 3. Initial Setup (One Time)

### Step 3.1: Clone the Repository

```bash
git clone https://github.com/az9713/niche-directory-builder.git
cd niche-directory-builder
```

### Step 3.2: Set Up the Python Pipeline

```bash
cd pipeline

# Create a virtual environment
python -m venv .venv

# Activate it
source .venv/bin/activate         # Linux/Mac
# .venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# The first time you install crawl4ai, it needs to download a browser:
python -c "from crawl4ai import AsyncWebCrawler; print('OK')"
# If this fails, run: playwright install chromium
```

**What gets installed:**
- `pandas` — data manipulation (like a spreadsheet library)
- `crawl4ai` — web crawler that outputs markdown (uses a headless browser)
- `anthropic` — Claude API client
- `python-dotenv` — reads `.env` files
- `supabase` — Supabase client for Python
- `httpx` — HTTP client

### Step 3.3: Configure Pipeline Environment

```bash
# Still in pipeline/ directory
cp .env.example .env
```

Edit `pipeline/.env` with your actual keys:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
SUPABASE_URL=https://abcdefghij.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Where to find these keys:**
- `ANTHROPIC_API_KEY`: Go to console.anthropic.com → API Keys → Create Key
- `SUPABASE_URL`: Go to supabase.com → Your Project → Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Same page → `service_role` key (NOT the `anon` key)

**IMPORTANT:** The `service_role` key has FULL database access. Never commit it to git.
Never use it in frontend code.

### Step 3.4: Set Up the Frontend

```bash
cd ../frontend

# Install Node.js dependencies
npm install
```

**What gets installed:** (into `node_modules/`, about 200MB — this is normal)
- `next` — the Next.js framework
- `react`, `react-dom` — React UI library
- `@supabase/supabase-js` — Supabase client for JavaScript
- `tailwindcss` — CSS utility framework
- `typescript` — TypeScript compiler

### Step 3.5: Configure Frontend Environment

```bash
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Where to find the anon key:**
- Supabase → Your Project → Settings → API → `anon` `public` key

**Why `NEXT_PUBLIC_` prefix?** In Next.js, only environment variables starting with
`NEXT_PUBLIC_` are exposed to the browser. This is a security feature — you DON'T
want `SUPABASE_SERVICE_ROLE_KEY` leaking to users.

---

## 4. Running the Data Pipeline

### Step 4.1: Get Raw Data from Outscraper (Manual)

1. Go to outscraper.com and create an account
2. Create a new Google Maps scraping task
3. Enter these search queries (one at a time or batched):
   - "mobile pet grooming"
   - "mobile dog grooming"
   - "mobile cat grooming"
   - "in-home pet grooming"
   - "mobile pet spa"
4. Set location to "United States" (or a specific state for testing)
5. Select fields: name, full_address, city, state, zip, phone, website, rating,
   reviews_count, business_status, category
6. Run the scrape and download CSV files
7. Save them to `pipeline/step1_outscraper/raw/`

**Expected:** 300-1500 raw rows, cost $5-15

### Step 4.2: Run Step 2 — Clean Data

```bash
cd pipeline
source .venv/bin/activate    # If not already activated
python step2_clean.py
```

**What it does:**
- Reads all CSVs from `step1_outscraper/raw/`
- Removes rows missing name, address, city, or state
- Removes permanently closed businesses
- Removes known chains (PetSmart, Petco, Walmart, etc.)
- Deduplicates by name + city + state
- Generates URL slugs (e.g., "happy-paws-austin-tx")
- Writes `data/step2_cleaned.csv`

**Verify:** Open `data/step2_cleaned.csv` and spot-check 10 rows. Confirm no chains
remain. Confirm all rows have name, city, state.

### Step 4.3: Run Step 3 — Verify Businesses (MOST CRITICAL)

```bash
python step3_verify.py
```

**What it does:**
- Crawls each business website using a headless browser (Crawl4AI)
- Sends website text (truncated to 4000 chars) to Claude Haiku
- Claude classifies each as MOBILE_GROOMER, SALON_ONLY, NOT_GROOMER, or UNCLEAR
- Keeps only MOBILE_GROOMER + UNCLEAR (businesses without websites)
- Writes `data/step3_verified.csv`

**This step takes 5-30 minutes** depending on how many businesses have websites.

**CRITICAL — Verify 20 results manually:**
1. Open `data/step3_verified.csv`
2. Pick 10 businesses classified as MOBILE_GROOMER
3. Visit their websites — do they actually offer mobile grooming?
4. Pick 10 businesses that were REJECTED (open the full classification output)
5. Visit their websites — were they correctly rejected?
6. Target: >85% accuracy. If lower, adjust keywords in `step3_verify.py`

**Cost:** ~$0.50 (Claude Haiku is very cheap)

### Step 4.4: Run Steps 4, 6, 7 — Enrichment

```bash
python step4_services.py     # Extract services, pet types, prices
# python step5_images.py     # OPTIONAL: skip unless you need images
python step6_features.py     # Extract features (licensed, insured, etc.)
python step7_service_areas.py  # Extract service areas
```

Each step:
1. Reads the previous step's CSV
2. Crawls websites again (yes, redundantly — keeps each step independent)
3. Sends text to Claude Haiku with a step-specific prompt
4. Parses the structured response
5. Writes enriched CSV

**Verify after each step:** Open the CSV, pick 15 businesses, visit their websites,
confirm the extracted data is accurate.

### Step 4.5: Run Step 8 — Finalize and Upload

```bash
python step8_finalize.py
```

**What it does:**
- Auto-detects the latest pipeline CSV (step7 → step6 → step5 → step4 → step3)
- Selects production columns, validates data integrity
- Fixes duplicate slugs, coerces booleans, swaps inverted price ranges
- Writes `data/final_listings.csv`
- Upserts to Supabase `listings` table (if credentials are configured)

**Verify:** `SELECT count(*) FROM listings` in Supabase SQL Editor should match
the CSV row count.

---

## 5. Setting Up Supabase

### Step 5.1: Create a Supabase Project

1. Go to supabase.com and sign up (free)
2. Click "New Project"
3. Choose a name (e.g., "pet-grooming-directory")
4. Set a database password (save it somewhere safe)
5. Choose a region close to your users
6. Wait for the project to be created (~2 minutes)

### Step 5.2: Run the Schema SQL

1. In your Supabase project, go to SQL Editor (left sidebar)
2. Click "New Query"
3. Open `supabase_schema.sql` from this repository
4. Copy and paste the ENTIRE file into the SQL Editor
5. Click "Run"

**What this creates:**
- `listings` table with 40+ columns
- `leads` table for contact form submissions
- Full-text search column (`fts`) with GIN index
- 7 database indexes for fast queries
- Row Level Security (RLS) policies
- Auto-updating `updated_at` trigger

### Step 5.3: Get Your API Keys

Go to Settings → API in your Supabase project:

- **Project URL** → This is your `SUPABASE_URL`
- **anon public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for frontend)
- **service_role key** → This is your `SUPABASE_SERVICE_ROLE_KEY` (for pipeline)

---

## 6. Running the Frontend

### Step 6.1: Development Server

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

**What you'll see:**
- If Supabase is configured with data: the full directory with listings
- If Supabase has no data yet: "-- Verified Groomers", "-- States Covered", empty browse

**Hot reload:** Edit any file in `frontend/src/` and the browser updates instantly.
No need to restart the server.

### Step 6.2: Production Build

```bash
npm run build
```

This compiles the application for production:
- Minifies JavaScript and CSS
- Pre-renders static pages (homepage, all detail pages)
- Generates sitemap.xml
- Optimizes images and fonts

**Expected output:**

```
Route (app)                              Size     First Load JS
/                                        xxx kB   xxx kB
/groomer/[slug]                          xxx kB   xxx kB
/groomers                                xxx kB   xxx kB
/sitemap.xml                             0 B      0 B
/robots.txt                              0 B      0 B
```

### Step 6.3: Run Production Build Locally

```bash
npm run start
```

Opens at http://localhost:3000 — this serves the built files, not the dev server.

---

## 7. Deploying to Production

### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to vercel.com and sign up (free tier is sufficient)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js — leave settings as defaults
6. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click "Deploy"
8. Wait 1-2 minutes — your site is live at `your-project.vercel.app`

### Option B: Deploy Anywhere with Node.js

```bash
cd frontend
npm run build
npm run start   # Serves on port 3000
```

Use a reverse proxy (nginx, Caddy) to expose port 3000 to the internet.

### After Deployment: Update URLs

1. Update `frontend/src/app/sitemap.ts` — change `baseUrl`
2. Update `frontend/src/app/robots.ts` — change sitemap URL
3. Update `frontend/src/components/JsonLd.tsx` — change site URL
4. Update `frontend/.env.local` — set `NEXT_PUBLIC_SITE_URL`
5. Redeploy

---

## 8. Understanding the Codebase

### File-by-File Guide

#### Pipeline Utilities

| File | Purpose | Key Functions |
|------|---------|--------------|
| `utils/crawler.py` | Web crawling via Crawl4AI | `crawl_url()`, `crawl_urls()` |
| `utils/llm.py` | Claude API calls | `classify()`, `classify_batch()` |
| `utils/csv_utils.py` | CSV read/write | `read_csv()`, `write_csv()`, `read_all_csvs()` |

#### Pipeline Steps

| File | Input | Output | Tools Used |
|------|-------|--------|------------|
| `step2_clean.py` | `raw/*.csv` | `step2_cleaned.csv` | pandas |
| `step3_verify.py` | `step2_cleaned.csv` | `step3_verified.csv` | Crawl4AI + Claude |
| `step4_services.py` | `step3_verified.csv` | `step4_services.csv` | Crawl4AI + Claude |
| `step5_images.py` | `step4_services.csv` | `step5_images.csv` | Crawl4AI + Claude Vision |
| `step6_features.py` | `step4_services.csv` | `step6_features.csv` | Crawl4AI + Claude |
| `step7_service_areas.py` | `step6_features.csv` | `step7_areas.csv` | Crawl4AI + Claude |
| `step8_finalize.py` | latest available CSV | `final_listings.csv` | pandas + Supabase |

#### Frontend Libraries

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/queries.ts` | All database query functions |
| `src/lib/types.ts` | TypeScript interfaces (Listing, Lead, ListingFilters) |

#### Frontend Pages

| File | URL Route | Rendering |
|------|-----------|-----------|
| `src/app/page.tsx` | `/` | SSG (static, revalidate every hour) |
| `src/app/groomers/page.tsx` | `/groomers` | Server wrapper + client component |
| `src/app/groomer/[slug]/page.tsx` | `/groomer/happy-paws-tx` | SSG per listing |
| `src/app/sitemap.ts` | `/sitemap.xml` | Dynamic at build time |
| `src/app/robots.ts` | `/robots.txt` | Static |

#### Frontend Components

| Component | Type | Purpose |
|-----------|------|---------|
| `Header.tsx` | Server | Navigation bar with mobile hamburger |
| `Footer.tsx` | Server | Site footer with links |
| `HomeSearchBar.tsx` | Client | Homepage search → navigates to /groomers |
| `SearchBar.tsx` | Client | Reusable search input with callback |
| `FilterSidebar.tsx` | Client | State, city, services, features filters |
| `ListingCard.tsx` | Server | Card in browse grid |
| `ListingDetail.tsx` | Server | Full listing on detail page |
| `LeadForm.tsx` | Client | Contact form, inserts to Supabase |
| `JsonLd.tsx` | Server | Schema.org structured data |
| `BrowsePage.tsx` | Client | Browse layout wrapper |

**Server vs Client components:**
- **Server** = renders on the server, can fetch data directly, smaller JS bundle
- **Client** = has `'use client'` directive, runs in browser, can use hooks (useState, useEffect)

---

## 9. Modifying for a New Niche

Want to build a directory for mobile auto detailing, junk removal, or mobile notary?

### Step 9.1: Update Search Queries

Edit `pipeline/step1_outscraper/README.md` with new Outscraper queries:

```
# Example: Mobile Auto Detailing
"mobile auto detailing"
"mobile car wash"
"mobile car detailing"
"on-site auto detailing"
```

### Step 9.2: Update Classification (Step 3)

Edit `step3_verify.py`:
- Change `CLASSIFICATION_PROMPT` — update categories and keywords
- Example: MOBILE_DETAILER / SHOP_ONLY / NOT_DETAILER / UNCLEAR
- Update keywords: "mobile", "we come to you", "at your location", etc.

### Step 9.3: Update Services (Step 4)

Edit `step4_services.py`:
- Change `SERVICE_PROMPT` — list new services to extract
- Change `BOOLEAN_SERVICES` list to match
- Example: exterior_wash, interior_detail, ceramic_coating, paint_correction, etc.

### Step 9.4: Update Features (Step 6)

Edit `step6_features.py`:
- Change `FEATURES_PROMPT` — list new features to extract
- Change `BOOLEAN_FEATURES` list to match
- Example: is_insured, uses_eco_products, fleet_pricing, etc.

### Step 9.5: Update Database Schema

Edit `supabase_schema.sql`:
- Rename/add/remove service columns (`svc_*`)
- Rename/add/remove feature columns
- Drop and recreate the table (or use ALTER TABLE)

### Step 9.6: Update Frontend

1. **TypeScript types** (`src/lib/types.ts`) — update Listing interface
2. **Filter sidebar** (`src/components/FilterSidebar.tsx`) — update checkboxes
3. **Listing detail** (`src/components/ListingDetail.tsx`) — update service/feature display
4. **Listing card** (`src/components/ListingCard.tsx`) — update badges
5. **Detail page** (`src/app/groomer/[slug]/page.tsx`) — update SERVICE_LABELS
6. **Branding** — update Header.tsx, layout.tsx metadata, JsonLd.tsx
7. **URL routes** — rename `groomer/` to your niche term if desired

---

## 10. Troubleshooting

### Pipeline Issues

**"ANTHROPIC_API_KEY not set"**
- Check `pipeline/.env` exists and has the key
- Ensure the virtual environment is activated: `source .venv/bin/activate`

**"No CSV files found in raw/"**
- Run Outscraper first and save CSVs to `pipeline/step1_outscraper/raw/`

**Crawl4AI hangs or fails**
- Ensure `playwright install chromium` has been run
- Try increasing timeout: edit `crawl_urls(urls, batch_size=5, timeout=30)`
- Some websites block headless browsers — these will return `None` (expected)

**Claude API rate limits**
- Reduce concurrency: change `max_concurrent=10` to `5` in the classify_batch calls

### Frontend Issues

**"supabaseUrl is required" during build**
- The fallback in `supabase.ts` should handle this. Ensure you haven't removed the
  placeholder fallback: `supabaseUrl || 'https://placeholder.supabase.co'`

**No data showing on the frontend**
- Verify data exists: check Supabase Table Editor → listings
- Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check browser console for errors (F12 → Console)

**Tailwind styles not working**
- Tailwind v4 does NOT use `tailwind.config.js` — do not create one
- Styles are configured in `src/app/globals.css` with `@import "tailwindcss"`

**Build fails with type errors**
- Run `npm run lint` to see all errors
- TypeScript is strict — all types must match exactly

### Supabase Issues

**"permission denied for table listings"**
- RLS is enabled. Frontend must use the `anon` key, not the `service_role` key
- Check that RLS policies were created: run the schema SQL again

**Full-text search returns no results**
- The `fts` column is auto-generated. Check it exists: `SELECT fts FROM listings LIMIT 1`
- Ensure the GIN index was created: check Supabase → Database → Indexes

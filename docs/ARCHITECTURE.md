# Architecture Documentation

This document describes the architecture of the Niche Directory Builder at multiple
levels of abstraction. All diagrams are ASCII art.

---

## Table of Contents

1. [Level 0: System Context](#level-0-system-context)
2. [Level 1: High-Level Architecture](#level-1-high-level-architecture)
3. [Level 2: Data Pipeline Architecture](#level-2-data-pipeline-architecture)
4. [Level 3: Frontend Architecture](#level-3-frontend-architecture)
5. [Level 4: Database Architecture](#level-4-database-architecture)
6. [Level 5: Component Communication Flows](#level-5-component-communication-flows)
7. [Level 6: Deployment Architecture](#level-6-deployment-architecture)

---

## Level 0: System Context

Who interacts with this system and what external services does it use?

```
                          +-------------------+
                          |    Site Visitor    |
                          |   (Pet Owner)      |
                          +--------+----------+
                                   |
                                   | HTTPS
                                   v
                          +-------------------+
                          |  Niche Directory   |
                          |    Application     |
                          +-------------------+
                                   |
                    +--------------+--------------+
                    |              |              |
                    v              v              v
            +-----------+  +-----------+  +-----------+
            | Outscraper |  | Claude API |  |  Supabase  |
            | (Google    |  | (Anthropic)|  | (Postgres  |
            |  Maps)     |  |            |  |  + Auth)   |
            +-----------+  +-----------+  +-----------+

            Outscraper    Claude Haiku     Supabase
            provides raw  classifies and   stores final
            business data extracts data    listings + leads
```

**Actors:**
- **Site Visitor** — searches, browses, filters listings, submits lead forms
- **Directory Operator** — runs the data pipeline, manages data quality

**External Services:**
- **Outscraper** — scrapes Google Maps for raw business data (Step 1, manual)
- **Claude API** — AI classification and extraction (Steps 3-7, automated)
- **Supabase** — PostgreSQL database with auto-generated REST API, RLS, FTS

---

## Level 1: High-Level Architecture

The system has two independent subsystems that share a Supabase database.

```
+================================================================+
|                    NICHE DIRECTORY BUILDER                       |
|                                                                 |
|  +-------------------------+    +----------------------------+  |
|  |   DATA PIPELINE         |    |   FRONTEND                  |  |
|  |   (Python)              |    |   (Next.js)                 |  |
|  |                         |    |                             |  |
|  |  Outscraper CSVs        |    |  Homepage (SSG)             |  |
|  |       |                 |    |  Browse page (Client)       |  |
|  |       v                 |    |  Detail page (SSG)          |  |
|  |  step2 -> step3 -> ...  |    |  Lead form (Client)         |  |
|  |       |                 |    |                             |  |
|  |       v                 |    +-------------+---------------+  |
|  |  step8 (finalize)       |                  |                  |
|  |       |                 |                  |                  |
|  +-------+-----------------+                  |                  |
|          |                                    |                  |
|          | WRITE                         READ |                  |
|          | (service_role key)     (anon key)   |                  |
|          v                                    v                  |
|  +------------------------------------------------------+       |
|  |                    SUPABASE                            |       |
|  |                                                       |       |
|  |  +---------------+    +---------------+               |       |
|  |  |   listings    |    |    leads      |               |       |
|  |  | (40+ columns) |    | (form submits)|               |       |
|  |  +---------------+    +---------------+               |       |
|  |                                                       |       |
|  |  PostgreSQL + RLS + FTS + REST API                    |       |
|  +------------------------------------------------------+       |
+================================================================+
```

**Key principle:** The pipeline WRITES data, the frontend READS data. They never
interact directly. Supabase is the integration point.

**Security boundary:** The pipeline uses `service_role` key (full access).
The frontend uses `anon` key (read listings, insert leads only).

---

## Level 2: Data Pipeline Architecture

Each step is an independent Python script. Data flows as CSV files between steps.

```
  +------------------+
  |  Outscraper      |     MANUAL: Run Outscraper, download CSVs
  |  (Google Maps)   |     Output: pipeline/step1_outscraper/raw/*.csv
  +--------+---------+
           |
           | raw CSVs (name, address, phone, website, rating, ...)
           v
  +------------------+
  |  step2_clean.py  |     Remove junk, chains, dupes, generate slugs
  |                  |     Tools: pandas only
  +--------+---------+     Output: data/step2_cleaned.csv
           |
           | cleaned CSV
           v
  +------------------+
  |  step3_verify.py |     MOST CRITICAL: Crawl websites + classify
  |                  |     Tools: Crawl4AI + Claude Haiku
  +--------+---------+     Output: data/step3_verified.csv
           |               (only MOBILE_GROOMER + UNCLEAR kept)
           | verified CSV
           v
  +------------------+
  |  step4_services  |     Extract 11 services + pet types + prices
  |                  |     Tools: Crawl4AI + Claude Haiku
  +--------+---------+     Output: data/step4_services.csv
           |
           | enriched CSV
           v
  +------------------+
  |  step5_images    |     OPTIONAL: Scrape + verify images
  |  (SKIP DEFAULT)  |     Tools: Crawl4AI + Claude Vision
  +--------+---------+     Output: data/step5_images.csv
           |
           | (skipped by default)
           v
  +------------------+
  |  step6_features  |     Extract 8 features (licensed, insured, ...)
  |                  |     Tools: Crawl4AI + Claude Haiku
  +--------+---------+     Output: data/step6_features.csv
           |               Reads from step4 (skips step5)
           | enriched CSV
           v
  +------------------+
  |  step7_areas     |     Extract service areas + radius
  |                  |     Tools: Crawl4AI + Claude Haiku
  +--------+---------+     Output: data/step7_areas.csv
           |
           | enriched CSV
           v
  +------------------+
  |  step8_finalize  |     Validate + write final CSV + upsert Supabase
  |                  |     Tools: pandas + supabase-py
  +--------+---------+     Output: data/final_listings.csv + Supabase
           |
           v
      [Supabase DB]
```

### Pipeline Internal Architecture (per step)

Each enrichment step (3, 4, 6, 7) follows the same pattern:

```
  +---------------+     +----------------+     +--------------+
  | Read CSV      | --> | Crawl websites | --> | Send to LLM  |
  | (pandas)      |     | (Crawl4AI,     |     | (Claude Haiku|
  |               |     |  batches of 5) |     |  10 parallel)|
  +---------------+     +----------------+     +--------------+
                                                      |
                                                      v
                                               +--------------+
                                               | Parse LLM    |
                                               | response     |
                                               | (pipe-delim) |
                                               +--------------+
                                                      |
                                                      v
                                               +--------------+
                                               | Write CSV    |
                                               | (pandas)     |
                                               +--------------+
```

### Shared Utilities

```
  pipeline/utils/
  +------------------+------------------------------------------+
  | crawler.py       | Crawl4AI wrapper                          |
  |                  |   crawl_url(url) -> str | None            |
  |                  |   crawl_urls(urls, batch=10) -> dict      |
  |                  |   Uses AsyncWebCrawler, headless browser  |
  +------------------+------------------------------------------+
  | llm.py           | Claude API wrapper                        |
  |                  |   classify(prompt) -> str                 |
  |                  |   classify_batch(items, template) -> list |
  |                  |   Lazy-init client, semaphore concurrency |
  +------------------+------------------------------------------+
  | csv_utils.py     | Pandas CSV helpers                        |
  |                  |   read_csv(path) -> DataFrame             |
  |                  |   write_csv(df, path) -> None             |
  |                  |   read_all_csvs(dir) -> DataFrame         |
  +------------------+------------------------------------------+
```

---

## Level 3: Frontend Architecture

### Page Structure

```
  Next.js App Router
  ==================

  /                          Homepage (SSG, revalidate=3600)
  |                          Server component, fetches stats
  |
  /groomers                  Browse page (Server + Client hybrid)
  |                          Server wrapper with metadata
  |                          Client component does filtering
  |
  /groomer/[slug]            Detail page (SSG via generateStaticParams)
  |                          Pre-rendered at build time
  |                          revalidate=3600
  |
  /sitemap.xml               Dynamic sitemap (all listing URLs)
  /robots.txt                Allows all crawlers
```

### Component Hierarchy

```
  layout.tsx (RootLayout)
  +-- Header.tsx                     Site-wide navigation
  +-- main
  |   +-- page.tsx (HomePage)
  |   |   +-- HomeSearchBar.tsx      Navigates to /groomers?search=
  |   |
  |   +-- groomers/page.tsx          Server wrapper
  |   |   +-- BrowsePageClient.tsx   Client-side filtering
  |   |       +-- SearchBar.tsx      Reusable search input
  |   |       +-- FilterSidebar.tsx  State, city, services, features
  |   |       +-- ListingCard.tsx    Card in grid (x many)
  |   |
  |   +-- groomer/[slug]/page.tsx    Detail page
  |       +-- JsonLd.tsx             Schema.org structured data
  |       +-- ListingDetail.tsx      Full listing info
  |       +-- LeadForm.tsx           Contact form (client component)
  |
  +-- Footer.tsx                     Site-wide footer
```

### Data Flow (Browse Page)

```
  User types search / changes filter
           |
           v
  +-------------------+
  | BrowsePageClient  |    Client component (useState + useEffect)
  |                   |
  | 1. Parse URL      |    URL params -> ListingFilters
  |    params         |
  |                   |
  | 2. Build Supabase |    Supabase JS client builds query:
  |    query          |    .from('listings').select('*', {count:'exact'})
  |                   |    .textSearch() / .eq() / .gte() / .contains()
  |                   |    .order('rating', {ascending: false})
  |                   |    .range(from, to)
  |                   |
  | 3. Fetch data     |    Direct HTTPS to Supabase REST API
  |                   |    (anon key in Authorization header)
  |                   |
  | 4. Render results |    ListingCard grid + pagination
  |                   |
  | 5. Update URL     |    router.push('/groomers?state=TX&...')
  +-------------------+    (no page reload, just URL sync)
```

### Data Flow (Lead Form Submission)

```
  User fills out form on detail page
           |
           v
  +-------------------+
  | LeadForm.tsx      |    Client component
  |                   |
  | 1. Validate       |    Name + email required
  |                   |
  | 2. Insert         |    supabase.from('leads').insert({
  |                   |      listing_id, name, email, phone,
  |                   |      pet_type, message
  |                   |    })
  |                   |
  | 3. Show result    |    Success message or error
  +-------------------+
           |
           v
  +-------------------+
  | Supabase          |    RLS: anon can INSERT into leads
  | leads table       |    service_role can SELECT (admin/CRM)
  +-------------------+
```

---

## Level 4: Database Architecture

### Entity Relationship Diagram

```
  +------------------------------------------------------------------+
  |                          listings                                  |
  +------------------------------------------------------------------+
  | PK  id              BIGSERIAL                                     |
  |     slug            TEXT UNIQUE NOT NULL    <-- URL identifier     |
  |     name            TEXT NOT NULL                                  |
  |     full_address    TEXT                                           |
  |     city            TEXT NOT NULL                                  |
  |     state           TEXT NOT NULL                                  |
  |     zip             TEXT                                           |
  |     phone           TEXT                                           |
  |     website         TEXT                                           |
  |     rating          DECIMAL(2,1)                                   |
  |     reviews_count   INTEGER                                        |
  |     google_maps_url TEXT                                           |
  |     classification  TEXT           (MOBILE_GROOMER / UNCLEAR)      |
  |     verification_confidence INTEGER (0-100)                        |
  |------------------------------------------------------------------+
  | SERVICES (11 booleans)                                            |
  |     svc_full_groom, svc_bath_only, svc_nail_trim,                |
  |     svc_deshedding, svc_teeth_brushing, svc_ear_cleaning,        |
  |     svc_flea_treatment, svc_puppy_groom, svc_senior_groom,       |
  |     svc_dematting, svc_breed_cuts                                  |
  |------------------------------------------------------------------+
  | PET TYPES                                                          |
  |     accepts_dogs    BOOLEAN DEFAULT TRUE                           |
  |     accepts_cats    BOOLEAN DEFAULT FALSE                          |
  |     breed_sizes     TEXT[]        (small, medium, large, xl)       |
  |     price_range_low  DECIMAL(8,2)                                  |
  |     price_range_high DECIMAL(8,2)                                  |
  |------------------------------------------------------------------+
  | FEATURES (8 fields)                                                |
  |     is_licensed, is_insured, fear_free_certified,                 |
  |     years_experience INTEGER, uses_natural_products,              |
  |     cage_free, one_on_one_attention, online_booking               |
  |------------------------------------------------------------------+
  | IMAGES                                                             |
  |     image_url       TEXT                                           |
  |     image_description TEXT                                         |
  |------------------------------------------------------------------+
  | SERVICE AREA                                                       |
  |     primary_city         TEXT                                      |
  |     service_cities       TEXT[]                                    |
  |     service_radius_miles INTEGER                                   |
  |------------------------------------------------------------------+
  | TIMESTAMPS                                                         |
  |     created_at      TIMESTAMPTZ DEFAULT NOW()                      |
  |     updated_at      TIMESTAMPTZ DEFAULT NOW()  (auto-trigger)      |
  |------------------------------------------------------------------+
  | GENERATED                                                          |
  |     fts             TSVECTOR  (name + city + state)                |
  +------------------------------------------------------------------+
         |
         | 1:N
         v
  +------------------------------------------------------------------+
  |                           leads                                    |
  +------------------------------------------------------------------+
  | PK  id              BIGSERIAL                                     |
  | FK  listing_id      BIGINT -> listings(id)                        |
  |     name            TEXT NOT NULL                                  |
  |     email           TEXT NOT NULL                                  |
  |     phone           TEXT                                           |
  |     pet_type        TEXT                                           |
  |     message         TEXT                                           |
  |     created_at      TIMESTAMPTZ DEFAULT NOW()                      |
  +------------------------------------------------------------------+
```

### Index Strategy

```
  INDEX NAME                    TYPE     COLUMNS              PURPOSE
  ----------------------------- -------- -------------------- --------------------
  idx_listings_state            B-tree   (state)              Filter by state
  idx_listings_city_state       B-tree   (city, state)        Filter by city+state
  idx_listings_slug             B-tree   (slug)               Detail page lookup
  idx_listings_rating           B-tree   (rating DESC)        Sort by rating
  idx_listings_fts              GIN      (fts)                Full-text search
  idx_listings_fear_free        Partial  (id) WHERE true      Fear Free filter
  idx_listings_accepts_cats     Partial  (id) WHERE true      Accepts cats filter
```

### Row Level Security (RLS) Policies

```
  TABLE      OPERATION   ROLE             EFFECT
  ---------- ----------- ---------------- --------------------------------
  listings   SELECT      anon,authed      ALLOW (public browsing)
  listings   INSERT      service_role     ALLOW (pipeline writes)
  listings   UPDATE      service_role     ALLOW (pipeline updates)
  listings   DELETE      service_role     ALLOW (admin cleanup)
  leads      INSERT      anon,authed      ALLOW (form submissions)
  leads      SELECT      service_role     ALLOW (admin/CRM reads)
  leads      UPDATE      service_role     ALLOW (admin management)
  leads      DELETE      service_role     ALLOW (admin cleanup)
```

---

## Level 5: Component Communication Flows

### Flow 1: End-to-End Data Journey (Pipeline to User)

```
  Google Maps
      |
      | (Outscraper scrape)
      v
  Raw CSV files
      |
      | step2_clean.py (pandas)
      v
  Cleaned CSV ----+
      |           |
      | step3     | Each step: Crawl website text
      | step4     |            Send to Claude Haiku
      | step6     |            Parse pipe-delimited response
      | step7     |            Write enriched CSV
      v           |
  Enriched CSV <--+
      |
      | step8_finalize.py
      | (validate + upsert)
      v
  Supabase DB (listings table)
      |
      | Supabase REST API (PostgREST)
      | (HTTPS, anon key, RLS enforced)
      v
  Next.js Frontend
      |
      | Server components (SSG at build)
      | Client components (runtime queries)
      v
  User's Browser
```

### Flow 2: Search Query Lifecycle

```
  User types "Austin mobile groomer"
      |
      v
  SearchBar.tsx
      | onSearch(query)
      v
  BrowsePageClient.tsx
      | setFilters({search: "Austin mobile groomer", page: 1})
      | router.push('/groomers?search=Austin+mobile+groomer')
      |
      | useEffect triggers on filters change
      v
  Supabase JS Client
      | supabase.from('listings')
      |   .select('*', {count: 'exact'})
      |   .textSearch('fts', 'Austin mobile groomer', {type: 'websearch'})
      |   .order('rating', {ascending: false})
      |   .range(0, 19)
      v
  Supabase REST API
      | PostgREST translates to SQL:
      | SELECT * FROM listings
      |   WHERE fts @@ websearch_to_tsquery('Austin mobile groomer')
      |   ORDER BY rating DESC NULLS LAST
      |   LIMIT 20 OFFSET 0
      v
  PostgreSQL (with GIN index on fts column)
      | Returns matching rows + total count
      v
  BrowsePageClient.tsx
      | setListings(data), setCount(totalCount)
      | Renders ListingCard grid
      v
  User sees filtered results
```

### Flow 3: Static Page Generation (Build Time)

```
  npm run build
      |
      v
  Next.js Build Process
      |
      +-- Homepage (page.tsx)
      |   | Server component
      |   | Calls getListingCount(), getStateCount()
      |   | Supabase query -> count of listings, unique states
      |   | Renders static HTML
      |
      +-- Browse page (groomers/page.tsx)
      |   | Server wrapper renders metadata
      |   | BrowsePageClient.tsx is client-side (no SSG)
      |   | Renders shell HTML, data loads at runtime
      |
      +-- Detail pages (groomer/[slug]/page.tsx)
      |   | generateStaticParams() calls getAllSlugs()
      |   | For each slug: getListingBySlug(slug)
      |   | Pre-renders one HTML page per listing
      |   | Includes JSON-LD structured data
      |
      +-- Sitemap (sitemap.ts)
      |   | Fetches all slugs from Supabase
      |   | Generates XML with all URLs
      |
      +-- Robots (robots.ts)
          | Static: allow all, reference sitemap
```

---

## Level 6: Deployment Architecture

```
  +----------------------------------------------------------+
  |                      INTERNET                              |
  +----------------------------------------------------------+
           |                              |
           v                              v
  +------------------+           +------------------+
  |     Vercel        |           |    Supabase       |
  |                   |           |    (AWS)          |
  | +---------------+ |           | +---------------+ |
  | | CDN (Edge)    | |           | | PostgreSQL    | |
  | | Static HTML   | |           | | (listings,    | |
  | | CSS, JS       | |           | |  leads)       | |
  | +-------+-------+ |           | +-------+-------+ |
  |         |         |           |         |         |
  | +-------+-------+ |           | +-------+-------+ |
  | | Serverless    | |   HTTPS   | | PostgREST     | |
  | | Functions     |-+---------->| | (REST API)    | |
  | | (SSR/ISR)     | |  queries  | |               | |
  | +---------------+ |           | +---------------+ |
  +------------------+           +------------------+

  Vercel serves:                 Supabase provides:
  - Static HTML (CDN cached)     - PostgreSQL database
  - SSR pages (serverless)       - Auto-generated REST API
  - ISR revalidation (3600s)     - Row Level Security
  - Client JS bundles            - Full-text search
                                 - Realtime (unused)
```

### Environment Variables in Production

```
  Vercel Dashboard -> Settings -> Environment Variables:
  +------------------------------------+-------------------------+
  | Variable                           | Source                  |
  +------------------------------------+-------------------------+
  | NEXT_PUBLIC_SUPABASE_URL           | Supabase project URL    |
  | NEXT_PUBLIC_SUPABASE_ANON_KEY      | Supabase anon key       |
  +------------------------------------+-------------------------+

  Pipeline (.env — local machine only, never deployed):
  +------------------------------------+-------------------------+
  | ANTHROPIC_API_KEY                  | Anthropic dashboard     |
  | SUPABASE_URL                       | Supabase project URL    |
  | SUPABASE_SERVICE_ROLE_KEY          | Supabase service key    |
  +------------------------------------+-------------------------+
```

---

## Technology Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js 16 (App Router) | SSG for SEO, ISR for freshness, server components |
| CSS framework | Tailwind CSS v4 | Utility-first, CSS-based config (no JS config file) |
| Database | Supabase (PostgreSQL) | Free tier, RLS, FTS, auto REST API, no backend needed |
| AI model | Claude Haiku | Fast, cheap ($0.25/M input), accurate for classification |
| Web crawler | Crawl4AI | LLM-optimized markdown output, async, headless |
| Data processing | pandas | Industry standard, powerful CSV manipulation |
| Hosting | Vercel | Zero-config Next.js deployment, free tier |
| Raw data source | Outscraper | Reliable Google Maps data, affordable |

---

## Security Model

```
  +-----------------+     +--------------------+     +----------------+
  | Pipeline        |     | Frontend           |     | Supabase       |
  | (local machine) |     | (Vercel/browser)   |     | (PostgreSQL)   |
  +-----------------+     +--------------------+     +----------------+
  |                 |     |                    |     |                |
  | service_role    |     | anon key           |     | RLS enforced   |
  | key (FULL       |     | (LIMITED access:   |     | on all tables  |
  |  access to DB)  |     |  SELECT listings,  |     |                |
  |                 |     |  INSERT leads)     |     |                |
  | NEVER deployed  |     |                    |     |                |
  | NEVER in git    |     | Exposed in client  |     |                |
  | .env only       |     | (safe because RLS) |     |                |
  +-----------------+     +--------------------+     +----------------+
```

The `anon` key is safe to expose in client-side JavaScript because Supabase
RLS policies restrict it to only `SELECT` on `listings` and `INSERT` on `leads`.
It cannot read leads, modify listings, or access any other data.

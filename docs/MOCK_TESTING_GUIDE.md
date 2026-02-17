# Mock Testing Guide

How to run and test the frontend without a Supabase database, and how the mock
workflow maps to the real lead-generation business model.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [What Mock Mode Does](#2-what-mock-mode-does)
3. [Running in Mock Mode](#3-running-in-mock-mode)
4. [Testing the Workflow](#4-testing-the-workflow)
5. [How Mock Maps to Production](#5-how-mock-maps-to-production)
6. [Switching to Real Supabase](#6-switching-to-real-supabase)
7. [Technical Details](#7-technical-details)

---

## 1. What This Project Is

This is a **niche online directory** — think Yelp or Angi, but focused on a
single vertical (the demo niche is Mobile Pet Grooming). You are the
**directory owner**, not the groomer.

The business model is **lead-generation arbitrage**:

1. Pet owners Google "mobile pet grooming Houston"
2. Your directory ranks on Google (every listing page is SEO-optimized)
3. A pet owner lands on your site, browses groomers, and fills out "Request a Quote"
4. That lead (name, email, phone, message) goes into **your** `leads` table — you own it
5. You monetize by selling leads to groomers or charging for premium placement

The key pages:

| URL | What It Is | Your Role |
|-----|-----------|-----------|
| `/` | Homepage — "Find Mobile Pet Groomers" | Your landing page, drives SEO traffic |
| `/groomers` | Browse/search page with filters | Your search experience, keeps visitors engaged |
| `/groomer/[slug]` | Detail page about one groomer | Your listing page (not the groomer's website) |

The groomer's actual website is just a link within the listing info. The detail
page itself — the layout, the content, and especially the lead form — belongs
to you.

---

## 2. What Mock Mode Does

Normally the frontend reads listing data from Supabase (PostgreSQL) and writes
leads there. Mock mode removes that dependency so you can run `npm run dev`
immediately — no Supabase account, no database setup, no environment variables.

Mock mode provides:

- **100 programmatically generated seed listings** across 40 cities in 22
  states, with varied services, ratings, prices, and features
- **In-memory filtering** that mirrors the real Supabase queries (state, city,
  search, services, rating, pagination)
- **Market Insights panel** that computes service coverage stats and identifies
  gaps for any selected state or city
- **Lead form submission** that logs to the browser console instead of writing
  to a database
- **Deliberate service deserts** in 6 states (GA, WA, CO, IN, OH, MN) for
  demonstrating arbitrage/market gap analysis

Auto-detection is automatic: if `NEXT_PUBLIC_SUPABASE_URL` is empty or contains
`"placeholder"`, mock mode activates. No code changes or flags needed.

---

## 3. Running in Mock Mode

```bash
cd frontend

# Make sure there is no .env.local, or that it has no NEXT_PUBLIC_SUPABASE_URL
# If you have one with real credentials, temporarily rename it:
mv .env.local .env.local.bak

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000`. You should see the directory homepage with 100
listings across 22 states.

---

## 4. Testing the Workflow

Though this uses seed data, the mock test exercises the same filtering and
lead-generation components as the production workflow. Here is what to verify:

### 4a. Homepage

Visit `http://localhost:3000`.

- Stats should show 100 listings across 22 states
- Navigation links to the browse page work

### 4b. Browse Page — Filtering

Visit `http://localhost:3000/groomers`.

- **State dropdown**: Select "TX" — should show ~15 listings across 5 cities.
  Select "FL" — should show ~12 across 4 cities.
- **City search**: Type "houston" in the city field — should narrow to ~3
  listings.
- **Service checkboxes**: Toggle services like "Flea Treatment" — listings
  without that service disappear.
- **Accepts Cats**: Toggle on — listings that are dogs-only disappear.
- **Fear Free Certified**: Toggle on — only ~25 listings remain.
- **Minimum Rating**: Set to 4.5 — filters out lower-rated groomers.
- **Pagination**: With 100 listings, you should see 5 pages. Click through
  them to verify pagination works.
- **Combined filters**: Stack multiple filters to verify they work together.
- **URL sync**: Check that the browser URL updates with query parameters as you
  filter (e.g., `/groomers?state=TX&city=houston`). Pasting that URL back
  should restore the same filters.

### 4c. Market Insights Panel

On the browse page (`/groomers`):

- A collapsible **Market Insights** bar should appear above the listing grid
- Click it to expand and see service coverage stats for all 100 groomers
- Select **State = GA** — the panel should show 2 groomers with red gap alerts
  (no cats, no flea treatment, no teeth brushing, no fear-free)
- Select **State = IN** — the panel should show the worst market: low ratings,
  multiple gaps, no online booking
- See [ARBITRAGE_DEMO_GUIDE.md](ARBITRAGE_DEMO_GUIDE.md) for 8 detailed demo
  scenarios with step-by-step instructions

### 4d. Detail Page

Click any listing card, or visit a URL directly like:

```
http://localhost:3000/groomer/pawfect-mobile-grooming-houston
```

- Listing details render (name, address, phone, services, features, rating)
- The "Request a Quote" form is visible on the right

![Detail page with lead form](pawfect_mobile_grooming.jpg)

### 4e. Lead Form Submission

This is the core monetization component. On any detail page:

1. Fill out the "Request a Quote" form (name, email, etc.)
2. Click "Request a Quote"
3. The form should show a green success message ("Quote Requested!")
4. Open your **browser DevTools** (F12 or right-click > Inspect > Console tab)
5. You should see: `[MOCK] Lead submitted: {listing_id: 1, name: "...", email: "...", ...}`

In production, this data writes to the `leads` table in Supabase. In mock mode,
it logs to the browser console so you can verify the form works end-to-end
without a database.

![Quote requested success state](after_quote_requested.gif)

### 4f. Build Verification

```bash
npm run build
```

This should succeed and generate static pages for all 100 seed listings. The
output will show routes like:

```
● /groomer/[slug]
  ├ /groomer/fluffy-on-wheels-houston
  ├ /groomer/cozy-grooming-co-austin
  ├ /groomer/royal-mobile-salon-dallas
  └ [+97 more paths]
```

---

## 5. How Mock Maps to Production

| Mock Behavior | Production Behavior |
|--------------|-------------------|
| 100 seed listings in memory | Thousands of listings in Supabase |
| In-memory array filtering | Supabase SQL queries with indexes |
| In-memory market insights computation | Supabase aggregate queries |
| `console.log` on lead submit | `INSERT INTO leads` via Supabase API |
| Static pages from seed slugs | Static pages from real slugs via `generateStaticParams` |
| Deliberate service deserts in 6 states | Real gaps emerge naturally from market data |
| Instant responses | Network latency to Supabase |

The UI components, page structure, filter logic, URL parameter syncing, form
validation, and page routing are **identical** between mock and production.
Mock mode only swaps the data layer.

---

## 6. Switching to Real Supabase

1. Create a Supabase project and run `supabase_schema.sql` in the SQL Editor
2. Run the data pipeline (`pipeline/step2-8`) to populate listings
3. Create `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

4. Restart the dev server — mock mode deactivates automatically

---

## 7. Technical Details

### How Auto-Detection Works

In `frontend/src/lib/queries.ts`:

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const IS_MOCK = !supabaseUrl || supabaseUrl.includes('placeholder');
```

Every query function checks `IS_MOCK` first. If true, it operates on the seed
array in `frontend/src/lib/seed-data.ts`. If false, it queries Supabase as
normal.

### Files Involved

| File | Role |
|------|------|
| `frontend/src/lib/seed-data.ts` | Generates 100 seed `Listing` objects with deterministic pseudo-random data |
| `frontend/src/lib/queries.ts` | All data access — mock branch + real Supabase branch, including `getMarketInsights()` |
| `frontend/src/lib/types.ts` | TypeScript interfaces including `MarketInsights` and `ServiceStat` |
| `frontend/src/lib/supabase.ts` | Supabase client (still uses placeholder fallback for builds) |
| `frontend/src/components/MarketInsights.tsx` | Collapsible insights panel with gap alerts and service coverage bars |

### Seed Data Summary

100 listings across 22 states (40 cities). The generator uses:
- Deterministic seeded random (same output every build)
- Regional price tiers (high/mid/low cost cities)
- Varied service probabilities (92% offer Full Groom, only 45% offer Flea Treatment)
- Deliberate service deserts in GA, WA, CO, IN, OH, MN for arbitrage demos

For the full breakdown of states, cities, and service deserts, see
[ARBITRAGE_DEMO_GUIDE.md](ARBITRAGE_DEMO_GUIDE.md#14-reference-seed-data-overview).

# User Guide & Quick Start

This guide is for people who want to USE this system to build a niche directory —
not necessarily modify the code. It walks through the complete workflow from zero
to a live, money-making directory website.

---

## Table of Contents

1. [What This System Does](#what-this-system-does)
2. [Quick Start (30-Minute Version)](#quick-start-30-minute-version)
3. [Complete Walkthrough](#complete-walkthrough)
4. [Use Cases](#use-cases)
5. [Cost Breakdown](#cost-breakdown)
6. [FAQ](#faq)

---

## What This System Does

This system builds niche online directories. A niche directory is a website that:

1. **Lists businesses** in a specific category (e.g., mobile pet groomers)
2. **Ranks in Google** because each listing has its own SEO-optimized page
3. **Generates leads** when visitors fill out "Request a Quote" forms
4. **Makes money** through lead sales, advertising, or premium listings

The system has two parts:
- **Data Pipeline** — scrapes, cleans, verifies, and enriches business data
- **Frontend** — a beautiful, fast website that displays the data

---

## Quick Start (30-Minute Version)

If you want to see results fast, here's the minimum viable path:

```
1. Clone the repo                          (2 min)
2. Create Supabase project + run schema    (5 min)
3. Get Anthropic API key                   (2 min)
4. Configure .env files                    (3 min)
5. Install dependencies                    (5 min)
6. Run Outscraper on one query             (5 min, costs ~$3)
7. Run pipeline steps 2-8                  (10-20 min)
8. Start frontend dev server               (1 min)
9. See your directory at localhost:3000
```

---

## Complete Walkthrough

### Phase 1: Set Up Accounts (10 minutes)

**1. Create a Supabase account**
- Go to https://supabase.com
- Click "Start your project" and sign up
- Create a new project (any name, any region)
- Wait for it to provision (~2 minutes)

**2. Create an Anthropic account**
- Go to https://console.anthropic.com
- Sign up and add billing (minimum $5 credit)
- Go to API Keys → Create Key
- Save the key somewhere safe

**3. Create an Outscraper account**
- Go to https://outscraper.com
- Sign up and add billing (minimum $5 credit)

### Phase 2: Set Up the Code (10 minutes)

**1. Clone and configure**
```bash
git clone https://github.com/az9713/niche-directory-builder.git
cd niche-directory-builder
```

**2. Set up Python environment**
```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate    # Linux/Mac
# .venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

**3. Configure pipeline secrets**
```bash
cp .env.example .env
```
Edit `pipeline/.env` — add your Anthropic API key and Supabase credentials.

**4. Set up frontend**
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```
Edit `frontend/.env.local` — add your Supabase URL and anon key.

### Phase 3: Set Up Database (5 minutes)

1. In Supabase, go to SQL Editor
2. Open `supabase_schema.sql` from this repo
3. Copy/paste the entire file and click Run
4. Done — your tables, indexes, and security policies are created

### Phase 4: Scrape Data (5-10 minutes)

1. Go to Outscraper → Google Maps scraper
2. Enter your search queries (see `pipeline/step1_outscraper/README.md`)
3. Set scope to United States
4. Run and download CSVs
5. Save CSVs to `pipeline/step1_outscraper/raw/`

### Phase 5: Run the Pipeline (10-30 minutes)

```bash
cd pipeline
source .venv/bin/activate

python step2_clean.py           # Clean data (~10 seconds)
python step3_verify.py          # Verify businesses (~5-20 min)
python step4_services.py        # Extract services (~5-15 min)
python step6_features.py        # Extract features (~5-15 min)
python step7_service_areas.py   # Extract areas (~5-15 min)
python step8_finalize.py        # Upload to Supabase (~30 sec)
```

**After Step 3:** Open `data/step3_verified.csv` and manually check 20 results.
Visit their websites. Are they actually mobile groomers? This is the quality gate.

### Phase 6: Launch the Frontend (2 minutes)

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 — your directory is live locally.

### Phase 7: Deploy (5 minutes)

1. Push to GitHub
2. Sign up at vercel.com
3. Import your repo
4. Set environment variables (Supabase URL + anon key)
5. Click Deploy
6. Your site is live at `your-project.vercel.app`

---

## Use Cases

### Use Case 1: Build a Mobile Pet Grooming Directory (Default)

**What:** The demo niche — mobile pet groomers nationwide.

**Steps:** Follow the walkthrough exactly as written above. The default search
queries, classification prompts, and service categories are all pre-configured
for mobile pet grooming.

**Expected results:** 150-500 verified listings across 30+ states.

---

### Use Case 2: Build a Mobile Auto Detailing Directory

**What:** Mobile car wash and detailing services that come to your location.

**Changes needed:**
- Search queries: "mobile auto detailing", "mobile car wash", "mobile car detailing"
- Step 3 keywords: "mobile", "we come to you", "at your location", "on-site"
- Step 4 services: exterior_wash, interior_detail, ceramic_coating, paint_correction,
  headlight_restoration, engine_bay, odor_removal
- Step 6 features: eco_friendly, fleet_pricing, same_day_service
- Frontend labels and branding

---

### Use Case 3: Build a Junk Removal Directory

**What:** Companies that haul away junk, furniture, and debris.

**Changes needed:**
- Search queries: "junk removal", "junk hauling", "furniture removal"
- Step 3: classify as JUNK_REMOVAL vs MOVING_COMPANY vs DUMPSTER_RENTAL
- Step 4 services: residential, commercial, furniture, appliances, yard_waste,
  construction_debris, estate_cleanout, hoarding_cleanup
- Step 6 features: same_day, licensed, insured, eco_friendly_disposal

---

### Use Case 4: Build an ADA Bathroom Contractor Directory

**What:** Contractors who specialize in ADA-compliant bathroom renovations.

**Changes needed:**
- Search queries: "ADA bathroom contractor", "accessible bathroom remodel",
  "handicap bathroom renovation", "walk-in shower installation"
- Step 3: classify as ADA_CONTRACTOR vs GENERAL_CONTRACTOR vs PLUMBER
- Step 4 services: walk_in_shower, grab_bars, wheelchair_accessible,
  roll_in_shower, comfort_height_toilet, widened_doorways
- Step 6 features: aci_certified, licensed, insured, free_estimates

---

### Use Case 5: Build a Mobile Notary Directory

**What:** Notaries who travel to your location for document signing.

**Changes needed:**
- Search queries: "mobile notary", "traveling notary", "notary signing agent"
- Step 3: classify as MOBILE_NOTARY vs OFFICE_NOTARY vs NOT_NOTARY
- Step 4 services: loan_signing, general_notary, apostille, certified_copies,
  real_estate_closings, estate_documents, power_of_attorney
- Step 6 features: nna_certified, background_checked, eo_insured

---

### Use Case 6: Build a Single-State Directory

**What:** Focus on one state for faster results and lower cost.

**Changes:** When running Outscraper, set location to a single state (e.g., "Texas").
This gives you 30-100 listings instead of 300-1500. Good for testing the pipeline
before going nationwide.

**Benefits:** $2-5 total cost, 15-minute pipeline run, easier to verify quality.

---

### Use Case 7: Run Only the Pipeline (Skip Frontend)

**What:** You just want clean, verified business data as a CSV.

**Steps:** Run steps 2-8. The output `data/final_listings.csv` contains all
enriched data. Skip the Supabase upload by not configuring Supabase credentials.
Skip the frontend entirely.

**Use the CSV for:** Spreadsheet analysis, lead lists, importing into another CRM.

---

### Use Case 8: Run Only the Frontend (Use Existing Data)

**What:** You already have business data in Supabase and just want the website.

**Steps:** Set up the frontend, point it at your Supabase project. Ensure your
table matches the `listings` schema (or modify `types.ts` to match your schema).

---

### Use Case 9: Add Premium Listings (Monetization)

**What:** Charge businesses to be featured at the top of search results.

**How to implement:**
1. Add a `is_premium BOOLEAN DEFAULT FALSE` column to `listings`
2. Add a `premium_until TIMESTAMPTZ` column
3. Update the query in `queries.ts` to sort premium listings first
4. Add a visual badge to `ListingCard.tsx` for premium listings
5. Create a payment flow (Stripe) to accept premium listing payments

---

### Use Case 10: Add Email Notifications for Leads

**What:** Send an email to the business owner when someone submits a lead form.

**How to implement:**
1. Create a Supabase Edge Function that triggers on INSERT to `leads`
2. The function calls an email API (SendGrid, Resend, or Supabase's built-in)
3. Email the listing's contact with the lead details
4. This is the foundation for a monetizable lead generation service

---

### Use Case 11: Export Leads as a CSV Report

**What:** Download all leads from Supabase for analysis or CRM import.

**How:** In Supabase Table Editor → leads → Export as CSV. Or use the Supabase
client in a Python script:

```python
from supabase import create_client
client = create_client(url, service_key)
response = client.table('leads').select('*').execute()
# Convert response.data to CSV with pandas
```

---

### Use Case 12: A/B Test Different Niches

**What:** Test multiple niches cheaply to find the most profitable one.

**Steps:**
1. Run a single-state Outscraper scrape for 3-4 different niches (~$3 each)
2. Run the pipeline for each
3. Compare: How many verified businesses? How competitive is the niche?
4. Pick the winner and go nationwide

**Good test niches:** mobile pet grooming, mobile auto detailing, junk removal,
mobile notary, luxury restroom trailers.

---

## Cost Breakdown

### Minimum Viable Directory

| Item | Cost |
|------|------|
| Outscraper (1 state, 1 query) | $2-3 |
| Claude API (Haiku, steps 3-7) | $0.50-1 |
| Supabase (free tier) | $0 |
| Vercel (free tier) | $0 |
| **Total** | **$2.50-4** |

### Full Nationwide Directory

| Item | Cost |
|------|------|
| Outscraper (5 queries, US-wide) | $5-15 |
| Claude API (Haiku, steps 3-7) | $2-5 |
| Supabase (free tier) | $0 |
| Vercel (free tier) | $0 |
| **Total** | **$7-20** |

### Optional Add-ons

| Item | Cost |
|------|------|
| Step 5: Image scraping (Claude Vision) | $5-15 |
| Custom domain | $10-15/year |
| Supabase Pro (if you outgrow free tier) | $25/month |
| Vercel Pro (if you outgrow free tier) | $20/month |

---

## FAQ

**Q: How long does the whole process take?**
A: 1-2 hours for a single-state test, 2-4 hours for a nationwide directory.
Most time is spent waiting for the pipeline to crawl websites.

**Q: Can I run the pipeline again to update data?**
A: Yes. Run Outscraper again, then re-run steps 2-8. Step 8 upserts on the `slug`
column, so existing listings get updated and new ones get added.

**Q: How do I add more listings later?**
A: Run Outscraper with the same (or new) queries. Save new CSVs to the `raw/`
directory alongside existing ones. Re-run the pipeline. Deduplication prevents
double-counting.

**Q: What if a business website is down?**
A: It gets classified as UNCLEAR and kept with only Google Maps data (no enrichment).
When you re-run the pipeline later, it may succeed.

**Q: Can I manually add or edit listings?**
A: Yes. Use the Supabase Table Editor to directly edit rows. Or add rows to the
CSV before running step8_finalize.py.

**Q: Is this legal?**
A: Scraping publicly available Google Maps data is generally accepted. However:
- Do NOT scrape images from websites without permission (Step 5 is optional for this reason)
- Respect robots.txt when crawling
- Include a "Claim Your Listing" feature so businesses can request edits

**Q: How does the site make money?**
A: Common monetization strategies:
1. **Lead generation:** Sell leads ($5-50 each depending on niche)
2. **Premium listings:** Charge businesses $20-100/month for top placement
3. **Advertising:** Display ads once traffic reaches 10K+ visits/month
4. **Affiliate links:** Link to related products/services

**Q: What's the expected traffic?**
A: A well-SEO'd niche directory can reach 1K-10K organic visits/month within
3-6 months. Each listing page targets a long-tail keyword like
"mobile pet grooming in Austin TX".

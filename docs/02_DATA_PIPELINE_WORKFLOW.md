# Data Pipeline Workflow: 7-Step Process

## Source

Frey Chu's methodology for building the Luxury Restroom Trailer directory.
This is the core technical workflow — the hardest and most valuable part of building a directory.

---

## Overview

The pipeline transforms raw, messy scraped data into a clean, enriched database ready for a directory frontend. Each step is a focused pass that does ONE thing well. Multiple passes with edge-case iteration beats one giant prompt.

```
Raw Scrape (71,000 rows)
    |
    v
Step 1: Scrape Raw Data (Outscraper)
    |
    v
Step 2: Clean Junk Data (Claude Code) → 71K → 20K
    |
    v
Step 3: Website Verification (Crawl4AI + Claude Code) → 20K → 725
    |
    v
Step 4: Inventory/Product Enrichment (Crawl4AI + Claude Code)
    |
    v
Step 5: Image Scraping & Verification (Crawl4AI + Claude Vision API)
    |
    v
Step 6: Amenities & Features Extraction (Crawl4AI + Claude Code)
    |
    v
Step 7: Service Area Extraction (Crawl4AI + Claude Code)
    |
    v
Final Cleaned CSV → Supabase Database → Frontend
```

---

## Step 1: Scrape Raw Data with Outscraper

### Purpose
Get the initial raw dataset of all potential businesses in the niche, nationwide.

### Tool
**Outscraper** (https://outscraper.com) — scrapes Google Maps listings.
- Described as the cheapest option
- Alternatives mentioned: Apify, others
- Many tutorials available online for learning Outscraper

### Process
1. Define search queries for your niche (e.g., "porta potty", "portable restroom", "restroom trailer", etc.)
2. Run queries across all target locations (Frey builds nationwide directories, covering every state)
3. Export results as CSV files

### Output
- Multiple CSV files (Frey had 5 CSVs)
- ~71,000 rows of potential listings
- Raw data includes: business name, address, city, state, phone, website URL, Google Maps data, categories, ratings, etc.
- Data is messy, full of duplicates, irrelevant businesses, closed businesses, etc.

### Cost
~$100 for a nationwide scrape in this niche.

---

## Step 2: Clean Junk Data with Claude Code

### Purpose
Remove obviously irrelevant, incomplete, or dead listings. This is a broad-strokes cleaning pass — not niche-specific verification yet.

### Tool
**Claude Code** — reading CSVs and applying filtering logic.

### Cleaning Criteria (generalized)
Remove listings that have:
1. **No business name** — incomplete data
2. **No address** — can't be located
3. **No city** — can't be located
4. **No state** — can't be located
5. **Permanently closed** — Google Maps marks these
6. **Obviously unrelated businesses** — big box retailers, chain stores clearly outside the niche
7. **Duplicates** — same business appearing multiple times

### Prompt Structure (paraphrased from transcript)
```
Here are my five CSVs [provide file paths]. Go ahead and look at every single
one and use this criteria to clean the data:

- Remove listings with no business name
- Remove listings with no address, city, or state
- Remove permanently closed listings
- Remove obvious junk data that doesn't relate to [NICHE]
  (e.g., big box retailers like Home Depot, Walmart, etc.)
- Remove duplicates

Output a single cleaned CSV with all remaining listings.
```

### Key Principles
- This prompt is **generalizable** to any directory niche
- The criteria focus on data completeness and obvious mismatches
- Don't try to verify niche relevance at this stage — that's Step 3

### Result
- 71,000 rows → ~20,000 rows
- Still a massive dataset, but obvious garbage removed
- Ready for deeper, website-level verification

---

## Step 3: Automated Website Verification with Crawl4AI

### Purpose
Visit every remaining business's website and determine whether they actually match your niche. This is the step that previously required 1,000+ hours of manual work.

### Tools
- **Crawl4AI** — open-source, LLM-friendly web crawler/scraper (https://github.com/unclecode/crawl4ai)
  - Free and open source
  - Installed locally on your computer
  - Installation: give the GitHub link to Claude Code and ask it to help install (took ~15 minutes)
- **Claude Code** — the "brain" that analyzes crawled content

### Key Module
**AsyncWebCrawler** — allows crawling multiple websites concurrently, dramatically reducing total crawl time.

### Process
1. Feed the CSV of 20,000 listings (each with a website URL) to Claude Code
2. Claude Code uses Crawl4AI to visit each website
3. For each website, Claude Code looks for niche-specific keywords and indicators
4. Each listing is classified as matching the niche or not
5. A confidence score is assigned to each verification

### Prompt Structure (paraphrased)
```
Using Crawl4AI, go through every single website in this CSV and identify
which businesses are [NICHE KEYWORD] providers.

Look for these keywords and synonyms on each website:
- [keyword 1]
- [keyword 2]
- [keyword 3]
- [synonym 1]
- [synonym 2]

For the luxury restroom trailer niche, keywords included:
- "restroom trailer"
- "luxury restroom"
- "portable restroom trailer"
- "mobile restroom"
- "VIP restroom"
- (and other synonyms)

Classify each as:
- MATCH: The business offers [NICHE SERVICE]
- NO MATCH: The business does not offer [NICHE SERVICE]

Include a verification_confidence score.
Output a CSV with the classification results.
```

### Pro Tips
- **Know all the synonyms** for your niche keyword. Different businesses use different terminology for the same thing.
- **Use AsyncWebCrawler** for concurrent crawling — massive time savings.
- This step ran in the background for ~3 hours for 20,000 websites.
- Some websites will be down, have no useful content, or block crawlers — handle gracefully.

### Result
- 20,000 listings → 725 verified luxury restroom trailer businesses
- Output CSV includes: business info + verification status + confidence score
- This is the core verified dataset that all subsequent enrichment builds on

---

## Step 4: Enrich Inventory/Product Data

### Purpose
For each verified business, determine what specific products/services they offer. In the restroom trailer case: how many stalls, what types of trailers, what configurations.

### Tools
- **Crawl4AI + Claude Code** (same as Step 3)

### Process
1. Take the 725 verified listings
2. Crawl each business website again, this time looking for specific product/inventory details
3. Extract structured data about their offerings

### Prompt Structure (paraphrased)
```
Take these [N] verified [NICHE] businesses and use Crawl4AI to visit
each website. For each business, find the full fleet/inventory of
products they offer.

Specifically, find:
- [Product type 1] (e.g., 2-stall trailers)
- [Product type 2] (e.g., 3-stall trailers)
- [Product type 3] (e.g., 4+ stall trailers)
- Any other product variants

Look at the homepage and any pages specifically about [NICHE PRODUCTS].
Go deep — check subpages, product pages, fleet pages.

Give me your game plan. Tell me if I'm missing anything.
Let me know before we go for it (before we burn tokens).
```

### Critical Lesson: One Pass Per Data Type
> "One of the first mistakes I made was giving it a massive laundry list of things to get — trailer inventory, images, amenities, features, pricing — all at once. It just didn't work. Super low quality."

**Do one enrichment type per pass.** This step ONLY gets inventory/product data. Images, amenities, service areas are separate passes.

### Edge Case Handling
- After each pass, **examine the results manually**
- You WILL find edge cases — businesses that were misclassified, data that was extracted incorrectly
- Feed those edge cases back to Claude Code: "You messed up on these. Here's what went wrong."
- **Expect to rerun 2–3 times** until data quality is acceptable

### Result
- New columns added to CSV: product types, stall counts, configurations
- Each listing now has structured inventory data

---

## Step 5: Scrape & Verify Images with Claude Vision

### Purpose
Get high-quality, relevant images for each listing. This is the most complex enrichment step because image quality is hard to assess programmatically.

### Tools
- **Crawl4AI** — scrapes candidate images from websites
- **Claude Vision API** — verifies image quality and relevance

### Two-Phase Process

#### Phase 1: Scrape Candidate Images (Crawl4AI)
```
For each business website:
1. Look for alt text on images that relates to [NICHE]
2. Examine file names for relevant keywords
3. Consider the page context where images appear
4. Scrape the top 3 candidate images (highest quality, most relevant)
```

**Problem discovered on first attempt:** Without the Vision verification step, scraped images included logos, favicons, low-quality thumbnails, and completely irrelevant images.

#### Phase 2: Verify with Claude Vision API
```
For each set of candidate images:
1. Send the top 3 candidates to Claude Vision
2. Ask Claude Vision to identify which image best represents [NICHE PRODUCT]
3. Select the best image based on:
   - Actually shows the product/service (not a logo or icon)
   - High resolution / good quality
   - Relevant to the specific listing
4. Store the verified image URL
```

### Cost
- ~$30 for Claude API credits (Vision)
- Required connecting API key to Claude
- ~1 hour runtime for 700 listings (ran overnight)

### Result
- New columns: image URLs (verified, high-quality)
- Green-highlighted columns in the spreadsheet indicating verified image data

### Legal Note (from transcript)
- Scraping images from business websites is a **gray area**
- Frey's plan: reach out to businesses, ask them to "claim their listing," which grants permission to use images
- Alternative: use stock images — the demo "crappy directory" generated real leads with identical stock images on every listing
- Images are NOT required for a directory to rank and get traffic

---

## Step 6: Extract Amenities, Features & Filter Data

### Purpose
Extract the specific amenities and features that users filter by when making decisions. These become the filterable attributes on the directory frontend.

### Tools
- **Crawl4AI + Claude Code**

### Process
1. Crawl each business website looking for amenities and features
2. Standardize feature names across all listings
3. Create filter-friendly boolean/categorical data

### Prompt Structure (paraphrased)
```
The first time I ran this, it didn't do a good job. There were a bunch
of weird words like "it" and "and" and "the" — those are not features.

Go to each business website. Look at the homepage and find any page
with [NICHE PRODUCTS]. Go deep into subpages.

Identify all amenities and features including:
- [Feature category 1] (e.g., running water)
- [Feature category 2] (e.g., climate control / AC / heating)
- [Feature category 3] (e.g., lighting type)
- [Feature category 4] (e.g., flushing toilets vs. non-flushing)
- [Feature category 5] (e.g., handwashing stations)
- Any other relevant amenities

Standardize feature names. Don't include generic words.
```

### Edge Cases (from first run)
- Generic words extracted as "features" (it, and, the)
- Inconsistent naming (same feature called different things across businesses)
- Missing features that exist on deeper subpages

### Result
- New columns for each amenity/feature (boolean or categorical)
- These directly map to the filter UI on the directory frontend
- Example filters on the finished directory: filter by stall count, running water, specific amenities

---

## Step 7: Extract Service Areas

### Purpose
Determine the geographic coverage of each business — where they will deliver/serve.

### Tools
- **Crawl4AI + Claude Code**

### Prompt Structure (paraphrased)
```
For each business, visit their website and find their service areas.

Extract:
- City (primary location)
- Region (broader area they serve)
- Radius (how far they'll travel, if mentioned)
```

### Edge Cases
- **Cross-state businesses:** A Florida-based business might serve Texas and Arizona too. First run incorrectly attributed all states equally.
- Had to adjust prompts to distinguish between primary location and extended service areas
- Some businesses don't list explicit service areas — may need to infer from location

### Result
- Three new columns: city, region, radius
- Enables location-based search and filtering on the directory

---

## Post-Pipeline: CSV to Database to Frontend

### Final Data Preparation
1. **Strip unnecessary columns** — remove intermediate/working columns, keep only the enriched data needed for the directory
2. **Create a cleaned final CSV** — this is the production dataset

### Database Setup
- **Supabase** is the database used
- Prompt to Claude Code (paraphrased): "Use this CSV to create the Supabase database. Use the exact columns."
- Claude Code creates the schema and imports the data

### Frontend Build
- Once the database is populated, "go buck wild and create whatever you want"
- The frontend design is the fun/creative part
- Claude Code handles the full build

---

## Key Workflow Principles

### 1. One Pass, One Data Type
Never try to extract everything at once. Each enrichment pass focuses on exactly one category of data. This produces dramatically higher quality results.

### 2. Iterate After Every Pass
Always examine results after each pass. Edge cases WILL exist. Feed them back and rerun. Expect 2–3 iterations per enrichment type.

### 3. Ask Claude Code for Its Game Plan
Before running an expensive enrichment pass, ask Claude Code to explain its approach. Review it. Catch issues before burning tokens/time.

### 4. Casual Prompts Work
The prompts shown are conversational, not hyper-engineered. Frey writes prompts by "having a conversation with ChatGPT" first, then uses them with Claude Code. Technical precision in prompts is less important than clarity about what you want.

### 5. Use AsyncWebCrawler for Scale
Concurrent crawling is essential for 20,000+ websites. The async module in Crawl4AI makes this practical.

### 6. Start with the Broadest Filter, Then Narrow
Step 2 removes obvious junk (broad). Step 3 verifies niche match (narrow). Steps 4–7 enrich (deep). Each step works on a progressively smaller, higher-quality dataset.

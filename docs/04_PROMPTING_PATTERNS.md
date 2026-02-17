# Prompting Patterns & Strategies

## Source

Prompt strategies and patterns extracted from Frey Chu's workflow. Frey is self-described as "totally non-technical" and has been using Claude Code for ~6 months.

---

## 1. General Prompting Philosophy

### Casual > Formal
Frey's prompts are conversational, not engineered. He describes writing prompts by "having a conversation with ChatGPT" first to draft them, then using the refined version with Claude Code. The prompts shown in the transcript read like casual instructions to a human assistant.

### One Task Per Prompt
The single most important lesson from the workflow:
> "One of the first mistakes I made was giving it a massive laundry list of things to get — trailer inventory, images, amenities, features, pricing — all at once. It just didn't work. Super low quality."

Each prompt focuses on extracting **one category** of data. Never combine extraction goals.

### Ask for the Game Plan First
Before running expensive operations, ask Claude Code to explain its approach:
> "Give me your game plan. Tell me if I'm missing anything. Let me know before we go for it."

This catches bad approaches before wasting time and API tokens.

### Iterate on Edge Cases
After each pass, review results. When you find errors:
> "Let Claude Code know that it messed up. It done messed up so that you can fix it."

Describe the specific edge cases and rerun. Expect 2–3 iterations per enrichment type.

---

## 2. Prompt Templates by Pipeline Step

### Step 2: Data Cleaning Prompt

**Purpose:** Remove obviously irrelevant rows from raw scraped CSV data.

**Template:**
```
Here are my [N] CSVs: [file paths]

Go ahead and look at every single one and use this criteria to clean the data:

1. Remove listings with no business name
2. Remove listings with no address
3. Remove listings with no city
4. Remove listings with no state
5. Remove permanently closed listings
6. Remove obvious junk data that doesn't relate to [YOUR NICHE]:
   - Big box retailers (Home Depot, Walmart, Lowe's, etc.)
   - [Other obviously irrelevant categories for your niche]
7. Remove duplicate listings

Output a single cleaned CSV with all remaining listings.
```

**Customization notes:**
- Item 6 needs niche-specific exclusion rules
- This is the most generalizable prompt — works for almost any directory niche
- Frey notes "anyone can benefit from this particular part"

---

### Step 3: Website Verification Prompt

**Purpose:** Visit each business website and classify whether it matches the target niche.

**Template:**
```
Using Crawl4AI with AsyncWebCrawler, go through every single website
in [CSV file path] and identify which businesses are [NICHE] providers.

For each website, look for these keywords and related terms:
- "[primary keyword]"
- "[synonym 1]"
- "[synonym 2]"
- "[synonym 3]"
- "[related term 1]"
- "[related term 2]"

Classify each listing as:
- LUXURY_CANDIDATE: Website contains evidence of [NICHE] services
- STANDARD: Business operates in the broader industry but NOT [NICHE]
- UNABLE_TO_VERIFY: Website down, blocked, or insufficient information

Include a verification_confidence score (0-100) for each classification.

Output results to a new CSV with all original columns plus:
- classification
- verification_confidence
- evidence (brief note on what keywords/content was found)
```

**Key insight:** Knowing ALL synonyms for your niche keyword is critical. Different businesses use different terms for the same thing. Research this before writing the prompt.

---

### Step 4: Inventory/Product Enrichment Prompt

**Purpose:** Extract specific product/service offerings from each verified business website.

**Template:**
```
Take these [N] verified [NICHE] businesses from [CSV file path].

Using Crawl4AI, visit each website and find the full fleet/inventory
of [PRODUCTS/SERVICES] that each business offers.

Specifically, look for:
- [Product variant 1] (e.g., 2-stall trailers)
- [Product variant 2] (e.g., 3-stall trailers)
- [Product variant 3] (e.g., 4+ stall trailers)
- [Product variant 4] (e.g., ADA accessible units)
- Any other [PRODUCT] variants or configurations

For each business, check:
1. Homepage
2. Any dedicated [PRODUCT] pages
3. Fleet/inventory pages
4. Service pages

Give me your game plan. Tell me if I'm missing anything.
Let me know before we go for it.
```

**The "game plan" ask** is specifically noted as a best practice — lets you review the approach before execution.

---

### Step 5: Image Scraping Prompt (Phase 1 — Crawl)

**Purpose:** Find candidate images on each business website.

**Template:**
```
For each business in [CSV file path], use Crawl4AI to find images
of their [NICHE PRODUCTS].

For each website:
1. Look at image alt text for [NICHE]-related terms
2. Examine image file names for relevant keywords
3. Consider the page context where each image appears
4. Evaluate image dimensions (prefer larger/higher quality)

Scrape the top 3 candidate images per business.

Output a CSV with:
- Business name
- image_url_1, image_url_2, image_url_3
- source_page for each image
- alt_text for each image
```

---

### Step 5: Image Verification Prompt (Phase 2 — Claude Vision)

**Purpose:** Use Claude Vision to select the best image from candidates.

**Template (for Claude Vision API):**
```
Look at these [N] candidate images for a [NICHE] business called [BUSINESS NAME].

Select the BEST image based on these criteria:
1. Actually shows a [NICHE PRODUCT] (not a logo, favicon, icon, or generic stock image)
2. High resolution and clear
3. Represents the business's actual [PRODUCT/SERVICE]
4. Professional quality

Return:
- selected_image_url: the URL of the best image
- rejection_reasons: why the other candidates were rejected
- confidence: how confident you are this is a good representative image (0-100)
```

**Why Vision is needed:** First attempts without Vision produced logos, favicons, low-quality thumbnails, and irrelevant images. The programmatic scrape alone cannot judge image content quality.

---

### Step 6: Amenities & Features Prompt

**Purpose:** Extract filterable attributes from each business website.

**Template:**
```
The first time I ran this, it didn't do a good job. There were
weird words extracted as features that are NOT features
(like "it", "and", "the"). Do NOT include generic words.

For each business in [CSV file path], use Crawl4AI to visit
their website.

Look at:
1. Homepage
2. Any page specifically about [NICHE PRODUCTS]
3. Go deep into subpages — don't just check the homepage

Identify all amenities and features, including but not limited to:
- [Amenity category 1] (e.g., running water: yes/no)
- [Amenity category 2] (e.g., climate control / AC / heating)
- [Amenity category 3] (e.g., flushing toilets)
- [Amenity category 4] (e.g., lighting)
- [Amenity category 5] (e.g., sound system)
- [Amenity category 6] (e.g., handwashing station)
- [Amenity category 7] (e.g., mirror/vanity)

STANDARDIZE feature names across all listings.
Use consistent terminology even if different businesses
describe the same feature differently.

Output as new columns in the CSV (boolean or categorical values).
```

**Note:** The explicit mention of the first run's failures ("weird words like it, and, the") is itself a prompt engineering pattern — telling the model about known failure modes so it avoids them.

---

### Step 7: Service Area Prompt

**Purpose:** Extract geographic service coverage for each business.

**Template:**
```
For each business in [CSV file path], visit their website
using Crawl4AI and find their service areas.

Extract and organize into three columns:
- city: Primary city/cities they serve
- region: Broader region or state(s)
- radius: How far they'll travel (in miles, if mentioned)

IMPORTANT: Distinguish between primary service area and
extended/occasional service areas. A business based in Florida
that mentions serving "events nationwide" should show Florida
as primary, not list every state.

If service area is not explicitly stated on the website,
use the business's physical address as the primary city
and leave region/radius as "not specified."
```

**Edge case noted:** Cross-state businesses. Florida-based business showed Florida, Texas, Arizona on first run without distinguishing primary vs. extended areas.

---

## 3. Meta-Prompting Patterns

### Pattern: Error Feedback Loop
After reviewing results from a pass:
```
I reviewed the results from the last run. Here are the issues I found:

1. [Business X] was classified as [WRONG] but should be [CORRECT] because [REASON]
2. [Business Y] is missing [DATA POINT] — it's on their website at [PAGE]
3. Several listings have [COMMON ERROR PATTERN]

Please fix these issues and rerun the extraction for all listings,
incorporating these corrections into your approach.
```

### Pattern: Pre-Execution Review
Before any expensive operation:
```
Give me your game plan.
Tell me if I'm missing anything.
Let me know before we go for it.
```

### Pattern: Scope Limitation
When Claude Code tries to do too much:
```
ONLY extract [SPECIFIC DATA TYPE] in this pass.
Do NOT extract images, pricing, or other data.
We will do those in separate passes.
```

### Pattern: Edge Case Awareness
Including known failure modes in the prompt:
```
The first time I ran this, [SPECIFIC PROBLEM OCCURRED].
[DESCRIBE THE BAD OUTPUT].
This time, make sure to [SPECIFIC CORRECTION].
```

---

## 4. Prompt Development Workflow

Frey's process for creating prompts:

1. **Start with ChatGPT** — have a conversation to explore what you want and draft the prompt
2. **Refine the prompt** — make it specific to your niche and data
3. **Test on small sample** — run on 10 listings first (Frey demoed with 10 businesses)
4. **Review results** — check for edge cases and quality issues
5. **Iterate** — update prompt based on findings
6. **Scale up** — run on full dataset
7. **Review again** — more edge cases emerge at scale
8. **Iterate again** — 2-3 rounds typically needed

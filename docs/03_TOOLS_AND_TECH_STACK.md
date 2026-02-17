# Tools & Technology Stack

## Source

All tools referenced in Frey Chu's directory-building workflow.

---

## 1. Data Scraping & Collection

### Outscraper
- **URL:** https://outscraper.com
- **Purpose:** Scrape business listings from Google Maps at scale
- **Why chosen:** Cheapest option for Google Maps scraping
- **Alternatives mentioned:** Apify
- **Cost:** ~$100 for a nationwide scrape
- **Output:** CSV files with business name, address, city, state, phone, website, Google Maps categories, ratings, review counts, open/closed status, etc.
- **Learning curve:** Low — many tutorials available online
- **Usage:** Define search queries for your niche + target geographic area → export CSV

---

## 2. Web Crawling & Scraping

### Crawl4AI
- **URL:** https://github.com/unclecode/crawl4ai
- **Purpose:** Open-source LLM-friendly web crawler and scraper
- **Cost:** Free (open source)
- **Installation:** Local installation on your computer. Frey gave the GitHub link to Claude Code and asked it to install — took ~15 minutes.
- **Key feature:** Designed to produce output that LLMs can easily parse and reason about

#### Key Modules Used

**AsyncWebCrawler**
- Crawls multiple websites concurrently (not one at a time)
- Essential for processing 20,000+ websites in reasonable time
- The 20,000-website verification pass took ~3 hours with concurrent crawling

#### How Crawl4AI Fits the Workflow
- Crawl4AI is the **engine** (fetches and parses web content)
- Claude Code is the **brain** (decides what to extract and how to classify)
- Together they replace thousands of hours of manual website review

#### What Crawl4AI Extracts
- Full page text content
- Image URLs + alt text + file names
- Page structure and links
- Content from subpages (can follow links)

---

## 3. AI Coding & Data Processing

### Claude Code
- **Purpose:** AI coding assistant that writes and executes code, processes data, builds the frontend
- **Cost:** $100/month (Claude Code Max subscription)
- **Role in workflow:**
  - Writes Python scripts to process CSVs
  - Orchestrates Crawl4AI crawling jobs
  - Analyzes crawled content to classify and extract data
  - Builds the Supabase database schema
  - Builds the entire frontend
- **Key strength:** Non-technical users can accomplish complex data processing through conversational prompts

### Claude API (Vision)
- **Purpose:** Image verification — analyzing scraped images to select the best/most relevant ones
- **Cost:** ~$30 for processing ~700 listings (3 candidate images each)
- **Setup:** Connect API key in Claude settings
- **Runtime:** ~1 hour for 700 listings
- **Usage:** Send candidate images → Claude Vision evaluates quality, relevance, and selects the best one

### ChatGPT
- **Purpose:** Prompt development — Frey uses ChatGPT to draft and refine prompts before using them with Claude Code
- **Not a core tool** in the build process, but used as a thinking/drafting partner

---

## 4. Database

### Supabase
- **URL:** https://supabase.com
- **Purpose:** PostgreSQL database + API layer for the directory
- **Why chosen:** Easy to set up with Claude Code, provides both database and API
- **Setup process:**
  1. Prepare final cleaned CSV with all enriched columns
  2. Give CSV to Claude Code
  3. Claude Code creates the database schema matching the CSV columns exactly
  4. Claude Code imports the data
- **Features used:**
  - PostgreSQL database for structured listing data
  - API endpoints for frontend queries
  - Likely: Row Level Security, full-text search, geographic queries

---

## 5. Frontend

### Technology (inferred from context)
- Built entirely by Claude Code ("vibe coded")
- Likely **Next.js** or similar modern React framework (common Claude Code output for directory-style sites)
- Features implemented:
  - Homepage with directory overview
  - Listing browse page with filters (stall count, amenities, features)
  - Individual listing detail pages (images, amenities, features, service areas, lead form)
  - Lead capture form on each listing
  - Filter/sort functionality
  - Mobile responsive design

### Design Reference
- Described as "Apple style" — clean, modern, polished
- Compared favorably to the previous WordPress version which was ugly, had Lorem Ipsum, and identical stock images
- Frey noted the directory is ~60% finished, planning to add more personality (e.g., the mascot character from the old site)

---

## 6. Previous Stack (Before Claude Code)

### WordPress
- Used for the original "crappy" porta potty directory (portapottymatch.com)
- Problems: Lorem Ipsum on front page, identical AI-generated images, sparse listing pages, AI-generated content with identical sentence structures
- Despite poor quality, it generated real leads including a $20,000+ order from the New Mexico State Fair
- Notable: APlaceForMom.com (824K monthly visitors) is also built on WordPress

---

## 7. SEO & Research Tools

### Ahrefs (mentioned)
- Used to check keyword search volumes and traffic estimates
- Example: "senior living homes dementia" gets 1,000+ monthly searches
- Used to analyze competitor directory traffic

### SimilarWeb (implied)
- Traffic estimates for example directories shown during the presentation

### Research Sources for Niche Understanding
- **Reddit** — forums discussing the niche, user pain points, decision criteria
- **TikTok** — conversations and content about the niche
- **Facebook Groups** — community discussions, user questions
- **Instagram** — visual content, business presence
- **General principle:** Go where the conversation about your niche is already happening to understand what drives user decisions

---

## 8. Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Claude Code Max subscription | $100/month | The AI coding tool |
| Outscraper (data scraping) | ~$100 | Nationwide Google Maps scrape |
| Claude API credits (Vision) | ~$50 | Image verification for 700+ listings |
| **Total** | **~$250** | For a fully enriched nationwide directory |

### Time Investment
- **Total build time:** 4 days
- **Manual equivalent:** 2,000+ hours
- **Ongoing maintenance:** 10–20 minutes/week

---

## 9. Tool Interaction Diagram

```
[Outscraper] ──CSV──> [Claude Code] ──orchestrates──> [Crawl4AI]
                            |                              |
                            |                              |
                            v                              v
                    Cleaning logic              Web content fetched
                    Classification              Images scraped
                    Data extraction             Page text parsed
                            |
                            v
                    [Claude Vision API]
                            |
                            v
                    Image verification
                            |
                            v
                    [Final CSV]
                            |
                            v
                    [Supabase Database]
                            |
                            v
                    [Frontend (built by Claude Code)]
```

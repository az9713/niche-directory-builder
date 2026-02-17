# Lessons Learned & Common Pitfalls

## Source

Mistakes, edge cases, and hard-won lessons from Frey Chu's directory-building experience.

---

## 1. Data Pipeline Pitfalls

### Pitfall: The "Mega Prompt" Approach
**What happened:** Frey tried to extract trailer inventory, images, amenities, features, and pricing all in a single Crawl4AI pass.
**Result:** "It just didn't work. Super low quality."
**Fix:** One enrichment type per pass. Always.

### Pitfall: Garbage Features Extracted
**What happened:** First amenities/features extraction returned generic words like "it", "and", "the" as features.
**Result:** Useless filter data that would break the frontend.
**Fix:** Explicitly tell the model what NOT to include. Reference the specific failure in the next prompt so it avoids the same mistake.

### Pitfall: Cross-State Service Area Confusion
**What happened:** Florida-based businesses showed Florida, Texas, and Arizona as service areas without distinguishing primary location from extended coverage.
**Result:** Misleading geographic data.
**Fix:** Prompt must distinguish between primary service area (where the business is based) and extended/occasional service areas.

### Pitfall: Bad Image Scraping Without Vision Verification
**What happened:** First image scraping pass pulled logos, favicons, tiny thumbnails, and completely irrelevant images.
**Result:** "Am I really about to clean this image data? Like this sounds so bad."
**Fix:** Two-phase approach — Crawl4AI scrapes candidates, then Claude Vision verifies and selects the best one. Cost ~$30 for 700 listings but saves enormous manual review time.

### Pitfall: Not Reviewing Results After Each Pass
**What happened:** Running enrichment at scale without checking small samples first.
**Result:** Edge cases compound. Errors in early passes propagate to later ones.
**Fix:** Always review results after each pass. Look for patterns in errors. Feed edge cases back. Expect 2-3 iterations per enrichment type.

---

## 2. Niche Selection Pitfalls

### Pitfall: Choosing Product-Based Niches
**Why it fails:** Product SERPs are cluttered with shopping ads, social media, video carousels, and big retailers. Very hard to get organic visibility.
**Fix:** Choose service-based, local niches where the SERP layout is more favorable (local pack + organic listings).

### Pitfall: Going Too Broad
**Why it fails:** Competing with Yelp, Angie's List, and other established horizontal directories is a losing game without massive budget and years of time.
**Fix:** Go sub-niche. "Dementia care senior living" instead of "senior living." "ADA bathroom contractors" instead of "bathroom contractors."

### Pitfall: Expecting Quick Revenue
**Why it fails:** SEO takes 6+ months minimum. If you need money in less than 6 months, this is the wrong model.
**Fix:** Treat the first directory as a learning exercise for Claude Code, SEO, and lead generation. The skills transfer.

---

## 3. Technical Pitfalls

### Pitfall: Not Using AsyncWebCrawler
**What happens:** Crawling 20,000 websites one at a time takes an impractical amount of time.
**Fix:** Use Crawl4AI's AsyncWebCrawler module for concurrent crawling. The 20K website verification pass completed in ~3 hours with concurrency.

### Pitfall: Not Installing Crawl4AI Properly
**Context:** Frey is self-described as "totally non-technical."
**Fix:** Give the Crawl4AI GitHub URL to Claude Code and ask it to help install. Took ~15 minutes.

### Pitfall: Burning Tokens Before Reviewing the Plan
**What happens:** Running an expensive enrichment pass only to discover the approach was wrong.
**Fix:** Always ask Claude Code "Give me your game plan. Tell me if I'm missing anything. Let me know before we go for it." Review before executing.

---

## 4. Content & Design Pitfalls

### Pitfall: Overinvesting in Design Before Data
**Lesson from the old directory:** Portapottymatch.com had Lorem Ipsum on the front page, identical stock images on every listing, and obviously AI-generated content — and still generated real leads including a $20,000+ order from the New Mexico State Fair.
**Takeaway:** Data quality and niche demand matter more than design. Don't spend weeks perfecting the frontend before your data is solid.

### Pitfall: All AI-Generated Content with Identical Patterns
**What happened on old directory:** "All of this is just AI generated. Sentence structures all the same. It's a bad directory."
**Takeaway:** Even if you use AI to generate listing descriptions, ensure variety in the output. But more importantly, real enriched DATA (amenities, features, images, service areas) is more valuable than AI-generated prose.

### Pitfall: Losing the Human Touch
**Observation:** The new "Apple style" directory is polished but lost the personality of the old site's mascot character.
**Fix:** Plan to add character/personality back. Frey noted the directory is ~60% finished and he plans to bring back the mascot. Directories don't have to be sterile — personality builds trust.

---

## 5. Legal & Ethical Considerations

### Image Scraping
- Scraping images from business websites is a **gray area**
- You need rights to display images on your website
- Small businesses may not have Terms of Service that address this
- **Mitigation strategy:** "Claim your listing" outreach — contact businesses, ask them to claim their listing, which implicitly grants permission to use their images
- **Alternative:** Use stock images. The crappy directory proved you don't need real images to generate leads.
- "You don't even need images for a directory to rank and get traffic."

### Data Scraping Generally
- Outscraper scrapes publicly available Google Maps data
- Crawl4AI accesses publicly visible website content
- Standard web scraping legal considerations apply
- Respect robots.txt and terms of service

---

## 6. Workflow Lessons

### Lesson: Small Sample First, Then Scale
Frey demonstrated with 10 businesses before running on 725. Always test your prompts on a small sample:
1. Run on 10 listings
2. Review results manually
3. Fix edge cases
4. Scale to full dataset
5. Review again at scale
6. Fix new edge cases
7. Repeat until quality is acceptable

### Lesson: Data Enrichment Is the Hard Part
> "I would say for directories the moat is definitely data."
> "100% this is where people either quit or give up."

The 7-step pipeline is the core value creation. Building the frontend is the easy, fun part. Data enrichment is where most people fail. Automate it or don't build a directory.

### Lesson: The Iterative Nature of Each Pass
No pass works perfectly the first time:
- Step 3 (website verification): Some sites are down, block crawlers, or have ambiguous content
- Step 4 (inventory): Businesses describe products differently
- Step 5 (images): Logos and favicons mixed in with real photos
- Step 6 (amenities): Junk words, inconsistent naming
- Step 7 (service areas): Cross-state confusion

Each needs 2-3 iterations. Budget time and tokens for this.

### Lesson: Research User Decision Criteria
Before building, understand what drives decisions in your niche:
- What are the deal-breaker features?
- What information is hardest to find?
- What do people ask about in Reddit/Facebook/TikTok?
- What would make someone choose one provider over another?

This research directly shapes your enrichment pipeline (Steps 4-7).

---

## 7. Key Quotes from the Transcript

On the value proposition:
> "Every successful directory helps people save time, save money, or make money."

On data as moat:
> "Data can be a moat. It can be a differentiator. And price transparency is a big one because it's so hard to get."

On the time savings:
> "I probably saved over 2,000 hours in what would have been manual data cleaning, manual data enrichment."

On getting started:
> "I don't know if there's a better playground... where you can learn how Claude Code works and learn SEO and learn how to sell and get into the business of lead generation... than directories."

On directories in 2026:
> "If your timeline is to make money in less than 6 months, I would not build a directory."

On demand validation:
> "Despite my really poor data curation, it kind of just showed me that there is a massive need in this space."

# Step 1: Outscraper — Raw Data Collection

## Setup
1. Create an account at https://outscraper.com
2. Go to Google Maps Scraper

## Search Queries
Run these queries across the United States (or a single target state):

- "mobile pet grooming"
- "mobile dog grooming"
- "mobile cat grooming"
- "in-home pet grooming"
- "mobile pet spa"

## Settings
- **Location:** United States (or specific state, e.g., "California")
- **Language:** English
- **Limit:** Leave default (all results)
- **Fields to include:** name, full_address, city, state, zip, phone, website, rating, reviews_count, business_status, category, google_maps_url

## Export
- Export each query result as CSV
- Save all CSVs into this `raw/` directory
- Expected: 300-1500 raw rows total
- Cost: $5-15

## Next Step
Run `python pipeline/step2_clean.py` to clean and deduplicate the raw data.

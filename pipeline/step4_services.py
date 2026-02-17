"""Step 4: Extract service information from business websites."""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.crawler import crawl_urls
from utils.csv_utils import read_csv, write_csv
from utils.llm import classify_batch

PIPELINE_DIR = Path(__file__).resolve().parent
INPUT_PATH = PIPELINE_DIR / "data" / "step3_verified.csv"
OUTPUT_PATH = PIPELINE_DIR / "data" / "step4_services.csv"

SERVICE_PROMPT = """You are extracting service information from a mobile pet grooming business website.

From the website content below, extract which services this business offers.
For each service, respond YES or NO. If unclear, respond NO.

Services to check:
- full_groom: Full grooming service (bath + haircut + nails + ears)
- bath_only: Bath-only service
- nail_trim: Nail trimming
- deshedding: Deshedding treatment
- teeth_brushing: Teeth brushing/dental
- ear_cleaning: Ear cleaning
- flea_treatment: Flea/tick treatment
- puppy_groom: Puppy/first groom special
- senior_groom: Senior pet grooming
- dematting: Dematting/detangling
- breed_cuts: Breed-specific cuts

Also extract:
- pet_types: What pets they groom (dogs, cats, other) — comma separated
- breed_sizes: What sizes they accept (small, medium, large, xl) — comma separated
- price_range_low: Lowest price mentioned (number only, or empty)
- price_range_high: Highest price mentioned (number only, or empty)

Website content:
{content}

Respond in this exact format (one per line):
full_groom|YES or NO
bath_only|YES or NO
nail_trim|YES or NO
deshedding|YES or NO
teeth_brushing|YES or NO
ear_cleaning|YES or NO
flea_treatment|YES or NO
puppy_groom|YES or NO
senior_groom|YES or NO
dematting|YES or NO
breed_cuts|YES or NO
pet_types|dogs,cats
breed_sizes|small,medium,large,xl
price_range_low|30
price_range_high|120"""

BOOLEAN_SERVICES = [
    "full_groom",
    "bath_only",
    "nail_trim",
    "deshedding",
    "teeth_brushing",
    "ear_cleaning",
    "flea_treatment",
    "puppy_groom",
    "senior_groom",
    "dematting",
    "breed_cuts",
]


def parse_services(response: str) -> dict:
    """Parse a service extraction response into a dict of values."""
    result = {}
    # Initialize defaults
    for svc in BOOLEAN_SERVICES:
        result[f"svc_{svc}"] = False
    result["pet_types"] = ""
    result["breed_sizes"] = ""
    result["price_range_low"] = None
    result["price_range_high"] = None

    for line in response.strip().splitlines():
        line = line.strip()
        if "|" not in line:
            continue
        key, _, value = line.partition("|")
        key = key.strip().lower()
        value = value.strip()

        if key in BOOLEAN_SERVICES:
            result[f"svc_{key}"] = value.upper() == "YES"
        elif key == "pet_types":
            result["pet_types"] = value
        elif key == "breed_sizes":
            result["breed_sizes"] = value
        elif key == "price_range_low":
            try:
                result["price_range_low"] = float(value) if value and value.upper() != "EMPTY" else None
            except ValueError:
                result["price_range_low"] = None
        elif key == "price_range_high":
            try:
                result["price_range_high"] = float(value) if value and value.upper() != "EMPTY" else None
            except ValueError:
                result["price_range_high"] = None

    return result


def extract_services() -> None:
    """Run the service extraction pipeline."""
    print("=" * 60)
    print("STEP 4: Extract Services")
    print("=" * 60)

    print(f"\nReading {INPUT_PATH} ...")
    df = read_csv(str(INPUT_PATH))
    total = len(df)
    print(f"  Total rows: {total}")

    # Initialize service columns
    for svc in BOOLEAN_SERVICES:
        df[f"svc_{svc}"] = False
    df["pet_types"] = ""
    df["breed_sizes"] = ""
    df["price_range_low"] = None
    df["price_range_high"] = None

    # Filter to rows with websites
    has_website = df["website"].notna() & (df["website"].str.strip() != "")
    urls = df.loc[has_website, "website"].tolist()

    if urls:
        print(f"\nCrawling {len(urls)} websites ...")
        crawled = crawl_urls(urls, batch_size=5, timeout=15)
        crawl_success = sum(1 for v in crawled.values() if v is not None)
        print(f"  Crawled successfully: {crawl_success}/{len(urls)}")

        # Prepare items for LLM
        items_to_classify = []
        classify_indices = []
        for idx, row in df[has_website].iterrows():
            text = crawled.get(row["website"])
            if text:
                items_to_classify.append({"content": text[:4000]})
                classify_indices.append(idx)

        if items_to_classify:
            print(f"\nExtracting services for {len(items_to_classify)} businesses ...")
            responses = classify_batch(
                items=items_to_classify,
                prompt_template=SERVICE_PROMPT,
                max_concurrent=10,
            )

            for idx, response in zip(classify_indices, responses):
                parsed = parse_services(response)
                for key, value in parsed.items():
                    df.at[idx, key] = value

    # Write output
    write_csv(df, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")

    # Stats
    print(f"\n--- Service Extraction Stats ---")
    for svc in BOOLEAN_SERVICES:
        col = f"svc_{svc}"
        count = df[col].sum()
        print(f"  {svc}: {count}/{total} ({count/total*100:.0f}%)" if total > 0 else f"  {svc}: 0")
    has_prices = df["price_range_low"].notna().sum()
    print(f"\n  Businesses with pricing info: {has_prices}/{total}")
    print(f"  Total output rows: {len(df)}")
    print("=" * 60)


if __name__ == "__main__":
    extract_services()

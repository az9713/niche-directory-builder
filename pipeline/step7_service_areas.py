"""Step 7: Extract service area information from business websites."""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.crawler import crawl_urls
from utils.csv_utils import read_csv, write_csv
from utils.llm import classify_batch

PIPELINE_DIR = Path(__file__).resolve().parent
INPUT_PATH = PIPELINE_DIR / "data" / "step6_features.csv"
OUTPUT_PATH = PIPELINE_DIR / "data" / "step7_areas.csv"

SERVICE_AREA_PROMPT = """You are extracting service area information from a mobile pet grooming business website.

IMPORTANT: Distinguish between the PRIMARY service area (where the business is based) and EXTENDED areas they travel to. A business in Dallas that mentions "serving the entire DFW metroplex" has primary_city=Dallas.

From the content below, extract:
- primary_city: The main city where the business is based
- service_cities: Other cities/areas they serve (comma separated, max 10)
- service_radius_miles: How far they travel in miles (number, or empty if not stated)

If service area is not stated on the website, use the business address.

Website content:
{content}

Business address from our records: {city}, {state}

Respond in this exact format:
primary_city|CityName
service_cities|City1,City2,City3
service_radius_miles|25"""


def parse_service_area(response: str, fallback_city: str) -> dict:
    """Parse a service area response into a dict."""
    result = {
        "primary_city": fallback_city,
        "service_cities": "",
        "service_radius_miles": None,
    }

    for line in response.strip().splitlines():
        line = line.strip()
        if "|" not in line:
            continue
        key, _, value = line.partition("|")
        key = key.strip().lower()
        value = value.strip()

        if key == "primary_city":
            result["primary_city"] = value if value and value.upper() != "EMPTY" else fallback_city
        elif key == "service_cities":
            result["service_cities"] = value if value.upper() != "EMPTY" else ""
        elif key == "service_radius_miles":
            try:
                result["service_radius_miles"] = int(value) if value and value.upper() != "EMPTY" else None
            except ValueError:
                result["service_radius_miles"] = None

    return result


def extract_service_areas() -> None:
    """Run the service area extraction pipeline."""
    print("=" * 60)
    print("STEP 7: Extract Service Areas")
    print("=" * 60)

    print(f"\nReading {INPUT_PATH} ...")
    df = read_csv(str(INPUT_PATH))
    total = len(df)
    print(f"  Total rows: {total}")

    # Initialize service area columns
    df["primary_city"] = df["city"]
    df["service_cities"] = ""
    df["service_radius_miles"] = None

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
                items_to_classify.append({
                    "content": text[:4000],
                    "city": str(row.get("city", "")),
                    "state": str(row.get("state", "")),
                })
                classify_indices.append(idx)

        if items_to_classify:
            print(f"\nExtracting service areas for {len(items_to_classify)} businesses ...")
            responses = classify_batch(
                items=items_to_classify,
                prompt_template=SERVICE_AREA_PROMPT,
                max_concurrent=10,
            )

            for i, (idx, response) in enumerate(zip(classify_indices, responses)):
                fallback_city = str(df.at[idx, "city"])
                parsed = parse_service_area(response, fallback_city)
                for key, value in parsed.items():
                    df.at[idx, key] = value

    # Write output
    write_csv(df, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")

    # Stats
    has_service_cities = (df["service_cities"] != "").sum()
    has_radius = df["service_radius_miles"].notna().sum()
    print(f"\n--- Service Area Stats ---")
    print(f"  With service cities listed: {has_service_cities}/{total}")
    print(f"  With service radius: {has_radius}/{total}")
    print(f"  Total output rows: {len(df)}")
    print("=" * 60)


if __name__ == "__main__":
    extract_service_areas()

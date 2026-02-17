"""Step 6: Extract business features from websites."""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.crawler import crawl_urls
from utils.csv_utils import read_csv, write_csv
from utils.llm import classify_batch

PIPELINE_DIR = Path(__file__).resolve().parent
INPUT_PATH = PIPELINE_DIR / "data" / "step4_services.csv"  # Skip step5 by default
OUTPUT_PATH = PIPELINE_DIR / "data" / "step6_features.csv"

FEATURES_PROMPT = """You are extracting features from a mobile pet grooming business website.
ONLY extract features that are EXPLICITLY stated on the website. Do NOT guess.

From the content below, determine:
- is_licensed: Does the business mention being licensed? (YES/NO)
- is_insured: Does the business mention being insured? (YES/NO)
- fear_free_certified: Is the business Fear Free certified? (YES/NO)
- years_experience: How many years of experience mentioned? (number or empty)
- uses_natural_products: Do they mention using natural/organic products? (YES/NO)
- cage_free: Do they mention cage-free grooming? (YES/NO)
- one_on_one_attention: Do they mention one-on-one attention? (YES/NO)
- online_booking: Do they offer online booking? (YES/NO)

Website content:
{content}

Respond in this exact format (one per line):
is_licensed|YES or NO
is_insured|YES or NO
fear_free_certified|YES or NO
years_experience|number or EMPTY
uses_natural_products|YES or NO
cage_free|YES or NO
one_on_one_attention|YES or NO
online_booking|YES or NO"""

BOOLEAN_FEATURES = [
    "is_licensed",
    "is_insured",
    "fear_free_certified",
    "uses_natural_products",
    "cage_free",
    "one_on_one_attention",
    "online_booking",
]


def parse_features(response: str) -> dict:
    """Parse a feature extraction response into a dict."""
    result = {}
    for feat in BOOLEAN_FEATURES:
        result[feat] = False
    result["years_experience"] = None

    for line in response.strip().splitlines():
        line = line.strip()
        if "|" not in line:
            continue
        key, _, value = line.partition("|")
        key = key.strip().lower()
        value = value.strip()

        if key in BOOLEAN_FEATURES:
            result[key] = value.upper() == "YES"
        elif key == "years_experience":
            try:
                result["years_experience"] = int(value) if value and value.upper() != "EMPTY" else None
            except ValueError:
                result["years_experience"] = None

    return result


def extract_features() -> None:
    """Run the feature extraction pipeline."""
    print("=" * 60)
    print("STEP 6: Extract Features")
    print("=" * 60)

    print(f"\nReading {INPUT_PATH} ...")
    df = read_csv(str(INPUT_PATH))
    total = len(df)
    print(f"  Total rows: {total}")

    # Initialize feature columns
    for feat in BOOLEAN_FEATURES:
        df[feat] = False
    df["years_experience"] = None

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
            print(f"\nExtracting features for {len(items_to_classify)} businesses ...")
            responses = classify_batch(
                items=items_to_classify,
                prompt_template=FEATURES_PROMPT,
                max_concurrent=10,
            )

            for idx, response in zip(classify_indices, responses):
                parsed = parse_features(response)
                for key, value in parsed.items():
                    df.at[idx, key] = value

    # Write output
    write_csv(df, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")

    # Stats
    print(f"\n--- Feature Extraction Stats ---")
    for feat in BOOLEAN_FEATURES:
        count = df[feat].sum()
        pct = count / total * 100 if total > 0 else 0
        print(f"  {feat}: {count}/{total} ({pct:.0f}%)")
    has_exp = df["years_experience"].notna().sum()
    print(f"  years_experience mentioned: {has_exp}/{total}")
    print(f"  Total output rows: {len(df)}")
    print("=" * 60)


if __name__ == "__main__":
    extract_features()

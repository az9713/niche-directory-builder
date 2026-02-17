"""Step 3: Verify each business is actually a mobile/in-home pet groomer.

This is the MOST CRITICAL step in the pipeline. It crawls each business
website and uses Claude Haiku to classify whether the business is a
mobile pet groomer, a salon-only groomer, or not a groomer at all.
"""

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.crawler import crawl_urls
from utils.csv_utils import read_csv, write_csv
from utils.llm import classify_batch

PIPELINE_DIR = Path(__file__).resolve().parent
INPUT_PATH = PIPELINE_DIR / "data" / "step2_cleaned.csv"
OUTPUT_PATH = PIPELINE_DIR / "data" / "step3_verified.csv"

CLASSIFICATION_SYSTEM = "You are classifying businesses for a mobile pet grooming directory."

CLASSIFICATION_PROMPT = """You are classifying businesses for a mobile pet grooming directory.

Based on the website content below, classify this business as one of:
- MOBILE_GROOMER: The business offers mobile/in-home pet grooming (they come to the customer)
- SALON_ONLY: The business is a pet grooming salon or shop (customers come to them)
- NOT_GROOMER: The business is not a pet groomer at all
- UNCLEAR: Cannot determine from the available content

Look for keywords: "mobile", "we come to you", "at your door", "in-home", "house call", "van", "mobile grooming van", "your driveway", "mobile pet spa", "come to your home", "mobile unit"

A business that offers BOTH mobile AND salon services should be classified as MOBILE_GROOMER.

Website content:
{content}

Respond with ONLY the classification (MOBILE_GROOMER, SALON_ONLY, NOT_GROOMER, or UNCLEAR) followed by a pipe | and a confidence score 0-100, followed by a pipe | and brief evidence.
Example: MOBILE_GROOMER|85|Website says "we bring our fully equipped van to your door\""""


def parse_classification(response: str) -> tuple[str, int, str]:
    """Parse a classification response into (label, confidence, evidence)."""
    parts = response.strip().split("|", 2)
    label = parts[0].strip().upper() if len(parts) >= 1 else "UNCLEAR"
    confidence = 0
    evidence = ""

    if len(parts) >= 2:
        try:
            confidence = int(parts[1].strip())
        except ValueError:
            confidence = 0
    if len(parts) >= 3:
        evidence = parts[2].strip()

    valid_labels = {"MOBILE_GROOMER", "SALON_ONLY", "NOT_GROOMER", "UNCLEAR"}
    if label not in valid_labels:
        label = "UNCLEAR"

    return label, confidence, evidence


def verify() -> None:
    """Run the verification pipeline."""
    print("=" * 60)
    print("STEP 3: Verify Mobile Groomers (CRITICAL)")
    print("=" * 60)

    # Read cleaned data
    print(f"\nReading {INPUT_PATH} ...")
    df = read_csv(str(INPUT_PATH))
    total = len(df)
    print(f"  Total rows: {total}")

    # Initialize classification columns
    df["classification"] = "UNCLEAR"
    df["verification_confidence"] = 0
    df["evidence"] = ""

    # Split into rows with and without websites
    has_website = df["website"].notna() & (df["website"].str.strip() != "")
    df_with_site = df[has_website].copy()
    df_no_site = df[~has_website].copy()
    print(f"  With website: {len(df_with_site)}")
    print(f"  Without website: {len(df_no_site)}")

    if len(df_with_site) > 0:
        # Crawl all websites
        urls = df_with_site["website"].tolist()
        print(f"\nCrawling {len(urls)} websites ...")
        crawled = crawl_urls(urls, batch_size=5, timeout=15)

        crawl_success = sum(1 for v in crawled.values() if v is not None)
        print(f"  Crawled successfully: {crawl_success}/{len(urls)}")

        # Prepare items for classification
        items_to_classify = []
        classify_indices = []
        for idx, row in df_with_site.iterrows():
            url = row["website"]
            text = crawled.get(url)
            if text:
                # Truncate to ~4000 chars to stay within token limits
                content = text[:4000]
                items_to_classify.append({"content": content})
                classify_indices.append(idx)
            else:
                df.at[idx, "classification"] = "UNCLEAR"
                df.at[idx, "evidence"] = "Could not crawl website"

        # Classify via Claude
        if items_to_classify:
            print(f"\nClassifying {len(items_to_classify)} businesses via Claude Haiku ...")
            responses = classify_batch(
                items=items_to_classify,
                prompt_template=CLASSIFICATION_PROMPT,
                max_concurrent=10,
            )

            for idx, response in zip(classify_indices, responses):
                label, confidence, evidence = parse_classification(response)
                df.at[idx, "classification"] = label
                df.at[idx, "verification_confidence"] = confidence
                df.at[idx, "evidence"] = evidence

    # Mark no-website rows as UNCLEAR (keep them — they have Maps data)
    df.loc[~has_website, "classification"] = "UNCLEAR"
    df.loc[~has_website, "evidence"] = "No website to verify"

    # Filter: keep MOBILE_GROOMER + UNCLEAR rows without a website
    keep_mask = (df["classification"] == "MOBILE_GROOMER") | (
        (df["classification"] == "UNCLEAR") & ~has_website
    )
    df_filtered = df[keep_mask].copy().reset_index(drop=True)

    # Write output
    write_csv(df_filtered, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")

    # Stats
    counts = df["classification"].value_counts()
    print(f"\n--- Classification Results ---")
    for label, count in counts.items():
        print(f"  {label}: {count}")
    print(f"\n--- Filtered Output ---")
    print(f"  MOBILE_GROOMER kept: {(df_filtered['classification'] == 'MOBILE_GROOMER').sum()}")
    print(f"  UNCLEAR (no website) kept: {(df_filtered['classification'] == 'UNCLEAR').sum()}")
    print(f"  Total output rows: {len(df_filtered)}")
    print("=" * 60)


if __name__ == "__main__":
    verify()

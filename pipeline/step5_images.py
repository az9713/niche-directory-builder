"""Step 5: Extract and select business images from websites.

OPTIONAL STEP — This step is skipped by default. Set SKIP_BY_DEFAULT = False
to enable image extraction. When skipped, it simply copies the input to
the output file.
"""

import re
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.csv_utils import read_csv, write_csv

SKIP_BY_DEFAULT = True

PIPELINE_DIR = Path(__file__).resolve().parent
INPUT_PATH = PIPELINE_DIR / "data" / "step4_services.csv"
OUTPUT_PATH = PIPELINE_DIR / "data" / "step5_images.csv"

# Patterns to skip when looking for business images
SKIP_PATTERNS = [
    r"logo",
    r"icon",
    r"favicon",
    r"sprite",
    r"banner-ad",
    r"tracking",
    r"pixel",
    r"badge",
    r"avatar",
    r"social[-_]",
    r"facebook",
    r"twitter",
    r"instagram",
    r"google",
    r"yelp",
]
SKIP_RE = re.compile("|".join(SKIP_PATTERNS), re.IGNORECASE)


def extract_image_urls_from_markdown(text: str) -> list[str]:
    """Extract image URLs from markdown content, filtering out logos/icons."""
    # Match markdown image syntax: ![alt](url)
    img_pattern = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
    urls = []
    for alt, url in img_pattern.findall(text):
        if SKIP_RE.search(url) or SKIP_RE.search(alt):
            continue
        # Skip very small images (common for icons) based on URL hints
        if any(dim in url for dim in ["1x1", "2x2", "16x", "32x", "48x"]):
            continue
        urls.append(url)
    return urls


def extract_images() -> None:
    """Run the image extraction pipeline."""
    print("=" * 60)
    print("STEP 5: Extract Images (OPTIONAL)")
    print("=" * 60)

    if SKIP_BY_DEFAULT:
        print("\n  SKIPPED — SKIP_BY_DEFAULT is True")
        print("  Copying input to output as-is.")
        df = read_csv(str(INPUT_PATH))
        df["image_url"] = ""
        df["image_description"] = ""
        write_csv(df, str(OUTPUT_PATH))
        print(f"  Output: {OUTPUT_PATH} ({len(df)} rows)")
        print("=" * 60)
        return

    # Full implementation when enabled
    from utils.crawler import crawl_urls
    from utils.llm import classify_batch

    print(f"\nReading {INPUT_PATH} ...")
    df = read_csv(str(INPUT_PATH))
    total = len(df)
    print(f"  Total rows: {total}")

    df["image_url"] = ""
    df["image_description"] = ""

    # Crawl websites to find images
    has_website = df["website"].notna() & (df["website"].str.strip() != "")
    urls = df.loc[has_website, "website"].tolist()

    if urls:
        print(f"\nCrawling {len(urls)} websites for images ...")
        crawled = crawl_urls(urls, batch_size=5, timeout=15)

        # Phase 1: Extract candidate image URLs
        candidates = {}
        for idx, row in df[has_website].iterrows():
            text = crawled.get(row["website"])
            if text:
                imgs = extract_image_urls_from_markdown(text)
                if imgs:
                    candidates[idx] = imgs

        print(f"  Found image candidates for {len(candidates)}/{len(urls)} businesses")

        if candidates:
            # Phase 2: Use Claude Vision to select the best image
            items = []
            classify_indices = []
            for idx, img_urls in candidates.items():
                # Limit to first 10 candidate URLs
                urls_text = "\n".join(f"- {u}" for u in img_urls[:10])
                items.append({
                    "business_name": df.at[idx, "name"],
                    "image_urls": urls_text,
                })
                classify_indices.append(idx)

            image_select_prompt = """Select the best image for a mobile pet grooming business listing.

Business name: {business_name}

Candidate image URLs:
{image_urls}

Pick the URL most likely to be a good representative photo of the business
(grooming van, groomer at work, happy pet, etc.). Avoid logos, icons, stock photos.

Respond in this format:
URL|the_best_url_here
DESC|Brief description of what the image likely shows"""

            print(f"\nSelecting best images for {len(items)} businesses ...")
            responses = classify_batch(
                items=items,
                prompt_template=image_select_prompt,
                max_concurrent=10,
            )

            for idx, response in zip(classify_indices, responses):
                for line in response.strip().splitlines():
                    if line.startswith("URL|"):
                        df.at[idx, "image_url"] = line.split("|", 1)[1].strip()
                    elif line.startswith("DESC|"):
                        df.at[idx, "image_description"] = line.split("|", 1)[1].strip()

    write_csv(df, str(OUTPUT_PATH))
    has_images = (df["image_url"] != "").sum()
    print(f"\n  Output: {OUTPUT_PATH}")
    print(f"  Businesses with images: {has_images}/{total}")
    print("=" * 60)


if __name__ == "__main__":
    extract_images()

"""Step 2: Clean and deduplicate raw Outscraper data."""

import re
import sys
from pathlib import Path

# Allow imports from pipeline root
sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.csv_utils import read_all_csvs, write_csv

PIPELINE_DIR = Path(__file__).resolve().parent
RAW_DIR = PIPELINE_DIR / "step1_outscraper" / "raw"
OUTPUT_PATH = PIPELINE_DIR / "data" / "step2_cleaned.csv"

CHAIN_NAMES = [
    "petsmart",
    "petco",
    "walmart",
    "target",
    "petvalu",
    "pet valu",
    "pet supplies plus",
]


def make_slug(name: str, city: str, state: str) -> str:
    """Generate a URL-friendly slug from name + city + state."""
    raw = f"{name} {city} {state}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw)
    return slug.strip("-")


def is_chain(name: str) -> bool:
    """Check if a business name matches a known chain."""
    name_lower = name.lower().strip()
    return any(chain in name_lower for chain in CHAIN_NAMES)


def clean() -> None:
    """Run the cleaning pipeline."""
    print("=" * 60)
    print("STEP 2: Clean & Deduplicate")
    print("=" * 60)

    # Read all raw CSVs
    print(f"\nReading CSVs from {RAW_DIR} ...")
    df = read_all_csvs(str(RAW_DIR))
    total_raw = len(df)
    print(f"  Total raw rows: {total_raw}")

    # Remove rows missing required fields
    required_cols = ["name", "full_address", "city", "state"]
    for col in required_cols:
        if col not in df.columns:
            # Try common Outscraper column name variants
            print(f"  WARNING: Column '{col}' not found. Available: {list(df.columns)}")
    before = len(df)
    df = df.dropna(subset=[c for c in required_cols if c in df.columns])
    removed_missing = before - len(df)
    print(f"  Removed {removed_missing} rows with missing required fields")

    # Remove permanently closed businesses
    before = len(df)
    if "business_status" in df.columns:
        df = df[~df["business_status"].str.upper().isin(["CLOSED_PERMANENTLY", "PERMANENTLY_CLOSED"])]
    removed_closed = before - len(df)
    print(f"  Removed {removed_closed} permanently closed businesses")

    # Remove known chains
    before = len(df)
    df = df[~df["name"].apply(is_chain)]
    removed_chains = before - len(df)
    print(f"  Removed {removed_chains} known chain stores")

    # Deduplicate by name + city + state
    before = len(df)
    df["_dedup_key"] = (
        df["name"].str.lower().str.strip()
        + "|"
        + df["city"].str.lower().str.strip()
        + "|"
        + df["state"].str.lower().str.strip()
    )
    df = df.drop_duplicates(subset="_dedup_key", keep="first")
    df = df.drop(columns=["_dedup_key"])
    removed_dupes = before - len(df)
    print(f"  Removed {removed_dupes} duplicate rows")

    # Generate slugs
    df["slug"] = df.apply(lambda row: make_slug(str(row["name"]), str(row["city"]), str(row["state"])), axis=1)

    # Sort by state, city, name
    df = df.sort_values(["state", "city", "name"]).reset_index(drop=True)

    # Write output
    write_csv(df, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")
    print(f"  Final count: {len(df)} rows")

    # Summary
    print(f"\n--- Summary ---")
    print(f"  Raw rows:           {total_raw}")
    print(f"  Missing fields:    -{removed_missing}")
    print(f"  Closed:            -{removed_closed}")
    print(f"  Chains:            -{removed_chains}")
    print(f"  Duplicates:        -{removed_dupes}")
    print(f"  Final:              {len(df)}")
    print("=" * 60)


if __name__ == "__main__":
    clean()

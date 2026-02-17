"""Step 8: Finalize data and upsert to Supabase."""

import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils.csv_utils import read_csv, write_csv

load_dotenv()

PIPELINE_DIR = Path(__file__).resolve().parent
DATA_DIR = PIPELINE_DIR / "data"
OUTPUT_PATH = DATA_DIR / "final_listings.csv"

# Data files in order of preference (latest step first)
DATA_CHAIN = [
    DATA_DIR / "step7_areas.csv",
    DATA_DIR / "step6_features.csv",
    DATA_DIR / "step5_images.csv",
    DATA_DIR / "step4_services.csv",
    DATA_DIR / "step3_verified.csv",
]

# Production column mapping: source_col -> output_col
PRODUCTION_COLUMNS = {
    "slug": "slug",
    "name": "name",
    "full_address": "full_address",
    "city": "city",
    "state": "state",
    "zip": "zip",
    "phone": "phone",
    "website": "website",
    "rating": "rating",
    "reviews_count": "reviews_count",
    "google_maps_url": "google_maps_url",
    "classification": "classification",
    "verification_confidence": "verification_confidence",
    # Services
    "svc_full_groom": "svc_full_groom",
    "svc_bath_only": "svc_bath_only",
    "svc_nail_trim": "svc_nail_trim",
    "svc_deshedding": "svc_deshedding",
    "svc_teeth_brushing": "svc_teeth_brushing",
    "svc_ear_cleaning": "svc_ear_cleaning",
    "svc_flea_treatment": "svc_flea_treatment",
    "svc_puppy_groom": "svc_puppy_groom",
    "svc_senior_groom": "svc_senior_groom",
    "svc_dematting": "svc_dematting",
    "svc_breed_cuts": "svc_breed_cuts",
    "pet_types": "pet_types",
    "breed_sizes": "breed_sizes",
    "price_range_low": "price_range_low",
    "price_range_high": "price_range_high",
    # Features
    "is_licensed": "is_licensed",
    "is_insured": "is_insured",
    "fear_free_certified": "fear_free_certified",
    "years_experience": "years_experience",
    "uses_natural_products": "uses_natural_products",
    "cage_free": "cage_free",
    "one_on_one_attention": "one_on_one_attention",
    "online_booking": "online_booking",
    # Service areas
    "primary_city": "primary_city",
    "service_cities": "service_cities",
    "service_radius_miles": "service_radius_miles",
    # Images (optional)
    "image_url": "image_url",
    "image_description": "image_description",
}

BOOLEAN_COLUMNS = [
    "svc_full_groom",
    "svc_bath_only",
    "svc_nail_trim",
    "svc_deshedding",
    "svc_teeth_brushing",
    "svc_ear_cleaning",
    "svc_flea_treatment",
    "svc_puppy_groom",
    "svc_senior_groom",
    "svc_dematting",
    "svc_breed_cuts",
    "is_licensed",
    "is_insured",
    "fear_free_certified",
    "uses_natural_products",
    "cage_free",
    "one_on_one_attention",
    "online_booking",
]


def find_latest_data() -> Path:
    """Find the latest available data file in the pipeline chain."""
    for path in DATA_CHAIN:
        if path.exists():
            print(f"  Using latest data file: {path.name}")
            return path
    raise FileNotFoundError("No pipeline data files found. Run earlier steps first.")


def validate(df: pd.DataFrame) -> list[str]:
    """Validate the final DataFrame, return a list of warnings."""
    warnings = []

    # Check for duplicate slugs
    if "slug" in df.columns:
        dupes = df["slug"].duplicated()
        if dupes.any():
            dupe_slugs = df.loc[dupes, "slug"].tolist()
            warnings.append(f"Duplicate slugs found ({len(dupe_slugs)}): {dupe_slugs[:5]}")
            # Fix: append index to make unique
            for i, idx in enumerate(df[dupes].index):
                df.at[idx, "slug"] = f"{df.at[idx, 'slug']}-{i + 2}"
            warnings.append("  -> Fixed by appending index to duplicate slugs")

    # Validate booleans
    for col in BOOLEAN_COLUMNS:
        if col in df.columns:
            non_bool = ~df[col].isin([True, False, 0, 1, "True", "False"])
            if non_bool.any():
                warnings.append(f"Column '{col}' has {non_bool.sum()} non-boolean values — coercing")
                df[col] = df[col].map(lambda x: str(x).upper() in ("TRUE", "YES", "1"))

    # Validate price ranges
    if "price_range_low" in df.columns and "price_range_high" in df.columns:
        both_set = df["price_range_low"].notna() & df["price_range_high"].notna()
        if both_set.any():
            invalid_prices = df.loc[both_set, "price_range_low"] > df.loc[both_set, "price_range_high"]
            if invalid_prices.any():
                count = invalid_prices.sum()
                warnings.append(f"Price range low > high for {count} rows — swapping")
                swap_mask = both_set & (df["price_range_low"] > df["price_range_high"])
                low = df.loc[swap_mask, "price_range_low"].copy()
                df.loc[swap_mask, "price_range_low"] = df.loc[swap_mask, "price_range_high"]
                df.loc[swap_mask, "price_range_high"] = low

    return warnings


def upsert_to_supabase(df: pd.DataFrame) -> None:
    """Upsert listings to Supabase."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("\n  Supabase credentials not found in environment. Skipping upsert.")
        print("  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.")
        return

    try:
        from supabase import create_client

        client = create_client(url, key)

        # Convert DataFrame to list of dicts, handling NaN
        records = df.where(pd.notna(df), None).to_dict(orient="records")

        # Upsert in batches of 100
        batch_size = 100
        total_upserted = 0
        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            client.table("listings").upsert(batch, on_conflict="slug").execute()
            total_upserted += len(batch)
            print(f"  Upserted batch {i // batch_size + 1}: {total_upserted}/{len(records)}")

        print(f"  Supabase upsert complete: {total_upserted} rows")

    except Exception as e:
        print(f"  Supabase upsert failed: {e}")


def finalize() -> None:
    """Run the finalization pipeline."""
    print("=" * 60)
    print("STEP 8: Finalize & Upload")
    print("=" * 60)

    # Find latest data
    print("\nLocating latest pipeline data ...")
    input_path = find_latest_data()

    print(f"Reading {input_path} ...")
    df = read_csv(str(input_path))
    total = len(df)
    print(f"  Total rows: {total}")

    # Select and rename columns (only those that exist)
    available_cols = {src: dst for src, dst in PRODUCTION_COLUMNS.items() if src in df.columns}
    df = df[list(available_cols.keys())].rename(columns=available_cols)
    print(f"  Selected {len(available_cols)} production columns")

    # Ensure boolean columns are actual booleans
    for col in BOOLEAN_COLUMNS:
        if col in df.columns:
            df[col] = df[col].map(lambda x: str(x).upper() in ("TRUE", "YES", "1"))

    # Validate
    print("\nValidating ...")
    warnings = validate(df)
    if warnings:
        print(f"  {len(warnings)} validation warnings:")
        for w in warnings:
            print(f"    {w}")
    else:
        print("  No validation warnings")

    # Write final CSV
    write_csv(df, str(OUTPUT_PATH))
    print(f"\n  Output: {OUTPUT_PATH}")
    print(f"  Final rows: {len(df)}")

    # Upsert to Supabase
    print("\nUpserting to Supabase ...")
    upsert_to_supabase(df)

    # Summary
    print(f"\n--- Final Summary ---")
    print(f"  Total listings: {len(df)}")
    print(f"  Columns: {len(df.columns)}")
    if "state" in df.columns:
        print(f"  States covered: {df['state'].nunique()}")
    if "classification" in df.columns:
        print(f"  Verified mobile groomers: {(df['classification'] == 'MOBILE_GROOMER').sum()}")
    print(f"  Validation warnings: {len(warnings)}")
    print("=" * 60)


if __name__ == "__main__":
    finalize()

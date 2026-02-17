"""Shared CSV utilities using pandas."""

from pathlib import Path

import pandas as pd


def read_csv(path: str) -> pd.DataFrame:
    """Read a single CSV file into a DataFrame."""
    return pd.read_csv(path)


def write_csv(df: pd.DataFrame, path: str) -> None:
    """Write a DataFrame to CSV with index=False."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)


def read_all_csvs(directory: str) -> pd.DataFrame:
    """Read and concatenate all CSV files in a directory."""
    csv_dir = Path(directory)
    csv_files = sorted(csv_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {directory}")
    frames = [pd.read_csv(f) for f in csv_files]
    print(f"  Read {len(frames)} CSV files from {directory}")
    return pd.concat(frames, ignore_index=True)

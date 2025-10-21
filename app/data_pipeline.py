"""
============================================================
 Jamaica Pulse - Data Pipeline
 Description: Handles multi-source data fetching, cleaning,
 and unification for sentiment and topic analysis backend.
============================================================
"""

import os
import pandas as pd
from datetime import datetime

# -------------------- Config --------------------
# Base directories (relative, works on any system)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")

RAW_DIR = os.path.join(DATA_DIR, "raw")
CLEANED_FILE = os.path.join(DATA_DIR, "cleaned_posts.csv")

# Ensure directories exist
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


# -------------------- Source Loaders --------------------
def fetch_instagram_data():
    """Load Instagram data if available."""
    path = os.path.join(RAW_DIR, "instagram_posts.csv")
    if os.path.exists(path):
        df = pd.read_csv(path)
        df["platform"] = "Instagram"
        return df
    return pd.DataFrame(columns=["platform", "text", "timestamp"])


def fetch_twitter_data():
    """Load X (Twitter) data if available."""
    path = os.path.join(RAW_DIR, "twitter_posts.csv")
    if os.path.exists(path):
        df = pd.read_csv(path)
        df["platform"] = "Twitter"
        return df
    return pd.DataFrame(columns=["platform", "text", "timestamp"])


def fetch_youtube_data():
    """Load YouTube comments if available."""
    path = os.path.join(RAW_DIR, "youtube_comments.csv")
    if os.path.exists(path):
        df = pd.read_csv(path)
        df["platform"] = "YouTube"
        return df
    return pd.DataFrame(columns=["platform", "text", "timestamp"])


def fetch_news_data():
    """Load News articles or headlines if available."""
    path = os.path.join(RAW_DIR, "news_articles.csv")
    if os.path.exists(path):
        df = pd.read_csv(path)
        df["platform"] = "News"
        return df
    return pd.DataFrame(columns=["platform", "text", "timestamp"])


# -------------------- Combine & Clean --------------------
def combine_and_clean():
    """
    Combine all available sources, clean text data,
    normalize timestamps, and save to cleaned_posts.csv.
    """
    sources = [
        fetch_instagram_data(),
        fetch_twitter_data(),
        fetch_youtube_data(),
        fetch_news_data(),
    ]

    combined = pd.concat(sources, ignore_index=True)
    if combined.empty:
        print("⚠️ No data found in any sources.")
        return combined

    # Drop duplicates & handle missing text
    combined.dropna(subset=["text"], inplace=True)
    combined.drop_duplicates(subset=["text"], inplace=True)
    combined["text"] = combined["text"].astype(str).str.strip()

    # Normalize timestamps
    combined["timestamp"] = pd.to_datetime(combined["timestamp"], errors="coerce")
    combined["timestamp"].fillna(datetime.now(), inplace=True)

    # Save cleaned data
    combined.to_csv(CLEANED_FILE, index=False, encoding="utf-8")
    print(f"✅ Cleaned data saved to {CLEANED_FILE}")
    return combined

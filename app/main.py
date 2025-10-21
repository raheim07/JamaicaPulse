"""
============================================================
 Jamaica Pulse - BACKEND
 Description: Flask API for sentiment analysis and
 ML-based topic categorization of Jamaican social data.
============================================================
"""

from flask import Flask, jsonify
from collections import defaultdict
from textblob import TextBlob
import pandas as pd
import os
import joblib
from flask_cors import CORS
import google.generativeai as genai

# Import data pipeline
from app.data_pipeline import combine_and_clean, DATA_DIR

# -------------------- App Setup --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Google AI Setup --------------------
# Get API key from environment variable
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("⚠️ WARNING: GOOGLE_API_KEY not set in environment. Summarization will fail.")

def summarize(text: str) -> str:
    """Use Gemini model to summarize topic trends briefly."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            "Very short, in an analytical way that provides insight, "
            "summarize this text for Jamaican social metrics:\n\n" + text
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Summarization error:", e)
        return text  # fallback


# -------------------- Model Loading --------------------
MODEL_DIR = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), "ML_model", "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

try:
    vectorizer = joblib.load(VECTORIZER_PATH)
    model = joblib.load(MODEL_PATH)
    print("✅ ML model and vectorizer loaded successfully.")
except Exception as e:
    print("⚠️ Failed to load ML model/vectorizer:", e)
    vectorizer = model = None


# -------------------- Analysis Functions --------------------
def analyze_sentiment(text: str):
    """Get sentiment polarity and label using TextBlob."""
    if not text or not isinstance(text, str):
        return 0.0, "Neutral"
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        return polarity, "Positive"
    elif polarity < -0.1:
        return polarity, "Negative"
    return polarity, "Neutral"


def categorize_text_ml(text):
    """Classify text into topics using trained ML model."""
    if not text or not isinstance(text, str) or model is None:
        return ["Other"]
    try:
        text_vector = vectorizer.transform([text])
        pred_category = model.predict(text_vector)[0]
        return [pred_category]
    except Exception:
        return ["Other"]


def analyze_dataframe(df):
    """Apply sentiment & ML categorization to dataframe."""
    if df.empty:
        return df
    df["polarity"], df["sentiment"] = zip(*df["text"].apply(analyze_sentiment))
    df["categories"] = df["text"].apply(categorize_text_ml)
    return df


# -------------------- Trend Calculation --------------------
def calculate_daily_sentiment(df):
    """Aggregate daily sentiment for trend charts."""
    trends = defaultdict(list)
    for _, row in df.iterrows():
        if not row["categories"] or not row["timestamp"]:
            continue
        date = pd.to_datetime(row["timestamp"]).date()
        normalized = int((row["polarity"] + 1) * 50)
        for cat in row["categories"]:
            trends[cat].append({"date": str(date), "sentiment": normalized})

    final = {}
    for topic, entries in trends.items():
        daily = defaultdict(list)
        for e in entries:
            daily[e["date"]].append(e["sentiment"])
        final[topic] = [
            {"date": d, "sentiment": sum(v) // len(v)}
            for d, v in sorted(daily.items())
        ]
    return final


# -------------------- API ROUTES --------------------
@app.route("/")
def home():
    return jsonify({"message": "Welcome to Jamaica Pulse API 🇯🇲"})


@app.route("/bulk", methods=["GET"])
def bulk_analysis():
    """Return all analyzed data."""
    try:
        df = combine_and_clean()
        df = analyze_dataframe(df)
        df["timestamp"] = pd.to_datetime(df["timestamp"]).dt.strftime("%Y-%m-%d %H:%M:%S")
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        print("Error in /bulk:", e)
        return jsonify([])


@app.route("/topics/with-content", methods=["GET"])
def topics_with_content():
    """Return topic-level sentiment breakdowns."""
    try:
        df = combine_and_clean()
        df = analyze_dataframe(df)

        topics = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0, "count": 0, "content": []})
        for _, row in df.iterrows():
            for cat in row["categories"]:
                topics[cat]["count"] += 1
                topics[cat][row["sentiment"].lower()] += 1
                topics[cat]["content"].append(row["text"])

        output = []
        for name, t in topics.items():
            total = t["count"] or 1
            output.append({
                "name": name,
                "positive": t["positive"] / total,
                "negative": t["negative"] / total,
                "neutral": t["neutral"] / total,
                "content": " ".join(t["content"])[:3000],
            })
        return jsonify(output)
    except Exception as e:
        print("Error in /topics/with-content:", e)
        return jsonify([])


@app.route("/topics/trends", methods=["GET"])
def get_all_topic_trends():
    """Return sentiment trends for all topics."""
    try:
        df = analyze_dataframe(combine_and_clean())
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce").fillna(pd.Timestamp.now())
        exploded = df.explode("categories").rename(columns={"categories": "category"})
        return jsonify(calculate_daily_sentiment(exploded))
    except Exception as e:
        print("Error fetching topic trends:", e)
        return jsonify({})


@app.route("/api/summarize_topic_ai/<topic_name>", methods=["GET"])
def summarize_topic_ai(topic_name):
    """Summarize topic sentiment with Gemini AI."""
    try:
        df = analyze_dataframe(combine_and_clean())
        df["categories"] = df["categories"].apply(lambda x: x if isinstance(x, list) else [x])
        topic_df = df[df["categories"].apply(lambda cats: topic_name in cats)]

        if topic_df.empty:
            return jsonify({"summary": f"No posts found for topic '{topic_name}'."})

        total = len(topic_df)
        pos = (topic_df["sentiment"] == "Positive").sum() / total
        neg = (topic_df["sentiment"] == "Negative").sum() / total
        neu = (topic_df["sentiment"] == "Neutral").sum() / total

        text_summary = f"Topic '{topic_name}' sentiment breakdown: Positive {pos*100:.1f}%, Negative {neg*100:.1f}%, Neutral {neu*100:.1f}%."
        ai_summary = summarize(text_summary)
        return jsonify({"summary": ai_summary})
    except Exception as e:
        print("Error in summarize_topic_ai:", e)
        return jsonify({"error": str(e)}), 500


# -------------------- Run App --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

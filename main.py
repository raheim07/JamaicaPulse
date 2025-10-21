# ============================================================
# Jamaica Pulse - BACKEND
# Description: Backend for sentiment analysis and ML-based topic categorization
# ============================================================

from flask import Flask, jsonify, request
from collections import defaultdict
from textblob import TextBlob
import pandas as pd
import os
import joblib
from flask_cors import CORS
import google.generativeai as genai


os.environ["GOOGLE_API_KEY"] = "AIzaSyBwAZlfW-zuATzY7Q85Td4ooIXj8ENydZI"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

def summarize(text: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")  # You can also use "gemini-1.5-pro" for higher quality
    prompt = f"Very Short, in an analytical way that provides insight, summarize this text for Jamaican social metrics(include):\n\n{text}"
    
    response = model.generate_content(prompt)
    return response.text.strip()
# -------------------- Flask App --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Paths --------------------
DATA_PATH = r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\cleaned_posts.csv"
MODEL_PATH = r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model\model\model.pkl"
VECTORIZER_PATH = r"C:\Users\rahei\Documents\Raheim's Development\PythonAI Projects\NationPulse\pulseofthenation.github.io\ML_model\model\vectorizer.pkl"

# -------------------- Load Model --------------------
vectorizer = joblib.load(VECTORIZER_PATH)
model = joblib.load(MODEL_PATH)

# -------------------- Sentiment Analysis --------------------
def analyze_sentiment(text: str):
    if not text or not isinstance(text, str):
        return 0.0, "Neutral"
    
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    return polarity, sentiment

# -------------------- ML Categorization --------------------
def categorize_text_ml(text):
    if not text or not isinstance(text, str):
        return ["Other"]
    try:
        text_vector = vectorizer.transform([text])
        pred_category = model.predict(text_vector)[0]
        return [pred_category]
    except Exception:
        return ["Other"]

# -------------------- Load & Clean Data --------------------
def load_and_clean_data():
    if not os.path.exists(DATA_PATH):
        return pd.DataFrame(columns=['platform', 'text'])

    df = pd.read_csv(DATA_PATH, encoding='utf-8')
    df.dropna(subset=['text'], inplace=True)
    df.drop_duplicates(subset=['text'], inplace=True)
    df['text'] = df['text'].fillna("")
    df = analyze_dataframe(df)
    df.reset_index(drop=True, inplace=True)
    return df

def analyze_dataframe(df):
    results = df['text'].apply(analyze_sentiment)
    if not results.empty:
        df['polarity'], df['sentiment'] = zip(*results)
    else:
        df['polarity'] = pd.Series(dtype=float)
        df['sentiment'] = pd.Series(dtype=str)

    df['categories'] = df['text'].apply(categorize_text_ml)
    return df

# -------------------- Calculate daily sentiment --------------------
def calculate_daily_sentiment(df):
    trends = defaultdict(list)
    for _, row in df.iterrows():
        if not row['categories'] or not row['timestamp']:
            continue
        date = pd.to_datetime(row['timestamp']).date()
        polarity = row['polarity']
        for cat in row['categories']:
            normalized = int((polarity + 1) * 50)
            trends[cat].append({"date": str(date), "sentiment": normalized})

    final_trends = {}
    for topic, entries in trends.items():
        daily_map = defaultdict(list)
        for e in entries:
            daily_map[e['date']].append(e['sentiment'])
        final_trends[topic] = [
            {"date": date, "sentiment": sum(vals) // len(vals)}
            for date, vals in sorted(daily_map.items())
        ]
    return final_trends

# -------------------- API Endpoints --------------------
@app.route('/')
def home():
    return jsonify({"message": "Welcome to Pulse of the Nation API 🇯🇲"})

@app.route('/bulk', methods=['GET'])
def bulk_analysis():
    try:
        df = load_and_clean_data()
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        df['timestamp'] = df['timestamp'].fillna(pd.Timestamp.now())
        df['timestamp'] = df['timestamp'].dt.strftime("%Y-%m-%d %H:%M:%S")
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        print("Error in /bulk:", e)
        return jsonify([])

@app.route('/topics/with-content', methods=['GET'])
def topics_with_content():
    try:
        df = load_and_clean_data()
        topics = {}
        for _, row in df.iterrows():
            for cat in row['categories']:
                if cat not in topics:
                    topics[cat] = {"name": cat, "positive": 0, "negative": 0, "neutral": 0, "count": 0, "content": []}
                if row['sentiment'] == "Positive":
                    topics[cat]['positive'] += 1
                elif row['sentiment'] == "Negative":
                    topics[cat]['negative'] += 1
                else:
                    topics[cat]['neutral'] += 1
                topics[cat]['count'] += 1
                topics[cat]['content'].append(row['text'])

        final_topics = []
        for t in topics.values():
            count = t['count'] or 1
            final_topics.append({
                "name": t['name'],
                "positive": t['positive']/count,
                "negative": t['negative']/count,
                "neutral": t['neutral']/count,
                "content": " ".join(t['content'])[:3000]
            })
        return jsonify(final_topics)
    except Exception as e:
        print("Error in /topics/with-content:", e)
        return jsonify([])

@app.route("/topics/trends", methods=["GET"])
def get_all_topic_trends():
    try:
        df = load_and_clean_data()
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        df['timestamp'] = df['timestamp'].fillna(pd.Timestamp.now())
        exploded = df.explode('categories')
        exploded.rename(columns={'categories': 'category'}, inplace=True)
        trends = calculate_daily_sentiment(exploded)
        return jsonify(trends)
    except Exception as e:
        print("Error fetching topic trends:", e)
        return jsonify({})

# -------------------- Simple Hard-Coded AI Summary --------------------
@app.route("/api/summarize_topic_ai/<topic_name>", methods=["GET"])
def summarize_topic_backend(topic_name):
    try:
        df = load_and_clean_data()
        if 'categories' not in df.columns:
            return jsonify({"summary": f"No categories column in data."})

        df['categories'] = df['categories'].apply(lambda x: x if isinstance(x, list) else [x])
        topic_posts = df[df['categories'].apply(lambda cats: topic_name in cats)]

        if topic_posts.empty:
            return jsonify({"summary": f"No posts found for topic '{topic_name}'."})

        total = len(topic_posts)
        positive = (topic_posts['sentiment'] == "Positive").sum() / total
        negative = (topic_posts['sentiment'] == "Negative").sum() / total
        neutral = (topic_posts['sentiment'] == "Neutral").sum() / total

        summary = f"Topic '{topic_name}' sentiment breakdown: Positive {positive*100:.1f}%, Negative {negative*100:.1f}%, Neutral {neutral*100:.1f}%."
        summary = summarize(summary)
        return jsonify({"summary": summary})
    except Exception as e:
        print("Error in summarize_topic_backend:", e)
        return jsonify({"error": str(e)}), 500


# Endpoint for individual trend data
@app.route("/topics/trends/<topic_name>", methods=["GET"])
def get_topic_trends(topic_name):
    try:
        df = load_and_clean_data()
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        df['timestamp'] = df['timestamp'].fillna(pd.Timestamp.now())
        
        # Filter for the specific topic
        topic_posts = df[df['categories'].apply(lambda cats: topic_name in cats if isinstance(cats, list) else False)]
        
        if topic_posts.empty:
            return jsonify({"trend": []})
        
        # Generate trend for last 7 days
        daily_map = defaultdict(list)
        for _, row in topic_posts.iterrows():
            date = pd.to_datetime(row['timestamp']).strftime('%Y-%m-%d')
            daily_map[date].append(row['polarity'])
        
        # Convert to normalized sentiment and get last 7 days
        trend_data = []
        for date, polarities in sorted(daily_map.items())[-7:]:
            avg_polarity = sum(polarities) / len(polarities)
            normalized_sentiment = int((avg_polarity + 1) * 50)
            trend_data.append({
                "date": date,
                "sentiment": normalized_sentiment
            })
        
        return jsonify({"trend": trend_data})
    except Exception as e:
        print(f"Error fetching trends for {topic_name}:", e)
        return jsonify({"trend": []})
# -------------------- Run App --------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

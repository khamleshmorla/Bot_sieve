"""
Sentiment Analyzer — uses Hugging Face pretrained models with VADER (rule-based) fallback.
Creates an hourly sentiment timeline from posts.
"""
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime

# Initialize VADER as baseline/fallback
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
_vader_analyzer = SentimentIntensityAnalyzer()

# Attempt to load Hugging Face Transformers pipeline
_hf_analyzer = None
try:
    from transformers import pipeline
    # Use a small, fast Hugging Face sentiment model mapping to POSITIVE/NEGATIVE
    _hf_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", truncation=True)
    print("[INFO] Successfully loaded Hugging Face sentiment model.")
except Exception as e:
    print(f"[WARN] Hugging Face sentiment model not loaded. Falling back to VADER. Error: {e}")

def analyze_post(text: str) -> Dict[str, float]:
    """Analyzes text sentiment. Uses Hugging Face if available, otherwise VADER."""
    if _hf_analyzer:
        try:
            result = _hf_analyzer(text[:512])[0]
            label = result['label'].upper()
            score = result['score']
            
            # Map HF to positive/negative/neutral format
            if label == "POSITIVE":
                return {"positive": score, "negative": 1.0 - score, "neutral": 0.0, "compound": score}
            else:
                return {"positive": 1.0 - score, "negative": score, "neutral": 0.0, "compound": -score}
        except Exception:
            pass # fallback to vader if HF inference fails

    # VADER fallback
    scores = _vader_analyzer.polarity_scores(text)
    return {
        "positive": scores["pos"],
        "negative": scores["neg"],
        "neutral": scores["neu"],
        "compound": scores["compound"],
    }


def build_sentiment_timeline(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups posts by hour, computes avg sentiment + fake/organic ratio per hour.
    Returns list of 24 hourly data points.
    """
    hourly: Dict[str, Dict] = defaultdict(lambda: {
        "positive": [], "negative": [], "neutral": [],
        "fake_count": 0, "organic_count": 0,
    })

    # Cap at 500 to prevent HF pipeline inference from hanging the thread on large synthetic datasets
    sample_posts = posts[:500] if len(posts) > 500 else posts

    for post in sample_posts:
        try:
            ts = datetime.fromisoformat(post["timestamp"])
        except Exception:
            continue
        hour_key = f"{ts.hour:02d}:00"
        sentiment = analyze_post(post["text"])
        h = hourly[hour_key]
        h["positive"].append(sentiment["positive"] * 100)
        h["negative"].append(sentiment["negative"] * 100)
        h["neutral"].append(sentiment["neutral"] * 100)
        if post.get("is_bot"):
            h["fake_count"] += 1
        else:
            h["organic_count"] += 1

    timeline = []
    for hour in [f"{h:02d}:00" for h in range(24)]:
        h = hourly.get(hour, {})
        pos_list = h.get("positive", [0])
        neg_list = h.get("negative", [0])
        neu_list = h.get("neutral", [0])
        fake = h.get("fake_count", 0)
        organic = h.get("organic_count", 0)
        total = fake + organic or 1
        timeline.append({
            "time": hour,
            "positive": round(sum(pos_list) / max(len(pos_list), 1), 1),
            "negative": round(sum(neg_list) / max(len(neg_list), 1), 1),
            "neutral": round(sum(neu_list) / max(len(neu_list), 1), 1),
            "fake": round((fake / total) * 100, 1),
            "organic": round((organic / total) * 100, 1),
        })

    return timeline

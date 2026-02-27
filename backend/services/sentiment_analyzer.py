"""
Sentiment Analyzer — uses VADER (rule-based, no training required)
Creates an hourly sentiment timeline from posts.
"""
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime


_analyzer = SentimentIntensityAnalyzer()


def analyze_post(text: str) -> Dict[str, float]:
    scores = _analyzer.polarity_scores(text)
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

    for post in posts:
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

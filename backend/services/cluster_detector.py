"""
Cluster Detector — DBSCAN-based account clustering to find bot networks.
Uses scikit-learn. No training required (unsupervised).
"""
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
import numpy as np


def build_feature_vector(account: Dict[str, Any]) -> List[float]:
    """Turn account metadata into a numeric feature vector."""
    age = account.get("account_age_days", 365)
    followers = account.get("followers", 0)
    following = account.get("following", 1)
    tweets = account.get("tweet_count", 0)
    has_pic = 1.0 if account.get("has_profile_pic") else 0.0
    has_bio = 1.0 if account.get("has_bio") else 0.0

    ff_ratio = followers / max(following, 1)
    tweet_rate = tweets / max(age, 1)

    return [
        min(age, 730) / 730,        # Normalized age (cap at 2 years)
        min(ff_ratio, 5) / 5,       # Normalized follower ratio
        min(tweet_rate, 50) / 50,   # Normalized tweet rate
        has_pic,
        has_bio,
        account.get("bot_score", 50) / 100,
    ]


def detect_clusters(accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Runs DBSCAN clustering on account feature vectors.
    Returns cluster summary nodes for visualization.
    """
    if len(accounts) < 5:
        return []

    features = np.array([build_feature_vector(a) for a in accounts])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    dbscan = DBSCAN(eps=0.5, min_samples=5)
    labels = dbscan.fit_predict(features_scaled)

    clusters = {}
    for i, label in enumerate(labels):
        if label == -1:
            continue  # Noise point
        if label not in clusters:
            clusters[label] = {"members": [], "bot_scores": []}
        clusters[label]["members"].append(accounts[i])
        clusters[label]["bot_scores"].append(accounts[i].get("bot_score", 50))

    # Build output nodes for visualization
    nodes = []
    # Spread nodes in a grid for visualization
    positions = [
        (25, 30), (65, 25), (50, 65), (80, 55), (15, 65),
        (40, 45), (70, 75), (30, 80), (85, 35), (10, 45),
    ]
    sorted_clusters = sorted(clusters.items(), key=lambda x: -len(x[1]["members"]))
    for idx, (label, data) in enumerate(sorted_clusters[:10]):
        avg_bot_score = sum(data["bot_scores"]) / len(data["bot_scores"])
        is_bot_cluster = avg_bot_score > 50
        x, y = positions[idx % len(positions)]
        nodes.append({
            "id": f"c{idx + 1}",
            "label": f"{'Bot' if is_bot_cluster else 'Real'} Group {idx + 1}",
            "size": len(data["members"]),
            "botScore": round(avg_bot_score),
            "x": x,
            "y": y,
        })

    # Also add unclustered nodes as "Real Users" if they exist
    noise_count = int((labels == -1).sum())
    if noise_count > 0:
        nodes.append({
            "id": "noise",
            "label": "Real / Unclustered",
            "size": noise_count,
            "botScore": 15,
            "x": 50,
            "y": 88,
        })

    return nodes

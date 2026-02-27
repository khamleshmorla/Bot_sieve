"""
Copy-Paste Detector — uses TF-IDF + cosine similarity to find near-duplicate posts.
No ML training required. Uses scikit-learn.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
import numpy as np


def compute_copy_paste_score(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Returns copy-paste score (0-100) and list of duplicate clusters.
    """
    texts = [p["text"] for p in posts]

    if len(texts) < 2:
        return {"score": 0, "duplicate_count": 0}

    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = vectorizer.fit_transform(texts)
    except Exception:
        return {"score": 0, "duplicate_count": 0}

    # Compute pairwise cosine similarity
    THRESHOLD = 0.85
    sim_matrix = cosine_similarity(tfidf_matrix)

    # Count how many posts have at least one near-duplicate
    n = len(texts)
    duplicate_flags = np.zeros(n, dtype=bool)
    for i in range(n):
        for j in range(i + 1, n):
            if sim_matrix[i, j] >= THRESHOLD:
                duplicate_flags[i] = True
                duplicate_flags[j] = True

    duplicate_count = int(duplicate_flags.sum())
    score = round((duplicate_count / n) * 100) if n > 0 else 0

    return {
        "score": score,
        "duplicate_count": duplicate_count,
        "total_posts": n,
    }

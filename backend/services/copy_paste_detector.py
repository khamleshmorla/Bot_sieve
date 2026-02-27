"""
Copy-Paste Detector — uses scikit-learn TF-IDF + cosine similarity for fast spam detection.
"""
from typing import List, Dict, Any
import numpy as np


def compute_copy_paste_score(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Returns copy-paste score (0-100) and duplicate count.
    Uses fast TF-IDF + cosine similarity (no heavy ML models).
    """
    # Cap at 200 posts to keep the N x N cosine matrix from overflowing
    sample_posts = posts[:200] if len(posts) > 200 else posts
    texts = [p["text"] for p in sample_posts]

    if len(texts) < 2:
        return {"score": 0, "duplicate_count": 0, "total_posts": len(posts)}

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
        tfidf_matrix = vectorizer.fit_transform(texts)
        sim_matrix = cosine_similarity(tfidf_matrix)
        THRESHOLD = 0.80

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
            "total_posts": len(posts),
        }
    except Exception:
        return {"score": 0, "duplicate_count": 0, "total_posts": len(posts)}

"""
Copy-Paste Detector — uses Hugging Face Sentence Transformers for semantic similarity,
falling back to scikit-learn TF-IDF + cosine similarity.
"""
from typing import List, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Try importing Hugging Face sentence-transformers
_hf_encoder = None
try:
    from sentence_transformers import SentenceTransformer
    # 'all-MiniLM-L6-v2' is a tiny, fast HF pretrained model for text embeddings
    _hf_encoder = SentenceTransformer('all-MiniLM-L6-v2')
    print("[INFO] Successfully loaded Hugging Face sentence-transformers for text embeddings.")
except Exception as e:
    print(f"[WARN] Hugging Face sentence-transformers not loaded. Falling back to TF-IDF. Error: {e}")


def compute_copy_paste_score(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Returns copy-paste score (0-100) and list of duplicate clusters.
    Uses Hugging Face semantic embeddings if available, else TF-IDF.
    """
    global _hf_encoder
    texts = [p["text"] for p in posts]

    if len(texts) < 2:
        return {"score": 0, "duplicate_count": 0, "total_posts": len(texts)}

    # HF Path
    if _hf_encoder is not None:
        try:
            embeddings = _hf_encoder.encode(texts)
            sim_matrix = cosine_similarity(embeddings)
            THRESHOLD = 0.85
        except Exception:
            _hf_encoder = None  # Disable and let it fall through to TF-IDF
    
    # TF-IDF Fallback Path
    if _hf_encoder is None:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
            tfidf_matrix = vectorizer.fit_transform(texts)
            sim_matrix = cosine_similarity(tfidf_matrix)
            THRESHOLD = 0.85
        except Exception:
            return {"score": 0, "duplicate_count": 0, "total_posts": len(texts)}

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


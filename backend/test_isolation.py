import asyncio
from services.synthetic_generator import generate_accounts, generate_posts

# 1. Generate data
accounts = generate_accounts("#crypto", n_bots=300, n_real=80)
posts = generate_posts("#crypto", accounts)
print(f"Generated {len(accounts)} accounts and {len(posts)} posts. Testing detectors...")

# 2. Test Sentiment
try:
    from services.sentiment_analyzer import build_sentiment_timeline
    t = build_sentiment_timeline(posts)
    print("Sentiment: OK")
except Exception as e:
    print(f"Sentiment Failed: {e}")

# 3. Test Spike Detector
try:
    from services.spike_detector import detect_spikes
    s = detect_spikes(posts)
    print("Spikes: OK")
except Exception as e:
    print(f"Spikes Failed: {e}")

# 4. Test Clusters (heavy sklearn)
try:
    from services.cluster_detector import detect_clusters
    c = detect_clusters(accounts)
    print("Clusters: OK")
except Exception as e:
    print(f"Clusters Failed: {e}")

# 5. Test Copy Paste (heavy sklearn tf-idf + cosine sim)
try:
    from services.copy_paste_detector import compute_copy_paste_score
    cp = compute_copy_paste_score(posts)
    print(f"Copy-Paste: OK (Score: {cp.get('score')})")
except Exception as e:
    print(f"Copy-Paste Failed: {e}")

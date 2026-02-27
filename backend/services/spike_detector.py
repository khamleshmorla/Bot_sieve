"""
Spike Detector — Z-score based anomaly detection on post frequency.
No ML training required. Pure statistics (NumPy).
"""
from typing import List, Dict, Any
from collections import Counter
from datetime import datetime
import numpy as np


def detect_spikes(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Counts posts per hour and flags hours with abnormally high activity
    (Z-score > 2.5 = spike).
    """
    hour_counts: Counter = Counter()
    for post in posts:
        try:
            ts = datetime.fromisoformat(post["timestamp"])
            hour_counts[ts.hour] += 1
        except Exception:
            continue

    counts = np.array([hour_counts.get(h, 0) for h in range(24)], dtype=float)

    if counts.sum() == 0 or counts.std() == 0:
        return {
            "spike_detected": False,
            "spike_hours": [],
            "peak_hour": None,
            "peak_count": 0,
            "spike_magnitude": 0,
        }

    z_scores = (counts - counts.mean()) / counts.std()
    spike_hours = [int(h) for h in np.where(z_scores > 2.5)[0]]
    peak_hour = int(np.argmax(counts))
    peak_count = int(counts.max())
    baseline = float(counts.mean())
    spike_magnitude = round(peak_count / max(baseline, 1), 1)

    return {
        "spike_detected": len(spike_hours) > 0,
        "spike_hours": spike_hours,
        "peak_hour": peak_hour,
        "peak_count": peak_count,
        "spike_magnitude": spike_magnitude,
    }

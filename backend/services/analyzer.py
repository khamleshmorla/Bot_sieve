"""
Main Analyzer — orchestrates all services.
Tries real Twitter data first; falls back to synthetic on any error.
"""
from typing import List, Dict, Any
from datetime import datetime

from services.bot_detector import score_accounts
from services.sentiment_analyzer import build_sentiment_timeline
from services.copy_paste_detector import compute_copy_paste_score
from services.spike_detector import detect_spikes
from services.cluster_detector import detect_clusters


# ── Alert builder ──────────────────────────────────────────────────────────

def build_alerts(
    hashtag: str,
    accounts: List[Dict],
    posts: List[Dict],
    spike: Dict,
    copy_paste: Dict,
) -> List[Dict[str, Any]]:
    alerts = []
    now = datetime.utcnow().isoformat()

    bot_accounts = [a for a in accounts if a.get("bot_score", 0) > 55]
    if bot_accounts:
        confidence = min(99, round(len(bot_accounts) / max(len(accounts), 1) * 100 + 25))
        alerts.append({
            "id": "1", "timestamp": now, "hashtag": hashtag,
            "confidence": confidence, "type": "bot_cluster",
            "severity": "critical" if confidence > 85 else "high",
            "description": f"{len(bot_accounts)} bot-like accounts detected from {len(accounts)} total — recently created with minimal followers",
        })

    cp = copy_paste.get("score", 0)
    if cp > 25:
        alerts.append({
            "id": "2", "timestamp": now, "hashtag": hashtag,
            "confidence": cp, "type": "copy_paste",
            "severity": "high" if cp > 60 else "medium",
            "description": f"{copy_paste.get('duplicate_count', 0)} posts are near-identical — copy-paste campaign signal",
        })

    if spike.get("spike_detected"):
        mag = spike.get("spike_magnitude", 1)
        alerts.append({
            "id": "3", "timestamp": now, "hashtag": hashtag,
            "confidence": min(99, round(mag * 18)),
            "type": "spike", "severity": "high" if mag > 4 else "medium",
            "description": f"Posting rate surged {mag:.1f}× above baseline — abnormal volume spike",
        })

    bot_posts = [p for p in posts if p.get("is_bot")]
    if len(bot_posts) > 10:
        alerts.append({
            "id": "4", "timestamp": now, "hashtag": hashtag,
            "confidence": 65, "type": "coordinated", "severity": "medium",
            "description": f"{len(bot_posts)} posts concentrated in a narrow time window — coordinated behaviour",
        })

    return alerts


# ── Explainability builder ─────────────────────────────────────────────────

def build_explainability(
    accounts: List[Dict],
    copy_paste: Dict,
    spike: Dict,
    bot_accounts: List[Dict],
) -> List[Dict[str, Any]]:
    total = max(len(accounts), 1)
    new_acc = [a for a in accounts if a.get("account_age_days", 999) <= 7]
    low_followers = [a for a in accounts if a.get("followers", 0) < 10]

    return [
        {
            "label": "Accounts are brand-new (< 7 days old)",
            "value": round(len(new_acc) / total * 100),
            "color": "destructive" if len(new_acc) / total > 0.35 else "warning",
        },
        {
            "label": "Posts are near-identical duplicates",
            "value": copy_paste.get("score", 0),
            "color": "destructive" if copy_paste.get("score", 0) > 55 else "warning",
        },
        {
            "label": "Abnormal posting frequency (bot-level)",
            "value": min(100, round(len(bot_accounts) / total * 100 + 15)),
            "color": "warning",
        },
        {
            "label": "Accounts have very few followers",
            "value": round(len(low_followers) / total * 100),
            "color": "destructive" if len(low_followers) / total > 0.45 else "warning",
        },
        {
            "label": "Activity concentrated in a narrow window",
            "value": min(100, round(spike.get("spike_magnitude", 0) * 14)),
            "color": "warning",
        },
    ]


# ── Core analysis ──────────────────────────────────────────────────────────

def run_full_analysis(hashtag: str) -> Dict[str, Any]:
    data_source = "live"
    api_status = None
    api_provider = None

    accounts: List[Dict] = []
    posts: List[Dict] = []
    fetched = False

    # ── Priority 1: Official Twitter API v2 ────────────────────────────────
    if not fetched:
        try:
            from services.twitter_client import fetch_tweets, map_to_accounts_and_posts
            result = fetch_tweets(hashtag, max_results=15)
            if result["error"] is None and result["count"] >= 3:
                accounts, posts = map_to_accounts_and_posts(result, hashtag)
                api_provider = "twitter_official_v2"
                fetched = True
            else:
                api_status = result.get("error", "twitter_no_data")
        except Exception as e:
            api_status = f"twitter_exception: {e}"

    # ── Priority 2: RapidAPI (two providers) ───────────────────────────────
    if not fetched:
        try:
            from services.rapidapi_client import fetch_real_tweets
            rapid_result = fetch_real_tweets(hashtag)
            if rapid_result["ok"] and len(rapid_result.get("posts", [])) >= 3:
                accounts = rapid_result["accounts"]
                posts = rapid_result["posts"]
                api_provider = rapid_result.get("source", "rapidapi")
                fetched = True
            else:
                api_status = rapid_result.get("error", "rapidapi_no_data")
        except Exception as e:
            api_status = f"rapidapi_exception: {e}"

    # ── Priority 3: Synthetic fallback ─────────────────────────────────────
    if not fetched:
        data_source = "synthetic"
        from services.synthetic_generator import generate_accounts, generate_posts
        accounts = generate_accounts(hashtag, n_bots=300, n_real=80)
        posts = generate_posts(hashtag, accounts)

    # 2. Bot-score every account
    scored_accounts = score_accounts(accounts)

    # 3. For real Twitter data, label posts as bot/real based on bot score
    if data_source == "live":
        handle_to_bot = {
            a["handle"]: a.get("bot_score", 0) > 50
            for a in scored_accounts
        }
        for post in posts:
            post["is_bot"] = handle_to_bot.get(post["handle"], False)

    # 4. Run detectors
    sentiment_timeline = build_sentiment_timeline(posts)
    copy_paste = compute_copy_paste_score(posts)
    spike = detect_spikes(posts)
    clusters = detect_clusters(scored_accounts)

    # 5. Aggregate
    bot_accounts   = [a for a in scored_accounts if a.get("bot_score", 0) > 55]
    susp_accounts  = [a for a in scored_accounts if a.get("bot_score", 0) > 35]  # wider net
    total_posts    = len(posts)
    fake_posts     = len([p for p in posts if p.get("is_bot")])
    fake_percent   = round(fake_posts / max(total_posts, 1) * 100)
    total_acc      = max(len(scored_accounts), 1)

    # ── Dataset-level signals ─────────────────────────────────────────────
    # Signal A: What fraction of accounts are brand-new (< 90 days)?
    new_acc_ratio  = len([a for a in scored_accounts if a.get("account_age_days", 999) <= 90]) / total_acc

    # Signal B: What fraction have fewer than 50 followers?
    low_flw_ratio  = len([a for a in scored_accounts if a.get("followers", 0) < 50]) / total_acc

    # Signal C: Average bot score across ALL accounts (even individually-OK ones)
    avg_bot_score  = sum(a.get("bot_score", 0) for a in scored_accounts) / total_acc

    # Signal D: Suspicious account concentration (score > 35)
    susp_ratio     = len(susp_accounts) / total_acc

    # ── 6. Composite fakeness score ────────────────────────────────────────
    bot_ratio      = len(bot_accounts) / total_acc
    cp_score       = copy_paste.get("score", 0)
    spike_score    = min(100, spike.get("spike_magnitude", 0) * 10)

    fakeness_score = round(
        # Primary signals
        bot_ratio     * 30 +           # confirmed bots
        cp_score      * 0.25 +         # copy-paste
        spike_score   * 0.15 +         # abnormal spike
        fake_percent  * 0.10 +         # bot-labeled posts
        # Dataset-level signals
        new_acc_ratio * 20 +           # many brand-new accounts
        low_flw_ratio * 15 +           # many near-zero-follower accounts
        susp_ratio    * 10 +           # wide suspicious cohort
        avg_bot_score * 0.20           # average suspicion across all
    )
    fakeness_score = max(0, min(100, fakeness_score))
    bot_score_pct  = round(max(bot_ratio * 100, avg_bot_score * 0.8))

    # ── 7. Verdict ──────────────────────────────────────────────────────────
    verdict = "fake" if fakeness_score > 35 else "real"

    # 8. Alerts & explainability
    alerts = build_alerts(hashtag, scored_accounts, posts, spike, copy_paste)
    factors = build_explainability(scored_accounts, copy_paste, spike, bot_accounts)

    # 9. Top analyzed accounts (sorted by bot score descending)
    top_suspicious = [
        {
            "handle": a["handle"],
            "botScore": a["bot_score"],
            "accountAge": a.get("account_age_days", 0),
            "followers": a.get("followers", 0),
            "tweets": a.get("tweet_count", 0),
        }
        for a in sorted(scored_accounts, key=lambda x: x.get("bot_score", 0), reverse=True)
    ][:8]

    return {
        "hashtag": hashtag,
        "verdict": verdict,
        "fakeness_score": fakeness_score,
        "bot_score": bot_score_pct,
        "fake_percent": fake_percent,
        "total_posts": total_posts,
        "suspicious_posts": fake_posts,
        "total_accounts": len(scored_accounts),
        "fake_accounts": len(bot_accounts),
        "copy_paste_score": cp_score,
        "spike": spike,
        "sentiment_timeline": sentiment_timeline,
        "alerts": alerts,
        "suspicious_accounts": top_suspicious,
        "clusters": clusters,
        "explainability": factors,
        # Meta — tells frontend whether data is live or demo
        "data_source": data_source,
        "api_status": api_status,
        "api_provider": api_provider,
    }

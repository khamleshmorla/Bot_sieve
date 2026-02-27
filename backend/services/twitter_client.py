"""
Twitter API v2 Client — fetches real tweets and user data.
Falls back to None on rate limits / insufficient access.
"""
import os
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from urllib.parse import unquote
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

TWITTER_API_BASE = "https://api.twitter.com/2"


def _get_token() -> Optional[str]:
    """Load the bearer token from environment exactly as provided."""
    token = os.getenv("TWITTER_BEARER_TOKEN", "").strip()
    if not token:
        return None
    return token


def _parse_account_age(created_at: str) -> int:
    """Convert Twitter ISO timestamp to account age in days."""
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        return max(1, (datetime.now(timezone.utc) - dt).days)
    except Exception:
        return 365


def fetch_tweets(hashtag: str, max_results: int = 15) -> Dict[str, Any]:
    """
    Call Twitter API v2 recent search for a hashtag.
    Results are cached for 10 minutes to save credits.
    """
    from services.cache import analysis_cache
    cache_key = f"tw_official_{hashtag.lower()}"
    cached = analysis_cache.get(cache_key)
    if cached:
        return cached

    token = _get_token()
    if not token:
        return {"tweets": [], "users_map": {}, "error": "no_token", "count": 0}

    # Build query — exclude retweets, limit to recent original posts
    query_text = hashtag if hashtag.startswith("#") else f"#{hashtag}"
    full_query = f"{query_text} -is:retweet"

    # Optimization: requesting only 15 results to save credits
    results_to_fetch = min(max(10, max_results), 15)

    params = {
        "query": full_query,
        "max_results": results_to_fetch,
        "tweet.fields": "created_at,author_id,text,public_metrics",
        "user.fields": "created_at,public_metrics,description,profile_image_url,username,name",
        "expansions": "author_id",
    }
    headers = {"Authorization": f"Bearer {token}"}

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(
                f"{TWITTER_API_BASE}/tweets/search/recent",
                params=params,
                headers=headers,
            )
    except httpx.TimeoutException:
        return {"tweets": [], "users_map": {}, "error": "timeout", "count": 0}
    except Exception as e:
        return {"tweets": [], "users_map": {}, "error": str(e), "count": 0}

    if resp.status_code == 200:
        data = resp.json()
        tweets = data.get("data", [])
        users_list = data.get("includes", {}).get("users", [])
        users_map = {u["id"]: u for u in users_list}
        result = {
            "tweets": tweets,
            "users_map": users_map,
            "error": None,
            "count": len(tweets),
        }
        # Cache the successful result
        analysis_cache.set(cache_key, result)
        return result
    elif resp.status_code == 402:
        return {"tweets": [], "users_map": {}, "error": "credits_depleted", "count": 0}
    elif resp.status_code == 429:
        return {"tweets": [], "users_map": {}, "error": "rate_limited", "count": 0}
    elif resp.status_code == 403:
        return {"tweets": [], "users_map": {}, "error": "access_forbidden", "count": 0}
    elif resp.status_code == 401:
        return {"tweets": [], "users_map": {}, "error": "invalid_token", "count": 0}
    else:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        return {"tweets": [], "users_map": {}, "error": f"http_{resp.status_code}: {detail}", "count": 0}


def map_to_accounts_and_posts(
    twitter_result: Dict[str, Any],
    hashtag: str,
) -> tuple[List[Dict], List[Dict]]:
    """
    Convert raw Twitter API data to our internal account/post schema.
    """
    now = datetime.now(timezone.utc)
    tweets = twitter_result["tweets"]
    users_map = twitter_result["users_map"]

    accounts_seen: Dict[str, Dict] = {}
    posts: List[Dict] = []

    for tweet in tweets:
        uid = tweet.get("author_id")
        user = users_map.get(uid, {})
        username = user.get("username", uid or "unknown")
        handle = f"@{username}"

        # Build account (dedup by handle)
        if handle not in accounts_seen:
            profile_image = user.get("profile_image_url", "")
            has_pic = bool(profile_image) and "default_profile" not in profile_image
            has_bio = bool((user.get("description") or "").strip())
            metrics = user.get("public_metrics", {})
            created_at = user.get("created_at", "")

            accounts_seen[handle] = {
                "handle": handle,
                "name": user.get("name", username),
                "account_age_days": _parse_account_age(created_at) if created_at else 365,
                "followers": metrics.get("followers_count", 0),
                "following": metrics.get("following_count", 0),
                "tweet_count": metrics.get("tweet_count", 0),
                "has_profile_pic": has_pic,
                "has_bio": has_bio,
                "is_bot": False,  # scored later
            }

        # Build post
        posts.append({
            "id": tweet.get("id", ""),
            "handle": handle,
            "text": tweet.get("text", ""),
            "timestamp": tweet.get("created_at", now.isoformat()),
            "is_bot": False,  # updated after scoring
        })

    accounts = list(accounts_seen.values())
    return accounts, posts

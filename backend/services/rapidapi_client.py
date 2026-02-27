"""
RapidAPI Twitter Client — tries two providers in sequence.

Provider 1: twitter-api45.p.rapidapi.com  (RAPIDAPI_KEY)
Provider 2: twttrapi.p.rapidapi.com       (TWTTR_RAPIDAPI_KEY)

Both return real tweets. Falls back gracefully on any error.
"""
import os
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Twitter date formats ───────────────────────────────────────────────────

def _parse_twitter_date(date_str: str) -> int:
    """Parse Twitter v1-style date: 'Mon Jan 01 00:00:00 +0000 2024' → age days."""
    if not date_str:
        return 365
    for fmt in ("%a %b %d %H:%M:%S %z %Y", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            dt = datetime.strptime(date_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return max(1, (datetime.now(timezone.utc) - dt).days)
        except ValueError:
            continue
    return 365

# ── Internal schema helpers ────────────────────────────────────────────────

def _make_account(handle: str, name: str, age_days: int, followers: int,
                  following: int, tweets: int, has_pic: bool, has_bio: bool) -> Dict:
    return {
        "handle": handle,
        "name": name,
        "account_age_days": age_days,
        "followers": followers,
        "following": following,
        "tweet_count": tweets,
        "has_profile_pic": has_pic,
        "has_bio": has_bio,
        "is_bot": False,
    }

def _make_post(post_id: str, handle: str, text: str, timestamp: str) -> Dict:
    return {"id": post_id, "handle": handle, "text": text, "timestamp": timestamp, "is_bot": False}

# ── Provider 1: twitter-api45.p.rapidapi.com ──────────────────────────────

def _fetch_twitter_api45(hashtag: str, count: int = 50) -> Dict[str, Any]:
    key = os.getenv("RAPIDAPI_KEY", "").strip()
    if not key:
        return {"ok": False, "error": "no_key_api45"}

    query = hashtag  # Flexible search (company names, hashtags, phrases)
    headers = {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com",
    }
    params = {"query": query, "count": str(min(count, 50)), "result_type": "recent"}

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(
                "https://twitter-api45.p.rapidapi.com/search.php",
                headers=headers, params=params,
            )
    except Exception as e:
        return {"ok": False, "error": str(e)}

    if resp.status_code != 200:
        return {"ok": False, "error": f"api45_http_{resp.status_code}"}

    try:
        data = resp.json()
    except Exception:
        return {"ok": False, "error": "api45_json_parse"}

    # Response: { "timeline": [...tweets] }
    # Each tweet: { tweet_id, text, created_at, author: { user_name, name, followers,
    #               following, statuses_count, description, profile_image_url, created_at } }
    raw_tweets = data.get("timeline", [])
    if not raw_tweets:
        raw_tweets = data.get("data", [])
    if not isinstance(raw_tweets, list) or not raw_tweets:
        return {"ok": False, "error": "api45_no_data"}

    accounts: Dict[str, Dict] = {}
    posts: List[Dict] = []

    for tw in raw_tweets:
        # twitter-api45 uses 'user_info' (not 'author')
        user_info = tw.get("user_info", {}) or {}
        # screen_name is at tweet level AND inside user_info
        uname = (
            user_info.get("screen_name")
            or tw.get("screen_name")
            or "unknown"
        )
        handle = f"@{uname}"

        # Profile picture: uses 'avatar' field
        pic = user_info.get("avatar") or user_info.get("profile_image_url", "")
        has_pic = bool(pic) and "default_profile" not in pic

        if handle not in accounts:
            accounts[handle] = _make_account(
                handle=handle,
                name=user_info.get("name", uname),
                age_days=_parse_twitter_date(user_info.get("created_at", "")),
                followers=int(user_info.get("followers_count", 0) or 0),
                following=int(user_info.get("friends_count", 0) or 0),  # 'friends_count' = following
                tweets=int(user_info.get("statuses_count", user_info.get("listed_count", 0)) or 0),
                has_pic=has_pic,
                has_bio=bool((user_info.get("description") or "").strip()),
            )

        posts.append(_make_post(
            post_id=str(tw.get("tweet_id", tw.get("id", ""))),
            handle=handle,
            text=tw.get("text", tw.get("full_text", ""))[:280],
            timestamp=tw.get("created_at", datetime.utcnow().isoformat()),
        ))

    return {"ok": True, "accounts": list(accounts.values()), "posts": posts, "source": "twitter-api45"}

# ── Provider 2: twttrapi.p.rapidapi.com (GraphQL) ─────────────────────────

def _parse_twttrapi_entries(entries: list) -> Tuple[Dict[str, Dict], List[Dict]]:
    accounts: Dict[str, Dict] = {}
    posts: List[Dict] = []

    for entry in entries:
        try:
            content = entry.get("content", {})
            item = content.get("itemContent", {})
            tweet_result = item.get("tweet_results", {}).get("result", {})

            tweet_legacy = tweet_result.get("legacy", {})
            core = tweet_result.get("core", {})
            user_result = core.get("user_results", {}).get("result", {})
            user_legacy = user_result.get("legacy", {})

            if not tweet_legacy or not user_legacy:
                continue

            uname = user_legacy.get("screen_name", "unknown")
            handle = f"@{uname}"
            pic = user_legacy.get("profile_image_url_https", "")
            has_pic = bool(pic) and "default_profile" not in pic

            if handle not in accounts:
                accounts[handle] = _make_account(
                    handle=handle,
                    name=user_legacy.get("name", uname),
                    age_days=_parse_twitter_date(user_legacy.get("created_at", "")),
                    followers=int(user_legacy.get("followers_count", 0) or 0),
                    following=int(user_legacy.get("friends_count", 0) or 0),
                    tweets=int(user_legacy.get("statuses_count", 0) or 0),
                    has_pic=has_pic,
                    has_bio=bool((user_legacy.get("description") or "").strip()),
                )

            text = tweet_legacy.get("full_text") or tweet_legacy.get("text", "")
            posts.append(_make_post(
                post_id=tweet_legacy.get("id_str", ""),
                handle=handle,
                text=text[:280],
                timestamp=tweet_legacy.get("created_at", datetime.utcnow().isoformat()),
            ))
        except Exception:
            continue

    return accounts, posts

def _fetch_twttrapi(hashtag: str, count: int = 50) -> Dict[str, Any]:
    key = os.getenv("TWTTR_RAPIDAPI_KEY", "").strip()
    if not key:
        return {"ok": False, "error": "no_key_twttr"}

    query = hashtag  # Flexible search
    headers = {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "twttrapi.p.rapidapi.com",
    }
    params = {"q": query}

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(
                "https://twttrapi.p.rapidapi.com/search-tweets",
                headers=headers, params=params,
            )
    except Exception as e:
        return {"ok": False, "error": str(e)}

    if resp.status_code != 200:
        return {"ok": False, "error": f"twttr_http_{resp.status_code}"}

    try:
        data = resp.json()
    except Exception:
        return {"ok": False, "error": "twttr_json_parse"}

    # Navigate GraphQL structure
    try:
        instructions = (
            data["data"]["search_by_raw_query"]["search_timeline"]["timeline"]["instructions"]
        )
    except (KeyError, TypeError):
        return {"ok": False, "error": "twttr_structure"}

    entries = []
    for instr in instructions:
        if instr.get("type") == "TimelineAddEntries":
            entries.extend(instr.get("entries", []))

    accounts, posts = _parse_twttrapi_entries(entries)
    if not posts:
        return {"ok": False, "error": "twttr_no_data"}

    return {"ok": True, "accounts": list(accounts.values()), "posts": posts, "source": "twttrapi"}

# ── Public entry point ─────────────────────────────────────────────────────

def fetch_real_tweets(hashtag: str) -> Dict[str, Any]:
    """
    Try two RapidAPI providers in sequence.
    Returns { ok, accounts, posts, source, error }
    """
    # Provider 1
    r1 = _fetch_twitter_api45(hashtag, count=50)
    if r1.get("ok") and len(r1.get("posts", [])) >= 3:
        return r1

    # Provider 2
    r2 = _fetch_twttrapi(hashtag, count=50)
    if r2.get("ok") and len(r2.get("posts", [])) >= 3:
        return r2

    # Both failed — report the first meaningful error
    err = r1.get("error") or r2.get("error") or "all_providers_failed"
    return {"ok": False, "error": err, "accounts": [], "posts": [], "source": None}

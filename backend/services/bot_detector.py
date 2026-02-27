"""
Bot Detector — heuristic scoring calibrated for real Twitter data.
Scores each account 0–100. Higher = more bot-like.
"""
from typing import Dict, Any, List
import math


def score_account(account: Dict[str, Any]) -> float:
    """
    Multi-signal heuristic bot scorer, tuned for real-world Twitter accounts.
    Returns 0–100. > 55 = suspicious.
    """
    score = 0.0

    age  = account.get("account_age_days", 365)
    followers  = account.get("followers",  0)
    following  = account.get("following",  1)
    tweets     = account.get("tweet_count", 0)
    has_pic    = account.get("has_profile_pic", True)
    has_bio    = account.get("has_bio", True)

    # ── 1. Account age ──────────────────────────────────────────────────────
    # Very new = almost certainly a bot or throwaway account
    if age <= 1:
        score += 40
    elif age <= 7:
        score += 30
    elif age <= 30:
        score += 20
    elif age <= 90:
        score += 10
    elif age <= 180:
        score += 5
    # Note: old age is NOT a trust signal — many bots use aged accounts

    # ── 2. Follower / Following ratio ───────────────────────────────────────
    # Bots follow thousands but have almost no organic followers
    ratio = followers / max(following, 1)
    if ratio < 0.02:     # 1 follower per 50 following → extreme bot signal
        score += 35
    elif ratio < 0.05:   # 1 per 20
        score += 28
    elif ratio < 0.10:   # 1 per 10
        score += 20
    elif ratio < 0.20:   # 1 per 5
        score += 12
    elif ratio < 0.50:   # fewer followers than following
        score += 6

    # ── 3. Absolute follower count ──────────────────────────────────────────
    # Near-zero organic followers despite many following = classic bot
    if followers == 0 and following > 50:
        score += 25
    elif followers < 5 and following > 100:
        score += 20
    elif followers < 10 and following > 200:
        score += 15

    # ── 4. Tweet velocity (tweets per day of account life) ──────────────────
    # Humans average ~1–5 tweets/day. Bots can do 100s.
    days = max(age, 1)
    velocity = tweets / days
    if velocity > 100:
        score += 30
    elif velocity > 50:
        score += 22
    elif velocity > 20:
        score += 14
    elif velocity > 8:
        score += 6

    # ── 5. High tweet count on a fresh account ──────────────────────────────
    if age <= 30 and tweets > 500:
        score += 18
    elif age <= 90 and tweets > 5000:
        score += 14

    # ── 6. Profile completeness ─────────────────────────────────────────────
    if not has_pic:
        score += 15
    if not has_bio:
        score += 12

    # ── 7. Credible organic signal — pulls score down ───────────────────────
    if followers > 1000 and ratio > 2.0:
        score -= 15   # well-followed, more following than followers → journalist/influencer
    if followers > 5000:
        score -= 10
    if has_pic and has_bio and age > 365 and ratio > 0.5:
        score -= 8    # complete, old, balanced account

    return max(0.0, min(100.0, score))


def score_accounts(accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Score all accounts, return sorted by bot_score descending."""
    for acc in accounts:
        acc["bot_score"] = round(score_account(acc))
    return sorted(accounts, key=lambda x: x["bot_score"], reverse=True)

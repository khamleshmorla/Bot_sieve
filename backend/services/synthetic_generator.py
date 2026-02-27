"""
Synthetic data generator — creates realistic tweet-like data for a given hashtag.
No Twitter API required. Used for demo and development.
"""
import random
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any


BOT_NAMES = [
    "user_{n}x", "truth_{n}speak", "real_{n}voice", "citizen_{n}x",
    "voice_{n}ppl", "anon_{n}user", "news_{n}today", "info_{n}bot",
    "alert_{n}now", "daily_{n}post"
]

REAL_USER_NAMES = [
    "john_smith_{n}", "priya_{n}k", "michael_{n}j", "sara_{n}m",
    "alex_{n}r", "nina_{n}p", "david_{n}c", "amy_{n}t", "ravi_{n}g"
]

BOT_POSTS = [
    "This is an absolute disgrace! {hashtag} deserves attention!",
    "Can't believe what's happening with {hashtag}. Share this!",
    "Everyone must know about {hashtag}. RT this immediately!",
    "BREAKING: {hashtag} — the truth they don't want you to see!",
    "Stand up for what's right! {hashtag} is trending for a reason!",
    "Wake up people! {hashtag} is the real story!",
    "Don't let them silence us! {hashtag} must go viral!",
    "This is unacceptable. {hashtag} — spread the word!",
    "Outrageous! {hashtag} — join the fight today!",
    "They want to hide this from you. {hashtag} — share now!",
]

REAL_POSTS = [
    "Honestly not sure what to think about {hashtag}. Thoughts?",
    "Just heard about {hashtag}. Is this actually a thing?",
    "My uncle was talking about {hashtag} at dinner last night lol",
    "Can someone explain {hashtag} to me? I'm confused",
    "Saw {hashtag} trending, did some research, here's what I found...",
    "Not gonna lie, the whole {hashtag} situation is complicated",
    "People in my neighborhood are talking about {hashtag}",
    "I actually looked into {hashtag} and the reality is more nuanced",
    "Does anyone have sources on {hashtag}? Would love to read more",
    "Interesting perspective on {hashtag} in today's paper",
]


def _seed_from_hashtag(hashtag: str) -> int:
    return int(hashlib.md5(hashtag.encode()).hexdigest(), 16) % (2**31)


def generate_accounts(
    hashtag: str,
    n_bots: int = 300,
    n_real: int = 80,
) -> List[Dict[str, Any]]:
    seed = _seed_from_hashtag(hashtag)
    rng = random.Random(seed)

    accounts = []

    for i in range(n_bots):
        name_template = rng.choice(BOT_NAMES)
        n = rng.randint(1000, 99999)
        handle = "@" + name_template.replace("{n}", str(n))
        accounts.append({
            "handle": handle,
            "account_age_days": rng.randint(1, 7),
            "followers": rng.randint(0, 20),
            "following": rng.randint(800, 1800),
            "tweet_count": rng.randint(200, 1200),
            "has_profile_pic": rng.random() < 0.15,
            "has_bio": rng.random() < 0.1,
            "is_bot": True,
        })

    for i in range(n_real):
        name_template = rng.choice(REAL_USER_NAMES)
        n = rng.randint(10, 999)
        handle = "@" + name_template.replace("{n}", str(n))
        accounts.append({
            "handle": handle,
            "account_age_days": rng.randint(180, 2000),
            "followers": rng.randint(50, 5000),
            "following": rng.randint(40, 800),
            "tweet_count": rng.randint(20, 500),
            "has_profile_pic": rng.random() < 0.9,
            "has_bio": rng.random() < 0.8,
            "is_bot": False,
        })

    rng.shuffle(accounts)
    return accounts


def generate_posts(
    hashtag: str,
    accounts: List[Dict],
    hours: int = 24,
) -> List[Dict[str, Any]]:
    seed = _seed_from_hashtag(hashtag) + 1
    rng = random.Random(seed)

    posts = []
    now = datetime.utcnow()
    base_time = now - timedelta(hours=hours)

    for acc in accounts:
        n_posts = (
            rng.randint(5, 30) if acc["is_bot"] else rng.randint(1, 5)
        )

        if acc["is_bot"]:
            template = rng.choice(BOT_POSTS)
            # Bots often reuse the same template
            texts = [template.format(hashtag=hashtag)] * max(1, n_posts // 2)
            texts += [
                rng.choice(BOT_POSTS).format(hashtag=hashtag)
                for _ in range(n_posts - len(texts))
            ]
        else:
            texts = [
                rng.choice(REAL_POSTS).format(hashtag=hashtag)
                for _ in range(n_posts)
            ]

        # Bots post in coordinated bursts (14-18h window)
        for i, text in enumerate(texts):
            if acc["is_bot"]:
                hour_offset = rng.uniform(14, 18)
            else:
                hour_offset = rng.uniform(0, 24)

            ts = base_time + timedelta(hours=hour_offset, minutes=rng.randint(0, 59))
            posts.append({
                "id": f"{acc['handle']}_{i}",
                "handle": acc["handle"],
                "text": text,
                "timestamp": ts.isoformat(),
                "is_bot": acc["is_bot"],
            })

    return posts

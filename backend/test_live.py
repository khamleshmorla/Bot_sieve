import json
from services.analyzer import run_full_analysis

def test_live():
    res = run_full_analysis("crypto")
    print("\n" + "="*50)
    print("Verdict:", res.get("verdict"))
    print("Fakeness Score:", res.get("fakeness_score"))
    print("Aggregate Bot Score:", res.get("bot_score"))
    print("Copy-Paste Score:", res.get("copy_paste_score"))
    
    print("\nTop 3 Suspicious Accounts:")
    for a in res.get("suspicious_accounts", [])[:3]:
        print(f"  - @{a['handle']} -> Bot Score: {a['botScore']}")
    print("="*50 + "\n")

if __name__ == "__main__":
    test_live()

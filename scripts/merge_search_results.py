"""Merge search_results.json ASINs into seed_books.json"""
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
SEARCH_FILE = ROOT_DIR / "data" / "search_results.json"
SEED_FILE = ROOT_DIR / "data" / "seed_books.json"

with open(SEARCH_FILE, "r", encoding="utf-8") as f:
    search_data = json.load(f)

new_entries = []
for asin, info in search_data.items():
    new_entries.append({
        "asin": info.get("asin", asin),
        "title": info.get("title", ""),
        "author": info.get("author", ""),
        "narrator": "",
        "price": 0.0,
        "rating": 0.0,
        "review_count": 0,
        "runtime_minutes": 0,
        "categories": [info.get("cat", "Science Fiction")],
        "cover_url": "",
        "binding": "Audible Audiobook",
        "is_audible": True,
        "affiliate_url": f"https://www.amazon.com/dp/{asin}?tag=yuanyuan07-20"
    })

with open(SEED_FILE, "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_asins = set(s["asin"] for s in existing)
merged = existing[:]
for ne in new_entries:
    if ne["asin"] not in existing_asins:
        merged.append(ne)
        existing_asins.add(ne["asin"])

print(f"Existing: {len(existing)}, New from search: {len(new_entries)}, Merged: {len(merged)}")

with open(SEED_FILE, "w", encoding="utf-8") as f:
    json.dump(merged, f, indent=2, ensure_ascii=False)

print(f"Saved to {SEED_FILE}")

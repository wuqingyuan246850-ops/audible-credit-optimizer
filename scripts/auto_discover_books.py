"""Auto-discover Audible audiobooks via Amazon Creators API SearchItems."""
import json
import logging
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
load_dotenv()

CREDENTIAL_ID = os.getenv("AMAZON_ACCESS_KEY", "")
CREDENTIAL_SECRET = os.getenv("AMAZON_SECRET_KEY", "")
ASSOCIATE_TAG = os.getenv("AMAZON_ASSOCIATE_TAG", "")
PARTNER_TAG = os.getenv("AMAZON_PARTNER_TAG") or ASSOCIATE_TAG or ""
MARKETPLACE = os.getenv("AMAZON_MARKETPLACE", "www.amazon.com")
TOKEN_ENDPOINT = os.getenv("AMAZON_TOKEN_ENDPOINT", "https://api.amazon.com/auth/o2/token")

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
SEED_FILE = ROOT_DIR / "data" / "seed_books.json"
API_BASE = "https://creatorsapi.amazon/catalog/v1"
_token_cache = {"token": None, "expires_at": 0}


def get_bearer_token():
    global _token_cache
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 300:
        return _token_cache["token"]
    if not CREDENTIAL_ID or not CREDENTIAL_SECRET:
        logger.error("Missing AMAZON_ACCESS_KEY or AMAZON_SECRET_KEY in .env")
        return None
    try:
        body = {
            "grant_type": "client_credentials",
            "client_id": CREDENTIAL_ID,
            "client_secret": CREDENTIAL_SECRET,
            "scope": "creatorsapi::default",
        }
        resp = requests.post(TOKEN_ENDPOINT, json=body, headers={"Content-Type": "application/json"}, timeout=30)
        resp.raise_for_status()
        td = resp.json()
        _token_cache["token"] = td["access_token"]
        _token_cache["expires_at"] = time.time() + td.get("expires_in", 3600)
        logger.info("Obtained new Bearer token")
        return _token_cache["token"]
    except Exception as e:
        logger.error(f"Token failed: {e}")
        return None


def search_items(keywords, max_results=10):
    token = get_bearer_token()
    if not token:
        return []
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=UTF-8",
            "x-marketplace": MARKETPLACE,
        }
        payload = {
            "keywords": keywords,
            "partnerTag": PARTNER_TAG,
            "marketplace": MARKETPLACE,
            "resources": [
                "itemInfo.title",
                "itemInfo.byLineInfo",
                "itemInfo.classifications",
                "images.primary.large",
            ],
        }
        resp = requests.post(f"{API_BASE}/searchItems", json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("searchResult", {}).get("items", [])
        logger.info(f"Search '{keywords}': {len(items)} items")
        return items[:max_results]
    except Exception as e:
        logger.error(f"Search failed for '{keywords}': {e}")
        if hasattr(e, "response") and e.response:
            logger.error(f"Response: {e.response.text[:500]}")
        return []


def _get_nested(d, *keys, default=None):
    c = d
    for k in keys:
        if isinstance(c, dict):
            c = c.get(k, default)
        else:
            return default
    return c


def is_audiobook(item):
    binding = _get_nested(item.get("itemInfo", {}), "classifications", "binding", "displayValue") or ""
    return "audible" in binding.lower()


def guess_category(keywords):
    k = keywords.lower()
    if any(w in k for w in ["sci fi", "science fiction", "sci-fi", "space opera"]):
        return "Science Fiction"
    if any(w in k for w in ["fantasy", "magic", "dragon", "fae", "romantasy", "mage"]):
        return "Fantasy"
    if any(w in k for w in ["thriller", "mystery", "suspense", "crime", "murder", "detective"]):
        return "Thriller"
    if any(w in k for w in ["business", "entrepreneur", "leadership", "marketing", "startup"]):
        return "Business"
    if any(w in k for w in ["self", "growth", "habit", "mindset", "motivation", "personal"]):
        return "Self Development"
    if any(w in k for w in ["history", "historical", "biography", "memoir"]):
        return "Non-Fiction"
    if any(w in k for w in ["romance", "romantic", "love", "rom-com"]):
        return "Romance"
    if any(w in k for w in ["horror", "supernatural", "ghost", "paranormal"]):
        return "Horror"
    return None


def parse_search_item(item, default_category="Uncategorized"):
    info = item.get("itemInfo", {})
    asin = item.get("asin") or item.get("ASIN") or ""
    if not asin:
        return None
    title = _get_nested(info, "title", "displayValue") or ""
    byline = _get_nested(info, "byLineInfo", default={})
    contribs = byline.get("contributors", []) if isinstance(byline, dict) else []
    author = ", ".join(c.get("name", "") for c in contribs if c.get("role") == "Author")
    narrator = ", ".join(c.get("name", "") for c in contribs if c.get("role") == "Narrator")
    detail_url = item.get("detailPageURL", "") or f"https://www.amazon.com/dp/{asin}?tag={ASSOCIATE_TAG}"
    return {
        "asin": asin,
        "title": title,
        "author": author,
        "narrator": narrator,
        "price": 0.0,
        "rating": 0.0,
        "review_count": 0,
        "runtime_minutes": 0,
        "categories": [default_category],
        "cover_url": _get_nested(item.get("images", {}), "primary", "large", "url") or "",
        "binding": "Audible Audiobook",
        "is_audible": True,
        "affiliate_url": detail_url,
    }


def add_to_seed(new_entries):
    existing = []
    if SEED_FILE.exists():
        with open(SEED_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
    existing_asins = {s["asin"] for s in existing}
    added, skipped = [], []
    for ne in new_entries:
        if ne["asin"] in existing_asins:
            skipped.append(ne["asin"])
        else:
            existing.append(ne)
            existing_asins.add(ne["asin"])
            added.append(ne["asin"])
    with open(SEED_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    logger.info(f"Added {len(added)} new, skipped {len(skipped)} duplicates")
    return added


def discover(keywords, category=None, max_results=10, quiet=False):
    if "audible" not in keywords.lower():
        keywords = f"audible {keywords}"
    cat = category or guess_category(keywords) or "Uncategorized"
    items = search_items(keywords, max_results=max_results)
    audiobooks = [i for i in items if is_audiobook(i)]
    if not quiet:
        logger.info(f"  Audible items: {len(audiobooks)}/{len(items)}")
    seeds = []
    for item in audiobooks:
        s = parse_search_item(item, cat)
        if s:
            seeds.append(s)
    if not seeds:
        if not quiet:
            logger.warning("  No new Audible books found")
        return []
    added = add_to_seed(seeds)
    if not quiet and added:
        for a in added[:5]:
            s = next((s for s in seeds if s["asin"] == a), None)
            if s:
                logger.info(f"    + {s['title']} ({a}) [{cat}]")
        if len(added) > 5:
            logger.info(f"    ... and {len(added)-5} more")
    return added


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Auto-discover Audible audiobooks via Amazon Creators API")
    parser.add_argument("keywords", nargs="*", help="Search keywords (space-separated)")
    parser.add_argument("--category", "-c", help="Manually set category")
    parser.add_argument("--max", "-m", type=int, default=10, help="Max results per query (default: 10)")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive mode")
    args = parser.parse_args()

    if args.interactive or not args.keywords:
        print("=" * 60)
        print("Amazon Creators API - Auto Book Discovery")
        print("=" * 60)
        print("Enter search queries (one per line, empty line to finish)")
        print("  Examples:")
        print("    science fiction bestseller")
        print("    fantasy top rated")
        print("    thriller suspense")
        print()
        queries = []
        while True:
            try:
                q = input("Search: ").strip()
                if not q:
                    break
                queries.append(q)
            except (EOFError, KeyboardInterrupt):
                break
    else:
        if args.keywords:
            queries = [" ".join(args.keywords)]
        else:
            queries = []

    if not queries:
        print("No queries. Exiting.")
        return

    total = 0
    for q in queries:
        print(f"\n--- {q} ---")
        added = discover(q, category=args.category, max_results=args.max)
        total += len(added)
        time.sleep(1.5)

    print(f"\n{'=' * 60}")
    print(f"Done. Added {total} new audiobooks to seed_books.json")
    if total > 0:
        print("Next: run fetch_books.py >> generate_site.py >> commit & push")
    print("=" * 60)


if __name__ == "__main__":
    main()

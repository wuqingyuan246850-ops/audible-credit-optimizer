"""Audible Credit Optimizer - Amazon Creators API Data Fetcher v3.x"""

import json, os, sys, time, logging
from datetime import datetime
from pathlib import Path
import requests
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
load_dotenv()

CREDENTIAL_ID = os.getenv("AMAZON_ACCESS_KEY", "")
CREDENTIAL_SECRET = os.getenv("AMAZON_SECRET_KEY", "")
ASSOCIATE_TAG = os.getenv("AMAZON_ASSOCIATE_TAG", "")
PARTNER_TAG = os.getenv("AMAZON_PARTNER_TAG") or ASSOCIATE_TAG or os.getenv("AMAZON_ASSOCIATE_TAG", "")
MARKETPLACE = os.getenv("AMAZON_MARKETPLACE", "www.amazon.com")
TOKEN_ENDPOINT = os.getenv("AMAZON_TOKEN_ENDPOINT", "https://api.amazon.com/auth/o2/token")
AKID = os.getenv("AWS_ACCESS_KEY_ID", "")  # PAAPI 5.0 fallback
SAK = os.getenv("AWS_SECRET_ACCESS_KEY", "")  # PAAPI 5.0 fallback

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
SEED_FILE = ROOT_DIR / "data" / "seed_books.json"
OUTPUT_FILE = ROOT_DIR / "data" / "books.json"

API_BASE = "https://creatorsapi.amazon/catalog/v1"

_token_cache = {"token": None, "expires_at": 0}

def get_bearer_token():
    global _token_cache
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 300:
        return _token_cache["token"]
    if not CREDENTIAL_ID or not CREDENTIAL_SECRET:
        return None
    try:
        body = {"grant_type": "client_credentials", "client_id": CREDENTIAL_ID, "client_secret": CREDENTIAL_SECRET, "scope": "creatorsapi::default"}
        resp = requests.post(TOKEN_ENDPOINT, json=body, headers={"Content-Type": "application/json"}, timeout=30)
        resp.raise_for_status()
        td = resp.json()
        _token_cache["token"] = td["access_token"]
        _token_cache["expires_at"] = time.time() + td.get("expires_in", 3600)
        logger.info("Obtained new Bearer token")
        return _token_cache["token"]
    except Exception as e:
        logger.error(f"Token failed: {e}")
        if hasattr(e, "response") and e.response:
            logger.error(f"Response: {e.response.text}")
        return None

def creators_api_request(endpoint, payload):
    token = get_bearer_token()
    if not token:
        return None
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8", "x-marketplace": MARKETPLACE}
        resp = requests.post(f"{API_BASE}/{endpoint}", json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        err_text = ""
        if hasattr(e, "response") and e.response:
            err_text = e.response.text
            print("RESPONSE_BODY_START", err_text[:500], "RESPONSE_BODY_END", flush=True)
            logger.error(f"Body: {err_text}")
        logger.error(f"API failed: {e}")
        return None

RESOURCES = [
    "itemInfo.title", "itemInfo.byLineInfo", "itemInfo.features", "itemInfo.productInfo",
    "itemInfo.externalIds", "itemInfo.classifications",
    "offersV2.listings.price",
    "customerReviews.count", "customerReviews.starRating",
    "images.primary.large", "images.variants.large",
]

def fetch_items_by_asin(asins):
    if not asins: return []
    all_items = []
    for i in range(0, len(asins), 10):
        batch = asins[i:i+10]
        data = creators_api_request("getItems", {"itemIds": batch, "partnerTag": PARTNER_TAG, "marketplace": MARKETPLACE, "resources": RESOURCES})
        if data and "itemsResult" in data:
            items = data["itemsResult"].get("items", [])
            all_items.extend(items)
            logger.info(f"  Batch {i//10+1}: got {len(items)} items")
        else:
            logger.warning(f"  Batch {i//10+1}: no results")
    return all_items

def _get_nested(d, *keys, default=None):
    c = d
    for k in keys:
        if isinstance(c, dict):
            c = c.get(k, default)
        else:
            return default
    return c

def parse_item(item):
    try:
        asin = item.get("ASIN", item.get("asin", ""))
        if not asin: return None
        info = item.get("itemInfo", {})
        title = _get_nested(info, "title", "displayValue") or ""
        byline = _get_nested(info, "byLineInfo", default={})
        contribs = byline.get("contributors", []) if isinstance(byline, dict) else []
        author = ", ".join([c.get("name","") for c in contribs if c.get("role")=="Author"])
        narrator = ", ".join([c.get("name","") for c in contribs if c.get("role")=="Narrator"])
        prices = []
        list_price = 0.0
        listings = _get_nested(item.get("offersV2",{}), "listings", default=[])
        for lst in (listings or []):
            if not isinstance(lst, dict): continue
            pd = lst.get("price", {})
            if not isinstance(pd, dict): continue
            money = pd.get("money", {})
            if isinstance(money, dict):
                amt = money.get("amount", 0) or 0
                if amt > 0:
                    prices.append(amt)
            sb = pd.get("savingBasis", {})
            if isinstance(sb, dict):
                sb_money = sb.get("money", {})
                if isinstance(sb_money, dict):
                    sb_amt = sb_money.get("amount", 0) or 0
                    if sb_amt > list_price:
                        list_price = sb_amt
        price = prices[0] if prices else list_price
        # Parse customerReviews from API response
        customer_reviews = item.get("customerReviews", {}) or {}
        rating = float(_get_nested(customer_reviews, "starRating", default=0) or 0)
        review_count = int(_get_nested(customer_reviews, "count", default=0) or 0)
        product_info = _get_nested(info, "productInfo", default={})
        runtime = _get_nested(product_info, "runtime", "value", default=0) or 0
        binding = _get_nested(info, "classifications", "binding", "displayValue") or ""
        cover_url = _get_nested(item.get("images",{}), "primary", "large", "url") or ""
        detail_url = item.get("detailPageURL", "")
        # Only append tag if NOT already present (API already includes it)
        if detail_url and ASSOCIATE_TAG and "tag=" not in detail_url:
            sep = "&" if "?" in detail_url else "?"
            detail_url = f"{detail_url}{sep}tag={ASSOCIATE_TAG}"
        return {"asin":asin,"title":title,"author":author,"narrator":narrator,"price":float(price),"rating":float(rating),"review_count":int(review_count),"runtime_minutes":runtime,"binding":binding,"categories":[],"cover_url":cover_url,"affiliate_url":detail_url,"is_audible":"audible" in binding.lower(),"last_updated":datetime.now().isoformat()}
    except Exception as e:
        logger.warning(f"Parse failed: {e}")
        return None

def main():
    if not SEED_FILE.exists():
        logger.warning("No seed file found")
        return
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        seeds = json.load(f)
    # Build ASIN -> categories mapping from seed data
    seed_categories = {}
    for s in seeds:
        if isinstance(s, dict):
            asin = s.get("asin", "")
            if asin:
                seed_categories[asin] = s.get("categories", [])
    asins = list(seed_categories.keys())
    logger.info(f"Loaded {len(asins)} ASINs")
    if not asins:
        return
    api_items = fetch_items_by_asin(asins)
    books = []
    for item in api_items:
        p = parse_item(item)
        if p:
            # Preserve categories from seed data
            asin = p.get("asin", "")
            if asin and asin in seed_categories:
                p["categories"] = seed_categories[asin]
            books.append(p)
    if not books:
        logger.info("Fallback to seed data")
        books = seeds
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(books)} books")

if __name__ == "__main__":
    main()


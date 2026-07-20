# -*- coding: utf-8 -*-
"""
Audible Credit Optimizer -- Static Site Generator

Reads books.json -> applies Jinja2 templates -> outputs static HTML/CSS/JS
"""

import json
import os
import logging
import re
import shutil
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
DATA_FILE = ROOT_DIR / "data" / "books.json"
TEMPLATE_DIR = ROOT_DIR / "templates"
STATIC_DIR = ROOT_DIR / "static"
OUTPUT_DIR = ROOT_DIR / "output"


def load_books():
    if not DATA_FILE.exists():
        logger.error(f"Data file not found: {DATA_FILE}")
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def categorize_books(books):
    categories = {}
    category_slugs = {}
    for book in books:
        cats = book.get("categories", [])
        if not cats:
            cats = ["Uncategorized"]
        for cat in cats:
            slug = cat.lower().replace(" ", "-").replace("/", "-")
            if cat not in categories:
                categories[cat] = []
                category_slugs[cat] = slug
            categories[cat].append(book)
    sorted_cats = sorted(categories.items(), key=lambda x: len(x[1]), reverse=True)
    return {cat: {"slug": category_slugs[cat], "books": books} for cat, books in sorted_cats}


def compute_value_score(book):
    price = book.get("price", 0) or 0
    rating = book.get("rating", 0) or 0
    runtime = book.get("runtime_minutes", 0) or 0
    price_score = min(price, 40)
    rating_score = (rating / 5) * 30 if rating > 0 else 15
    runtime_hours = runtime / 60
    runtime_score = min(runtime_hours * 1.5, 30) if runtime > 0 else 15
    total = price_score + rating_score + runtime_score
    return round(total, 1)


def compute_value_tier(score):
    if score >= 75:
        return "legendary"
    elif score >= 55:
        return "excellent"
    elif score >= 40:
        return "great"
    elif score >= 25:
        return "good"
    else:
        return "decent"


def enrich_books(books):
    for book in books:
        CREDIT_COST = 14.95
        if "credit_value" not in book or not book["credit_value"]:
            price = book.get("price", 0) or 0
            book["credit_value"] = round(price / CREDIT_COST, 1) if price > 0 else 0
        book["value_score"] = compute_value_score(book)
        book["value_tier"] = compute_value_tier(book["value_score"])
        p = book.get("price", 0) or 0
        book["price_formatted"] = f"${p:.2f}" if p > 0 else "Free"
        mins = book.get("runtime_minutes", 0) or 0
        if mins > 0:
            if mins >= 60:
                h = mins // 60
                m = mins % 60
                book["runtime_formatted"] = f"{h}h {m}m"
            else:
                book["runtime_formatted"] = f"{mins}m"
        else:
            book["runtime_formatted"] = "N/A"
        cats = book.get("categories", [])
        book["primary_category"] = cats[0] if cats else "Other"
        r = book.get("rating", 0) or 0
        if r > 0:
            stars_full = int(r)
            stars_half = 1 if r - stars_full >= 0.3 else 0
            stars_empty = 5 - stars_full - stars_half
            book["stars_display"] = "\u2605" * stars_full + "\u00bd" * stars_half + "\u2606" * stars_empty
        else:
            book["stars_display"] = ""
        book["slug"] = make_slug(book.get("title", ""))
    return books


def get_top_picks(books, count=5):
    sorted_books = sorted(books, key=lambda b: b["value_score"], reverse=True)
    return sorted_books[:count]




def make_slug(text):
    """Convert text to URL-friendly slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    slug = slug.strip('-')[:80]
    return slug or 'book'


def minify_css(text):
    """Simple CSS minifier - removes comments, whitespace."""
    text = re.sub(r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*/', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s*([{}:;,])\s*', r'\1', text)
    text = re.sub(r';}', '}', text)
    return text.strip()


def minify_js(text):
    """Simple JS minifier - removes comments, extra whitespace."""
    text = re.sub(r'//.*', '', text)
    text = re.sub(r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*/', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s*([{}():;=+\-*/%,!])\s*', r'\1', text)
    return text.strip()

def build_site():
    books = load_books()
    if not books:
        logger.error("No books to build site. Exiting.")
        return False

    books = enrich_books(books)
    categories = categorize_books(books)
    top_picks = get_top_picks(books)

    env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))

    if OUTPUT_DIR.exists():
        shutil.rmtree(str(OUTPUT_DIR))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    static_out = OUTPUT_DIR / "static"
    shutil.copytree(str(STATIC_DIR), str(static_out))

    # Minify CSS
    css_path = static_out / "css" / "style.css"
    if css_path.exists():
        with open(css_path, "r", encoding="utf-8") as f:
            css_text = f.read()
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(minify_css(css_text))
        logger.info(f"Minified CSS: {len(css_text)} -> {len(minify_css(css_text))} bytes")

    # Minify JS
    js_path = static_out / "js" / "app.js"
    if js_path.exists():
        # Detect encoding: try UTF-8, fall back to UTF-16 LE
        raw = open(js_path, "rb").read()
        try:
            js_text = raw.decode("utf-8")
        except UnicodeDecodeError:
            js_text = raw.decode("utf-16-le")
        minified = minify_js(js_text)
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(minified)
        logger.info(f"Minified JS: {len(js_text)} -> {len(minified)} bytes")
    # Remove old block

    template = env.get_template("index.html")
    html = template.render(
        books=books,
        categories=categories,
        top_picks=top_picks,
        total_books=len(books),
        build_date=datetime.now().strftime("%B %d, %Y"),
        static_prefix=".",
        canonical_path="",
    )
    with open(OUTPUT_DIR / "index.html", "w", encoding="utf-8") as f:
        f.write(html)
    logger.info("Generated index.html")

    template_cat = env.get_template("category.html")
    for cat_name, cat_data in categories.items():
        slug = cat_data["slug"]
        cat_books = sorted(cat_data["books"], key=lambda b: b["value_score"], reverse=True)
        html = template_cat.render(
            books=cat_books,
            categories=categories,
            category_name=cat_name,
            category_slug=slug,
            total_books=len(cat_books),
            build_date=datetime.now().strftime("%B %d, %Y"),
            static_prefix="..",
            canonical_path=f"category/{slug}.html",
        )
        cat_dir = OUTPUT_DIR / "category"
        cat_dir.mkdir(exist_ok=True)
        with open(cat_dir / f"{slug}.html", "w", encoding="utf-8") as f:
            f.write(html)
        logger.info(f"Generated category/{slug}.html ({len(cat_books)} books)")
    # --- Book Detail Pages (SEO) ---
    book_slugs = {}
    book_dir = OUTPUT_DIR / "book"
    book_dir.mkdir(exist_ok=True)
    template_book = env.get_template("book_detail.html")
    for book in books:
        slug = make_slug(book.get("title", ""))
        if not slug:
            continue
        book_slugs[book.get("asin", "")] = slug
        related = [b for b in books if b.get("primary_category") == book.get("primary_category") and b.get("asin") != book.get("asin")]
        related = sorted(related, key=lambda b: b.get("value_score", 0), reverse=True)[:6]
        for r in related:
            r["slug"] = book_slugs.get(r.get("asin", ""), make_slug(r.get("title", "")))
        html = template_book.render(
            book=book,
            related_books=related,
            categories=categories,
            total_books=len(books),
            build_date=datetime.now().strftime("%B %d, %Y"),
            static_prefix="..",
            canonical_path=f"book/{slug}.html",
        )
        with open(book_dir / f"{slug}.html", "w", encoding="utf-8") as f:
            f.write(html)
        logger.info(f"Generated book/{slug}.html")
    logger.info(f"Generated {len(books)} book detail pages")


    public_books = []
    for b in books:
        public_books.append({
            k: v for k, v in b.items()
            if k not in ("affiliate_url",)
        })
    with open(OUTPUT_DIR / "books.json", "w", encoding="utf-8") as f:
        json.dump(public_books, f, indent=2, ensure_ascii=False)

    headers = """# Cloudflare Pages _headers
/* 
  Content-Type: text/html; charset=utf-8
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: public, max-age=3600, s-maxage=3600

# SEO files - correct Content-Type
/robots.txt
  Content-Type: text/plain; charset=utf-8
/sitemap.xml
  Content-Type: application/xml; charset=utf-8

# Static assets with proper cache
/static/*
  Cache-Control: public, max-age=86400, immutable
"""
    with open(OUTPUT_DIR / "_headers", "w", encoding="utf-8") as f:
        f.write(headers)


    # --- Google Search Console verification ---
    google_verify = ROOT_DIR / "google0d3944acb60592a6.html"
    if google_verify.exists():
        shutil.copy2(str(google_verify), str(OUTPUT_DIR / "google0d3944acb60592a6.html"))
        logger.info("Copied Google Search Console verification file")

    # --- Sitemap (SEO) ---
    SITE_URL = os.environ.get("SITE_URL") or "https://audiobookvalue.com"
    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    today = datetime.now().strftime("%Y-%m-%d")
    def add_url(loc, priority="0.8", changefreq="daily"):
        u = SubElement(urlset, "url")
        SubElement(u, "loc").text = f"{SITE_URL}{loc}"
        SubElement(u, "lastmod").text = today
        SubElement(u, "changefreq").text = changefreq
        SubElement(u, "priority").text = priority
    add_url("/", "1.0", "daily")
    for cat_name, cat_data in categories.items():
        add_url(f"/category/{cat_data['slug']}.html", "0.9", "daily")
    for book in books:
        slug = book_slugs.get(book.get("asin", ""), make_slug(book.get("title", "")))
        if slug:
            add_url(f"/book/{slug}.html", "0.7", "weekly")
    xmlstr = minidom.parseString(tostring(urlset)).toprettyxml(indent="  ")
    with open(OUTPUT_DIR / "sitemap.xml", "w", encoding="utf-8") as f:
        f.write(xmlstr)
    logger.info("Generated sitemap.xml")

    # --- Robots.txt (SEO) ---
    robots = f"""Sitemap: {SITE_URL}/sitemap.xml

User-agent: *
Allow: /
"""
    with open(OUTPUT_DIR / "robots.txt", "w") as f:
        f.write(robots)
    logger.info("Generated robots.txt")

    logger.info(f"Site built successfully in {OUTPUT_DIR}")
    logger.info(f"  - {len(books)} books indexed")
    logger.info(f"  - {len(categories)} categories")
    logger.info(f"  - {len(top_picks)} top picks featured")
    return True


if __name__ == "__main__":
    build_site()


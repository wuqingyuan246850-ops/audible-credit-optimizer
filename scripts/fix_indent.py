import re
fp = r"C:\Users\My Windows\Documents\亚马逊有声书\scripts\fetch_books.py"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()
# Fix lines 164-173: fix indentation of seed_categories, seed_defaults, for loop, and if asin:
c = c.replace(
    " seed_categories = {}\n seed_defaults = {}\n for s in seeds:\n        if isinstance(s, dict):\n            asin = s.get(\"asin\", \"\")\n if asin:",
    "    seed_categories = {}\n    seed_defaults = {}\n    for s in seeds:\n        if isinstance(s, dict):\n            asin = s.get(\"asin\", \"\")\n            if asin:"
)
with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("Indentation fixed")

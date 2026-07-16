import json

with open("data/books.json", "r", encoding="utf-8") as f:
    b = json.load(f)

print(f"Books: {len(b)}")
print(f"With price > 0: {sum(1 for x in b if x.get('price',0) > 0)}")
print(f"With cover: {sum(1 for x in b if x.get('cover_url'))}")
print(f"With runtimes: {sum(1 for x in b if x.get('runtime_minutes',0) > 0)}")
categories = set()
for x in b:
    cats = x.get("categories", []) or []
    if cats:
        categories.add(cats[0])
    elif x.get("primary_category"):
        categories.add(x["primary_category"])
print(f"Categories: {sorted(categories)}")

# Show price distribution
prices = [x.get("price", 0) or 0 for x in b]
non_zero = [p for p in prices if p > 0]
print(f"Non-zero prices: {len(non_zero)}")
if non_zero:
    print(f"  Min: ${min(non_zero):.2f}, Max: ${max(non_zero):.2f}, Avg: ${sum(non_zero)/len(non_zero):.2f}")

# Show sample items
for x in b[:3]:
    print(f"  [{x.get('asin','?')}] {x.get('title','?')[:50]} - ${x.get('price',0):.2f} - runtime: {x.get('runtime_minutes',0)}min")

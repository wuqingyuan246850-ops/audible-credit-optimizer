fp = r"C:\Users\My Windows\Documents\亚马逊有声书\templates\index.html"
with open(fp, "r", encoding="utf-8") as f:
    c = f.read()
old = '<span class="stars">{{ book.stars_display }}</span>\n                         <span class="rating-num">{{ book.rating }}</span>'
new = '<span class="stars">{{ book.stars_display }}</span>\n                         {% if book.rating > 0 %}\n                         <span class="rating-num">{{ book.rating }}</span>\n                         {% else %}\n                         <span class="rating-num">N/A</span>\n                         {% endif %}'
c = c.replace(old, new)
with open(fp, "w", encoding="utf-8") as f:
    f.write(c)
print("Rating N/A fixed in index.html")

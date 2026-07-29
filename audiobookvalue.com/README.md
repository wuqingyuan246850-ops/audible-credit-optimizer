# AudibleCreditOptimizer — audiobookvalue.com

Best value Audible audiobooks recommendation site. Pure static HTML+CSS+JS.
Affiliate ID: `yuanyuan07-20`

## Structure

```
.
├── index.html              # Homepage with book grid + filter/sort
├── books.json              # All book data (source of truth)
├── robots.txt
├── sitemap.xml             # Auto-generated
├── stats.json              # Auto-generated site stats
├── css/style.css           # Responsive styles
├── js/app.js               # Homepage app (books.json loader + UI)
├── js/book-template.js     # Book detail page helper (dynamic loader)
├── audiobooks/             # Generated landing pages (1 per ASIN)
├── images/placeholder.svg  # Fallback cover image
└── scripts/generate.js     # Page generator (run after updating books.json)
```

## Daily Workflow

### 1. Add a new audiobook
Edit `books.json` and add a new entry to the `books` array.
Minimum fields: ASIN, title, author, slug, rating, durationMinutes, categories.

### 2. Regenerate pages
```bash
node scripts/generate.js
```
This creates/updates:
- /audiobooks/[slug].html (individual book landing page)
- sitemap.xml
- stats.json

### 3. Deploy
Push to GitHub. Cloudflare Pages auto-deploys.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub (or any Git provider)
2. Log in to Cloudflare Pages
3. Connect your Git repo
4. Build settings:
   - Build command: `node scripts/generate.js`
   - Build output: `/` (root directory)
5. Deploy! Your site will be live at https://audiobookvalue.com

## Adding 5-Question Content to Each Book Page

The landing pages currently use `description` as the main content.
To add the full 5-question format (what, who, when, difference, action):

1. Add a `questions` object to each book entry in `books.json`:
   ```json
   {
     "questions": {
       "q1": "What is this audiobook? ...",
       "q2": "Who is it for? ...",
       "q3": "Use scenario? ...",
       "q4": "What makes it different? ...",
       "q5": "Can users start immediately? ..."
     }
   }
   ```
2. Run `node scripts/generate.js` to regenerate all pages
3. The 5-answer content will automatically appear as question-answer sections

## SEO Checklist

- [x] robots.txt
- [x] sitemap.xml (auto-generated with all pages)
- [x] Unique title + meta description per page
- [x] Open Graph tags (og:title, og:description, og:image, og:type)
- [x] Schema.org structured data (Book + AggregateRating + Offer)
- [x] Canonical URLs
- [x] rel="nofollow sponsored" on affiliate links
- [ ] Submit sitemap to Google Search Console
- [ ] Register in Google Search Console + Bing Webmaster Tools
- [ ] Set up Cloudflare Pages custom domain

## Affiliate Links

All links format: `https://www.amazon.com/dp/{ASIN}?tag=yuanyuan07-20&ref_=as_li_ss_tl`

Commission: $20 per user who signs up for 30-day free Audible trial.

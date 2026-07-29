/**
 * audiobookvalue.com - Static Page Generator
 * 
 * Reads books.json and generates:
 * 1. Individual audiobook landing pages (/audiobooks/[slug].html)
 * 2. sitemap.xml
 * 
 * Usage: node scripts/generate.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TAG = "yuanyuan07-20";

// Load data
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "books.json"), "utf-8"));
const { books, categories, site } = data;

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function buildAffiliateLink(asin) {
  return "https://www.amazon.com/dp/" + asin + "?tag=" + TAG + "&ref_=as_li_ss_tl";
}

function formatNumber(num) {
  if (num >= 1000000) return (num/1000000).toFixed(1) + "M";
  if (num >= 1000) return (num/1000).toFixed(1) + "K";
  return num.toString();
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Replace placeholders in template
function renderTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), value);
  }
  return result;
}

// Generate book detail page
function generateBookPage(book) {
  const affiliateLink = buildAffiliateLink(book.asin);
  const durationHrs = (book.durationMinutes / 60).toFixed(1);
  const questions = book.questions || {};
  
  const qList = [
    { q: "What is this audiobook?", a: questions.q1 || book.description },
    { q: "Who is it for? What problem does it solve?", a: questions.q2 },
    { q: "What is the best use scenario?", a: questions.q3 },
    { q: "What makes it different?", a: questions.q4 },
    { q: "Can you start using it immediately?", a: questions.q5 }
  ].filter(item => item.a);

  const questionSections = qList.map((item, i) => {
    const num = i + 1;
    const qText = escapeHtml(item.q);
    const aText = escapeHtml(item.a).replace(/\n/g, "<br>");
    return `
      <div class="question-section">
        <div class="question-header">
          <span class="num">${num}</span>
          ${qText}
        </div>
        <div class="question-body">
          <p>${aText}</p>
        </div>
      </div>`;
  }).join("\n");

  const catNames = book.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ");
  const safeTitle = escapeHtml(book.title);
  const safeAuthor = escapeHtml(book.author);
  const safeNarrator = escapeHtml(book.narrator);
  const safeDesc = escapeHtml(book.description).substring(0, 160);
  const stars = renderStars(book.rating);
  const ratingFormatted = formatNumber(book.ratingCount);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle} by ${safeAuthor} Audiobook Review | AudibleCreditOptimizer</title>
<meta name="description" content="Read our review of ${safeTitle} by ${safeAuthor}. ${book.rating}/5 stars, ${durationHrs}h long. Is this audiobook worth your credit? Find out now.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://audiobookvalue.com/audiobooks/${book.slug}.html">
<meta property="og:title" content="${safeTitle} by ${safeAuthor} - Audiobook Review">
<meta property="og:description" content="${book.rating}/5 stars | ${durationHrs}h | Free with Audible trial. Read our full review.">
<meta property="og:type" content="book">
<meta property="og:url" content="https://audiobookvalue.com/audiobooks/${book.slug}.html">
<meta property="og:image" content="${book.coverUrl}">
<link rel="stylesheet" href="../css/style.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": ${JSON.stringify(book.title)},
  "author": ${JSON.stringify(book.author)},
  "datePublished": "${book.releaseDate}",
  "abridged": false,
  "audioFormat": "Audiobook",
  "duration": "PT${book.durationMinutes}M",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${book.rating}",
    "reviewCount": "${book.ratingCount}",
    "bestRating": "5"
  },
  "offers": {
    "@type": "Offer",
    "url": "${affiliateLink}",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "description": "Free with 30-day Audible trial"
  }
}
</script>
</head>
<body>

<header class="site-header">
  <div class="header-inner">
    <div>
      <div class="site-title"><a href="/">🎧 <span>Audible</span>CreditOptimizer</a></div>
      <div class="site-tagline">audiobookvalue.com</div>
    </div>
  </div>
</header>

<main class="book-detail">
  <div class="book-detail-header">
    <img class="book-detail-cover" src="${book.coverUrl}" alt="${safeTitle}" onerror="this.src="../images/placeholder.jpg"">
    <div class="book-detail-info">
      <h1>${safeTitle}</h1>
      <p class="author">by ${safeAuthor} · Narrated by ${safeNarrator}</p>
      <div class="detail-meta">
        <div class="detail-meta-item">
          <div class="value" style="color:#f5a623">${stars}</div>
          <div class="label">${book.rating}/5 (${ratingFormatted} ratings)</div>
        </div>
        <div class="detail-meta-item">
          <div class="value">${durationHrs}h</div>
          <div class="label">Duration (${book.duration})</div>
        </div>
        <div class="detail-meta-item">
          <div class="value" style="color:#10b981">FREE</div>
          <div class="label">With 30-Day Trial</div>
        </div>
        <div class="detail-meta-item">
          <div class="value">${catNames}</div>
          <div class="label">Categories</div>
        </div>
      </div>
      <a href="${affiliateLink}" class="detail-cta" target="_blank" rel="nofollow sponsored">🎧 Start Free Trial & Download Now</a>
      <p style="font-size:.8rem;color:#6b7280;margin-top:8px">Free 30-day Audible trial. Cancel anytime. Keep the book forever.</p>
    </div>
  </div>
  
  <div id="questions-container">
${questionSections}
  </div>
  
  <div style="text-align:center;margin-top:32px;padding:24px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px">
    <h3 style="margin-bottom:8px">Ready to start listening?</h3>
    <p style="color:#374151;margin-bottom:16px">Get "${safeTitle}" free with your 30-day Audible trial. No commitment, cancel anytime.</p>
    <a href="${affiliateLink}" class="detail-cta" target="_blank" rel="nofollow sponsored">🎧 Claim Your Free Trial & Download</a>
  </div>
  
  <div style="margin-top:32px">
    <p style="font-size:.8rem;color:#6b7280;text-align:center">
      As an Amazon Associate we earn from qualifying purchases. When you sign up for a free trial through our links, we may earn a commission. 
      Last updated: ${new Date().toLocaleDateString()}
    </p>
  </div>
</main>

<footer class="site-footer">
  <p>© 2026 <a href="https://audiobookvalue.com">AudibleCreditOptimizer</a> — audiobookvalue.com</p>
  <p>We participate in the Amazon Services LLC Associates Program. ${escapeHtml(site.affiliateDisclaimer)}</p>
  <p style="margin-top:8px"><a href="/">Home</a> | <a href="/sitemap.xml">Sitemap</a></p>
</footer>

</body>
</html>`;
}

// Generate sitemap
function generateSitemap() {
  const now = new Date().toISOString().split("T")[0];
  const urls = [
    "https://audiobookvalue.com/",
    ...books.map(b => "https://audiobookvalue.com/audiobooks/" + b.slug + ".html")
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) {
    const priority = url === "https://audiobookvalue.com/" ? "1.0" : "0.8";
    xml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${priority}</priority>\n  </url>\n`;
  }
  xml += '</urlset>';
  return xml;
}

// --- Main ---
const audiobooksDir = path.join(ROOT, "audiobooks");
if (!fs.existsSync(audiobooksDir)) {
  fs.mkdirSync(audiobooksDir, { recursive: true });
}

let generated = 0;
for (const book of books) {
  const html = generateBookPage(book);
  const filePath = path.join(audiobooksDir, book.slug + ".html");
  fs.writeFileSync(filePath, html, "utf-8");
  generated++;
  console.log("  OK " + book.slug + ".html");
}
console.log("\nGenerated " + generated + " audiobook pages");

// Sitemap
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), generateSitemap(), "utf-8");
console.log("  OK sitemap.xml");

// Stats
const stats = {
  totalBooks: books.length,
  totalCategories: categories.length,
  avgRating: (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1),
  generatedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(ROOT, "stats.json"), JSON.stringify(stats, null, 2), "utf-8");
console.log("  OK stats.json");

console.log("\n✅ All pages generated successfully!");

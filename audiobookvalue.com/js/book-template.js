// Book detail page rendering (used by generated pages)
// This script powers the /audiobooks/[slug].html pages

const TAG = "yuanyuan07-20";

function buildAffiliateLink(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}&ref_=as_li_ss_tl`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function formatNumber(num) {
  if (num >= 1000000) return (num/1000000).toFixed(1) + "M";
  if (num >= 1000) return (num/1000).toFixed(1) + "K";
  return num.toString();
}

// Load book data and render page
async function renderBookPage() {
  try {
    const resp = await fetch("../books.json");
    const data = await resp.json();
    const books = data.books;
    
    // Get current slug from URL
    const slug = window.location.pathname.split("/").pop().replace(".html", "");
    const book = books.find(b => b.slug === slug);
    
    if (!book) {
      document.body.innerHTML = `<div class="empty-state"><h3>Book not found</h3><p>This audiobook page could not be found. <a href="/">Browse all audiobooks</a></p></div>`;
      return;
    }
    
    const affiliateLink = buildAffiliateLink(book.asin);
    const durationHrs = (book.durationMinutes / 60).toFixed(1);
    
    // Set SEO meta
    document.title = `${book.title} by ${book.author} Audiobook Review | AudibleCreditOptimizer`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = `Read our review of ${book.title} by ${book.author}. ${book.rating}/5 stars, ${durationHrs}h long. Is this audiobook worth your credit? Find out now.`;
    
    // Render
    const container = document.getElementById("book-content");
    
    const questions = book.questions || {};
    const qList = [
      { q: "What is this audiobook?", a: questions.q1 || book.description },
      { q: "Who is it for? What problem does it solve?", a: questions.q2 },
      { q: "What is the best use scenario?", a: questions.q3 },
      { q: "What makes it different?", a: questions.q4 },
      { q: "Can you start using it immediately?", a: questions.q5 }
    ];
    
    container.innerHTML = `
      <div class="book-detail-header">
        <img class="book-detail-cover" src="${book.coverUrl}" alt="${book.title}" onerror="this.src='../images/placeholder.jpg'">
        <div class="book-detail-info">
          <h1>${book.title}</h1>
          <p class="author">by ${book.author} · Narrated by ${book.narrator}</p>
          <div class="detail-meta">
            <div class="detail-meta-item">
              <div class="value" style="color:#f5a623">${renderStars(book.rating)}</div>
              <div class="label">${book.rating}/5 (${formatNumber(book.ratingCount)} ratings)</div>
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
              <div class="value">${book.categories.map(c => c.charAt(0).toUpperCase()+c.slice(1)).join(", ")}</div>
              <div class="label">Categories</div>
            </div>
          </div>
          <a href="${affiliateLink}" class="detail-cta" target="_blank" rel="nofollow sponsored">🎧 Start Free Trial & Download Now</a>
          <p style="font-size:.8rem;color:#6b7280;margin-top:8px">Free 30-day Audible trial. Cancel anytime. Keep the book forever.</p>
        </div>
      </div>
      
      <div id="questions-container">
        ${qList.filter(item => item.a).map((item, i) => `
          <div class="question-section">
            <div class="question-header">
              <span class="num">${i + 1}</span>
              ${item.q}
            </div>
            <div class="question-body">
              <p>${item.a.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        `).join("")}
      </div>
      
      <div style="text-align:center;margin-top:32px;padding:24px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px">
        <h3 style="margin-bottom:8px">Ready to start listening?</h3>
        <p style="color:#374151;margin-bottom:16px">Get "${book.title}" free with your 30-day Audible trial. No commitment, cancel anytime.</p>
        <a href="${affiliateLink}" class="detail-cta" target="_blank" rel="nofollow sponsored">🎧 Claim Your Free Trial & Download</a>
      </div>
      
      <div style="margin-top:32px">
        <p style="font-size:.8rem;color:#6b7280;text-align:center">
          As an Amazon Associate we earn from qualifying purchases. When you sign up for a free trial through our links, we may earn a commission. 
          Last updated: ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;
    
  } catch (err) {
    console.error("Failed to render book page:", err);
  }
}

document.addEventListener("DOMContentLoaded", renderBookPage);

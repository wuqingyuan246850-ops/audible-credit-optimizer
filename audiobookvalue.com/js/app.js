// AudiobookValue.com - Main App
// Affiliate ID
const TAG = "yuanyuan07-20";

// State
let books = [];
let categories = [];
let activeCategory = "all";
let sortBy = "rating";
let searchQuery = "";

// Build Amazon affiliate link
function buildAffiliateLink(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}&ref_=as_li_ss_tl`;
}

// Build Audible affiliate link
function buildAudibleLink(asin) {
  return `https://www.audible.com/pd/${asin}?tag=${TAG}&ref_=as_li_ss_tl`;
}

// Render stars
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// Format price
function formatPrice(price) {
  return price === 0 ? "Free" : `$${price.toFixed(2)}`;
}

// Generate slug
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Get affiliate link for a book
function getAffiliateLink(book) {
  return buildAffiliateLink(book.asin);
}

// Render book card
function renderBookCard(book) {
  const affiliateLink = getAffiliateLink(book);
  const durationHrs = (book.durationMinutes / 60).toFixed(1);
  
  return `
    <div class="book-card" data-asin="${book.asin}" data-categories="${book.categories.join(",")}" data-rating="${book.rating}" data-duration="${book.durationMinutes}" data-title="${book.title.toLowerCase()}">
      <div class="book-card-inner">
        <img class="book-cover" src="${book.coverUrl}" alt="${book.title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
        <div class="book-info">
          <a href="audiobooks/${book.slug}.html" class="book-title">${book.title}</a>
          <div class="book-author">by ${book.author}</div>
          <div class="book-meta">
            <div class="book-rating">
              <span class="stars">${renderStars(book.rating)}</span>
              <span>${book.rating}</span>
            </div>
            <div class="book-duration">${durationHrs}h (${book.duration})</div>
          </div>
          <div class="book-price-info">
            ${book.audiblePrice === 0 ? '<span class="price-free">Free with Trial</span>' : ''}
            ${book.listPrice > 0 ? `<span class="price-list">$${book.listPrice.toFixed(2)}</span>` : ''}
            <span class="price-credit">1 Credit</span>
          </div>
          <div class="book-tags">
            ${book.tags.slice(0, 3).map(t => `<span class="book-tag">${t.replace(/-/g, ' ')}</span>`).join('')}
          </div>
        </div>
      </div>
      <a href="${affiliateLink}" class="book-cta" target="_blank" rel="nofollow sponsored">Start Free Trial & Get This Book</a>
    </div>
  `;
}

// Render book grid
function renderBookGrid() {
  const grid = document.getElementById("book-grid");
  const countEl = document.getElementById("results-count");
  
  let filtered = [...books];
  
  // Filter by category
  if (activeCategory !== "all") {
    filtered = filtered.filter(b => b.categories.includes(activeCategory));
  }
  
  // Filter by search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
    );
  }
  
  // Sort
  switch (sortBy) {
    case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
    case "duration": filtered.sort((a, b) => b.durationMinutes - a.durationMinutes); break;
    case "title": filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "rating-count": filtered.sort((a, b) => b.ratingCount - a.ratingCount); break;
  }
  
  countEl.textContent = `Showing ${filtered.length} of ${books.length} audiobooks`;
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><h3>No audiobooks found</h3><p>Try adjusting your filters or search query.</p></div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(renderBookCard).join("");
}

// Render filter tags
function renderFilters() {
  const container = document.getElementById("filter-tags");
  container.innerHTML = `
    <span class="filter-tag ${activeCategory === 'all' ? 'active' : ''}" data-category="all">All</span>
    ${categories.map(cat => `
      <span class="filter-tag ${activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">${cat.icon} ${cat.name}</span>
    `).join("")}
  `;
  
  container.querySelectorAll(".filter-tag").forEach(el => {
    el.addEventListener("click", () => {
      activeCategory = el.dataset.category;
      renderFilters();
      renderBookGrid();
    });
  });
}

// Render stats
function renderStats() {
  document.getElementById("stat-books").textContent = books.length;
  const avgRating = books.reduce((s, b) => s + b.rating, 0) / books.length;
  document.getElementById("stat-rating").textContent = avgRating.toFixed(1);
  const totalHours = books.reduce((s, b) => s + b.durationMinutes, 0) / 60;
  document.getElementById("stat-hours").textContent = totalHours > 1000 ? `${(totalHours/1000).toFixed(1)}K+` : `${Math.round(totalHours)}+`;
}

// Init
async function init() {
  try {
    const resp = await fetch("books.json");
    const data = await resp.json();
    books = data.books;
    categories = data.categories;
    
    // Set site info
    document.getElementById("affiliate-disclaimer").textContent = data.site.affiliateDisclaimer;
    
    // Render
    renderStats();
    renderFilters();
    renderBookGrid();
    
    // Search
    document.getElementById("search-box").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderBookGrid();
    });
    
    // Sort
    document.getElementById("sort-select").addEventListener("change", (e) => {
      sortBy = e.target.value;
      renderBookGrid();
    });
    
  } catch (err) {
    console.error("Failed to load books:", err);
    document.getElementById("book-grid").innerHTML = `<div class="empty-state"><h3>Failed to load books</h3><p>Please try refreshing the page.</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);

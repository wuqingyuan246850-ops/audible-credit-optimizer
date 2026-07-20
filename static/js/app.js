 /**
  * Audible Credit Optimizer - Frontend App
  * Handles table sorting, filtering, and search
  */
 (function() {
     'use strict';
 
     const tableBody = document.getElementById('table-body');
     const searchInput = document.getElementById('search-input');
     const categoryFilter = document.getElementById('category-filter');
     const tierFilter = document.getElementById('tier-filter');
     const sortSelect = document.getElementById('sort-select');
 
     if (!tableBody) return;
 
     // Get all rows
     const rows = Array.from(tableBody.querySelectorAll('.book-row'));

    // --- Load remaining books from embedded JSON (paginated) ---
    (function() {
        var dataScript = document.getElementById('books-json-data');
        if (!dataScript) return;
        var allBooks;
        try { allBooks = JSON.parse(dataScript.textContent); } catch(e) { return; }
        // First 40 are already in HTML
        var remaining = allBooks.slice(40);
        if (remaining.length === 0) return;
        
        function esc(t) { return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
        
        var rIdx = 0, BATCH = 40;
        var frag = document.createDocumentFragment();
        
        function insertBatch() {
            var end = Math.min(rIdx + BATCH, remaining.length);
            for (; rIdx < end; rIdx++) {
                var b = remaining[rIdx];
                var tr = document.createElement('tr');
                tr.className = 'book-row';
                tr.dataset.title = (b.title||'').toLowerCase();
                tr.dataset.author = (b.author||'').toLowerCase();
                tr.dataset.narrator = (b.narrator||'').toLowerCase();
                tr.dataset.category = b.primary_category||'';
                tr.dataset.valueTier = b.value_tier||'';
                tr.dataset.price = String(b.price||0);
                tr.dataset.rating = String(b.rating||0);
                tr.dataset.runtime = String(b.runtime_minutes||0);
                tr.dataset.valueScore = String(b.value_score||0);
                var h = '';
                h += '<td class="col-cover">';
                if (b.cover_url) { h += '<img src="'+esc(b.cover_thumb)+'" alt="" class="cover-thumb" loading="lazy" width="40" height="54">'; }
                else { h += '<div class="cover-thumb cover-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/></svg></div>'; }
                h += '</td>';
                h += '<td class="col-title"><a href="book/'+esc(b.slug)+'.html" class="book-title-link">'+esc(b.title)+'</a></td>';
                h += '<td class="col-author">'+esc(b.author)+'</td>';
                h += '<td class="col-category"><span class="category-tag">'+esc(b.primary_category)+'</span></td>';
                h += '<td class="col-rating"><span class="stars">'+(b.stars_display||'')+'</span>';
                if (b.rating > 0) { h += '<span class="rating-num">'+b.rating+'</span>'; }
                else { h += '<span class="rating-num">N/A</span>'; }
                h += '</td>';
                h += '<td class="col-runtime">'+(b.runtime_formatted||'N/A')+'</td>';
                h += '<td class="col-price">'+(b.price_formatted||'')+'</td>';
                h += '<td class="col-value"><span class="value-badge badge-'+esc(b.value_tier)+'" title="Value Score: '+b.value_score+'">'+b.value_score+'</span></td>';
                h += '<td class="col-action"><a href="'+esc(b.affiliate_url)+'" target="_blank" rel="noopener sponsored" class="btn btn-table">Get on Audible</a></td>';
                tr.innerHTML = h;
                frag.appendChild(tr);
                rows.push(tr);
            }
            if (frag.children.length > 0) { tableBody.appendChild(frag); frag = document.createDocumentFragment(); }
            if (rIdx < remaining.length) { requestAnimationFrame(insertBatch); }
        }
        
        // Start after paint
        var startLoad = function() { requestAnimationFrame(function() { requestAnimationFrame(insertBatch); }); };
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startLoad); }
        else { startLoad(); }
    })();

 
     // --- Search ---
     function filterRows() {
         const searchTerm = (searchInput ? searchInput.value.toLowerCase() : '');
         const category = (categoryFilter ? categoryFilter.value : 'all');
         const tier = (tierFilter ? tierFilter.value : 'all');
 
         rows.forEach(function(row) {
             const title = row.dataset.title || '';
             const author = row.dataset.author || '';
             const narrator = row.dataset.narrator || '';
             const rowCategory = row.dataset.category || '';
             const rowTier = row.dataset.valueTier || '';
 
             const matchesSearch = !searchTerm ||
                 title.includes(searchTerm) ||
                 author.includes(searchTerm) ||
                 narrator.includes(searchTerm);
 
             const matchesCategory = !category || category === 'all' || rowCategory === category;
             const matchesTier = !tier || tier === 'all' || rowTier === tier;
 
             row.classList.toggle('row-hidden', !(matchesSearch && matchesCategory && matchesTier));
         });
     }
 
     if (searchInput) searchInput.addEventListener('input', filterRows);
     if (categoryFilter) categoryFilter.addEventListener('change', filterRows);
     if (tierFilter) tierFilter.addEventListener('change', filterRows);
 
     // --- Sorting ---
     function sortRows(sortKey, direction) {
         const sorted = rows.sort(function(a, b) {
             let valA, valB;
 
             switch (sortKey) {
                 case 'title':
                     valA = (a.dataset.title || '').toLowerCase();
                     valB = (b.dataset.title || '').toLowerCase();
                     return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                 case 'author':
                     valA = (a.dataset.author || '').toLowerCase();
                     valB = (b.dataset.author || '').toLowerCase();
                     return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                 case 'category':
                     valA = (a.dataset.category || '').toLowerCase();
                     valB = (b.dataset.category || '').toLowerCase();
                     return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                 case 'price':
                     valA = parseFloat(a.dataset.price) || 0;
                     valB = parseFloat(b.dataset.price) || 0;
                     return direction === 'asc' ? valA - valB : valB - valA;
                 case 'rating':
                     valA = parseFloat(a.dataset.rating) || 0;
                     valB = parseFloat(b.dataset.rating) || 0;
                     return direction === 'asc' ? valA - valB : valB - valA;
                 case 'runtime':
                     valA = parseInt(a.dataset.runtime) || 0;
                     valB = parseInt(b.dataset.runtime) || 0;
                     return direction === 'asc' ? valA - valB : valB - valA;
                 case 'value_score':
                     valA = parseFloat(a.dataset.valueScore) || 0;
                     valB = parseFloat(b.dataset.valueScore) || 0;
                     return direction === 'asc' ? valA - valB : valB - valA;
                 default:
                     return 0;
             }
         });
 
         // Re-append rows in sorted order (batched to avoid forced reflow)
         var fragment = document.createDocumentFragment();
         sorted.forEach(function(row) {
             fragment.appendChild(row);
         });
         tableBody.appendChild(fragment);
 
        // Update sort indicators in header (cached reference)
        if (!sortHeaders) {
            var sortHeaders = document.querySelectorAll('.sortable');
        }
        sortHeaders.forEach(function(th) {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === sortKey) {
                th.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
     }
 
     // --- Sort select change ---
     if (sortSelect) {
         sortSelect.addEventListener('change', function() {
             const val = this.value;
             const match = val.match(/^(.+)_(asc|desc)$/);
             if (match) {
                 sortRows(match[1], match[2]);
             }
         });
     }
 
     // --- Click on table header to sort ---
     (typeof sortHeaders !== 'undefined' ? sortHeaders : document.querySelectorAll('.sortable')).forEach(function(th) {
         th.addEventListener('click', function() {
             const sortKey = this.dataset.sort;
             if (!sortKey) return;
 
             // Toggle direction
             const currentlyDesc = this.classList.contains('sort-desc');
             const direction = currentlyDesc ? 'asc' : 'desc';
 
             sortRows(sortKey, direction);
 
             // Update sort select if it exists
             if (sortSelect) {
                 sortSelect.value = sortKey + '_' + direction;
             }
         });
     });
 
     // --- Initial sort: deferred after paint to avoid forced reflow ---
     function runInitialSort() {
        // Books already sorted by Value Score in HTML.
        // Skipping DOM sort eliminates forced reflow.
    }
     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', function() {
             window.requestAnimationFrame(function() {
                 window.requestAnimationFrame(runInitialSort);
             });
         });
     } else {
         window.requestAnimationFrame(function() {
             window.requestAnimationFrame(runInitialSort);
         });
     }
 
     // --- Update count after filter ---
     function updateCount() {
         // Optional: show count of visible rows
         const visible = rows.filter(function(r) { return !r.classList.contains('row-hidden'); });
         // Could display count somewhere if needed
     }
 
 
    // Mobile: hamburger menu for nav
    (function() {
        var hamburger = document.getElementById('hamburger-btn');
        var mobileNav = document.getElementById('mobile-nav');
        if (!hamburger || !mobileNav) return;

        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('open');
            document.body.classList.toggle('mobile-nav-open');
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('open');
                document.body.classList.remove('mobile-nav-open');
            });
        });
    })();

    // --- Scroll-to-top button ---
    (function() {
        var scrollBtn = document.getElementById('scroll-top');
        if (!scrollBtn) return;

        var scrollTicking = false;
        window.addEventListener('scroll', function() {
            if (!scrollTicking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 400) {
                        scrollBtn.classList.add('visible');
                    } else {
                        scrollBtn.classList.remove('visible');
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    // --- Result count display ---
    (function() {
        var resultCount = document.getElementById('result-count');
        if (!resultCount || !rows) return;

        function updateResultCount() {
            var visible = rows.filter(function(r) { return !r.classList.contains('row-hidden'); });
            resultCount.innerHTML = 'Showing <strong>' + visible.length + '</strong> of <strong>' + rows.length + '</strong> audiobooks';
        }

        // Hook into existing filter
        if (searchInput) {
            searchInput.addEventListener('input', function() { window.requestAnimationFrame(updateResultCount); });
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() { window.requestAnimationFrame(updateResultCount); });
        }
        if (tierFilter) {
            tierFilter.addEventListener('change', function() { window.requestAnimationFrame(updateResultCount); });
        }

        updateResultCount();
    })();

})();




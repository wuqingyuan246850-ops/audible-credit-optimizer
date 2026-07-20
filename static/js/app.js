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
 
         // Update sort indicators in header
         document.querySelectorAll('.sortable').forEach(function(th) {
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
     document.querySelectorAll('.sortable').forEach(function(th) {
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
 
     // --- Initial sort: by value_score descending ---
     if (sortSelect && sortSelect.value) {
         const match = sortSelect.value.match(/^(.+)_(asc|desc)$/);
         if (match) {
             sortRows(match[1], match[2]);
         }
     } else {
         sortRows('value_score', 'desc');
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

        window.addEventListener('scroll', function() {
            if (window.scrollY > 400) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
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
            searchInput.addEventListener('input', function() { setTimeout(updateResultCount, 50); });
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() { setTimeout(updateResultCount, 50); });
        }
        if (tierFilter) {
            tierFilter.addEventListener('change', function() { setTimeout(updateResultCount, 50); });
        }

        updateResultCount();
    })();

})();



"""Append new CSS styles for mobile menu, scroll-top, result count."""
css_add = """

/* --- Result Count --- */
.result-count {
    color: var(--text-secondary);
    font-size: 0.82rem;
    white-space: nowrap;
    padding: 10px 0;
}
.result-count strong {
    color: var(--text-primary);
}

/* --- Hamburger Menu --- */
.hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-left: auto;
}
.hamburger-line {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 2px;
    transition: all 0.2s;
}
.hamburger.active .hamburger-line:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
}
.hamburger.active .hamburger-line:nth-child(2) {
    opacity: 0;
}
.hamburger.active .hamburger-line:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
}

.mobile-nav-open { overflow: hidden; }
.mobile-nav-overlay {
    display: none;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(23, 26, 33, 0.97);
    z-index: 99;
    flex-direction: column;
    padding: 20px;
    gap: 4px;
    overflow-y: auto;
}
.mobile-nav-overlay.open { display: flex; }
.mobile-nav-overlay .nav-link {
    font-size: 1rem;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
}
.mobile-nav-overlay .nav-link:hover {
    background: rgba(255,255,255,0.05);
    color: var(--text-primary);
}
.mobile-nav-overlay .nav-link.active {
    color: var(--text-heading);
    background: rgba(102, 192, 244, 0.1);
}
.mobile-nav-overlay .nav-cta {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(75, 107, 126, 0.3);
}
.mobile-nav-overlay .nav-cta .btn {
    width: 100%;
    justify-content: center;
    font-size: 0.95rem;
}

/* --- Scroll to Top --- */
.scroll-top {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
    width: 44px;
    height: 44px;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 50%;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.scroll-top.visible {
    opacity: 1;
    visibility: visible;
}
.scroll-top:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
}
.scroll-top svg {
    width: 20px;
    height: 20px;
}

@media (max-width: 900px) {
    .hamburger { display: flex; }
}
@media (max-width: 600px) {
    .scroll-top {
        bottom: 16px;
        right: 16px;
        width: 38px;
        height: 38px;
    }
}
"""

with open("static/css/style.css", "a", encoding="utf-8") as f:
    f.write(css_add)
print("CSS styles appended successfully")

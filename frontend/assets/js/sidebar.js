// Left auto-hide sidebar navigation (shared across pages)
(function () {
  "use strict";

  function ensureSidebarCssLoaded() {
    const existing = document.querySelector(
      'link[rel="stylesheet"][href*="assets/css/sidebar.css"]'
    );
    if (existing) {
      const href = existing.getAttribute("href") || "";
      if (!href.includes("v=4")) existing.setAttribute("href", "assets/css/sidebar.css?v=4");
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "assets/css/sidebar.css?v=4";
    document.head.appendChild(link);
  }

  function enableSideNavLayout() {
    // Ensure the CSS selector `.side-nav-enabled header { display:none }` always applies
    document.documentElement.classList.add("side-nav-enabled");

    // Defensive: if a page still has the old top header, hide it (prevents overlap/double nav)
    const header = document.querySelector("header");
    if (header) header.style.display = "none";
  }

  const LINKS = [
    { href: "index.html", label: "Home", icon: "fa-house" },
    { href: "about.html", label: "About Us", icon: "fa-circle-info" },
    { href: "services.html", label: "Services", icon: "fa-briefcase" },
    { href: "blog.html", label: "Blog", icon: "fa-newspaper" },
    { href: "testimonials.html", label: "Testimonials", icon: "fa-quote-left" },
    { href: "insights.html", label: "Insights", icon: "fa-lightbulb" },
    // Use a widely available FontAwesome icon
    { href: "careers.html", label: "Careers", icon: "fa-briefcase" },
    { href: "employes.html", label: "Team", icon: "fa-users" },
    { href: "contact.html", label: "Contact", icon: "fa-envelope" },
  ];

  function currentPage() {
    const path = window.location.pathname || "";
    const file = path.split("/").pop() || "index.html";
    // If served at / (no file), treat as index.html
    return file.includes(".html") ? file : "index.html";
  }

  function buildNav() {
    const page = currentPage();

    const aside = document.createElement("aside");
    aside.id = "nav-rail";
    aside.className = "nav-rail is-collapsed";
    aside.setAttribute("aria-label", "Primary navigation");

    const linksHtml = LINKS.map((l) => {
      const isActive = l.href === page;
      return `
        <a class="nav-rail__link ${isActive ? "is-active" : ""}" href="${l.href}" ${
          isActive ? 'aria-current="page"' : ""
        }>
          <i class="nav-rail__icon fas ${l.icon}"></i>
          <span class="nav-rail__label">${l.label}</span>
        </a>
      `;
    }).join("");

    aside.innerHTML = `
      <div class="nav-rail__inner">
        <div class="nav-rail__top">
          <button
            id="nav-rail-toggle"
            class="nav-rail__toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded="false"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          <span class="nav-rail__label nav-rail__menu-title">Menu</span>
        </div>

        <div class="nav-rail__divider"></div>

        <nav class="nav-rail__nav" aria-label="Site">
          ${linksHtml}
        </nav>

        <div class="nav-rail__bottom">
          <div class="nav-rail__divider"></div>
          <button
            class="nav-rail__link nav-rail__btn"
            type="button"
            aria-label="Toggle dark mode"
            data-theme-toggle
          >
            <i class="nav-rail__icon fas fa-moon text-lg" data-theme-icon></i>
            <span class="nav-rail__label">Theme</span>
          </button>
          <p class="nav-rail__meta nav-rail__label">
            Auto-hides when idle.
          </p>
        </div>
      </div>
    `;

    return aside;
  }

  function initAutoHide(navRail, navRailToggle) {
    let collapseTimer = null;
    const COLLAPSE_DELAY_MS = 300;

    const setCollapsed = (collapsed) => {
      navRail.classList.toggle("is-collapsed", collapsed);
      navRailToggle.setAttribute("aria-expanded", String(!collapsed));
      // Let layout respond (avoid sidebar overlapping content when expanded)
      document.documentElement.classList.toggle("nav-rail-expanded", !collapsed);
    };

    const expandNow = () => {
      if (collapseTimer) window.clearTimeout(collapseTimer);
      setCollapsed(false);
    };

    const scheduleCollapse = () => {
      if (collapseTimer) window.clearTimeout(collapseTimer);
      collapseTimer = window.setTimeout(() => {
        const active = document.activeElement;
        if (!navRail.matches(":hover") && !(active && navRail.contains(active))) {
          setCollapsed(true);
        }
      }, COLLAPSE_DELAY_MS);
    };

    setCollapsed(true);

    navRail.addEventListener("mouseenter", expandNow);
    navRail.addEventListener("mouseleave", scheduleCollapse);
    navRail.addEventListener("focusin", expandNow);
    navRail.addEventListener("focusout", scheduleCollapse);

    // Use both click and touchstart for better mobile responsiveness
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isCollapsed = navRail.classList.contains("is-collapsed");
      setCollapsed(!isCollapsed);
      if (!isCollapsed) scheduleCollapse();
    };
    
    navRailToggle.addEventListener("click", handleToggle);
    // Add touchstart for immediate response on touch devices
    navRailToggle.addEventListener("touchstart", (e) => {
      e.preventDefault();
      handleToggle(e);
    }, { passive: false });

    window.addEventListener("mousemove", (e) => {
      if (e.clientX <= 10) expandNow();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setCollapsed(true);
    });

    window.addEventListener("pointerdown", (e) => {
      if (!navRail.contains(e.target)) scheduleCollapse();
    });
  }

  // Defer scripts run after parsing; body exists.
  if (!document.body) return;

  // Make sure layout + CSS are always applied on every page.
  ensureSidebarCssLoaded();
  enableSideNavLayout();

  // Avoid injecting twice
  if (document.getElementById("nav-rail")) return;

  const aside = buildNav();
  document.body.insertBefore(aside, document.body.firstChild);

  const navRail = document.getElementById("nav-rail");
  const navRailToggle = document.getElementById("nav-rail-toggle");
  if (navRail && navRailToggle) {
    initAutoHide(navRail, navRailToggle);
  }
})();


// Theme Toggle Functionality
(function() {
  'use strict';

  function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
      updateThemeIcons(true);
    } else {
      html.classList.remove('dark');
      updateThemeIcons(false);
    }
  }

  function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
    updateThemeToggleLabels(isDark);
  }

  function updateThemeIcons(isDark) {
    const icons = document.querySelectorAll(
      '#theme-icon, #theme-icon-mobile, [data-theme-icon]'
    );
    icons.forEach(icon => {
      if (icon) {
        // Preserve any existing styling classes (e.g. sidebar icon class)
        icon.classList.add('fas', 'text-lg');
        icon.classList.remove('fa-sun', 'fa-moon');
        icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
      }
    });
  }

  function updateThemeToggleLabels(isDark) {
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    const toggles = document.querySelectorAll(
      '[data-theme-toggle], #theme-toggle, #theme-toggle-mobile'
    );
    toggles.forEach((btn) => {
      if (!btn) return;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  function bindThemeToggle() {
    // Bind once (theme.js may be included on many pages)
    if (document.documentElement.dataset.themeToggleBound === 'true') return;
    document.documentElement.dataset.themeToggleBound = 'true';

    // Use capture so it still works if some element stops bubbling.
    document.addEventListener('click', function(e) {
      if (!e || !e.target || !e.target.closest) return;
      const btn = e.target.closest('[data-theme-toggle], #theme-toggle, #theme-toggle-mobile');
      if (!btn) return;
      e.preventDefault();
      toggleTheme();
    }, { capture: true, passive: false });
  }

  // Initialize theme immediately (before DOMContentLoaded to prevent flash)
  if (document.readyState === 'loading') {
    initTheme();
  } else {
    initTheme();
  }

  // Bind immediately so the toggle works right away (including homepage)
  bindThemeToggle();
  updateThemeToggleLabels(document.documentElement.classList.contains('dark'));

  // Refresh icons once DOM is ready (after any dynamic nav injection)
  document.addEventListener('DOMContentLoaded', function() {
    // Ensure icons are correct after any dynamic DOM injection
    const isDark = document.documentElement.classList.contains('dark');
    updateThemeIcons(isDark);
    updateThemeToggleLabels(isDark);
  });
})();

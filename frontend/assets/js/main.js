// TechMaa-AI Website Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // 1. --- Configuration ---
  const API_BASE_URL = 'http://localhost:4000/api/public';

  // 2. --- Global Elements & Functions ---

  // Set current year in footer
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Unified mobile navigation toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const closeMobileMenuButton = document.getElementById("close-mobile-menu");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");

  if (mobileMenuButton && mobileMenu && mobileMenuOverlay) {
    const toggleMobileMenu = () => {
      const isOpen = mobileMenu.classList.contains("translate-x-full");
      mobileMenu.classList.toggle("translate-x-full", !isOpen);
      mobileMenuOverlay.classList.toggle("hidden", !isOpen);
      document.body.classList.toggle("overflow-hidden", isOpen);
    };

    mobileMenuButton.addEventListener("click", toggleMobileMenu);
    if (closeMobileMenuButton) {
      closeMobileMenuButton.addEventListener("click", toggleMobileMenu);
    }
    mobileMenuOverlay.addEventListener("click", toggleMobileMenu);
  }

  // 3. --- Form Handlers ---

  // Newsletter subscription form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    const msg = document.getElementById('newsletterMsg');
    const submitButton = newsletterForm.querySelector('button[type="submit"]');

    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value.trim();
      
      submitButton.disabled = true;
      submitButton.textContent = 'Subscribing...';
      msg.textContent = '';
      msg.classList.remove('text-red-500', 'text-green-500');

      try {
        const res = await fetch(`${API_BASE_URL}/newsletter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');
        
        msg.textContent = data.message || 'Thanks for subscribing!';
        msg.classList.add('text-green-500');
        newsletterForm.reset();
      } catch (err) {
        msg.textContent = err.message || 'Something went wrong. Please try again.';
        msg.classList.add('text-red-500');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe';
      }
    });
  }

  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const msg = document.getElementById('contactMsg');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(contactForm);
      const payload = Object.fromEntries(form.entries());
      
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      msg.textContent = '';
      msg.classList.remove('text-red-500', 'text-green-500');

      try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Server error');

        msg.textContent = data.message || 'Message sent!';
        msg.classList.add('text-green-500');
        contactForm.reset();
      } catch (err) {
        msg.textContent = err.message || 'Could not send. Try again later.';
        msg.classList.add('text-red-500');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
    });
  }

  // 4. --- Dynamic Content Loading ---

  // Generic loader with fallback support
  async function loadAndRender(endpoint, containerId, template, fallbackHTML = '') {
    const el = document.getElementById(containerId);
    if (!el) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`);
      if (!res.ok) throw new Error('API error');
      
      const items = await res.json();
      if (!items || items.length === 0) throw new Error('No items received');

      el.innerHTML = items.map(template).join('');
    } catch (e) {
      console.error(`Failed to load ${endpoint}:`, e);
      // Special handling for jobs to show a pre-rendered fallback section
      if (containerId === 'jobs') {
        const fallbackEl = document.getElementById('jobs-fallback');
        if (fallbackEl) fallbackEl.classList.remove('hidden');
      } else {
        el.innerHTML = fallbackHTML || '<p class="text-gray-500">No content available at the moment.</p>';
      }
    }
  }

  // Load posts for insights.html
  loadAndRender(
    'posts',
    'posts',
    (p) => `
      <article class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
          <a href="#" class="block">
              <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=1974&auto=format&fit=crop'}" alt="${p.title}" class="w-full h-48 object-cover">
          </a>
          <div class="p-6 flex flex-col flex-grow">
              <p class="text-sm text-yellow-600 font-semibold mb-2">${p.category || 'ARTICLE'}</p>
              <h3 class="text-xl font-bold text-gray-900 mb-3">
                  <a href="#" class="hover:text-yellow-500 transition-colors">${p.title}</a>
              </h3>
              <p class="text-gray-600 mb-4 flex-grow">${p.excerpt || ''}</p>
              <div class="mt-auto text-sm text-gray-500">
                  <span>By ${p.author || 'TechMaa-AI'} on ${new Date(p.publishedAt).toLocaleDateString()}</span>
              </div>
          </div>
      </article>
    `,
    `<p class="col-span-full text-center text-gray-500">Our latest insights are coming soon. Stay tuned!</p>`
  );

  // Load jobs for careers.html
  // NOTE: The large fallback HTML should be moved to careers.html inside a hidden element with id="jobs-fallback"
  loadAndRender(
    'jobs',
    'jobs',
    (j) => `
      <div role="listitem" class="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
          <h3 class="text-2xl font-semibold text-gray-900 mb-2">${j.title}</h3>
          <p class="text-gray-600 mb-4">${j.location} | ${j.type}</p>
          <p class="text-gray-700 mb-6 flex-grow">${j.summary || 'Join our team to work on exciting projects.'}</p>
          <a href="apply-form.html?role=${encodeURIComponent(j.title)}" class="mt-auto text-center bg-gray-800 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">Learn More & Apply</a>
      </div>
    `
  );

});
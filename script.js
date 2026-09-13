/**
 * CARTERA — MINIMAL TYPOGRAPHY PORTFOLIO
 * Script handling headline parallax depth effect and smooth interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.getElementById('hero-content');
  const heroHeadline = document.getElementById('hero-headline');
  const yearElement = document.getElementById('year');

  // 1. Dynamic Footer Year
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // -------------------------------------------------------------------------
  // 1b. Auto-Hiding Navbar & Mobile Navigation
  // -------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const navHamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  let isMobileMenuOpen = false;

  function openMobileMenu() {
    if (!navHamburger || !mobileMenu) return;
    isMobileMenuOpen = true;
    navHamburger.classList.add('is-active');
    navHamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    if (navbar) {
      navbar.classList.remove('nav-hidden');
    }
  }

  function closeMobileMenu() {
    if (!navHamburger || !mobileMenu) return;
    isMobileMenuOpen = false;
    navHamburger.classList.remove('is-active');
    navHamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  function toggleMobileMenu() {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (navHamburger && mobileMenu) {
    navHamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close mobile menu when any mobile nav link is clicked
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        closeMobileMenu();

        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            setTimeout(() => {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }, 120);
          }
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    });

    // Close on resize if window expands past mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  if (navbar) {
    let lastScrollY = window.scrollY;
    let cumulativeDelta = 0;
    let idleNavTimer = null;
    const TOP_THRESHOLD = 60;   // Always visible near the top of the page
    const HIDE_THRESHOLD = 90;  // Must scroll down at least ~90px continuously to hide
    const SHOW_THRESHOLD = -15; // Reappear quickly on slight upward scroll (-15px)
    const IDLE_DELAY = 1800;    // Hide after 1.8s of no scroll activity

    function showNavbar() {
      navbar.classList.remove('nav-hidden');
    }

    function hideNavbar() {
      if (isMobileMenuOpen) return;
      if (window.scrollY > TOP_THRESHOLD) {
        navbar.classList.add('nav-hidden');
      }
    }

    function resetIdleTimer() {
      clearTimeout(idleNavTimer);
      if (isMobileMenuOpen) return;
      if (window.scrollY > TOP_THRESHOLD) {
        idleNavTimer = setTimeout(() => {
          hideNavbar();
          cumulativeDelta = 0;
        }, IDLE_DELAY);
      }
    }

    function handleNavbarScroll() {
      if (isMobileMenuOpen) return;
      const currentScrollY = window.scrollY;
      const stepDelta = currentScrollY - lastScrollY;

      // 1. Always visible near top of page
      if (currentScrollY <= TOP_THRESHOLD) {
        showNavbar();
        cumulativeDelta = 0;
        clearTimeout(idleNavTimer);
        lastScrollY = Math.max(0, currentScrollY);
        return;
      }

      // 2. Cumulative scroll delta calculation
      if (stepDelta > 0) {
        // Scrolling DOWN
        if (cumulativeDelta < 0) {
          cumulativeDelta = 0; // reset if previously scrolling up
        }
        cumulativeDelta += stepDelta;

        // Only hide after meaningful continuous downward scroll
        if (cumulativeDelta >= HIDE_THRESHOLD) {
          hideNavbar();
          clearTimeout(idleNavTimer);
        } else {
          // Keep idle timer active while scrolling down before threshold
          resetIdleTimer();
        }
      } else if (stepDelta < 0) {
        // Scrolling UP
        if (cumulativeDelta > 0) {
          cumulativeDelta = 0; // reset if previously scrolling down
        }
        cumulativeDelta += stepDelta;

        // Immediately slide back down and reappear
        if (cumulativeDelta <= SHOW_THRESHOLD) {
          showNavbar();
          resetIdleTimer();
        }
      }

      lastScrollY = Math.max(0, currentScrollY);
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // Desktop hover polish: keep visible when cursor is over navbar
    navbar.addEventListener('mouseenter', () => {
      clearTimeout(idleNavTimer);
    });
    navbar.addEventListener('mouseleave', () => {
      resetIdleTimer();
    });

    // Clicking logo smoothly scrolls to top and closes mobile menu if open
    const navLogo = navbar.querySelector('.nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        if (isMobileMenuOpen) {
          closeMobileMenu();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // 2. Parallax Depth Effect on Scroll
  // As the user scrolls past the hero, the headline moves slightly slower than the scroll
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && heroContent) {
    let latestScrollY = 0;
    let ticking = false;

    function updateParallax() {
      const scrollY = latestScrollY;
      const heroHeight = window.innerHeight;

      // Only calculate while within or near the hero viewport
      if (scrollY <= heroHeight * 1.5) {
        // Move slower than scroll: rate of 0.38 gives elegant depth
        const translateY = scrollY * 0.38;
        
        // Softly fade out as the user approaches the end of the hero section
        const opacity = Math.max(0, 1 - (scrollY / (heroHeight * 0.85)));

        heroContent.style.transform = `translate3d(0, ${translateY}px, 0)`;
        heroContent.style.opacity = opacity.toFixed(3);
      }

      ticking = false;
    }

    function onScroll() {
      latestScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call
    onScroll();
  }

  // 3. Scroll-Reveal Animations for Sections Below Hero
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px', // Trigger smoothly as element enters viewport
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // -------------------------------------------------------------------------
  // 4. Projects Stacked Browser Mockup Carousel (Dynamic Supabase Integration)
  // -------------------------------------------------------------------------
  const carouselStage = document.getElementById('carousel-stage');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const projectTitle = document.getElementById('project-title');
  const projectDesc = document.getElementById('project-desc');
  const projectTags = document.getElementById('project-tags');
  const projectLink = document.getElementById('project-link');
  const carouselCounter = document.getElementById('carousel-counter');
  const carouselDots = document.getElementById('carousel-dots');

  let projectsData = [];
  let currentProjectIdx = 0;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatAddressBar(url, fallbackTitle) {
    if (!url) {
      const clean = (fallbackTitle || 'project').toLowerCase().replace(/[^a-z0-9]/g, '');
      return `${clean}.vercel.app`;
    }
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '') + (parsed.pathname !== '/' ? parsed.pathname : '');
    } catch (e) {
      return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
  }

  // Fetch projects from Supabase
  async function loadProjectsFromSupabase() {
    if (!carouselStage) return;

    try {
      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        throw new Error('Supabase client is not available.');
      }

      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      projectsData = data || [];

      // Temporary debug log: log screenshot_url for each project
      projectsData.forEach((p, i) => {
        console.log(`[Cartera Projects] #${i + 1} "${p.title}" -> screenshot_url:`, p.screenshot_url);
      });

      if (projectsData.length === 0) {
        renderEmptyCarousel('No projects published yet.');
        return;
      }

      renderDynamicCarousel(projectsData);
    } catch (err) {
      console.warn('Supabase fetch failed or table empty, checking status:', err.message);
      renderEmptyCarousel('Unable to load projects at this time.');
    }
  }

  function renderEmptyCarousel(message) {
    if (carouselStage) {
      carouselStage.innerHTML = `
        <div class="mockup-card is-active" style="pointer-events: auto;">
          <div class="browser-mockup">
            <div class="browser-chrome">
              <div class="browser-dots">
                <span class="browser-dot"></span>
                <span class="browser-dot"></span>
                <span class="browser-dot"></span>
              </div>
              <div class="browser-address-bar font-mono">cartera.dev</div>
            </div>
            <div class="browser-viewport">
              <div class="mockup-placeholder placeholder-theme-1">
                <span class="placeholder-tag font-mono">// PORTFOLIO STATUS</span>
                <h3 class="placeholder-name" style="font-size: 1.4rem;">CARTERA</h3>
                <span class="placeholder-meta">${escapeHtml(message)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (projectTitle) projectTitle.textContent = 'Projects Coming Soon';
    if (projectDesc) projectDesc.textContent = 'Projects added via the admin panel will appear here dynamically.';
    if (projectLink) projectLink.style.display = 'none';
    if (projectTags) projectTags.innerHTML = '<span class="project-tag">Coming Soon</span>';
    if (carouselCounter) carouselCounter.textContent = '00 / 00';
    if (carouselDots) carouselDots.innerHTML = '';
  }

  function renderDynamicCarousel(projects) {
    const total = projects.length;
    currentProjectIdx = 0;

    // 1. Build Cards HTML
    let cardsHtml = '';
    projects.forEach((proj, idx) => {
      let positionClass = '';
      if (idx === 0) {
        positionClass = 'is-active';
      } else if (idx === 1) {
        positionClass = 'is-next';
      } else if (idx === total - 1 && total > 2) {
        positionClass = 'is-prev';
      }

      const themeClass = `placeholder-theme-${(idx % 5) + 1}`;
      const address = formatAddressBar(proj.live_url, proj.title);
      const tagList = (proj.tech_tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const topTag = tagList[0] || 'FEATURED WORK';
      const subTag = tagList[1] || 'WEB EXPERIENCE';
      const hasScreenshot = Boolean(proj.screenshot_url && proj.screenshot_url.trim());

      cardsHtml += `
        <div class="mockup-card ${positionClass}" 
             data-index="${idx}" 
             ${proj.live_url ? `data-url="${escapeHtml(proj.live_url)}"` : ''} 
             role="group" 
             aria-label="Project ${idx + 1} of ${total}: ${escapeHtml(proj.title)}">
          <div class="browser-mockup">
            <div class="browser-chrome">
              <div class="browser-dots">
                <span class="browser-dot"></span>
                <span class="browser-dot"></span>
                <span class="browser-dot"></span>
              </div>
              <div class="browser-address-bar font-mono">${escapeHtml(address)}</div>
            </div>
            <div class="browser-viewport">
              ${hasScreenshot ? `
                <img 
                  src="${escapeHtml(proj.screenshot_url.trim())}" 
                  alt="${escapeHtml(proj.title)} Preview" 
                  class="mockup-img" 
                  ${idx === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
                  onerror="this.classList.add('img-fallback'); const fb = this.nextElementSibling; if (fb) fb.classList.remove('is-hidden');"
                >
                <div class="mockup-placeholder ${themeClass} is-hidden">
                  <span class="placeholder-tag font-mono">// ${escapeHtml(topTag)}</span>
                  <h3 class="placeholder-name">${escapeHtml(proj.title)}</h3>
                  <span class="placeholder-meta">${escapeHtml(subTag)}</span>
                </div>
              ` : `
                <div class="mockup-placeholder ${themeClass}">
                  <span class="placeholder-tag font-mono">// ${escapeHtml(topTag)}</span>
                  <h3 class="placeholder-name">${escapeHtml(proj.title)}</h3>
                  <span class="placeholder-meta">${escapeHtml(subTag)}</span>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    });

    carouselStage.innerHTML = cardsHtml;

    // 2. Build Dot Indicators HTML
    if (carouselDots) {
      carouselDots.innerHTML = projects.map((p, idx) => `
        <button class="carousel-dot ${idx === 0 ? 'active' : ''}" 
                data-index="${idx}" 
                aria-label="Go to project ${idx + 1}: ${escapeHtml(p.title)}">
        </button>
      `).join('');
    }

    // 3. Update Initial Details
    updateCarousel(0);

    // 4. Attach Card Interaction Listeners
    attachCarouselEvents();
  }

  function updateCarousel(newIndex) {
    if (!projectsData || projectsData.length === 0) return;
    const totalProjects = projectsData.length;
    currentProjectIdx = (newIndex + totalProjects) % totalProjects;

    // 1. Update Mockup Cards Positions
    const cards = carouselStage.querySelectorAll('.mockup-card');
    cards.forEach(card => {
      const cardIdx = parseInt(card.getAttribute('data-index'), 10);
      const diff = (cardIdx - currentProjectIdx + totalProjects) % totalProjects;

      card.classList.remove('is-active', 'is-next', 'is-prev');

      if (diff === 0) {
        card.classList.add('is-active');
      } else if (diff === 1) {
        card.classList.add('is-next');
      } else if (diff === totalProjects - 1 && totalProjects > 2) {
        card.classList.add('is-prev');
      }
    });

    // 2. Update Project Details Panel with Smooth Fade Transition
    if (projectTitle && projectDesc && projectLink && projectTags && carouselCounter) {
      projectTitle.style.opacity = '0';
      projectTitle.style.transform = 'translateY(6px)';
      projectDesc.style.opacity = '0';
      projectDesc.style.transform = 'translateY(6px)';

      setTimeout(() => {
        const project = projectsData[currentProjectIdx];
        if (!project) return;

        projectTitle.textContent = project.title || 'Untitled Project';
        projectDesc.textContent = project.description || 'No description provided.';
        
        if (project.live_url) {
          projectLink.href = project.live_url;
          projectLink.style.display = 'inline-flex';
          projectLink.style.pointerEvents = 'auto';
          projectLink.style.opacity = '1';
        } else {
          projectLink.style.display = 'none';
        }

        const counterCurrent = String(currentProjectIdx + 1).padStart(2, '0');
        const counterTotal = String(totalProjects).padStart(2, '0');
        carouselCounter.textContent = `${counterCurrent} / ${counterTotal}`;

        // Render tags
        const tags = (project.tech_tags || '')
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean);

        projectTags.innerHTML = tags
          .map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`)
          .join('');

        projectTitle.style.opacity = '1';
        projectTitle.style.transform = 'translateY(0)';
        projectDesc.style.opacity = '1';
        projectDesc.style.transform = 'translateY(0)';
      }, 160);
    }

    // 3. Update Dots
    if (carouselDots) {
      const dots = carouselDots.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentProjectIdx);
      });
    }
  }

  function attachCarouselEvents() {
    // Stage Click Handler: next/prev card clicks & active card link opening
    carouselStage.onclick = (e) => {
      const card = e.target.closest('.mockup-card');
      if (!card) return;

      if (card.classList.contains('is-next')) {
        updateCarousel(currentProjectIdx + 1);
      } else if (card.classList.contains('is-prev')) {
        updateCarousel(currentProjectIdx - 1);
      } else if (card.classList.contains('is-active')) {
        const url = card.getAttribute('data-url');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    };
  }

  // Arrow Button Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (projectsData.length > 0) updateCarousel(currentProjectIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (projectsData.length > 0) updateCarousel(currentProjectIdx + 1);
    });
  }

  // Dot Click Delegation
  if (carouselDots) {
    carouselDots.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        updateCarousel(idx);
      }
    });
  }

  // Mobile Touch Swipe Gesture Support
  if (carouselStage) {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchStartX - touchEndX;
      const SWIPE_THRESHOLD = 45;

      if (swipeDistance > SWIPE_THRESHOLD) {
        updateCarousel(currentProjectIdx + 1);
      } else if (swipeDistance < -SWIPE_THRESHOLD) {
        updateCarousel(currentProjectIdx - 1);
      }
    }, { passive: true });
  }

  // Keyboard Left / Right Navigation
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    window.addEventListener('keydown', (e) => {
      if (projectsData.length === 0) return;
      const rect = projectsSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        if (e.key === 'ArrowLeft') {
          updateCarousel(currentProjectIdx - 1);
        } else if (e.key === 'ArrowRight') {
          updateCarousel(currentProjectIdx + 1);
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Contact Form Submission (UI Feedback)
  // -------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');

  if (contactForm && contactSubmitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      contactSubmitBtn.disabled = true;
      contactSubmitBtn.innerHTML = `<span>MESSAGE SENT</span>`;

      setTimeout(() => {
        contactForm.reset();
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.innerHTML = `
          <span>SEND MESSAGE</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }, 3000);
    });
  }

  // Initialize Dynamic Fetch
  loadProjectsFromSupabase();
});



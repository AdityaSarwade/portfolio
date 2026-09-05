/**
 * Main Application Initialization
 * Coordinates all portfolio components
 */

class Portfolio {
  constructor() {
    this.components = {};
    this.isInitialized = false;
    this.settings = {
      particles: false,
      cursor: false,
      animations: false
    };
  }

  async init() {
    if (this.isInitialized) {
      console.warn('Portfolio already initialized');
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }

    console.log('Initializing portfolio...');

    // Dynamic calculations
    this.updateDynamicValues();

    // Determine which features to enable based on device capabilities
    this.determineSettings();

    // Initialize components
    await this.initializeComponents();

    // Setup global functionality
    this.setupNavigation();
    this.setupContactForm();
    this.setupScrollEffects();
    this.setupResizeHandler();
    this.setupTypingAnimation();

    this.isInitialized = true;
    console.log('Portfolio initialized successfully');

    // Store reference globally for timeline animation trigger
    window.portfolio = this;
  }

  updateDynamicValues() {
    // 1. Dynamic Experience Calculation (Jan 2024 start)
    // Rule: Jan 2026 onwards = 2+ years; Jun 2026 onwards = 2.5+ years
    const now = new Date();
    const yearsDiff = now.getFullYear() - 2024;
    const month = now.getMonth(); // 0 = Jan, 5 = June
    const halfYears = yearsDiff * 2 + (month >= 5 ? 1 : 0);
    const expYears = Math.max(1, halfYears * 0.5);
    const expText = expYears % 1 === 0 ? `${expYears}+` : `${expYears.toFixed(1)}+`;

    const expElement = document.getElementById('experience-years');
    if (expElement) {
      expElement.textContent = expText;
    }

    // 2. Dynamic Footer Year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = now.getFullYear();
    }
  }

  setupTypingAnimation() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
      'Generative AI & LLMs',
      'Autonomous AI Agents',
      'GraphRAG & Vector Search',
      'Scalable ML Systems',
      'Quantization & ONNX'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 75;

    const type = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 35;
      } else {
        el.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 1800; // Pause when full phrase is typed
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // Pause before typing next phrase
      }

      setTimeout(type, typingSpeed);
    };

    setTimeout(type, 600);
  }

  determineSettings() {
    // Check user preferences and device capabilities
    const reducedMotion = prefersReducedMotion();
    const mobile = isMobile();
    const touch = isTouchDevice();

    this.settings = {
      particles: !mobile && !reducedMotion,
      cursor: !touch && !reducedMotion,
      animations: !reducedMotion
    };

    console.log('Settings:', this.settings);
  }

  async initializeComponents() {
    try {
      // Initialize particle field
      if (this.settings.particles && window.THREE) {
        console.log('Initializing particles...');
        try {
          this.components.particles = new ParticleField();
          this.components.particles.init();
        } catch (e) {
          console.error('Error initializing particles:', e);
        }
      }

      // Initialize sparkling cursor
      if (this.settings.cursor) {
        console.log('Initializing cursor...');
        try {
          this.components.cursor = new SparklingCursor();
          this.components.cursor.init();
        } catch (e) {
          console.error('Error initializing cursor:', e);
        }
      }

      // Initialize git timeline
      console.log('Initializing timeline...');
      try {
        this.components.timeline = new GitTimeline('git-timeline');
        this.components.timeline.init();
        // Store reference for scroll animation trigger
        this.timeline = this.components.timeline;
      } catch (e) {
        console.error('Error initializing timeline:', e);
      }

      // Initialize scroll animations (or ensure sections are visible)
      console.log('Initializing scroll animations...');
      setTimeout(() => {
        try {
          initScrollAnimations();
        } catch (e) {
          console.error('Error initializing scroll animations:', e);
        }
      }, 100);

    } catch (error) {
      console.error('Error initializing components:', error);
    }
  }

  setupNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
          // Close mobile menu if open
          const navLinks = document.querySelector('.nav-links');
          if (navLinks) {
            navLinks.classList.remove('active');
            const toggle = document.querySelector('.nav-toggle');
            if (toggle) {
              toggle.classList.remove('active');
            }
          }

          // Smooth scroll to target
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Mobile menu toggle
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('active');
          toggle.classList.remove('active');
        }
      });
    }

    // Active nav link on scroll
    this.updateActiveNavLink();
    window.addEventListener('scroll', throttle(() => {
      this.updateActiveNavLink();
    }, 100));
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 150) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  setupContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message')
        };

        console.log('Form submitted:', data);
        this.showNotification('Message sent successfully! (This is a demo)', 'success');
        form.reset();
      });
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--accent-primary);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      z-index: 10000;
      box-shadow: var(--shadow-glow);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  setupScrollEffects() {
    let lastScrollTop = 0;
    const nav = document.querySelector('.nav');

    window.addEventListener('scroll', throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Hide/show nav on scroll
      if (nav) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Scrolling down
          nav.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          nav.style.transform = 'translateY(0)';
        }
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 100));
  }

  setupResizeHandler() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        // Update settings based on new screen size
        this.determineSettings();

        // Reinitialize or destroy components as needed
        if (!this.settings.particles && this.components.particles) {
          this.components.particles.destroy();
          delete this.components.particles;
        } else if (this.settings.particles && !this.components.particles && window.THREE) {
          this.components.particles = new ParticleField();
          this.components.particles.init();
        }

        if (!this.settings.cursor && this.components.cursor) {
          this.components.cursor.destroy();
          delete this.components.cursor;
        } else if (this.settings.cursor && !this.components.cursor) {
          this.components.cursor = new SparklingCursor();
          this.components.cursor.init();
        }

        // Refresh GSAP ScrollTrigger if available
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 250);
    });
  }

  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    this.components = {};
    this.isInitialized = false;
  }
}

// Initialize portfolio when DOM is ready
const app = new Portfolio();
app.init();

// Backup: Ensure all content is visible after page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('Running backup visibility check...');
    const selectors = [
      'section',
      '.section-title',
      '.skill-category',
      '.project-card',
      '.stat-card',
      '.contact-item',
      '.about-content',
      '.projects-grid',
      '.skills-grid',
      '.timeline-commit',
      '.timeline-path',
      '.timeline-branch',
      '.about-text',
      '.about-stats',
      '.experience-card',
      '.experience-list'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.opacity === '0' || computedStyle.visibility === 'hidden') {
            element.style.setProperty('opacity', '1', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('transform', 'scale(1)', 'important');
          }
        });
      }
    });
  }, 500);
});

// Add animation for notification
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .nav {
    transition: transform 0.3s ease;
  }
`;
document.head.appendChild(style);

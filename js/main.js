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

    // Determine which features to enable based on device capabilities
    this.determineSettings();

    // Initialize components
    await this.initializeComponents();

    // Setup global functionality
    this.setupNavigation();
    this.setupContactForm();
    this.setupScrollEffects();
    this.setupResizeHandler();

    this.isInitialized = true;
    console.log('Portfolio initialized successfully');

    // Store reference globally for timeline animation trigger
    window.portfolio = this;
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
        this.components.particles = new ParticleField();
        this.components.particles.init();
      }

      // Initialize sparkling cursor
      if (this.settings.cursor) {
        console.log('Initializing cursor...');
        this.components.cursor = new SparklingCursor();
        this.components.cursor.init();
      }

      // Initialize git timeline
      console.log('Initializing timeline...');
      this.components.timeline = new GitTimeline('git-timeline');
      this.components.timeline.init();
      // Store reference for scroll animation trigger
      this.timeline = this.components.timeline;

      // Initialize scroll animations
      if (this.settings.animations && window.gsap) {
        console.log('Initializing scroll animations...');
        // Wait a bit for everything to be rendered
        setTimeout(() => {
          initScrollAnimations();
        }, 100);
      }

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
      const sectionHeight = section.clientHeight;

      if (window.pageYOffset >= sectionTop - 100) {
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

        // Show success message
        this.showNotification('Message sent successfully! (This is a demo)', 'success');

        // Reset form
        form.reset();

        // In production, you would send this to a backend or service like:
        // - FormSpree: https://formspree.io/
        // - EmailJS: https://www.emailjs.com/
        // - Netlify Forms: https://www.netlify.com/products/forms/
        // - Your own backend API
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
    // Cleanup all components
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

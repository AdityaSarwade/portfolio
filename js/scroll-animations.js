/**
 * Scroll-triggered Animations using GSAP ScrollTrigger
 */

function initScrollAnimations() {
  // First, ensure all elements are visible by default
  const ensureVisible = () => {
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
      '.experience-card',
      '.experience-list'
    ];

    console.log('Ensuring all elements are visible...');
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements for ${selector}`);
      elements.forEach(element => {
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('transform', 'scale(1)', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
      });
    });
  };

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('GSAP or ScrollTrigger not loaded - sections will display without animations');
    ensureVisible();
    return;
  }

  // Ensure elements are visible first, then GSAP will animate them
  ensureVisible();

  gsap.registerPlugin(ScrollTrigger);

  // Fade in sections on scroll
  gsap.utils.toArray('section').forEach((section, index) => {
    // Skip hero section (already visible)
    if (section.id === 'hero') return;

    gsap.from(section, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
        // markers: true // Uncomment for debugging
      }
    });
  });

  // Animate section titles
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.8,
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Animate skill bars
  document.querySelectorAll('.skill-progress').forEach(bar => {
    const progress = bar.dataset.progress;

    gsap.to(bar, {
      width: `${progress}%`,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Animate skill categories
  gsap.utils.toArray('.skill-category').forEach((category, index) => {
    gsap.from(category, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      delay: index * 0.1,
      scrollTrigger: {
        trigger: category,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });

  // Animate project cards with stagger
  const projectCards = gsap.utils.toArray('.project-card');
  if (projectCards.length > 0) {
    gsap.from(projectCards, {
      opacity: 0,
      y: 100,
      scale: 0.8,
      stagger: 0.15,
      duration: 0.8,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Animate experience cards
  const expCards = gsap.utils.toArray('.experience-card');
  if (expCards.length > 0) {
    gsap.from(expCards, {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.experience-list',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Animate stat cards
  gsap.utils.toArray('.stat-card').forEach((card, index) => {
    gsap.from(card, {
      opacity: 0,
      scale: 0.5,
      duration: 0.6,
      delay: index * 0.1,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    // Animate numbers counting up
    const statNumber = card.querySelector('.stat-number');
    if (statNumber) {
      const finalValue = statNumber.textContent.trim();
      const isPercent = finalValue.includes('%');
      const isFloat = finalValue.includes('.');
      const numericValue = isFloat ? parseFloat(finalValue) : parseInt(finalValue);

      if (!isNaN(numericValue)) {
        const obj = { value: 0 };

        gsap.to(obj, {
          value: numericValue,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (isPercent) {
              statNumber.textContent = Math.round(obj.value) + '%';
            } else if (isFloat) {
              statNumber.textContent = (Math.round(obj.value * 2) / 2).toFixed(1) + '+';
            } else {
              statNumber.textContent = Math.round(obj.value) + '+';
            }
          },
          onComplete: () => {
            statNumber.textContent = finalValue;
          },
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        });
      }
    }
  });

  // Animate contact items
  const contactItems = gsap.utils.toArray('.contact-item');
  if (contactItems.length > 0) {
    contactItems.forEach((item, index) => {
      gsap.from(item, {
        opacity: 0,
        x: -50,
        duration: 0.6,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  // Parallax effect for hero section
  gsap.to('.hero-content', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Timeline animation trigger
  const timelineContainer = document.querySelector('.timeline-container');
  if (timelineContainer) {
    ScrollTrigger.create({
      trigger: timelineContainer,
      start: 'top 70%',
      onEnter: () => {
        // Trigger timeline animation
        if (window.portfolio && window.portfolio.timeline) {
          window.portfolio.timeline.animate();
        }
      },
      once: true
    });
  }

  // Add scroll indicator hide on scroll
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 0,
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '100px top',
        scrub: true
      }
    });
  }

  // Footer fade in
  gsap.from('.footer', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    }
  });

  // Refresh ScrollTrigger after all animations are set up
  ScrollTrigger.refresh();
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = initScrollAnimations;
}

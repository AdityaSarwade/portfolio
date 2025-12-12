/**
 * Utility functions for device detection and helpers
 */

// Device detection
const isMobile = () => window.innerWidth <= 768;

const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;

const isDesktop = () => window.innerWidth > 1024;

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Get adaptive particle count based on device
function getParticleCount() {
  if (isMobile()) return 500;
  if (isTablet()) return 1000;
  return 2000;
}

// Throttle function for performance
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Linear interpolation for smooth animations
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Map a value from one range to another
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Random number in range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Random integer in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get distance between two points
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Get scroll percentage
function getScrollPercentage() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return (scrollTop / scrollHeight) * 100;
}

// Preload images
function preloadImages(urls) {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    })
  );
}

// Wait for element to exist in DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
    getParticleCount,
    throttle,
    debounce,
    lerp,
    map,
    random,
    randomInt,
    distance,
    clamp,
    isInViewport,
    getScrollPercentage,
    preloadImages,
    waitForElement
  };
}

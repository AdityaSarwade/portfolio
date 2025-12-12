/**
 * Sparkling Cursor Effect
 */

class SparklingCursor {
  constructor() {
    this.cursorDot = document.querySelector('.custom-cursor');
    this.canvas = document.getElementById('sparkle-canvas');

    if (!this.cursorDot || !this.canvas) {
      console.warn('Cursor elements not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.sparkles = [];
    this.maxSparkles = 15;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastSparkleTime = 0;
    this.sparkleInterval = 50; // ms between sparkles
    this.animationId = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    this.setupCanvas();
    this.setupEventListeners();
    this.animate();
    this.isInitialized = true;

    // Add class to body to enable custom cursor styles
    document.body.classList.add('custom-cursor-enabled');
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.pointerEvents = 'none';
  }

  setupEventListeners() {
    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Update cursor dot position
      this.cursorDot.style.left = `${e.clientX}px`;
      this.cursorDot.style.top = `${e.clientY}px`;

      // Add sparkles while moving
      const now = Date.now();
      if (now - this.lastSparkleTime > this.sparkleInterval) {
        this.addSparkle(e.clientX, e.clientY);
        this.lastSparkleTime = now;
      }
    });

    // Click effect
    window.addEventListener('mousedown', (e) => {
      this.cursorDot.classList.add('clicked');
      // Burst effect - create multiple sparkles
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          this.addSparkle(
            e.clientX + random(-20, 20),
            e.clientY + random(-20, 20),
            true // bigger sparkles for click
          );
        }, i * 20);
      }
    });

    window.addEventListener('mouseup', () => {
      this.cursorDot.classList.remove('clicked');
    });

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursorDot.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.cursorDot.classList.remove('hover');
      });
    });

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }, 250));
  }

  addSparkle(x, y, isBurst = false) {
    if (this.sparkles.length >= this.maxSparkles) {
      this.sparkles.shift(); // Remove oldest sparkle
    }

    const sparkle = {
      x,
      y,
      size: isBurst ? random(4, 8) : random(2, 6),
      opacity: 1,
      lifetime: random(300, 600),
      createdAt: Date.now(),
      vx: random(-1, 1),
      vy: random(-2, 0), // Slight upward drift
      color: this.getRandomColor(),
      shape: randomInt(0, 2) // 0: circle, 1: star, 2: plus
    };

    this.sparkles.push(sparkle);
  }

  getRandomColor() {
    const colors = [
      { r: 255, g: 255, b: 255 },     // White
      { r: 0, g: 212, b: 255 },       // Cyan
      { r: 123, g: 44, b: 191 },      // Purple
      { r: 255, g: 215, b: 0 }        // Gold
    ];
    return colors[randomInt(0, colors.length - 1)];
  }

  updateSparkles() {
    const now = Date.now();

    this.sparkles = this.sparkles.filter(sparkle => {
      const age = now - sparkle.createdAt;

      // Remove if lifetime exceeded
      if (age > sparkle.lifetime) {
        return false;
      }

      // Update position (drift)
      sparkle.x += sparkle.vx;
      sparkle.y += sparkle.vy;

      // Fade out over lifetime
      sparkle.opacity = 1 - (age / sparkle.lifetime);

      return true;
    });
  }

  drawSparkle(sparkle) {
    const { x, y, size, opacity, color, shape } = sparkle;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    switch (shape) {
      case 0: // Circle
        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 1: // Star
        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        this.drawStar(x, y, 4, size, size / 2);
        break;

      case 2: // Plus
        this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }

    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all sparkles
    this.sparkles.forEach(sparkle => this.drawSparkle(sparkle));
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.updateSparkles();
    this.render();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    document.body.classList.remove('custom-cursor-enabled');
    this.sparkles = [];
    this.isInitialized = false;
  }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SparklingCursor;
}

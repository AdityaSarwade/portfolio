/**
 * Three.js Particle Field with Mouse Interaction
 */

class ParticleField {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) {
      console.warn('Particle canvas not found');
      return;
    }

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = getParticleCount();

    // Mouse tracking
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };

    // Animation
    this.animationId = null;
    this.isInitialized = false;

    // Particle properties
    this.particlePositions = [];
    this.particleVelocities = [];
    this.originalPositions = [];
  }

  init() {
    if (this.isInitialized || !window.THREE) {
      console.warn('Particles already initialized or THREE.js not loaded');
      return;
    }

    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.createParticles();
      this.setupEventListeners();
      this.animate();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing particle field:', error);
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 400;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    // Initialize particle positions and colors
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random position in 3D space
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 500;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Store original positions
      this.originalPositions.push({ x, y, z });

      // Store velocities for drift effect
      this.particleVelocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2
      });

      // Color variation (cyan to purple gradient)
      const mixFactor = Math.random();
      colors[i3] = lerp(0, 0.48, mixFactor);      // R
      colors[i3 + 1] = lerp(0.83, 0.17, mixFactor); // G
      colors[i3 + 2] = lerp(1, 0.75, mixFactor);  // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material with vertex colors
    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupEventListeners() {
    // Mouse move tracking (throttled for performance)
    const handleMouseMove = throttle((e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, 16); // ~60fps

    window.addEventListener('mousemove', handleMouseMove);

    // Handle resize
    window.addEventListener('resize', debounce(() => this.handleResize(), 250));
  }

  handleResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateParticles() {
    if (!this.particles) return;

    const positions = this.particles.geometry.attributes.position.array;

    // Smooth mouse following
    this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, 0.05);
    this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, 0.05);

    // Mouse position in 3D space
    const mouseX = this.mouse.x * 400;
    const mouseY = this.mouse.y * 400;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Current position
      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      // Original position
      const origX = this.originalPositions[i].x;
      const origY = this.originalPositions[i].y;
      const origZ = this.originalPositions[i].z;

      // Distance from mouse
      const dx = x - mouseX;
      const dy = y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repel from mouse
      const repelRadius = 150;
      if (dist < repelRadius) {
        const force = (1 - dist / repelRadius) * 5;
        x += (dx / dist) * force;
        y += (dy / dist) * force;
      }

      // Gentle drift
      x += this.particleVelocities[i].x;
      y += this.particleVelocities[i].y;
      z += this.particleVelocities[i].z;

      // Pull back to original position
      x = lerp(x, origX, 0.01);
      y = lerp(y, origY, 0.01);
      z = lerp(z, origZ, 0.01);

      // Boundary check
      if (Math.abs(x - origX) > 200) x = origX;
      if (Math.abs(y - origY) > 200) y = origY;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Gentle rotation
    this.particles.rotation.y += 0.0002;
    this.particles.rotation.x += 0.0001;
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.updateParticles();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.scene.remove(this.particles);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    this.isInitialized = false;
  }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleField;
}

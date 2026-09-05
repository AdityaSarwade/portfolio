/**
 * Git Branch Timeline Visualization
 */

class GitTimeline {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Timeline container #${containerId} not found`);
      return;
    }

    this.milestones = this.defineMilestones();
    this.svg = null;
    this.isInitialized = false;
  }

  defineMilestones() {
    return [
      {
        id: 'schooling',
        branch: 'main',
        year: '2008-2018',
        title: 'Schooling',
        description: "St. Mira's Heritage Academy, Bangalore",
        color: '#4CAF50',
        icon: '🏫'
      },
      {
        id: 'junior-college',
        branch: 'main',
        year: '2018-2020',
        title: 'Pre-University (Junior College)',
        description: 'Jain College, Jayanagar',
        color: '#00bcd4',
        icon: '📚'
      },
      {
        id: 'university',
        branch: 'main',
        year: '2020-2024',
        title: 'Graduated, B.Tech in CSE',
        description: 'Dayananda Sagar University',
        color: '#2196F3',
        icon: '🎓',
        createBranch: 'experience'
      },
      {
        id: 'snive',
        branch: 'experience',
        year: '2023',
        title: 'Founding ML Engineer',
        description: 'Snive (Text-to-Image & Generative ML)',
        color: '#FF9800',
        icon: '🚀'
      },
      {
        id: 'iron-mountain',
        branch: 'main',
        year: '2024-Present',
        title: 'Associate AI Engineer',
        description: 'Iron Mountain (Enterprise AI, Agents & Search)',
        color: '#9C27B0',
        icon: '⭐',
        isCurrent: true,
        mergeBranch: 'experience'
      }
    ];
  }

  init() {
    if (this.isInitialized) return;

    this.createSVG();
    this.drawTimeline();
    this.setupInteractivity();
    this.isInitialized = true;
  }

  createSVG() {
    const width = 900;
    const height = 620;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Add defs for gradients and filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Gradient for commits
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'commit-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#00d4ff;stop-opacity:1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', 'stop-color:#7b2cbf;stop-opacity:1');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'coloredBlur');

    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');

    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);

    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);

    defs.appendChild(gradient);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    this.container.appendChild(this.svg);
  }

  drawTimeline() {
    const startX = 180;
    const startY = 70;
    const verticalSpacing = 110;
    const branchOffset = 180;

    // Track branch positions
    const branches = {
      main: { x: startX, y: startY },
      experience: { x: startX + branchOffset, y: 0 }
    };

    let currentY = startY;
    const mainPath = [];

    // Draw main branch path first
    this.milestones.forEach((milestone, index) => {
      if (milestone.branch === 'main') {
        currentY = startY + (index * verticalSpacing);
        mainPath.push({ x: startX, y: currentY, milestone });
      }
    });

    // Draw main branch line
    const mainLine = this.createPath(
      mainPath.map(p => ({ x: p.x, y: p.y })),
      'url(#commit-gradient)',
      3
    );
    mainLine.classList.add('timeline-path');
    this.svg.appendChild(mainLine);

    // Draw commits and branches
    let experienceY = 0;

    this.milestones.forEach((milestone, index) => {
      const baseY = startY + (index * verticalSpacing);

      if (milestone.branch === 'main') {
        // Main branch commit
        this.drawCommit(startX, baseY, milestone);

        // Handle branch creation
        if (milestone.createBranch === 'experience') {
          experienceY = baseY + verticalSpacing;
          branches.experience.y = experienceY;
        }

        // Handle merge
        if (milestone.mergeBranch) {
          const mergeFromX = branches.experience.x;
          const mergeFromY = experienceY;

          const mergePath = this.createCurvePath(
            mergeFromX, mergeFromY,
            startX, baseY,
            milestone.color
          );
          mergePath.classList.add('timeline-branch');
          this.svg.appendChild(mergePath);
        }

      } else if (milestone.branch === 'experience') {
        // Experience branch
        const branchX = branches.experience.x;

        // Branch off line
        const branchPath = this.createCurvePath(
          startX, baseY - verticalSpacing,
          branchX, baseY,
          milestone.color
        );
        branchPath.classList.add('timeline-branch');
        this.svg.appendChild(branchPath);

        this.drawCommit(branchX, baseY, milestone);
        experienceY = baseY;
      }
    });
  }

  createPath(points, stroke, strokeWidth) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    path.setAttribute('d', d);
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');

    return path;
  }

  createCurvePath(x1, y1, x2, y2, color) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.5;
    const cy2 = y2;

    const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.7');

    return path;
  }

  drawCommit(x, y, milestone) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('timeline-commit');
    if (milestone.isCurrent) {
      g.classList.add('timeline-current');
    }
    g.setAttribute('data-id', milestone.id);

    // Commit circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', milestone.isCurrent ? 12 : 8);
    circle.setAttribute('fill', milestone.color);
    circle.setAttribute('filter', 'url(#glow)');

    // Year label (anchored to the right so it aligns before the commit)
    const yearText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yearText.setAttribute('x', x - 25);
    yearText.setAttribute('y', y + 5);
    yearText.setAttribute('text-anchor', 'end');
    yearText.setAttribute('class', 'timeline-year');
    yearText.textContent = milestone.year;

    // Title
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', x + 25);
    titleText.setAttribute('y', y - 6);
    titleText.setAttribute('class', 'timeline-title');
    titleText.textContent = `${milestone.icon} ${milestone.title}`;

    // Description
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', x + 25);
    descText.setAttribute('y', y + 16);
    descText.setAttribute('class', 'timeline-description');
    descText.textContent = milestone.description;

    g.appendChild(circle);
    g.appendChild(yearText);
    g.appendChild(titleText);
    g.appendChild(descText);

    this.svg.appendChild(g);
  }

  setupInteractivity() {
    const commits = this.svg.querySelectorAll('.timeline-commit');

    commits.forEach(commit => {
      commit.style.cursor = 'pointer';

      commit.addEventListener('mouseenter', () => {
        commit.style.opacity = '1';
      });

      commit.addEventListener('mouseleave', () => {
        commit.style.opacity = '';
      });
    });
  }

  animate() {
    if (!window.gsap) {
      console.warn('GSAP not loaded, skipping timeline animation');
      return;
    }

    // Animate path drawing
    const paths = this.svg.querySelectorAll('.timeline-path');
    paths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut'
      });
    });

    // Animate commits appearing
    const commits = this.svg.querySelectorAll('.timeline-commit');
    gsap.from(commits, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      stagger: 0.2,
      delay: 0.5,
      ease: 'back.out(1.7)'
    });

    // Animate branch lines
    const branches = this.svg.querySelectorAll('.timeline-branch');
    gsap.from(branches, {
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      delay: 1
    });
  }

  destroy() {
    if (this.svg) {
      this.container.removeChild(this.svg);
      this.svg = null;
    }
    this.isInitialized = false;
  }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitTimeline;
}

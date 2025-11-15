# Anime.js Marketing Animations & Visual Strategy

## 🎯 Overview

Comprehensive guide for using Anime.js to create stunning, attention-grabbing animations for SEO product marketing, reports, and client demos.

## 🎨 Animation Philosophy

### Core Principles

1. **Purpose-Driven** - Every animation serves a clear goal
2. **Attention-Focusing** - Guide eyes to key information
3. **Performance-First** - 60fps, < 100ms delays
4. **Accessible** - Respect prefers-reduced-motion
5. **Brand-Consistent** - Match LightDom visual identity

### When to Use Animation

✅ **Use animations for:**
- Highlighting improvements (SEO score increases)
- Data transitions (before/after comparisons)
- Progressive disclosure (revealing insights)
- Celebratory moments (goals achieved)
- Interactive elements (hover states, clicks)
- Loading states (progress indicators)

❌ **Avoid animations for:**
- Critical information (must be readable)
- Rapid repetition (can cause seizures)
- Blocking interactions (frustrating users)
- Decoration only (adds load time)

## 📊 SEO Report Animations

### 1. Score Progress Animation

**Use Case:** Show SEO score improvement over time

```javascript
import anime from 'animejs';

class SEOScoreAnimation {
  animateScore(element, from, to) {
    // Counter animation
    const obj = { score: from };
    
    anime({
      targets: obj,
      score: to,
      duration: 2000,
      easing: 'easeOutExpo',
      round: 1,
      update: function() {
        element.textContent = obj.score;
      }
    });
    
    // Progress ring animation
    anime({
      targets: element.querySelector('.progress-ring'),
      strokeDashoffset: [
        anime.setDashoffset,
        this.calculateDashOffset(to)
      ],
      duration: 2000,
      easing: 'easeOutExpo',
      delay: 200
    });
    
    // Pulse effect on completion
    anime({
      targets: element,
      scale: [1, 1.05, 1],
      duration: 400,
      delay: 2000,
      easing: 'easeInOutQuad'
    });
  }
  
  calculateDashOffset(score) {
    const circumference = 2 * Math.PI * 50; // radius = 50
    return circumference - (score / 100) * circumference;
  }
}
```

**HTML Structure:**
```html
<div class="seo-score-widget">
  <svg class="progress-ring" width="120" height="120">
    <circle
      class="progress-ring-bg"
      stroke="#2a2f3e"
      stroke-width="10"
      fill="transparent"
      r="50"
      cx="60"
      cy="60"
    />
    <circle
      class="progress-ring"
      stroke="#5865F2"
      stroke-width="10"
      fill="transparent"
      r="50"
      cx="60"
      cy="60"
      style="stroke-dasharray: 314.159; stroke-dashoffset: 314.159;"
    />
  </svg>
  <div class="score-value">0</div>
  <div class="score-label">SEO Score</div>
</div>
```

### 2. Metric Comparison Animation

**Use Case:** Before/after comparisons

```javascript
class MetricComparisonAnimation {
  animateComparison(containerId, beforeData, afterData) {
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1000
    });
    
    // 1. Fade in "Before" state
    timeline.add({
      targets: `${containerId} .before`,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100)
    });
    
    // 2. Highlight problems
    timeline.add({
      targets: `${containerId} .before .issue`,
      backgroundColor: ['transparent', '#FF4444'],
      scale: [1, 1.05, 1],
      duration: 600,
      delay: anime.stagger(150)
    }, '+=500');
    
    // 3. Transition to "After"
    timeline.add({
      targets: `${containerId} .before`,
      opacity: [1, 0],
      translateX: [-50, -100],
      duration: 600
    });
    
    timeline.add({
      targets: `${containerId} .after`,
      opacity: [0, 1],
      translateX: [100, 0],
      duration: 600
    }, '-=400');
    
    // 4. Celebrate improvements
    timeline.add({
      targets: `${containerId} .after .improvement`,
      backgroundColor: ['transparent', '#00C851'],
      scale: [1, 1.1, 1],
      duration: 600,
      delay: anime.stagger(150)
    });
    
    // 5. Show sparkles
    this.createSparkles(`${containerId} .after`);
    
    return timeline;
  }
  
  createSparkles(selector) {
    const container = document.querySelector(selector);
    const sparkleCount = 10;
    
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerHTML = '✨';
      container.appendChild(sparkle);
      
      anime({
        targets: sparkle,
        translateX: () => anime.random(-50, 50),
        translateY: () => anime.random(-50, -100),
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        duration: 1500,
        delay: i * 100,
        easing: 'easeOutQuad',
        complete: () => sparkle.remove()
      });
    }
  }
}
```

### 3. Interactive Infographic

**Use Case:** Product feature showcase

```javascript
class InteractiveInfographic {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
    this.setupSections();
  }
  
  setupSections() {
    const sections = this.container.querySelectorAll('.feature-section');
    
    // Create scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateSection(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));
  }
  
  animateSection(section) {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    // 1. Title reveal
    timeline.add({
      targets: section.querySelector('.feature-title'),
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600
    });
    
    // 2. Icon animation
    timeline.add({
      targets: section.querySelector('.feature-icon'),
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [0, 360],
      duration: 800
    }, '-=300');
    
    // 3. Description stagger
    timeline.add({
      targets: section.querySelectorAll('.feature-point'),
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: anime.stagger(150),
      duration: 500
    }, '-=400');
    
    // 4. Pulse attention to CTA
    timeline.add({
      targets: section.querySelector('.cta-button'),
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0 rgba(88, 101, 242, 0)',
        '0 0 0 10px rgba(88, 101, 242, 0.3)',
        '0 0 0 0 rgba(88, 101, 242, 0)'
      ],
      duration: 1000
    });
  }
  
  // Hover interactions
  addHoverEffects() {
    const features = this.container.querySelectorAll('.feature-card');
    
    features.forEach(card => {
      card.addEventListener('mouseenter', () => {
        anime({
          targets: card,
          scale: 1.05,
          translateY: -5,
          boxShadow: '0 10px 30px rgba(88, 101, 242, 0.3)',
          duration: 300,
          easing: 'easeOutQuad'
        });
        
        // Animate internal elements
        anime({
          targets: card.querySelector('.feature-icon'),
          rotate: [0, 15, -15, 0],
          duration: 600,
          easing: 'easeInOutSine'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        anime({
          targets: card,
          scale: 1,
          translateY: 0,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          duration: 300,
          easing: 'easeOutQuad'
        });
      });
    });
  }
}
```

## 📈 Chart & Data Animations

### 1. Animated Bar Chart

```javascript
class AnimatedBarChart {
  animateChart(data) {
    // Animate bars growing
    anime({
      targets: '.bar',
      height: function(el, i) {
        return (data[i] / Math.max(...data)) * 200 + 'px';
      },
      easing: 'easeOutExpo',
      duration: 1500,
      delay: anime.stagger(100)
    });
    
    // Animate values counting up
    data.forEach((value, i) => {
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: value,
        round: 1,
        duration: 1500,
        delay: i * 100,
        easing: 'easeOutExpo',
        update: function() {
          document.querySelector(`.bar[data-index="${i}"] .value`).textContent = obj.val;
        }
      });
    });
  }
}
```

### 2. Line Chart Animation

```javascript
class AnimatedLineChart {
  animatePath(svgPath, duration = 2000) {
    const path = document.querySelector(svgPath);
    const length = path.getTotalLength();
    
    // Set up the starting positions
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    
    // Animate
    anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: duration,
      easing: 'easeInOutQuad',
      complete: () => {
        // Animate data points appearing
        this.animateDataPoints();
      }
    });
  }
  
  animateDataPoints() {
    anime({
      targets: '.data-point',
      scale: [0, 1],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 400,
      easing: 'easeOutBack'
    });
  }
}
```

## 🎬 Product Demo Animations

### 1. Feature Tour

```javascript
class FeatureTour {
  constructor() {
    this.currentStep = 0;
    this.steps = document.querySelectorAll('.tour-step');
  }
  
  start() {
    this.showStep(0);
  }
  
  showStep(index) {
    if (index >= this.steps.length) {
      this.complete();
      return;
    }
    
    const step = this.steps[index];
    const timeline = anime.timeline();
    
    // 1. Focus on element
    timeline.add({
      targets: step.dataset.target,
      scale: [1, 1.1],
      boxShadow: [
        '0 0 0 0 rgba(88, 101, 242, 0)',
        '0 0 0 20px rgba(88, 101, 242, 0.4)'
      ],
      duration: 600,
      easing: 'easeOutQuad'
    });
    
    // 2. Show tooltip
    timeline.add({
      targets: step,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400
    }, '-=300');
    
    // 3. Animate arrow pointing
    timeline.add({
      targets: step.querySelector('.arrow'),
      translateY: [-5, 5],
      duration: 600,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    this.currentStep = index;
  }
  
  next() {
    anime({
      targets: this.steps[this.currentStep],
      opacity: [1, 0],
      translateY: [0, -20],
      duration: 300,
      complete: () => {
        this.showStep(this.currentStep + 1);
      }
    });
  }
}
```

### 2. Onboarding Flow

```javascript
class OnboardingAnimation {
  animateStep(stepNumber) {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    // Progress bar
    timeline.add({
      targets: '.progress-fill',
      width: `${(stepNumber / 4) * 100}%`,
      duration: 600
    });
    
    // Step indicator
    timeline.add({
      targets: `.step-${stepNumber}`,
      scale: [1, 1.2, 1],
      backgroundColor: ['#2a2f3e', '#5865F2'],
      duration: 400
    }, '-=300');
    
    // Content transition
    timeline.add({
      targets: '.step-content',
      opacity: [1, 0],
      translateX: [0, -50],
      duration: 300,
      complete: () => {
        // Load new content
        this.loadStepContent(stepNumber);
      }
    });
    
    // New content entrance
    timeline.add({
      targets: '.step-content',
      opacity: [0, 1],
      translateX: [50, 0],
      duration: 400
    });
  }
}
```

## 🎯 Attention-Focusing Techniques

### 1. Spotlight Effect

```javascript
class SpotlightEffect {
  highlight(element) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'spotlight-overlay';
    document.body.appendChild(overlay);
    
    // Darken everything
    anime({
      targets: overlay,
      opacity: [0, 0.8],
      duration: 400
    });
    
    // Highlight target
    const rect = element.getBoundingClientRect();
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    spotlight.style.cssText = `
      position: fixed;
      top: ${rect.top - 10}px;
      left: ${rect.left - 10}px;
      width: ${rect.width + 20}px;
      height: ${rect.height + 20}px;
      border: 3px solid #5865F2;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8);
      z-index: 10000;
    `;
    document.body.appendChild(spotlight);
    
    // Pulse animation
    anime({
      targets: spotlight,
      scale: [0.95, 1],
      duration: 1000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  }
  
  remove() {
    anime({
      targets: ['.spotlight-overlay', '.spotlight'],
      opacity: [1, 0],
      duration: 300,
      complete: function() {
        document.querySelectorAll('.spotlight-overlay, .spotlight')
          .forEach(el => el.remove());
      }
    });
  }
}
```

### 2. Pulse Attention

```javascript
function pulseAttention(selector, options = {}) {
  const defaults = {
    scale: 1.05,
    duration: 1000,
    iterations: 3
  };
  
  const settings = { ...defaults, ...options };
  
  anime({
    targets: selector,
    scale: [1, settings.scale, 1],
    duration: settings.duration,
    easing: 'easeInOutQuad',
    loop: settings.iterations
  });
}

// Usage
pulseAttention('.important-metric', { scale: 1.1, iterations: 5 });
```

### 3. Arrow Pointer

```javascript
class ArrowPointer {
  point(targetElement, message) {
    const arrow = document.createElement('div');
    arrow.className = 'animated-arrow';
    arrow.innerHTML = `
      <div class="arrow-message">${message}</div>
      <svg class="arrow-svg" viewBox="0 0 100 100">
        <path d="M 10 50 L 70 50 L 60 40 M 70 50 L 60 60" 
              stroke="#5865F2" 
              stroke-width="3" 
              fill="none"/>
      </svg>
    `;
    
    document.body.appendChild(arrow);
    
    // Position near target
    const rect = targetElement.getBoundingClientRect();
    arrow.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left - 150}px;
    `;
    
    // Animate entrance
    const timeline = anime.timeline();
    
    timeline.add({
      targets: arrow,
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 400
    });
    
    // Bounce animation
    timeline.add({
      targets: arrow.querySelector('.arrow-svg'),
      translateX: [0, 10],
      duration: 600,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  }
}
```

## 🎨 Free Site Evaluation Animation

### Landing Page Demo

```javascript
class FreeEvaluationDemo {
  async runDemo() {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    // 1. Hero entrance
    timeline.add({
      targets: '.hero-title',
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 800
    });
    
    timeline.add({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600
    }, '-=400');
    
    // 2. Form highlight
    timeline.add({
      targets: '.evaluation-form',
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 600
    }, '-=200');
    
    // 3. URL input animation
    this.typewriterEffect('.url-input', 'example.com');
    
    // 4. Scan button pulse
    timeline.add({
      targets: '.scan-button',
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 0 0 0 rgba(88, 101, 242, 0)',
        '0 0 0 15px rgba(88, 101, 242, 0.4)',
        '0 0 0 0 rgba(88, 101, 242, 0)'
      ],
      duration: 1500
    });
    
    // 5. Simulate scan
    await this.simulateScan();
    
    // 6. Show results
    this.showResults();
  }
  
  typewriterEffect(selector, text) {
    const element = document.querySelector(selector);
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.value += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);
  }
  
  async simulateScan() {
    // Show progress
    anime({
      targets: '.scan-progress',
      width: ['0%', '100%'],
      duration: 3000,
      easing: 'easeInOutQuad'
    });
    
    // Scanning messages
    const messages = [
      'Analyzing page structure...',
      'Checking meta tags...',
      'Evaluating Core Web Vitals...',
      'Scanning for SEO issues...',
      'Generating recommendations...'
    ];
    
    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => {
        anime({
          targets: '.scan-message',
          opacity: [1, 0],
          duration: 300,
          complete: () => {
            document.querySelector('.scan-message').textContent = messages[i];
            anime({
              targets: '.scan-message',
              opacity: [0, 1],
              duration: 300,
              complete: resolve
            });
          }
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }
  
  showResults() {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    // Hide scanner
    timeline.add({
      targets: '.scanner',
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 400
    });
    
    // Show results container
    timeline.add({
      targets: '.results-container',
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 600
    });
    
    // Animate score gauge
    timeline.add({
      targets: '.score-gauge',
      rotate: [0, 180], // Simulating gauge needle
      duration: 2000,
      easing: 'easeOutElastic(1, .8)'
    }, '-=400');
    
    // Show issues found
    timeline.add({
      targets: '.issue-card',
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(150),
      duration: 500
    });
    
    // Pulse CTA
    timeline.add({
      targets: '.upgrade-cta',
      scale: [1, 1.05, 1],
      backgroundColor: ['#5865F2', '#7C5CFF', '#5865F2'],
      duration: 1000,
      loop: 3
    });
  }
}
```

## 📊 Monthly Report Animation

### Email Report Preview

```javascript
class MonthlyReportAnimation {
  generateReport(data) {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    // 1. Header entrance
    timeline.add({
      targets: '.report-header',
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 600
    });
    
    // 2. Key metrics cards
    timeline.add({
      targets: '.metric-card',
      opacity: [0, 1],
      translateY: [50, 0],
      rotate: [-5, 0],
      delay: anime.stagger(100),
      duration: 600
    });
    
    // 3. Celebrate improvements
    const improvements = document.querySelectorAll('.metric-card.improved');
    improvements.forEach(card => {
      this.celebrateImprovement(card);
    });
    
    // 4. Chart animations
    timeline.add({
      targets: '.chart-container',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600
    });
    
    // 5. Recommendations section
    timeline.add({
      targets: '.recommendations',
      opacity: [0, 1],
      duration: 600
    });
    
    timeline.add({
      targets: '.recommendation-item',
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: anime.stagger(100),
      duration: 400
    });
  }
  
  celebrateImprovement(element) {
    // Confetti effect
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = ['#5865F2', '#7C5CFF', '#00C851'][i % 3];
      element.appendChild(confetti);
      
      anime({
        targets: confetti,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, -200),
        rotate: () => anime.random(0, 360),
        scale: [1, 0],
        opacity: [1, 0],
        duration: 2000,
        delay: i * 50,
        easing: 'easeOutQuad',
        complete: () => confetti.remove()
      });
    }
    
    // Card highlight
    anime({
      targets: element,
      backgroundColor: ['#1a1f2e', '#2a2f3e', '#1a1f2e'],
      duration: 1000,
      easing: 'easeInOutQuad'
    });
  }
}
```

## ⚡ Performance Optimization

### Best Practices

```javascript
class PerformanceOptimizedAnimations {
  constructor() {
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }
  
  animate(config) {
    if (this.prefersReducedMotion) {
      // Skip animation, apply end state
      this.applyEndState(config);
      return;
    }
    
    // Use will-change for better performance
    const targets = document.querySelectorAll(config.targets);
    targets.forEach(el => {
      el.style.willChange = 'transform, opacity';
    });
    
    // Run animation
    const animation = anime({
      ...config,
      complete: () => {
        // Clean up will-change
        targets.forEach(el => {
          el.style.willChange = 'auto';
        });
        
        if (config.complete) config.complete();
      }
    });
    
    return animation;
  }
  
  applyEndState(config) {
    const targets = document.querySelectorAll(config.targets);
    // Apply final values immediately
    targets.forEach(el => {
      if (config.opacity) el.style.opacity = Array.isArray(config.opacity) 
        ? config.opacity[config.opacity.length - 1] 
        : config.opacity;
      if (config.translateY) el.style.transform = 'translateY(0)';
      // ... apply other properties
    });
  }
}
```

### GPU Acceleration

```css
/* Ensure GPU acceleration */
.animated-element {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}
```

## 🎯 Call-to-Action Animations

### Pulsing Button

```javascript
function animateCTA(selector) {
  anime({
    targets: selector,
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(88, 101, 242, 0.7)',
      '0 0 0 20px rgba(88, 101, 242, 0)',
      '0 0 0 0 rgba(88, 101, 242, 0)'
    ],
    duration: 2000,
    easing: 'easeInOutQuad',
    loop: true
  });
}
```

### Hover Effects

```javascript
document.querySelectorAll('.cta-button').forEach(button => {
  button.addEventListener('mouseenter', () => {
    anime({
      targets: button,
      scale: 1.1,
      backgroundColor: '#7C5CFF',
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    // Animate icon
    anime({
      targets: button.querySelector('.icon'),
      translateX: [0, 5],
      duration: 300,
      easing: 'easeOutQuad'
    });
  });
  
  button.addEventListener('mouseleave', () => {
    anime({
      targets: button,
      scale: 1,
      backgroundColor: '#5865F2',
      duration: 300,
      easing: 'easeOutQuad'
    });
    
    anime({
      targets: button.querySelector('.icon'),
      translateX: [5, 0],
      duration: 300,
      easing: 'easeOutQuad'
    });
  });
});
```

## 📚 Complete Example: Product Showcase

```javascript
class ProductShowcase {
  async run() {
    // 1. Hero section
    await this.animateHero();
    
    // 2. Features tour
    await this.animateFeatures();
    
    // 3. Pricing comparison
    await this.animatePricing();
    
    // 4. Testimonials
    await this.animateTestimonials();
    
    // 5. Final CTA
    await this.animateFinalCTA();
  }
  
  async animateHero() {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });
    
    timeline.add({
      targets: '.hero-title',
      opacity: [0, 1],
      translateY: [100, 0],
      duration: 1000
    });
    
    timeline.add({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 800
    }, '-=700');
    
    timeline.add({
      targets: '.hero-cta',
      opacity: [0, 1],
      scale: [0, 1],
      duration: 600
    }, '-=400');
    
    // Floating elements
    anime({
      targets: '.floating-element',
      translateY: [-10, 10],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: anime.stagger(200)
    });
    
    return timeline.finished;
  }
  
  // ... more methods
}
```

---

**Last Updated:** 2024-11-14  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation

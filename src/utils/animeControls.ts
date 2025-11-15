/**
 * Anime.js Advanced Animation Controls System
 * 
 * Comprehensive animation control utilities inspired by animejs.com
 * Features: Timelines, stagger effects, SVG animations, interactive controls
 */

import anime from 'animejs/lib/anime.es.js';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AnimationConfig {
  targets: string | HTMLElement | HTMLElement[];
  duration?: number;
  delay?: number;
  easing?: string;
  autoplay?: boolean;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface ControlledAnimation {
  instance: any; // anime.AnimeInstance or anime.AnimeTimelineInstance
  play: () => void;
  pause: () => void;
  restart: () => void;
  reverse: () => void;
  seek: (time: number) => void;
  isPlaying: () => boolean;
  getProgress: () => number;
}

// ============================================================================
// Core Animation Factory with Controls
// ============================================================================

/**
 * Create a controlled animation instance with full playback controls
 */
export function createControlledAnimation(config: any): ControlledAnimation {
  const instance = anime({
    ...config,
    autoplay: config.autoplay ?? false,
  });

  return {
    instance,
    play: () => instance.play(),
    pause: () => instance.pause(),
    restart: () => instance.restart(),
    reverse: () => instance.reverse(),
    seek: (time: number) => instance.seek(time),
    isPlaying: () => !instance.paused && instance.began && !instance.completed,
    getProgress: () => instance.progress,
  };
}

/**
 * Create a timeline with multiple animation steps
 */
export function createTimeline(config?: any): any {
  return anime.timeline({
    easing: 'easeOutExpo',
    duration: 750,
    ...config,
  });
}

// ============================================================================
// Product Showcase Animations
// ============================================================================

/**
 * Hero product entrance - dramatic reveal with multiple stages
 */
export function productHeroEntrance(target: string | HTMLElement) {
  const tl = createTimeline();
  
  tl.add({
    targets: target,
    opacity: [0, 1],
    scale: [0.8, 1],
    translateY: [60, 0],
    duration: 1200,
    easing: 'easeOutExpo',
  })
  .add({
    targets: `${target} .product-title`,
    opacity: [0, 1],
    translateY: [30, 0],
    delay: anime.stagger(100),
    duration: 800,
  }, '-=600')
  .add({
    targets: `${target} .product-features`,
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(150, {start: 200}),
    duration: 600,
  }, '-=400');

  return tl;
}

/**
 * Feature card stagger animation for product features
 */
export function featureCardsStagger(target: string | HTMLElement, options = {}) {
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: [40, 0],
    scale: [0.9, 1],
    rotate: [2, 0],
    delay: anime.stagger(100, {
      from: 'center',
      ...options
    }),
    duration: 800,
    easing: 'easeOutElastic(1, .8)',
    autoplay: false,
  });
}

/**
 * Product rotation 3D effect
 */
export function product3DRotation(target: string | HTMLElement) {
  return anime({
    targets: target,
    rotateY: ['0deg', '360deg'],
    duration: 3000,
    easing: 'easeInOutQuad',
    loop: true,
    autoplay: false,
  });
}

/**
 * Floating animation for product images
 */
export function productFloating(target: string | HTMLElement) {
  return anime({
    targets: target,
    translateY: [-10, 10],
    duration: 2000,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    autoplay: false,
  });
}

// ============================================================================
// Data Visualization Animations
// ============================================================================

/**
 * Animated counter for statistics and metrics
 */
export function animatedCounter(
  target: string | HTMLElement,
  from: number,
  to: number,
  duration: number = 2000
) {
  const obj = { value: from };
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  
  return anime({
    targets: obj,
    value: to,
    round: 1,
    duration,
    easing: 'easeOutExpo',
    update: () => {
      if (element) {
        element.textContent = obj.value.toLocaleString();
      }
    },
    autoplay: false,
  });
}

/**
 * Progress bar animation with smooth fill
 */
export function progressBarAnimation(target: string | HTMLElement, toPercent: number) {
  return anime({
    targets: target,
    width: [`0%`, `${toPercent}%`],
    duration: 1500,
    easing: 'easeOutQuart',
    autoplay: false,
  });
}

/**
 * Chart bars animation - staggered growth
 */
export function chartBarsAnimation(target: string | HTMLElement) {
  return anime({
    targets: target,
    height: (el: HTMLElement) => {
      const finalHeight = el.getAttribute('data-height') || '100%';
      return [0, finalHeight];
    },
    delay: anime.stagger(100),
    duration: 1200,
    easing: 'easeOutElastic(1, .6)',
    autoplay: false,
  });
}

// ============================================================================
// Interactive Micro-animations
// ============================================================================

/**
 * Button magnetic effect - follows cursor
 */
export function buttonMagnetic(buttonEl: HTMLElement, strength: number = 20) {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = buttonEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    anime({
      targets: buttonEl,
      translateX: deltaX * strength,
      translateY: deltaY * strength,
      duration: 400,
      easing: 'easeOutQuad',
    });
  };
  
  const handleMouseLeave = () => {
    anime({
      targets: buttonEl,
      translateX: 0,
      translateY: 0,
      duration: 600,
      easing: 'easeOutElastic(1, .6)',
    });
  };
  
  buttonEl.addEventListener('mousemove', handleMouseMove);
  buttonEl.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    buttonEl.removeEventListener('mousemove', handleMouseMove);
    buttonEl.removeEventListener('mouseleave', handleMouseLeave);
  };
}

/**
 * Ripple effect on click
 */
export function rippleEffect(target: string | HTMLElement, x: number, y: number) {
  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '20px';
  ripple.style.height = '20px';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = 'rgba(88, 101, 242, 0.4)';
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';
  
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (container) {
    container.appendChild(ripple);
    
    anime({
      targets: ripple,
      scale: [0, 20],
      opacity: [0.8, 0],
      duration: 800,
      easing: 'easeOutExpo',
      complete: () => ripple.remove(),
    });
  }
}

// ============================================================================
// SVG Path Animations
// ============================================================================

/**
 * SVG path drawing animation
 */
export function svgDrawAnimation(target: string | HTMLElement) {
  const path = typeof target === 'string' ? document.querySelector(target) : target;
  if (!path || !(path instanceof SVGPathElement)) return null;
  
  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;
  
  return anime({
    targets: path,
    strokeDashoffset: [length, 0],
    duration: 2000,
    easing: 'easeInOutSine',
    autoplay: false,
  });
}

/**
 * SVG morph animation between paths
 */
export function svgMorphAnimation(target: string | HTMLElement, toPath: string) {
  return anime({
    targets: target,
    d: toPath,
    duration: 1000,
    easing: 'easeInOutQuad',
    autoplay: false,
  });
}

// ============================================================================
// Text Animations
// ============================================================================

/**
 * Text reveal with letter-by-letter animation
 */
export function textRevealAnimation(target: string | HTMLElement) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;
  
  const text = element.textContent || '';
  element.innerHTML = text.split('').map(char => 
    `<span style="display:inline-block;opacity:0">${char === ' ' ? '&nbsp;' : char}</span>`
  ).join('');
  
  return anime({
    targets: `${typeof target === 'string' ? target : ''} span`,
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(50),
    duration: 600,
    easing: 'easeOutExpo',
    autoplay: false,
  });
}

/**
 * Typewriter effect
 */
export function typewriterAnimation(target: string | HTMLElement, text: string, speed: number = 50) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;
  
  element.textContent = '';
  const chars = text.split('');
  let index = 0;
  
  return anime({
    targets: { index: 0 },
    index: chars.length,
    round: 1,
    duration: chars.length * speed,
    easing: 'linear',
    update: (anim) => {
      const currentIndex = Math.floor(anim.animations[0].currentValue);
      if (currentIndex > index) {
        element.textContent += chars[index];
        index++;
      }
    },
    autoplay: false,
  });
}

// ============================================================================
// Scroll-triggered Animations
// ============================================================================

/**
 * Create scroll-triggered animation
 */
export function createScrollAnimation(
  target: string | HTMLElement,
  animationConfig: anime.AnimeParams,
  offset: number = 0.8
) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          anime({
            targets: element,
            ...animationConfig,
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: offset }
  );
  
  observer.observe(element as Element);
  
  return () => observer.disconnect();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Create accessible animation that respects user preferences
 */
export function createAccessibleAnimation(config: any): ControlledAnimation | null {
  if (prefersReducedMotion()) {
    // Apply instant changes without animation
    const targets = config.targets;
    const element = typeof targets === 'string' ? document.querySelector(targets) : targets;
    if (element) {
      Object.keys(config).forEach(key => {
        if (key !== 'targets' && key !== 'duration' && key !== 'delay') {
          const value = config[key as keyof anime.AnimeParams];
          if (Array.isArray(value)) {
            // Apply final value immediately
            (element as any)[key] = value[value.length - 1];
          }
        }
      });
    }
    return null;
  }
  
  return createControlledAnimation(config);
}

// ============================================================================
// Preset Animation Bundles
// ============================================================================

/**
 * Product page complete animation suite
 */
export function productPageAnimations(containerSelector: string) {
  return {
    hero: productHeroEntrance(`${containerSelector} .hero`),
    features: featureCardsStagger(`${containerSelector} .feature-card`),
    stats: animatedCounter(`${containerSelector} .stat-value`, 0, 1000),
    cta: buttonMagnetic(document.querySelector(`${containerSelector} .cta-button`) as HTMLElement),
  };
}

export default {
  createControlledAnimation,
  createTimeline,
  productHeroEntrance,
  featureCardsStagger,
  product3DRotation,
  productFloating,
  animatedCounter,
  progressBarAnimation,
  chartBarsAnimation,
  buttonMagnetic,
  rippleEffect,
  svgDrawAnimation,
  svgMorphAnimation,
  textRevealAnimation,
  typewriterAnimation,
  createScrollAnimation,
  prefersReducedMotion,
  createAccessibleAnimation,
  productPageAnimations,
};

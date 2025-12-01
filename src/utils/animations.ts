/**
 * Animation Utilities
 * 
 * Inspired by animejs.com - providing easy-to-use animation presets
 * and utilities for creating smooth, professional animations throughout
 * the LightDom design system.
 */

import anime from 'animejs';

// =============================================================================
// Animation Presets
// =============================================================================

/**
 * Button hover animation - elastic scale effect
 */
export const buttonHoverAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    scale: [1, 1.05],
    duration: 400,
    easing: 'easeOutElastic(1, .6)',
    autoplay: false,
  });
};

/**
 * Button click animation - bouncy press effect
 */
export const buttonClickAnimation = (target: string | HTMLElement) => {
  return anime.timeline({
    targets: target,
    easing: 'easeInOutQuad',
  })
  .add({
    scale: 0.95,
    duration: 100,
  })
  .add({
    scale: 1.02,
    duration: 150,
  })
  .add({
    scale: 1,
    duration: 100,
  });
};

/**
 * Card entrance animation - staggered reveal
 */
export const cardEntranceAnimation = (target: string | HTMLElement, stagger: number = 100) => {
  return anime({
    targets: target,
    translateY: [40, 0],
    opacity: [0, 1],
    delay: anime.stagger(stagger),
    duration: 800,
    easing: 'easeOutExpo',
  });
};

/**
 * Card hover animation - subtle lift effect
 */
export const cardHoverAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateY: [0, -8],
    boxShadow: [
      '0 4px 6px rgba(88, 101, 242, 0.1)',
      '0 20px 25px rgba(88, 101, 242, 0.2)',
    ],
    duration: 300,
    easing: 'easeOutCubic',
    autoplay: false,
  });
};

/**
 * Menu slide-in animation
 */
export const menuSlideInAnimation = (overlayTarget: string | HTMLElement, itemsTarget: string | HTMLElement) => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo',
  });
  
  timeline
    .add({
      targets: overlayTarget,
      opacity: [0, 1],
      duration: 400,
    })
    .add({
      targets: itemsTarget,
      translateX: [-100, 0],
      opacity: [0, 1],
      delay: anime.stagger(50),
      duration: 400,
    }, '-=200'); // Start 200ms before overlay finishes
  
  return timeline;
};

/**
 * Menu slide-out animation
 */
export const menuSlideOutAnimation = (overlayTarget: string | HTMLElement, itemsTarget: string | HTMLElement) => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo',
  });
  
  timeline
    .add({
      targets: itemsTarget,
      translateX: [0, -100],
      opacity: [1, 0],
      delay: anime.stagger(30, { direction: 'reverse' }),
      duration: 300,
    })
    .add({
      targets: overlayTarget,
      opacity: [1, 0],
      duration: 300,
    }, '-=150');
  
  return timeline;
};

/**
 * Loading pulse animation
 */
export const loadingPulseAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    scale: [1, 1.2, 1],
    opacity: [1, 0.6, 1],
    duration: 1200,
    easing: 'easeInOutQuad',
    loop: true,
  });
};

/**
 * Fade in animation
 */
export const fadeInAnimation = (target: string | HTMLElement, duration: number = 600) => {
  return anime({
    targets: target,
    opacity: [0, 1],
    duration,
    easing: 'easeOutQuad',
  });
};

/**
 * Fade out animation
 */
export const fadeOutAnimation = (target: string | HTMLElement, duration: number = 600) => {
  return anime({
    targets: target,
    opacity: [1, 0],
    duration,
    easing: 'easeOutQuad',
  });
};

/**
 * Scale in animation - for modals/dialogs
 */
export const scaleInAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutBack',
  });
};

/**
 * Scale out animation - for modals/dialogs
 */
export const scaleOutAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: 300,
    easing: 'easeInBack',
  });
};

/**
 * Slide up animation - for toasts/notifications
 */
export const slideUpAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutExpo',
  });
};

/**
 * Slide down animation - for dropdowns
 */
export const slideDownAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 400,
    easing: 'easeOutExpo',
  });
};

/**
 * Shake animation - for error states
 */
export const shakeAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateX: [
      { value: -10, duration: 50 },
      { value: 10, duration: 50 },
      { value: -10, duration: 50 },
      { value: 10, duration: 50 },
      { value: 0, duration: 50 },
    ],
    easing: 'easeInOutSine',
  });
};

/**
 * Ripple effect animation
 */
export const rippleAnimation = (x: number, y: number, container: HTMLElement) => {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  container.appendChild(ripple);
  
  anime({
    targets: ripple,
    scale: [0, 2],
    opacity: [0.8, 0],
    duration: 600,
    easing: 'easeOutQuad',
    complete: () => ripple.remove(),
  });
};

/**
 * Progress bar animation
 */
export const progressBarAnimation = (target: string | HTMLElement, progress: number) => {
  return anime({
    targets: target,
    width: progress + '%',
    duration: 1000,
    easing: 'easeInOutQuad',
  });
};

/**
 * Number counter animation
 */
export const numberCounterAnimation = (
  element: HTMLElement,
  from: number,
  to: number,
  duration: number = 2000
) => {
  const obj = { value: from };
  
  return anime({
    targets: obj,
    value: to,
    duration,
    easing: 'easeOutExpo',
    round: 1,
    update: () => {
      element.textContent = obj.value.toLocaleString();
    },
  });
};

/**
 * Morph path animation (for SVG)
 */
export const morphPathAnimation = (target: string | HTMLElement, newPath: string) => {
  return anime({
    targets: target,
    d: newPath,
    duration: 800,
    easing: 'easeInOutQuad',
  });
};

/**
 * Staggered list animation
 */
export const staggeredListAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(80, { start: 200 }),
    duration: 600,
    easing: 'easeOutExpo',
  });
};

/**
 * Rotate animation - for loading spinners
 */
export const rotateAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    rotate: '1turn',
    duration: 1000,
    easing: 'linear',
    loop: true,
  });
};

/**
 * Bounce animation
 */
export const bounceAnimation = (target: string | HTMLElement) => {
  return anime({
    targets: target,
    translateY: [
      { value: -30, duration: 400, easing: 'easeOutQuad' },
      { value: 0, duration: 400, easing: 'easeInQuad' },
    ],
    loop: true,
  });
};

// =============================================================================
// Easing Functions Reference
// =============================================================================

export const EASING_FUNCTIONS = {
  // Linear
  linear: 'linear',
  
  // Quad
  easeInQuad: 'easeInQuad',
  easeOutQuad: 'easeOutQuad',
  easeInOutQuad: 'easeInOutQuad',
  
  // Cubic
  easeInCubic: 'easeInCubic',
  easeOutCubic: 'easeOutCubic',
  easeInOutCubic: 'easeInOutCubic',
  
  // Quart
  easeInQuart: 'easeInQuart',
  easeOutQuart: 'easeOutQuart',
  easeInOutQuart: 'easeInOutQuart',
  
  // Expo
  easeInExpo: 'easeInExpo',
  easeOutExpo: 'easeOutExpo',
  easeInOutExpo: 'easeInOutExpo',
  
  // Back
  easeInBack: 'easeInBack',
  easeOutBack: 'easeOutBack',
  easeInOutBack: 'easeInOutBack',
  
  // Elastic
  easeInElastic: 'easeInElastic(1, .5)',
  easeOutElastic: 'easeOutElastic(1, .5)',
  easeInOutElastic: 'easeInOutElastic(1, .5)',
  
  // Bounce
  easeInBounce: 'easeInBounce',
  easeOutBounce: 'easeOutBounce',
  easeInOutBounce: 'easeInOutBounce',
};

// =============================================================================
// Animation Utilities
// =============================================================================

/**
 * Create a custom animation with anime.js
 */
export const createAnimation = (options: anime.AnimeParams) => {
  return anime(options);
};

/**
 * Create a timeline for complex animation sequences
 */
export const createTimeline = (options?: anime.AnimeTimelineInstance) => {
  return anime.timeline(options);
};

/**
 * Remove all animations from target
 */
export const removeAnimations = (target: string | HTMLElement) => {
  anime.remove(target);
};

/**
 * Pause animation
 */
export const pauseAnimation = (animation: anime.AnimeInstance) => {
  animation.pause();
};

/**
 * Play animation
 */
export const playAnimation = (animation: anime.AnimeInstance) => {
  animation.play();
};

/**
 * Restart animation
 */
export const restartAnimation = (animation: anime.AnimeInstance) => {
  animation.restart();
};

/**
 * Seek to specific time in animation
 */
export const seekAnimation = (animation: anime.AnimeInstance, time: number) => {
  animation.seek(time);
};

export default {
  // Presets
  buttonHoverAnimation,
  buttonClickAnimation,
  cardEntranceAnimation,
  cardHoverAnimation,
  menuSlideInAnimation,
  menuSlideOutAnimation,
  loadingPulseAnimation,
  fadeInAnimation,
  fadeOutAnimation,
  scaleInAnimation,
  scaleOutAnimation,
  slideUpAnimation,
  slideDownAnimation,
  shakeAnimation,
  rippleAnimation,
  progressBarAnimation,
  numberCounterAnimation,
  morphPathAnimation,
  staggeredListAnimation,
  rotateAnimation,
  bounceAnimation,
  
  // Utilities
  createAnimation,
  createTimeline,
  removeAnimations,
  pauseAnimation,
  playAnimation,
  restartAnimation,
  seekAnimation,
  
  // Constants
  EASING_FUNCTIONS,
};

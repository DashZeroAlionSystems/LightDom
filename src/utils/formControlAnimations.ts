/**
 * Form Control Animation Utilities
 * 
 * Reusable anime.js animation patterns for form controls, buttons, and transitions.
 * Inspired by animejs.com interactive demos and controls.
 * 
 * @see https://animejs.com/documentation/
 */

import anime from 'animejs';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  autoplay?: boolean;
}

export interface FormFieldState {
  isFocused: boolean;
  isValid: boolean;
  hasError: boolean;
  isDisabled: boolean;
}

// =============================================================================
// Button Animations
// =============================================================================

/**
 * Animate button on press - creates a satisfying press effect
 */
export function buttonPressAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 150, easing = 'easeOutQuad' } = options;
  
  return anime.timeline({
    targets: target,
  })
  .add({
    scale: 0.95,
    duration: duration * 0.4,
    easing: 'easeInQuad',
  })
  .add({
    scale: 1,
    duration: duration * 0.6,
    easing,
  });
}

/**
 * Animate button with ripple effect on click
 */
export function buttonRippleAnimation(
  container: HTMLElement,
  x: number,
  y: number,
  options: AnimationOptions = {}
) {
  const { duration = 600, easing = 'easeOutExpo' } = options;
  
  const ripple = document.createElement('span');
  ripple.className = 'anime-ripple';
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: translate(-50%, -50%) scale(0);
    pointer-events: none;
  `;
  
  container.appendChild(ripple);
  
  return anime({
    targets: ripple,
    scale: [0, 4],
    opacity: [1, 0],
    duration,
    easing,
    complete: () => ripple.remove(),
  });
}

/**
 * Button hover effect with scale and shadow
 */
export function buttonHoverEnterAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    scale: 1.05,
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    duration,
    easing,
  });
}

/**
 * Button hover leave effect
 */
export function buttonHoverLeaveAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    scale: 1,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    duration,
    easing,
  });
}

/**
 * Loading button animation - pulsing effect
 */
export function buttonLoadingAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 1200, easing = 'easeInOutQuad' } = options;
  
  return anime({
    targets: target,
    opacity: [1, 0.6, 1],
    duration,
    easing,
    loop: true,
  });
}

/**
 * Success button animation - checkmark bounce
 */
export function buttonSuccessAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 400, easing = 'easeOutElastic(1, .5)' } = options;
  
  return anime({
    targets: target,
    scale: [0.9, 1.1, 1],
    backgroundColor: '#52c41a',
    duration,
    easing,
  });
}

// =============================================================================
// Input Field Animations
// =============================================================================

/**
 * Animate input field on focus
 */
export function inputFocusAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.2)',
    duration,
    easing,
  });
}

/**
 * Animate input field on blur
 */
export function inputBlurAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    borderColor: '#d9d9d9',
    boxShadow: '0 0 0 0px rgba(102, 126, 234, 0)',
    duration,
    easing,
  });
}

/**
 * Animate floating label on input focus
 */
export function labelFloatAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    translateY: [-8, -24],
    scale: [1, 0.85],
    color: '#667eea',
    duration,
    easing,
  });
}

/**
 * Animate floating label back to default
 */
export function labelUnfloatAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    translateY: [-24, -8],
    scale: [0.85, 1],
    color: '#999',
    duration,
    easing,
  });
}

/**
 * Error shake animation for invalid fields
 */
export function inputErrorShakeAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 500, easing = 'easeInOutSine' } = options;
  
  return anime({
    targets: target,
    translateX: [0, -10, 10, -10, 10, -5, 5, 0],
    borderColor: '#f5222d',
    duration,
    easing,
  });
}

/**
 * Validation success animation
 */
export function inputValidAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    borderColor: '#52c41a',
    boxShadow: '0 0 0 3px rgba(82, 196, 26, 0.2)',
    duration,
    easing,
  });
}

// =============================================================================
// Switch / Toggle Animations
// =============================================================================

/**
 * Toggle switch animation
 */
export function switchToggleAnimation(
  knob: string | HTMLElement,
  track: string | HTMLElement,
  isChecked: boolean,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  const timeline = anime.timeline({ easing, duration });
  
  timeline.add({
    targets: knob,
    translateX: isChecked ? [0, 20] : [20, 0],
  }, 0);
  
  timeline.add({
    targets: track,
    backgroundColor: isChecked ? '#667eea' : '#d9d9d9',
  }, 0);
  
  return timeline;
}

// =============================================================================
// Dropdown / Select Animations
// =============================================================================

/**
 * Dropdown open animation
 */
export function dropdownOpenAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutExpo' } = options;
  
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: [-10, 0],
    scale: [0.95, 1],
    duration,
    easing,
  });
}

/**
 * Dropdown close animation
 */
export function dropdownCloseAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 150, easing = 'easeInQuad' } = options;
  
  return anime({
    targets: target,
    opacity: [1, 0],
    translateY: [0, -10],
    scale: [1, 0.95],
    duration,
    easing,
  });
}

/**
 * Dropdown item hover animation
 */
export function dropdownItemHoverAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 150, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingLeft: [16, 20],
    duration,
    easing,
  });
}

// =============================================================================
// Checkbox & Radio Animations
// =============================================================================

/**
 * Checkbox check animation
 */
export function checkboxCheckAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutBack' } = options;
  
  return anime({
    targets: target,
    scale: [0, 1],
    rotate: [45, 0],
    duration,
    easing,
  });
}

/**
 * Radio button select animation
 */
export function radioSelectAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutElastic(1, .6)' } = options;
  
  return anime({
    targets: target,
    scale: [0, 1],
    duration,
    easing,
  });
}

// =============================================================================
// Slider / Range Animations
// =============================================================================

/**
 * Slider thumb drag animation
 */
export function sliderThumbDragAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 100, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    scale: 1.2,
    boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
    duration,
    easing,
  });
}

/**
 * Slider thumb release animation
 */
export function sliderThumbReleaseAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutElastic(1, .5)' } = options;
  
  return anime({
    targets: target,
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    duration,
    easing,
  });
}

// =============================================================================
// Form Section / Panel Transitions
// =============================================================================

/**
 * Expand section animation
 */
export function sectionExpandAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutExpo' } = options;
  
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;
  
  // Get target height
  const targetHeight = element.scrollHeight;
  
  return anime({
    targets: target,
    height: [0, targetHeight],
    opacity: [0, 1],
    duration,
    easing,
  });
}

/**
 * Collapse section animation
 */
export function sectionCollapseAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeInQuad' } = options;
  
  return anime({
    targets: target,
    height: 0,
    opacity: [1, 0],
    duration,
    easing,
  });
}

/**
 * Staggered form field entrance
 */
export function formFieldsEntranceAnimation(
  target: string | HTMLElement,
  options: AnimationOptions & { stagger?: number } = {}
) {
  const { duration = 400, easing = 'easeOutExpo', stagger = 80 } = options;
  
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(stagger),
    duration,
    easing,
  });
}

// =============================================================================
// Model Card Animations (for OllamaModelSelector)
// =============================================================================

/**
 * Model card selection animation
 */
export function modelCardSelectAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutElastic(1, .6)' } = options;
  
  return anime({
    targets: target,
    scale: [1, 1.02, 1],
    borderColor: '#667eea',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    duration,
    easing,
  });
}

/**
 * Model card download progress animation
 */
export function modelDownloadProgressAnimation(
  progressBar: string | HTMLElement,
  progress: number,
  options: AnimationOptions = {}
) {
  const { duration = 400, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: progressBar,
    width: `${progress}%`,
    duration,
    easing,
  });
}

/**
 * Model card download complete animation
 */
export function modelDownloadCompleteAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 500, easing = 'easeOutElastic(1, .5)' } = options;
  
  return anime.timeline()
    .add({
      targets: target,
      scale: [1, 1.05],
      duration: duration * 0.4,
      easing: 'easeOutQuad',
    })
    .add({
      targets: target,
      scale: [1.05, 1],
      backgroundColor: 'rgba(82, 196, 26, 0.1)',
      borderColor: '#52c41a',
      duration: duration * 0.6,
      easing,
    });
}

/**
 * Model card hover animation
 */
export function modelCardHoverAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    translateY: -4,
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
    duration,
    easing,
  });
}

/**
 * Model card hover leave animation
 */
export function modelCardHoverLeaveAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeOutQuad' } = options;
  
  return anime({
    targets: target,
    translateY: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    duration,
    easing,
  });
}

// =============================================================================
// Tab / Panel Switch Animations
// =============================================================================

/**
 * Tab panel switch animation
 */
export function tabPanelSwitchAnimation(
  outgoing: string | HTMLElement | null,
  incoming: string | HTMLElement,
  direction: 'left' | 'right' = 'right',
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutExpo' } = options;
  const translateX = direction === 'right' ? [50, 0] : [-50, 0];
  
  const timeline = anime.timeline({ easing, duration });
  
  if (outgoing) {
    timeline.add({
      targets: outgoing,
      opacity: [1, 0],
      translateX: direction === 'right' ? [0, -50] : [0, 50],
      duration: duration * 0.5,
    }, 0);
  }
  
  timeline.add({
    targets: incoming,
    opacity: [0, 1],
    translateX,
  }, outgoing ? duration * 0.3 : 0);
  
  return timeline;
}

/**
 * Tab indicator slide animation
 */
export function tabIndicatorSlideAnimation(
  indicator: string | HTMLElement,
  targetPosition: number,
  targetWidth: number,
  options: AnimationOptions = {}
) {
  const { duration = 250, easing = 'easeOutExpo' } = options;
  
  return anime({
    targets: indicator,
    left: targetPosition,
    width: targetWidth,
    duration,
    easing,
  });
}

// =============================================================================
// Modal Animations
// =============================================================================

/**
 * Modal open animation
 */
export function modalOpenAnimation(
  modal: string | HTMLElement,
  overlay: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutExpo' } = options;
  
  const timeline = anime.timeline({ easing, duration });
  
  timeline.add({
    targets: overlay,
    opacity: [0, 1],
    duration: duration * 0.5,
  }, 0);
  
  timeline.add({
    targets: modal,
    opacity: [0, 1],
    scale: [0.9, 1],
    translateY: [20, 0],
  }, duration * 0.2);
  
  return timeline;
}

/**
 * Modal close animation
 */
export function modalCloseAnimation(
  modal: string | HTMLElement,
  overlay: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeInQuad' } = options;
  
  const timeline = anime.timeline({ easing, duration });
  
  timeline.add({
    targets: modal,
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: duration * 0.6,
  }, 0);
  
  timeline.add({
    targets: overlay,
    opacity: [1, 0],
    duration: duration * 0.4,
  }, duration * 0.4);
  
  return timeline;
}

// =============================================================================
// Notification / Toast Animations
// =============================================================================

/**
 * Toast enter animation
 */
export function toastEnterAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 300, easing = 'easeOutExpo' } = options;
  
  return anime({
    targets: target,
    opacity: [0, 1],
    translateY: [50, 0],
    scale: [0.9, 1],
    duration,
    easing,
  });
}

/**
 * Toast exit animation
 */
export function toastExitAnimation(
  target: string | HTMLElement,
  options: AnimationOptions = {}
) {
  const { duration = 200, easing = 'easeInQuad' } = options;
  
  return anime({
    targets: target,
    opacity: [1, 0],
    translateY: [0, -20],
    scale: [1, 0.95],
    duration,
    easing,
  });
}

// =============================================================================
// Export All Animations
// =============================================================================

export default {
  // Button animations
  buttonPressAnimation,
  buttonRippleAnimation,
  buttonHoverEnterAnimation,
  buttonHoverLeaveAnimation,
  buttonLoadingAnimation,
  buttonSuccessAnimation,
  
  // Input animations
  inputFocusAnimation,
  inputBlurAnimation,
  labelFloatAnimation,
  labelUnfloatAnimation,
  inputErrorShakeAnimation,
  inputValidAnimation,
  
  // Toggle animations
  switchToggleAnimation,
  
  // Dropdown animations
  dropdownOpenAnimation,
  dropdownCloseAnimation,
  dropdownItemHoverAnimation,
  
  // Checkbox/Radio animations
  checkboxCheckAnimation,
  radioSelectAnimation,
  
  // Slider animations
  sliderThumbDragAnimation,
  sliderThumbReleaseAnimation,
  
  // Section animations
  sectionExpandAnimation,
  sectionCollapseAnimation,
  formFieldsEntranceAnimation,
  
  // Model card animations
  modelCardSelectAnimation,
  modelDownloadProgressAnimation,
  modelDownloadCompleteAnimation,
  modelCardHoverAnimation,
  modelCardHoverLeaveAnimation,
  
  // Tab animations
  tabPanelSwitchAnimation,
  tabIndicatorSlideAnimation,
  
  // Modal animations
  modalOpenAnimation,
  modalCloseAnimation,
  
  // Toast animations
  toastEnterAnimation,
  toastExitAnimation,
};

# Anime.js Styleguide Research & Integration

## Overview

This document details the research into anime.js styleguide patterns, UX design principles, and animation code examples that can be integrated into LightDom's styleguide mining system.

## Anime.js - Key Findings

### Official Website
- **URL**: https://animejs.com
- **GitHub**: https://github.com/juliangarnier/anime
- **Documentation**: https://animejs.com/documentation/

### Core Philosophy

Anime.js is a lightweight JavaScript animation library with a simple yet powerful API. It works with CSS properties, SVG, DOM attributes, and JavaScript objects.

### Key Features for Styleguide Mining

1. **Declarative Animation Syntax**
2. **Timeline-based animations**
3. **Staggering effects**
4. **Custom easing functions**
5. **SVG morphing and drawing**
6. **Performance optimized**
7. **Small footprint (9.4KB gzipped)**

---

## Component Patterns from Anime.js

### 1. Button Animations

```javascript
// Hover effect with anime.js
const buttonAnimation = anime({
  targets: '.btn',
  scale: [1, 1.1],
  duration: 300,
  easing: 'easeOutElastic(1, .5)',
  autoplay: false
});

// Button configuration
const buttonConfig = {
  component: 'Button',
  animations: {
    hover: {
      property: 'scale',
      from: 1,
      to: 1.1,
      duration: 300,
      easing: 'easeOutElastic(1, .5)'
    },
    click: {
      property: 'scale',
      keyframes: [
        { value: 0.9, duration: 100 },
        { value: 1.05, duration: 150 },
        { value: 1, duration: 100 }
      ],
      easing: 'easeInOutQuad'
    }
  },
  styles: {
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};
```

### 2. Card Reveal Animations

```javascript
// Staggered card entrance
const cardReveal = anime({
  targets: '.card',
  translateY: [40, 0],
  opacity: [0, 1],
  delay: anime.stagger(100), // delay increases by 100ms for each card
  duration: 800,
  easing: 'easeOutExpo'
});

// Card configuration
const cardConfig = {
  component: 'Card',
  animations: {
    entrance: {
      properties: ['translateY', 'opacity'],
      from: { translateY: 40, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
      duration: 800,
      easing: 'easeOutExpo',
      stagger: 100
    },
    hover: {
      property: 'translateY',
      from: 0,
      to: -8,
      duration: 300,
      easing: 'easeOutCubic'
    }
  }
};
```

### 3. Menu/Navigation Animations

```javascript
// Mobile menu slide-in
const menuAnimation = anime.timeline({
  easing: 'easeOutExpo',
  duration: 600
});

menuAnimation
  .add({
    targets: '.menu-overlay',
    opacity: [0, 1],
    duration: 400
  })
  .add({
    targets: '.menu-item',
    translateX: [-100, 0],
    opacity: [0, 1],
    delay: anime.stagger(50),
    duration: 400
  }, '-=200'); // Start 200ms before previous animation ends

// Menu configuration
const menuConfig = {
  component: 'NavigationMenu',
  animations: {
    open: {
      timeline: [
        {
          targets: '.menu-overlay',
          opacity: [0, 1],
          duration: 400
        },
        {
          targets: '.menu-item',
          translateX: [-100, 0],
          opacity: [0, 1],
          delay: 'stagger(50)',
          duration: 400,
          offset: '-=200'
        }
      ]
    },
    close: {
      timeline: [
        {
          targets: '.menu-item',
          translateX: [0, -100],
          opacity: [1, 0],
          delay: 'stagger(30, {direction: "reverse"})',
          duration: 300
        },
        {
          targets: '.menu-overlay',
          opacity: [1, 0],
          duration: 300,
          offset: '-=150'
        }
      ]
    }
  }
};
```

### 4. Loading Indicators

```javascript
// Pulsing loader
const loaderAnimation = anime({
  targets: '.loader',
  scale: [1, 1.2, 1],
  opacity: [1, 0.6, 1],
  duration: 1200,
  easing: 'easeInOutQuad',
  loop: true
});

// Loader configuration
const loaderConfig = {
  component: 'Loader',
  animations: {
    pulse: {
      properties: ['scale', 'opacity'],
      keyframes: [
        { scale: 1, opacity: 1, duration: 0 },
        { scale: 1.2, opacity: 0.6, duration: 600 },
        { scale: 1, opacity: 1, duration: 600 }
      ],
      easing: 'easeInOutQuad',
      loop: true
    }
  }
};
```

### 5. Modal/Dialog Animations

```javascript
// Modal entrance
const modalAnimation = anime.timeline({
  easing: 'easeOutExpo'
});

modalAnimation
  .add({
    targets: '.modal-backdrop',
    opacity: [0, 1],
    duration: 300
  })
  .add({
    targets: '.modal-content',
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 400
  }, '-=150');

// Modal configuration
const modalConfig = {
  component: 'Modal',
  animations: {
    open: {
      timeline: [
        {
          targets: '.modal-backdrop',
          opacity: [0, 1],
          duration: 300
        },
        {
          targets: '.modal-content',
          scale: [0.8, 1],
          opacity: [0, 1],
          duration: 400,
          offset: '-=150'
        }
      ]
    },
    close: {
      timeline: [
        {
          targets: '.modal-content',
          scale: [1, 0.8],
          opacity: [1, 0],
          duration: 300
        },
        {
          targets: '.modal-backdrop',
          opacity: [1, 0],
          duration: 300,
          offset: '-=100'
        }
      ]
    }
  }
};
```

---

## Easing Functions Library

Anime.js provides extensive easing options:

```javascript
const easingLibrary = {
  // Basic
  linear: 'linear',
  
  // Ease
  easeIn: 'easeInQuad',
  easeOut: 'easeOutQuad',
  easeInOut: 'easeInOutQuad',
  
  // Cubic
  easeInCubic: 'easeInCubic',
  easeOutCubic: 'easeOutCubic',
  easeInOutCubic: 'easeInOutCubic',
  
  // Elastic
  easeInElastic: 'easeInElastic(1, .6)',
  easeOutElastic: 'easeOutElastic(1, .6)',
  easeInOutElastic: 'easeInOutElastic(1, .6)',
  
  // Bounce
  easeInBounce: 'easeInBounce',
  easeOutBounce: 'easeOutBounce',
  easeInOutBounce: 'easeInOutBounce',
  
  // Spring (custom)
  spring: 'spring(1, 80, 10, 0)',
  
  // Custom Bezier
  customBezier: 'cubicBezier(.5, .05, .1, .3)'
};
```

---

## Additional Styleguides to Mine

### 1. Material Design 3 (Google)

**URL**: https://m3.material.io/

**Key Animation Patterns:**
- **Motion principles**: Easing, duration, continuity
- **Transition patterns**: Shared element transitions
- **Component animations**: FAB, Chips, Cards, etc.
- **Page transitions**: Fade, scale, slide
- **Microinteractions**: Ripple effects, state changes

**Code Examples to Extract:**
```javascript
// Material Design motion tokens
const materialMotion = {
  duration: {
    short1: 50,   // Tooltip, snackbar
    short2: 100,  // Small components
    short3: 150,  // Radio, checkbox
    short4: 200,  // Large components
    medium1: 250, // FAB
    medium2: 300, // Modal
    medium3: 350, // Bottom sheet
    medium4: 400, // Dialog
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)'
  }
};
```

### 2. Framer Motion

**URL**: https://www.framer.com/motion/

**Key Features:**
- **Declarative animations**
- **Gesture-based interactions**
- **Layout animations**
- **Scroll-triggered animations**
- **SVG path animations**

**Code Examples:**
```javascript
// Framer Motion configuration
const framerMotionPatterns = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 100 }
  },
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  }
};
```

### 3. Tailwind UI

**URL**: https://tailwindui.com/

**Key Features:**
- **Utility-first animations**
- **Transition classes**
- **Transform utilities**
- **Animation presets**

**Code Examples:**
```javascript
// Tailwind animation classes
const tailwindAnimations = {
  spin: 'animate-spin',
  ping: 'animate-ping',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  
  // Custom animations
  fadeIn: 'animate-fadeIn',
  slideInLeft: 'animate-slideInLeft',
  slideInRight: 'animate-slideInRight'
};
```

### 4. Chakra UI

**URL**: https://chakra-ui.com/

**Key Features:**
- **Motion components**
- **Transition props**
- **Animation utilities**
- **Accessibility-focused animations**

### 5. Ant Design

**URL**: https://ant.design/components/overview

**Key Features:**
- **Motion design tokens**
- **Component animations**
- **Page transitions**
- **Loading states**

---

## Styleguide Mining Strategy

### 1. Automated Pattern Recognition

```javascript
// Pattern mining service
const mineStyleguidePatterns = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Extract animation CSS
  const animations = await page.evaluate(() => {
    const keyframes = {};
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            keyframes[rule.name] = Array.from(rule.cssRules).map(r => ({
              keyText: r.keyText,
              style: r.style.cssText
            }));
          }
        }
      } catch (e) {}
    }
    return keyframes;
  });
  
  // Extract transition classes
  const transitionClasses = await page.evaluate(() => {
    const classes = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.style.transition) {
            classes.push({
              selector: rule.selectorText,
              transition: rule.style.transition
            });
          }
        }
      } catch (e) {}
    }
    return classes;
  });
  
  return { animations, transitionClasses };
};
```

### 2. Component Animation Extraction

```javascript
// Extract component-specific animations
const extractComponentAnimations = async (componentSelector) => {
  const component = await page.$(componentSelector);
  
  // Get computed styles
  const animations = await page.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      animation: styles.animation,
      transition: styles.transition,
      transform: styles.transform,
      transformOrigin: styles.transformOrigin
    };
  }, component);
  
  // Trigger interactions and observe
  await component.hover();
  const hoverStyles = await page.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return { transform: styles.transform };
  }, component);
  
  return { base: animations, hover: hoverStyles };
};
```

### 3. Code Example Scraping

```javascript
// Scrape code examples from documentation
const scrapeCodeExamples = async (url) => {
  const page = await browser.newPage();
  await page.goto(url);
  
  const examples = await page.evaluate(() => {
    const codeBlocks = document.querySelectorAll('pre code, .code-example');
    return Array.from(codeBlocks).map(block => ({
      language: block.className.match(/language-(\w+)/)?.[1] || 'javascript',
      code: block.textContent,
      description: block.closest('section')?.querySelector('h2, h3, p')?.textContent
    }));
  });
  
  return examples;
};
```

---

## Integration with LightDom

### 1. Styleguide Configuration Schema

```json
{
  "styleguides": [
    {
      "name": "anime.js",
      "url": "https://animejs.com",
      "priority": 9,
      "patterns": {
        "buttons": ["hover", "click", "focus"],
        "cards": ["entrance", "hover", "exit"],
        "menus": ["open", "close", "item-hover"],
        "modals": ["open", "close"],
        "loaders": ["spin", "pulse", "bounce"]
      },
      "extractionRules": {
        "codeExamples": true,
        "cssAnimations": true,
        "jsLibraryUsage": true,
        "componentPatterns": true
      }
    },
    {
      "name": "Material Design 3",
      "url": "https://m3.material.io",
      "priority": 10,
      "patterns": {
        "motion": ["easing", "duration", "continuity"],
        "transitions": ["fade", "scale", "slide", "shared-element"],
        "components": ["all"]
      }
    },
    {
      "name": "Framer Motion",
      "url": "https://www.framer.com/motion",
      "priority": 9,
      "patterns": {
        "animations": ["declarative", "gesture", "layout", "scroll"],
        "transitions": ["spring", "tween", "inertia"]
      }
    }
  ]
}
```

### 2. Mining Service Configuration

```javascript
// services/animation-styleguide-miner.js
class AnimationStyleguideMiner {
  constructor() {
    this.styleguides = [
      { name: 'anime.js', url: 'https://animejs.com' },
      { name: 'Material Design 3', url: 'https://m3.material.io' },
      { name: 'Framer Motion', url: 'https://www.framer.com/motion' },
      { name: 'Tailwind UI', url: 'https://tailwindui.com' },
      { name: 'Chakra UI', url: 'https://chakra-ui.com' },
      { name: 'Ant Design', url: 'https://ant.design' }
    ];
  }
  
  async mineAll() {
    const results = [];
    for (const guide of this.styleguides) {
      const patterns = await this.mineStyleguide(guide.url);
      results.push({ ...guide, patterns });
    }
    return results;
  }
  
  async mineStyleguide(url) {
    // Implementation
  }
}
```

### 3. Database Schema for Animation Patterns

```sql
-- Animation patterns table
CREATE TABLE animation_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  styleguide_name VARCHAR(255) NOT NULL,
  styleguide_url TEXT NOT NULL,
  component_type VARCHAR(100) NOT NULL,
  animation_name VARCHAR(255) NOT NULL,
  code_example TEXT,
  css_rules JSONB,
  js_config JSONB,
  easing_function VARCHAR(100),
  duration INTEGER,
  properties JSONB,
  ux_purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_animation_patterns_styleguide ON animation_patterns(styleguide_name);
CREATE INDEX idx_animation_patterns_component ON animation_patterns(component_type);
CREATE INDEX idx_animation_patterns_animation ON animation_patterns(animation_name);
```

---

## UX Design Principles from Anime.js

### 1. Motion Design Guidelines

- **Purposeful Motion**: Every animation should serve a purpose (feedback, guidance, delight)
- **Performance**: Keep animations smooth (60fps target)
- **Accessibility**: Respect `prefers-reduced-motion` user preference
- **Subtlety**: Avoid overwhelming users with too much motion
- **Consistency**: Use consistent timing and easing across similar interactions

### 2. Animation Timing

```javascript
const timingGuidelines = {
  microinteractions: '100-300ms',    // Hover, click feedback
  smallComponents: '300-500ms',       // Buttons, chips, toggles
  mediumComponents: '500-700ms',      // Cards, panels
  largeComponents: '700-1000ms',      // Modals, pages
  pageTransitions: '1000-1500ms'      // Full page changes
};
```

### 3. Easing Selection

```javascript
const easingUseCases = {
  entrance: 'easeOutExpo',      // Elements appearing
  exit: 'easeInExpo',           // Elements disappearing
  interactive: 'easeOutCubic',  // User-triggered actions
  elastic: 'easeOutElastic',    // Playful interactions
  bounce: 'easeOutBounce',      // Attention-grabbing
  spring: 'spring',             // Natural, physics-based
  linear: 'linear'              // Continuous progress (loaders)
};
```

---

## Action Items

1. ✅ Document anime.js patterns and configuration
2. ✅ Identify additional styleguides to mine
3. ✅ Design extraction strategy for each styleguide
4. [ ] Implement animation pattern mining service
5. [ ] Create database schema for animation patterns
6. [ ] Build animation pattern library UI
7. [ ] Integrate with existing styleguide mining system
8. [ ] Add animation recommendations to SEO optimizer
9. [ ] Test pattern extraction on all target styleguides
10. [ ] Document best practices and usage examples

---

## References

- Anime.js Documentation: https://animejs.com/documentation/
- Material Design Motion: https://m3.material.io/styles/motion
- Framer Motion: https://www.framer.com/motion/
- Web Animations API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations

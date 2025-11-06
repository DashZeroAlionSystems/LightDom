# LightDom Space Harvester - Design System Style Guide

## Overview

This document outlines the comprehensive design system for the LightDom Space Harvester application. The design system provides a consistent visual language, reusable components, and animation patterns that ensure a cohesive user experience across all pages and components.

## Design Philosophy

The LightDom design system is built on the following principles:

- **Consistency**: All components follow the same visual patterns and interaction models
- **Accessibility**: WCAG 2.1 AA compliance with proper contrast ratios and keyboard navigation
- **Performance**: Optimized animations and efficient CSS for smooth user experience
- **Scalability**: Modular design tokens that can be easily updated and extended
- **Modern**: Contemporary design patterns with Discord-inspired aesthetics

## Design Tokens

### Colors

#### Primary Colors
- **Primary Blue**: `#5865f2` - Main brand color for primary actions
- **Primary Hover**: `#4752c4` - Hover state for primary elements
- **Primary Active**: `#3c45a5` - Active/pressed state for primary elements

#### Background Colors
- **Background Primary**: `#36393f` - Main background color
- **Background Secondary**: `#2f3136` - Secondary background for cards and panels
- **Background Tertiary**: `#202225` - Darker background for elevated elements

#### Status Colors
- **Success**: `#3ba55c` - Success states, positive actions
- **Warning**: `#faa81a` - Warning states, cautionary actions
- **Danger**: `#ed4245` - Error states, destructive actions
- **Info**: `#00b0f4` - Informational states, neutral actions

#### Text Colors
- **Text Primary**: `#ffffff` - Primary text color
- **Text Secondary**: `#b9bbbe` - Secondary text color
- **Text Muted**: `#72767d` - Muted text color for less important content

#### Border Colors
- **Border**: `#40444b` - Standard border color
- **Border Light**: `#4f545c` - Lighter border for subtle separations

### Typography

#### Font Sizes
- **XS**: `0.75rem` (12px) - Small labels, captions
- **SM**: `0.875rem` (14px) - Body text, form labels
- **Base**: `1rem` (16px) - Default body text
- **LG**: `1.125rem` (18px) - Large body text
- **XL**: `1.25rem` (20px) - Small headings
- **2XL**: `1.5rem` (24px) - Medium headings
- **3XL**: `1.875rem` (30px) - Large headings

#### Font Weights
- **Light**: `300` - Light text
- **Normal**: `400` - Regular text
- **Medium**: `500` - Medium emphasis
- **Semibold**: `600` - Strong emphasis
- **Bold**: `700` - Bold text
- **Extrabold**: `800` - Very bold text

### Spacing

The spacing system uses a consistent 4px base unit:

- **Space 1**: `4px` - Minimal spacing
- **Space 2**: `8px` - Small spacing
- **Space 3**: `12px` - Medium-small spacing
- **Space 4**: `16px` - Medium spacing
- **Space 5**: `20px` - Medium-large spacing
- **Space 6**: `24px` - Large spacing
- **Space 7**: `28px` - Extra large spacing
- **Space 8**: `32px` - Maximum spacing

### Border Radius

- **Small**: `4px` - Small elements, inputs
- **Medium**: `8px` - Standard elements, buttons
- **Large**: `12px` - Cards, panels
- **Extra Large**: `16px` - Large cards, modals
- **Full**: `9999px` - Circular elements

### Shadows

- **Small**: `0 1px 2px rgba(0, 0, 0, 0.1)` - Subtle elevation
- **Medium**: `0 4px 6px rgba(0, 0, 0, 0.1)` - Standard elevation
- **Large**: `0 10px 15px rgba(0, 0, 0, 0.1)` - High elevation
- **Extra Large**: `0 20px 25px rgba(0, 0, 0, 0.1)` - Maximum elevation
- **Inset**: `inset 0 2px 4px rgba(0, 0, 0, 0.06)` - Inset elements

### Transitions

- **Ease**: `all 0.2s ease-in-out` - Standard transitions
- **Fast**: `all 0.1s ease-out` - Quick transitions
- **Slow**: `all 0.3s ease-in` - Slow transitions

## Component System

### Buttons

#### Button Sizes
- **Small**: `ld-btn--sm` - Compact buttons for tight spaces
- **Medium**: `ld-btn--md` - Standard button size
- **Large**: `ld-btn--lg` - Prominent buttons for primary actions

#### Button Variants
- **Primary**: `ld-btn--primary` - Main call-to-action buttons
- **Secondary**: `ld-btn--secondary` - Secondary actions
- **Success**: `ld-btn--success` - Positive actions
- **Danger**: `ld-btn--danger` - Destructive actions
- **Ghost**: `ld-btn--ghost` - Subtle actions

#### Button States
- **Default**: Standard appearance
- **Hover**: Enhanced appearance on hover
- **Active**: Pressed state
- **Disabled**: Grayed out and non-interactive
- **Loading**: Shows spinner and disables interaction

### Cards

#### Card Types
- **Standard**: `ld-card` - Basic card with standard elevation
- **Elevated**: `ld-card--elevated` - Higher elevation for important content
- **Interactive**: `ld-card--interactive` - Hover effects for clickable cards

#### Card Structure
- **Header**: `ld-card__header` - Card title and actions
- **Content**: `ld-card__content` - Main card content
- **Title**: `ld-card__title` - Card title styling

### Inputs

#### Input States
- **Default**: Standard appearance
- **Focus**: Highlighted border and glow effect
- **Error**: Red border and error styling
- **Disabled**: Grayed out and non-interactive

### Layout Components

#### Containers
- **Container**: `ld-container` - Responsive container with max-width
- **Small**: `ld-container--sm` - 640px max-width
- **Medium**: `ld-container--md` - 768px max-width
- **Large**: `ld-container--lg` - 1024px max-width
- **Extra Large**: `ld-container--xl` - 1280px max-width
- **2X Large**: `ld-container--2xl` - 1536px max-width

#### Grid System
- **Grid**: `ld-grid` - CSS Grid container
- **Columns**: `ld-grid--cols-1` through `ld-grid--cols-6` - Column definitions
- **Gap**: `ld-grid--gap-sm/md/lg` - Grid spacing

#### Flexbox Utilities
- **Flex**: `ld-flex` - Flexbox container
- **Direction**: `ld-flex--col/row` - Flex direction
- **Wrap**: `ld-flex--wrap/nowrap` - Flex wrap
- **Justify**: `ld-flex--start/end/center/between/around/evenly` - Justify content
- **Align**: `ld-items--start/end/center/baseline/stretch` - Align items

## Animation System

### Animation Classes

#### Entrance Animations
- **Fade In**: `ld-animate-fade-in` - Smooth opacity transition
- **Slide Up**: `ld-animate-slide-up` - Slide in from bottom
- **Slide Down**: `ld-animate-slide-down` - Slide in from top
- **Slide Left**: `ld-animate-slide-left` - Slide in from right
- **Slide Right**: `ld-animate-slide-right` - Slide in from left
- **Scale In**: `ld-animate-scale-in` - Scale up from smaller size
- **Bounce In**: `ld-animate-bounce-in` - Bouncy entrance effect

#### Continuous Animations
- **Pulse**: `ld-animate-pulse` - Gentle pulsing effect
- **Float**: `ld-animate-float` - Floating motion
- **Glow**: `ld-animate-glow` - Glowing effect

#### Hover Animations
- **Hover Lift**: `ld-hover-lift` - Lifts element on hover
- **Hover Glow**: `ld-hover-glow` - Glow effect on hover
- **Hover Scale**: `ld-hover-scale` - Scales element on hover
- **Hover Rotate**: `ld-hover-rotate` - Rotates element on hover

### Animation Timing

- **Fast**: 0.1s - Quick, snappy animations
- **Standard**: 0.2s - Default animation timing
- **Slow**: 0.3s - Deliberate, smooth animations
- **Very Slow**: 0.5s - Dramatic, attention-grabbing animations

### Easing Functions

- **Ease Out**: `ease-out` - Quick start, slow end
- **Ease In**: `ease-in` - Slow start, quick end
- **Ease In Out**: `ease-in-out` - Smooth start and end
- **Linear**: `linear` - Constant speed

## Usage Guidelines

### Component Usage

1. **Always use design system classes** instead of custom CSS when possible
2. **Follow the established patterns** for consistency across the application
3. **Use appropriate animation classes** to enhance user experience
4. **Maintain proper contrast ratios** for accessibility
5. **Test hover and focus states** to ensure proper interaction feedback

### Animation Usage

1. **Use entrance animations sparingly** - only for important content
2. **Prefer subtle animations** over dramatic effects
3. **Respect user preferences** - animations are disabled for users who prefer reduced motion
4. **Use hover animations** to provide visual feedback
5. **Keep animations short** - typically under 0.3s

### Responsive Design

1. **Mobile-first approach** - design for mobile devices first
2. **Use responsive grid classes** for different screen sizes
3. **Test on multiple devices** to ensure proper scaling
4. **Consider touch targets** - minimum 44px for interactive elements

## Accessibility

### Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Keyboard Navigation

- **Focus indicators**: Visible focus rings for all interactive elements
- **Tab order**: Logical tab sequence through the interface
- **Skip links**: Allow users to skip to main content

### Screen Readers

- **Semantic HTML**: Use proper HTML elements for structure
- **ARIA labels**: Provide descriptive labels for complex components
- **Alt text**: Descriptive alternative text for images

## Implementation

### CSS Architecture

The design system is implemented using:

1. **Design Tokens** (`design-tokens.css`) - CSS custom properties for all design values
2. **Component System** (`component-system.css`) - Reusable component classes
3. **Animation System** (`animations.css`) - Animation utilities and keyframes

### File Structure

```
src/styles/
├── design-tokens.css      # Design tokens and CSS variables
├── component-system.css   # Component classes and utilities
└── animations.css         # Animation utilities and keyframes
```

### Integration

The design system is integrated into the application through:

1. **CSS Imports** - Imported in `index.css`
2. **Component Classes** - Applied to React components
3. **Utility Classes** - Used for layout and styling

## Maintenance

### Updating Design Tokens

1. **Modify values** in `design-tokens.css`
2. **Test across components** to ensure consistency
3. **Update documentation** to reflect changes
4. **Communicate changes** to the development team

### Adding New Components

1. **Follow existing patterns** for consistency
2. **Include all necessary states** (hover, focus, disabled, etc.)
3. **Add proper accessibility** attributes
4. **Document usage** in this style guide
5. **Test across devices** and browsers

### Performance Considerations

1. **Minimize CSS bundle size** by removing unused classes
2. **Use efficient selectors** to improve rendering performance
3. **Optimize animations** for smooth 60fps performance
4. **Consider critical CSS** for above-the-fold content

## Resources

### Design Tools

- **Figma**: Design system documentation and component library
- **Storybook**: Interactive component documentation
- **Chrome DevTools**: Testing and debugging styles

### References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)
- [Discord Design System](https://discord.com/branding)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

*This style guide is a living document that should be updated as the design system evolves. For questions or suggestions, please contact the design team.*

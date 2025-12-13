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

Our component system follows **Atomic Design** methodology, organizing components into hierarchical levels from simple to complex.

### Atomic Design Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                          PAGES                               │
│   Complete layouts combining templates with real content     │
├─────────────────────────────────────────────────────────────┤
│                        TEMPLATES                             │
│   Page-level structures placing organisms in context         │
├─────────────────────────────────────────────────────────────┤
│                        ORGANISMS                             │
│   Complex, distinct UI sections (Header, Card, Form)         │
├─────────────────────────────────────────────────────────────┤
│                        MOLECULES                             │
│   Simple atom groups (SearchField, FormGroup, NavItem)       │
├─────────────────────────────────────────────────────────────┤
│                          ATOMS                               │
│   Basic building blocks (Button, Input, Badge, Icon)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Atoms

Atoms are the **fundamental, indivisible building blocks** of our design system. They cannot be broken down further without losing their meaning.

### Button Atom

Buttons trigger actions or navigation. Use the appropriate variant to communicate the button's purpose.

#### Variants

| Variant | Usage | Example |
|---------|-------|---------|
| `filled` | Primary actions, CTAs | Submit, Save, Confirm |
| `filled-tonal` | Secondary importance | Cancel, Back |
| `outlined` | Medium emphasis | Edit, Options |
| `text` | Low emphasis, inline | Learn more, View all |
| `elevated` | Floating actions | FAB |
| `destructive` | Destructive actions | Delete, Remove |

#### Sizes

| Size | Height | Usage |
|------|--------|-------|
| `sm` | 32px | Compact UI, tables |
| `md` | 40px | Default, forms |
| `lg` | 48px | Hero sections, prominent CTAs |

#### Usage Examples

```tsx
import { Button } from '@/components/atoms/Button';

// Primary action
<Button variant="filled">Save Changes</Button>

// With icon
<Button variant="outlined" leftIcon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="filled" isLoading>
  Processing...
</Button>

// Full width (forms)
<Button variant="filled" fullWidth>
  Submit Form
</Button>

// Destructive action
<Button variant="destructive">Delete Account</Button>
```

#### Button States

- **Default**: Standard appearance
- **Hover**: Enhanced appearance on hover
- **Active**: Pressed state
- **Disabled**: Grayed out and non-interactive
- **Loading**: Shows spinner and disables interaction

#### CSS Classes
- **Small**: `ld-btn--sm` - Compact buttons for tight spaces
- **Medium**: `ld-btn--md` - Standard button size
- **Large**: `ld-btn--lg` - Prominent buttons for primary actions
- **Primary**: `ld-btn--primary` - Main call-to-action buttons
- **Secondary**: `ld-btn--secondary` - Secondary actions
- **Success**: `ld-btn--success` - Positive actions
- **Danger**: `ld-btn--danger` - Destructive actions
- **Ghost**: `ld-btn--ghost` - Subtle actions

---

### Input Atom

Inputs allow users to enter and edit text.

#### Variants

| Variant | Usage |
|---------|-------|
| `outlined` | Default, general forms |
| `filled` | Dense forms, search |
| `standard` | Minimal styling |

#### Usage Examples

```tsx
import { Input } from '@/components/atoms/Input';

// Basic text input
<Input 
  label="Email"
  placeholder="Enter your email"
  type="email"
/>

// With validation error
<Input 
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input 
  label="Username"
  helperText="Your public display name"
/>

// Disabled state
<Input 
  label="Locked Field"
  value="Cannot edit"
  disabled
/>
```

#### Input States
- **Default**: Standard appearance
- **Focus**: Highlighted border and glow effect
- **Error**: Red border and error styling
- **Disabled**: Grayed out and non-interactive

---

### Badge Atom

Badges convey status, counts, or labels.

#### Variants

| Variant | Color | Usage |
|---------|-------|-------|
| `default` | Gray | Neutral information |
| `primary` | Blue | Active states |
| `success` | Green | Positive status |
| `warning` | Yellow | Cautionary status |
| `error` | Red | Error or critical |
| `info` | Cyan | Informational |

#### Usage Examples

```tsx
import { Badge } from '@/components/atoms/Badge';

// Status indicator
<Badge variant="success">Active</Badge>

// Count badge
<Badge variant="primary">3 new</Badge>

// With icon
<Badge variant="warning">
  <AlertIcon /> Pending
</Badge>
```

---

### Icon Atom

Icons provide visual cues and enhance scannability.

#### Usage Examples

```tsx
import { Icon } from '@/components/atoms/Icon';
import { Settings, User, Search } from 'lucide-react';

// Standard icon
<Icon name="settings" size={24} />

// With Lucide React
<Settings className="h-6 w-6 text-primary" />

// Icon button
<button aria-label="Settings">
  <Settings className="h-5 w-5" />
</button>
```

---

### Text Atom

Typography elements for consistent text styling.

#### Variants

| Variant | Element | Usage |
|---------|---------|-------|
| `h1` | `<h1>` | Page titles |
| `h2` | `<h2>` | Section headers |
| `h3` | `<h3>` | Subsection headers |
| `body` | `<p>` | Body text |
| `caption` | `<span>` | Helper text, labels |
| `overline` | `<span>` | Category labels |

---

## Molecules

Molecules are **simple groups of atoms** functioning together as a unit.

### SearchField Molecule

Combines Input + Button + Icon for search functionality.

#### Usage Examples

```tsx
import { SearchField } from '@/components/molecules/SearchField';

// Basic search
<SearchField 
  placeholder="Search..."
  onSearch={(query) => handleSearch(query)}
/>

// With clear button
<SearchField 
  placeholder="Search products..."
  onSearch={handleSearch}
  showClear
/>

// With filters
<SearchField 
  placeholder="Search..."
  onSearch={handleSearch}
  filters={['All', 'Products', 'Users', 'Orders']}
  onFilterChange={handleFilterChange}
/>
```

---

### FormGroup Molecule

Combines Label + Input + HelperText + ErrorMessage.

#### Usage Examples

```tsx
import { FormGroup } from '@/components/molecules/FormGroup';

// Basic form field
<FormGroup
  label="Email Address"
  required
>
  <Input type="email" placeholder="you@example.com" />
</FormGroup>

// With validation
<FormGroup
  label="Password"
  error={errors.password}
  helperText="Must be at least 8 characters"
>
  <Input type="password" />
</FormGroup>
```

---

### ButtonGroup Molecule

Groups related buttons together.

#### Usage Examples

```tsx
import { ButtonGroup } from '@/components/molecules/ButtonGroup';

// Segmented control
<ButtonGroup>
  <Button variant="filled">Day</Button>
  <Button variant="outlined">Week</Button>
  <Button variant="outlined">Month</Button>
</ButtonGroup>

// Action group
<ButtonGroup spacing="md">
  <Button variant="text">Cancel</Button>
  <Button variant="filled">Save</Button>
</ButtonGroup>
```

---

### NavItem Molecule

Navigation item combining Icon + Text + Badge.

#### Usage Examples

```tsx
import { NavItem } from '@/components/molecules/NavItem';

// Basic nav item
<NavItem 
  icon={<HomeIcon />}
  label="Dashboard"
  href="/dashboard"
  active
/>

// With notification badge
<NavItem 
  icon={<InboxIcon />}
  label="Messages"
  href="/messages"
  badge={5}
/>
```

---

## Organisms

Organisms are **complex, distinct sections** of an interface composed of molecules and atoms.

### Card Organism

Content container with header, body, and footer sections.

#### Variants

| Variant | Usage |
|---------|-------|
| `elevated` | Default, floating card |
| `outlined` | Bordered card |
| `filled` | Solid background |

#### Usage Examples

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/organisms/Card';

// Standard card
<Card>
  <CardHeader>
    <CardTitle>Analytics Overview</CardTitle>
    <CardDescription>Your weekly performance</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button variant="text">View Details</Button>
  </CardFooter>
</Card>

// Interactive card
<Card 
  variant="outlined" 
  interactive
  onClick={() => navigate('/details')}
>
  <CardContent>
    <h3>Click me</h3>
    <p>This card is clickable</p>
  </CardContent>
</Card>

// Media card
<Card>
  <CardMedia src="/image.jpg" alt="Featured image" />
  <CardContent>
    <CardTitle>Featured Article</CardTitle>
    <p>Article description...</p>
  </CardContent>
</Card>
```

#### Card Types (CSS Classes)
- **Standard**: `ld-card` - Basic card with standard elevation
- **Elevated**: `ld-card--elevated` - Higher elevation for important content
- **Interactive**: `ld-card--interactive` - Hover effects for clickable cards

#### Card Structure (CSS Classes)
- **Header**: `ld-card__header` - Card title and actions
- **Content**: `ld-card__content` - Main card content
- **Title**: `ld-card__title` - Card title styling

---

### Header Organism

Site navigation with branding, navigation links, and user actions.

#### Usage Examples

```tsx
import { Header } from '@/components/organisms/Header';

<Header
  logo={<Logo />}
  navigation={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: 'Settings', href: '/settings' },
  ]}
  actions={
    <>
      <Button variant="text" leftIcon={<BellIcon />} />
      <Avatar src={user.avatar} alt={user.name} />
    </>
  }
/>
```

---

### Sidebar Organism

Vertical navigation for app layouts.

#### Usage Examples

```tsx
import { Sidebar, SidebarSection, SidebarItem } from '@/components/organisms/Sidebar';

<Sidebar>
  <SidebarSection title="Main">
    <SidebarItem icon={<HomeIcon />} label="Dashboard" href="/" active />
    <SidebarItem icon={<ProjectIcon />} label="Projects" href="/projects" />
    <SidebarItem icon={<AnalyticsIcon />} label="Analytics" href="/analytics" />
  </SidebarSection>
  
  <SidebarSection title="Settings">
    <SidebarItem icon={<SettingsIcon />} label="Settings" href="/settings" />
    <SidebarItem icon={<HelpIcon />} label="Help" href="/help" />
  </SidebarSection>
</Sidebar>
```

---

### Modal Organism

Dialog overlay for focused tasks.

#### Usage Examples

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/organisms/Modal';

<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <h2>Confirm Action</h2>
  </ModalHeader>
  <ModalBody>
    <p>Are you sure you want to proceed?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="text" onClick={handleClose}>Cancel</Button>
    <Button variant="filled" onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

---

### Form Organism

Complete form with validation and submission handling.

#### Usage Examples

```tsx
import { Form, FormGroup, FormActions } from '@/components/organisms/Form';

<Form onSubmit={handleSubmit}>
  <FormGroup label="Name" required>
    <Input name="name" placeholder="Enter your name" />
  </FormGroup>
  
  <FormGroup label="Email" required error={errors.email}>
    <Input name="email" type="email" placeholder="you@example.com" />
  </FormGroup>
  
  <FormActions>
    <Button variant="text" type="button" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="filled" type="submit" isLoading={isSubmitting}>
      Submit
    </Button>
  </FormActions>
</Form>
```

---

## Layout Components

### Containers
- **Container**: `ld-container` - Responsive container with max-width
- **Small**: `ld-container--sm` - 640px max-width
- **Medium**: `ld-container--md` - 768px max-width
- **Large**: `ld-container--lg` - 1024px max-width
- **Extra Large**: `ld-container--xl` - 1280px max-width
- **2X Large**: `ld-container--2xl` - 1536px max-width

### Grid System
- **Grid**: `ld-grid` - CSS Grid container
- **Columns**: `ld-grid--cols-1` through `ld-grid--cols-6` - Column definitions
- **Gap**: `ld-grid--gap-sm/md/lg` - Grid spacing

### Flexbox Utilities
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

### Related Documentation

- [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) - Component development rules and Storybook requirements
- [MATERIAL_DESIGN_STYLE_GUIDE.md](./MATERIAL_DESIGN_STYLE_GUIDE.md) - Material Design 3.0 implementation
- [ATOMIC_COMPONENT_SCHEMAS.md](./ATOMIC_COMPONENT_SCHEMAS.md) - Schema definitions for atomic components
- [COMPREHENSIVE_STORYBOOK_GUIDE.md](./COMPREHENSIVE_STORYBOOK_GUIDE.md) - Advanced Storybook patterns
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) - Scroll animations and utilities

### External References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)
- [Discord Design System](https://discord.com/branding)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)

---

*This style guide is a living document that should be updated as the design system evolves. For questions or suggestions, please contact the design team.*

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeConfigurator } from './ThemeConfigurator';

const meta: Meta<typeof ThemeConfigurator> = {
  title: 'Design System/Theme Configurator',
  component: ThemeConfigurator,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Theme Configurator

An interactive theme editor with live preview, inspired by modern design tools and Material Design guidelines.

## Features

- **Preset Themes** - 5 pre-configured themes (Light, Dark, Ocean, Sunset, Forest)
- **Live Preview** - See changes instantly with animated transitions
- **Color Customization** - Edit any color with visual color pickers
- **Export/Import** - Save and share theme configurations
- **CSS Variables** - Automatically generates CSS custom properties
- **Code Examples** - Shows how to use the theme in your code

## Theme Structure

A complete theme includes:
- **Colors** - Primary, secondary, accent, backgrounds, text, status colors
- **Spacing** - Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Typography** - Font families, sizes, weights, line heights
- **Animations** - Duration, easing functions, stagger delays
- **Border Radius** - Corner radius values
- **Shadows** - Elevation shadows

## How It Works

### 1. Choose a Preset
Start with one of the 5 pre-configured themes that match your desired aesthetic.

### 2. Customize Colors
Use the color pickers to adjust any color to match your brand. Changes are reflected immediately in the live preview.

### 3. Preview
See your theme in action with:
- Hero section with gradient background
- Feature cards with custom styling
- Text samples showing all typography styles

### 4. Export
Download your theme as a JSON file that can be:
- Imported later for further editing
- Used in your application code
- Shared with team members

## Usage Examples

### Applying a Theme

\`\`\`tsx
import { applyTheme, themePresets } from '@/config/themeConfig';

// Use a preset
applyTheme(themePresets.ocean);

// Or import a custom theme
import myTheme from './my-theme.json';
applyTheme(importTheme(JSON.stringify(myTheme)));
\`\`\`

### Using Theme Values

\`\`\`tsx
import { defaultTheme } from '@/config/themeConfig';

const MyComponent = () => (
  <div style={{
    background: defaultTheme.colors.primary,
    padding: defaultTheme.spacing.md,
    borderRadius: defaultTheme.borderRadius.lg,
  }}>
    Themed Content
  </div>
);
\`\`\`

### CSS Variables

\`\`\`css
.my-component {
  background: var(--theme-primary);
  color: var(--theme-text);
  padding: var(--theme-spacing-md);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
}
\`\`\`

## Integration with Anime.js

The theme system integrates seamlessly with anime.js animations:

\`\`\`tsx
import anime from 'animejs';
import { defaultTheme } from '@/config/themeConfig';

anime({
  targets: '.element',
  background: [
    defaultTheme.colors.primary,
    defaultTheme.colors.secondary
  ],
  duration: defaultTheme.animations.duration.normal,
  easing: defaultTheme.animations.easing.spring,
});
\`\`\`

## Best Practices

1. **Consistency** - Use theme values instead of hard-coded colors and spacing
2. **Accessibility** - Ensure sufficient color contrast for text
3. **Testing** - Test your theme with different content and layouts
4. **Documentation** - Export and document custom themes for team use
5. **Versioning** - Keep theme configurations in version control
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onThemeChange: {
      description: 'Callback fired when theme changes',
      action: 'theme changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeConfigurator>;

export const Default: Story = {};

export const WithCallback: Story = {
  args: {
    onThemeChange: (theme) => {
      console.log('Theme changed:', theme);
    },
  },
};

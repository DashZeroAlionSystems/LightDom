# Command Palette Theme System

## Overview

The slash command dropdown (type `/` in chat) now has a fully configurable theme system with multiple built-in themes and support for custom styling.

## Features

- ✅ **Fixed opacity issue** - Command palette now has proper background visibility
- ✅ **5 built-in themes** - Default Dark, Light, Discord, Glass, Material Design
- ✅ **Configurable via styleguide** - All colors/styles exposed as CSS variables
- ✅ **Persistent preferences** - Theme choice saved to localStorage
- ✅ **Visual theme selector** - Easy-to-use UI component for theme switching
- ✅ **Backdrop blur** - Modern glassmorphism effects
- ✅ **Service worker fixed** - Disabled PWA in development to prevent fetch errors

## Quick Start

### Apply a Theme

```typescript
import { applyCommandPaletteTheme } from '@/config/command-palette-theme';

// Apply one of the built-in themes
applyCommandPaletteTheme('discord');
applyCommandPaletteTheme('glass');
applyCommandPaletteTheme('material');
```

### Add Theme Selector to Settings

```typescript
import { CommandPaletteThemeSelector } from '@/components/settings/CommandPaletteThemeSelector';

function SettingsPage() {
  return (
    <div>
      <h2>Appearance Settings</h2>
      <CommandPaletteThemeSelector />
    </div>
  );
}
```

## Available Themes

### 1. **Default Dark** (default)
- Dark background with subtle transparency
- Blue accent for selected items
- Best for general use

### 2. **Light**
- Clean white background
- Subtle shadows
- Perfect for bright environments

### 3. **Discord**
- Matches Discord's UI aesthetic
- Dark slate background
- Purple/blue accents

### 4. **Glass Morphism**
- Heavy backdrop blur
- High transparency
- Modern, premium feel

### 5. **Material Design**
- Google Material Design inspired
- Subtle elevation
- Blue accent colors

## CSS Variables

The following CSS variables can be customized:

```css
:root {
  --command-palette-bg: rgba(28, 28, 35, 0.98);
  --command-palette-border: rgba(255, 255, 255, 0.1);
  --command-palette-shadow: rgba(0, 0, 0, 0.5);
  --command-palette-header: rgba(255, 255, 255, 0.5);
  --command-palette-selected: rgba(88, 101, 242, 0.2);
  --command-palette-description: rgba(255, 255, 255, 0.6);
}
```

## Custom Theme Example

```typescript
import { setCustomThemeColors } from '@/config/command-palette-theme-examples';

setCustomThemeColors({
  background: 'rgba(20, 20, 30, 0.95)',
  border: 'rgba(100, 200, 255, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.8)',
  headerColor: 'rgba(255, 255, 255, 0.7)',
  selectedBackground: 'rgba(100, 200, 255, 0.25)',
  descriptionColor: 'rgba(200, 200, 255, 0.8)',
});
```

## Service Worker Fix

The service worker errors have been resolved by:

1. **Disabled in development** - PWA service worker only runs in production builds
2. **Removed navigation fallback** - Prevents fetch errors to non-existent routes
3. **Updated manifest** - Corrected app name and branding

## Implementation Details

### Files Created/Modified

1. **`frontend/src/config/command-palette-theme.ts`**
   - Theme definitions
   - Apply/save/load functions
   - 5 built-in themes

2. **`frontend/src/components/settings/CommandPaletteThemeSelector.tsx`**
   - Visual theme picker UI
   - Live preview of each theme
   - Saves user preference

3. **`frontend/src/components/ui/PromptInput.tsx`**
   - Updated dropdown styling
   - Uses CSS variables for theming
   - Fixed opacity with explicit background

4. **`frontend/vite.config.ts`**
   - Disabled service worker in dev mode
   - Updated PWA manifest
   - Fixed navigation fallback issues

5. **`frontend/src/App.tsx`**
   - Initializes theme on app load
   - Loads saved user preference

## Usage in Chat

1. Type `/` in the chat input
2. See the styled command dropdown appear
3. Navigate with arrow keys
4. Press Enter to select
5. Press Escape to close

## Theme Persistence

Themes are automatically saved to `localStorage` and restored on page reload:

```typescript
// Saved key
localStorage.getItem('command-palette-theme'); // 'discord', 'glass', etc.
```

## Browser Support

- Modern browsers with CSS custom properties support
- Backdrop filter requires recent browser versions
- Fallback colors provided for older browsers

## Future Enhancements

- [ ] Theme import/export functionality
- [ ] Live theme editor
- [ ] Sync themes across devices
- [ ] Community theme marketplace
- [ ] Animated theme transitions

## Troubleshooting

**Q: Dropdown still looks transparent?**
A: Make sure the theme is initialized in App.tsx. The theme loads from localStorage on mount.

**Q: Service worker errors in console?**
A: Clear your browser cache and reload. The service worker is now disabled in development.

**Q: How do I create a custom theme?**
A: Use `setCustomThemeColors()` or add a new theme to `commandPaletteThemes` in the theme config file.

## API Reference

### `applyCommandPaletteTheme(themeName)`
Applies a theme immediately without saving to localStorage.

### `saveCommandPaletteTheme(themeName)`
Applies and saves theme preference to localStorage.

### `loadCommandPaletteTheme()`
Returns the saved theme name from localStorage or 'default'.

### `getCommandPaletteTheme()`
Returns the current theme object with all CSS variable values.

## Support

For issues or feature requests, check:
- `/config/command-palette-theme-examples.ts` for usage examples
- Component source in `/components/ui/PromptInput.tsx`
- Theme selector in `/components/settings/CommandPaletteThemeSelector.tsx`

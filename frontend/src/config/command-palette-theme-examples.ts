/**
 * Command Palette Theme Configuration - Usage Examples
 * 
 * This file demonstrates how to use the command palette theme system
 */

import { 
  applyCommandPaletteTheme, 
  saveCommandPaletteTheme, 
  loadCommandPaletteTheme,
  CommandPaletteThemeName 
} from './command-palette-theme';

// Example 1: Apply a theme programmatically
export function applyDiscordTheme() {
  applyCommandPaletteTheme('discord');
}

// Example 2: Apply and save user preference
export function setUserTheme(themeName: CommandPaletteThemeName) {
  saveCommandPaletteTheme(themeName);
}

// Example 3: Load saved theme on app startup
export function initializeTheme() {
  const savedTheme = loadCommandPaletteTheme();
  applyCommandPaletteTheme(savedTheme);
}

// Example 4: Custom CSS variables
export function setCustomThemeColors(colors: {
  background?: string;
  border?: string;
  shadow?: string;
  headerColor?: string;
  selectedBackground?: string;
  descriptionColor?: string;
}) {
  const root = document.documentElement;
  
  if (colors.background) {
    root.style.setProperty('--command-palette-bg', colors.background);
  }
  if (colors.border) {
    root.style.setProperty('--command-palette-border', colors.border);
  }
  if (colors.shadow) {
    root.style.setProperty('--command-palette-shadow', colors.shadow);
  }
  if (colors.headerColor) {
    root.style.setProperty('--command-palette-header', colors.headerColor);
  }
  if (colors.selectedBackground) {
    root.style.setProperty('--command-palette-selected', colors.selectedBackground);
  }
  if (colors.descriptionColor) {
    root.style.setProperty('--command-palette-description', colors.descriptionColor);
  }
}

// Example 5: Add to settings page
/*
import { CommandPaletteThemeSelector } from '@/components/settings/CommandPaletteThemeSelector';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <CommandPaletteThemeSelector />
    </div>
  );
}
*/

// Example 6: Initialize in main App component
/*
import { initializeTheme } from '@/config/command-palette-theme-examples';

function App() {
  useEffect(() => {
    initializeTheme();
  }, []);
  
  return <YourApp />;
}
*/

/**
 * Command Palette Theme Configuration
 * Styleguide attributes for slash command dropdown appearance
 */

export interface CommandPaletteTheme {
  background: string;
  border: string;
  shadow: string;
  headerColor: string;
  selectedBackground: string;
  descriptionColor: string;
  backdropFilter: string;
}

export const commandPaletteThemes = {
  default: {
    background: 'rgba(28, 28, 35, 0.98)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    headerColor: 'rgba(255, 255, 255, 0.5)',
    selectedBackground: 'rgba(88, 101, 242, 0.2)',
    descriptionColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(16px)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.15)',
    headerColor: 'rgba(0, 0, 0, 0.5)',
    selectedBackground: 'rgba(88, 101, 242, 0.15)',
    descriptionColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(16px)',
  },
  discord: {
    background: 'rgba(47, 49, 54, 0.98)',
    border: 'rgba(114, 118, 125, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.6)',
    headerColor: 'rgba(185, 187, 190, 0.7)',
    selectedBackground: 'rgba(88, 101, 242, 0.25)',
    descriptionColor: 'rgba(185, 187, 190, 0.8)',
    backdropFilter: 'blur(20px)',
  },
  glass: {
    background: 'rgba(15, 15, 20, 0.85)',
    border: 'rgba(255, 255, 255, 0.15)',
    shadow: 'rgba(0, 0, 0, 0.7)',
    headerColor: 'rgba(255, 255, 255, 0.6)',
    selectedBackground: 'rgba(88, 101, 242, 0.3)',
    descriptionColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px) saturate(150%)',
  },
  material: {
    background: 'rgba(33, 33, 33, 0.95)',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    headerColor: 'rgba(255, 255, 255, 0.55)',
    selectedBackground: 'rgba(66, 165, 245, 0.2)',
    descriptionColor: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(10px)',
  },
} as const;

export type CommandPaletteThemeName = keyof typeof commandPaletteThemes;

/**
 * Apply command palette theme to CSS variables
 */
export function applyCommandPaletteTheme(
  themeName: CommandPaletteThemeName = 'default'
): void {
  const theme = commandPaletteThemes[themeName];
  
  document.documentElement.style.setProperty('--command-palette-bg', theme.background);
  document.documentElement.style.setProperty('--command-palette-border', theme.border);
  document.documentElement.style.setProperty('--command-palette-shadow', theme.shadow);
  document.documentElement.style.setProperty('--command-palette-header', theme.headerColor);
  document.documentElement.style.setProperty('--command-palette-selected', theme.selectedBackground);
  document.documentElement.style.setProperty('--command-palette-description', theme.descriptionColor);
}

/**
 * Get current command palette theme
 */
export function getCommandPaletteTheme(): CommandPaletteTheme {
  return {
    background: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-bg')
      .trim() || commandPaletteThemes.default.background,
    border: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-border')
      .trim() || commandPaletteThemes.default.border,
    shadow: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-shadow')
      .trim() || commandPaletteThemes.default.shadow,
    headerColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-header')
      .trim() || commandPaletteThemes.default.headerColor,
    selectedBackground: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-selected')
      .trim() || commandPaletteThemes.default.selectedBackground,
    descriptionColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--command-palette-description')
      .trim() || commandPaletteThemes.default.descriptionColor,
    backdropFilter: commandPaletteThemes.default.backdropFilter,
  };
}

/**
 * Save theme preference to localStorage
 */
export function saveCommandPaletteTheme(themeName: CommandPaletteThemeName): void {
  localStorage.setItem('command-palette-theme', themeName);
  applyCommandPaletteTheme(themeName);
}

/**
 * Load theme preference from localStorage
 */
export function loadCommandPaletteTheme(): CommandPaletteThemeName {
  const saved = localStorage.getItem('command-palette-theme') as CommandPaletteThemeName;
  return saved && saved in commandPaletteThemes ? saved : 'default';
}

// Initialize theme on module load
if (typeof document !== 'undefined') {
  applyCommandPaletteTheme(loadCommandPaletteTheme());
}

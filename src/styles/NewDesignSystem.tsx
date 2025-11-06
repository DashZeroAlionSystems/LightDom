/**
 * New Design System
 * Modern, accessible, and professional design system following Material Design 3
 * with enhanced theming and component styles
 */

// ===== COLOR TOKENS =====
export const Colors = {
  // Primary Colors
  primary: {
    0: '#000000',
    10: '#21005D',
    20: '#381E72',
    30: '#4F378B',
    40: '#6750A4',
    50: '#7F67BE',
    60: '#9A82DB',
    70: '#B69DF8',
    80: '#D0BCFF',
    90: '#EADDFF',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  
  // Secondary Colors
  secondary: {
    0: '#000000',
    10: '#1D192B',
    20: '#332D41',
    30: '#4A4458',
    40: '#625B71',
    50: '#7A7289',
    60: '#958DA5',
    70: '#B0A7C0',
    80: '#CCC2DC',
    90: '#E8DEF8',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },

  // Tertiary Tones
  tertiary: {
    0: '#000000',
    10: '#31111D',
    20: '#492532',
    30: '#633B48',
    40: '#7D5260',
    50: '#986977',
    60: '#B58392',
    70: '#D29DAC',
    80: '#EFB8C8',
    90: '#FFD8E4',
    95: '#FFECF1',
    99: '#FFFBFA',
    100: '#FFFFFF',
  },

  // Error Tones
  error: {
    0: '#000000',
    10: '#410E0B',
    20: '#601410',
    30: '#8C1D18',
    40: '#B3261E',
    50: '#DC362E',
    60: '#E46962',
    70: '#EC928E',
    80: '#F2B8B5',
    90: '#F9DEDC',
    95: '#FCEEEE',
    99: '#FFFBF9',
    100: '#FFFFFF',
  },

  // Neutral Tones
  neutral: {
    0: '#000000',
    4: '#0F0F12',
    6: '#151519',
    10: '#1C1B1F',
    12: '#201F24',
    17: '#2B2930',
    20: '#313033',
    22: '#36343B',
    24: '#3B383E',
    30: '#48464C',
    40: '#605D66',
    50: '#787579',
    60: '#939094',
    70: '#AEAAAE',
    80: '#C9C5CA',
    87: '#DEDCE0',
    90: '#E6E1E5',
    92: '#ECE6F0',
    94: '#F3EDF7',
    95: '#F5EFF7',
    96: '#F7F2F9',
    98: '#FEF7FF',
    99: '#FFFBFF',
    100: '#FFFFFF',
  },

  // Neutral Variant Tones
  neutralVariant: {
    0: '#000000',
    10: '#1D1A22',
    20: '#322F37',
    30: '#48464C',
    40: '#605D66',
    50: '#79757F',
    60: '#938F99',
    70: '#AEA9B4',
    80: '#CAC4D0',
    90: '#E7E0EC',
    95: '#F5EEFA',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
};

// ===== MATERIAL DESIGN 3 TYPOGRAPHY =====
export const MD3Typography = {
  // Display Styles
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
    letterSpacing: '0px',
  },

  // Headline Styles
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
    letterSpacing: '0px',
  },

  // Title Styles
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 400,
    letterSpacing: '0px',
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },

  // Label Styles
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },

  // Body Styles
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },
};

// ===== MATERIAL DESIGN 3 STATE LAYERS =====
export const StateLayers = {
  // Hover states
  hover: {
    opacity: 0.08,
  },
  // Focus states
  focus: {
    opacity: 0.12,
  },
  // Pressed states
  pressed: {
    opacity: 0.12,
  },
  // Dragged states
  dragged: {
    opacity: 0.16,
  },
};

// ===== MATERIAL DESIGN 3 ELEVATION =====
export const MD3Elevation = {
  level0: 'none',
  level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
  level4: '0px 2px 3px 0px rgba(0, 0, 0, 0.30), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
  level5: '0px 4px 4px 0px rgba(0, 0, 0, 0.30), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
};

// ===== MATERIAL DESIGN 3 SHAPES =====
export const MD3Shapes = {
  corner: {
    none: '0px',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '28px',
    full: '9999px',
  },
};

// ===== MATERIAL DESIGN 3 SPACING =====
export const MD3Spacing = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  6: '6px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
  36: '36px',
  40: '40px',
  44: '44px',
  48: '48px',
  56: '56px',
  64: '64px',
  72: '72px',
  80: '80px',
  96: '96px',
};

// ===== MATERIAL DESIGN 3 MOTION =====
export const MD3Motion = {
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    standardAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    standardDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    linear: 'cubic-bezier(0.0, 0.0, 1.0, 1.0)',
  },
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms',
  },
};

// ===== MATERIAL DESIGN 3 THEMES =====
export const LightTheme = {
  colors: {
    // Primary
    primary: Colors.primary[40],
    onPrimary: Colors.primary[100],
    primaryContainer: Colors.primary[90],
    onPrimaryContainer: Colors.primary[10],

    // Secondary
    secondary: Colors.secondary[40],
    onSecondary: Colors.secondary[100],
    secondaryContainer: Colors.secondary[90],
    onSecondaryContainer: Colors.secondary[10],

    // Tertiary
    tertiary: Colors.tertiary[40],
    onTertiary: Colors.tertiary[100],
    tertiaryContainer: Colors.tertiary[90],
    onTertiaryContainer: Colors.tertiary[10],

    // Error
    error: Colors.error[40],
    onError: Colors.error[100],
    errorContainer: Colors.error[90],
    onErrorContainer: Colors.error[10],

    // Background & Surface
    background: Colors.neutral[99],
    onBackground: Colors.neutral[10],
    surface: Colors.neutral[99],
    onSurface: Colors.neutral[10],
    surfaceVariant: Colors.neutralVariant[90],
    onSurfaceVariant: Colors.neutralVariant[30],

    // Outline
    outline: Colors.neutralVariant[50],
    outlineVariant: Colors.neutralVariant[80],

    // Inverse
    inverseSurface: Colors.neutral[20],
    inverseOnSurface: Colors.neutral[95],
    inversePrimary: Colors.primary[80],

    // Surface Tints (MD3 specific)
    surfaceTint: Colors.primary[40],
    surface1: Colors.neutral[99],
    surface2: Colors.neutral[98],
    surface3: Colors.neutral[96],
    surface4: Colors.neutral[94],
    surface5: Colors.neutral[92],
  },

  typography: MD3Typography,
  elevation: MD3Elevation,
  shapes: MD3Shapes,
  spacing: MD3Spacing,
  motion: MD3Motion,
  stateLayers: StateLayers,
};

export const DarkTheme = {
  colors: {
    // Primary
    primary: Colors.primary[80],
    onPrimary: Colors.primary[20],
    primaryContainer: Colors.primary[30],
    onPrimaryContainer: Colors.primary[90],

    // Secondary
    secondary: Colors.secondary[80],
    onSecondary: Colors.secondary[20],
    secondaryContainer: Colors.secondary[30],
    onSecondaryContainer: Colors.secondary[90],

    // Tertiary
    tertiary: Colors.tertiary[80],
    onTertiary: Colors.tertiary[20],
    tertiaryContainer: Colors.tertiary[30],
    onTertiaryContainer: Colors.tertiary[90],

    // Error
    error: Colors.error[80],
    onError: Colors.error[20],
    errorContainer: Colors.error[30],
    onErrorContainer: Colors.error[90],

    // Background & Surface
    background: Colors.neutral[10],
    onBackground: Colors.neutral[90],
    surface: Colors.neutral[10],
    onSurface: Colors.neutral[90],
    surfaceVariant: Colors.neutralVariant[30],
    onSurfaceVariant: Colors.neutralVariant[80],

    // Outline
    outline: Colors.neutralVariant[60],
    outlineVariant: Colors.neutralVariant[30],

    // Inverse
    inverseSurface: Colors.neutral[90],
    inverseOnSurface: Colors.neutral[20],
    inversePrimary: Colors.primary[40],

    // Surface Tints (MD3 specific)
    surfaceTint: Colors.primary[80],
    surface1: Colors.neutral[10],
    surface2: Colors.neutral[12],
    surface3: Colors.neutral[17],
    surface4: Colors.neutral[22],
    surface5: Colors.neutral[24],
  },

  typography: MD3Typography,
  elevation: MD3Elevation,
  shapes: MD3Shapes,
  spacing: MD3Spacing,
  motion: MD3Motion,
  stateLayers: StateLayers,
};

// ===== MATERIAL DESIGN 3 DESIGN SYSTEM =====
export const MD3DesignSystem = {
  light: LightTheme,
  dark: DarkTheme,

  // Helper functions
  getColor: (path: string, theme: 'light' | 'dark' = 'light') => {
    const pathArray = path.split('.');
    let result: any = theme === 'light' ? LightTheme.colors : DarkTheme.colors;

    for (const key of pathArray) {
      if (result[key] === undefined) {
        console.warn(`MD3 Color '${path}' not found in ${theme} theme`);
        return theme === 'light' ? '#000000' : '#FFFFFF';
      }
      result = result[key];
    }

    return result;
  },

  getSpacing: (value: keyof typeof MD3Spacing) => {
    return MD3Spacing[value] || '0px';
  },

  getShape: (corner: keyof typeof MD3Shapes.corner) => {
    return MD3Shapes.corner[corner] || '0px';
  },

  getElevation: (level: keyof typeof MD3Elevation) => {
    return MD3Elevation[level] || 'none';
  },

  getMotion: (property: 'duration' | 'easing', value: string) => {
    const category = property === 'duration' ? MD3Motion.duration : MD3Motion.easing;
    return (category as any)[value] || (property === 'duration' ? '200ms' : 'cubic-bezier(0.2, 0.0, 0, 1.0)');
  },

  getTypography: (style: keyof typeof MD3Typography) => {
    return MD3Typography[style] || MD3Typography.bodyMedium;
  },

  getStateLayer: (state: keyof typeof StateLayers, color: string = '#000000') => {
    const opacity = StateLayers[state].opacity;
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  },
};

export default MD3DesignSystem;

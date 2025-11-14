/**
 * Material Design 3 Styleguide Configuration
 * 
 * Comprehensive rules and patterns for Material Design 3 applications
 * Governs animations, styles, components, and design tokens
 * 
 * Based on research from:
 * - material.io/design
 * - m3.material.io
 * - material-web components
 * - mui.com (Material-UI)
 */

export interface MD3StyleguideConfig {
  version: string;
  metadata: {
    name: string;
    description: string;
    lastUpdated: string;
  };
  tokens: MD3DesignTokens;
  components: MD3ComponentRules;
  animations: MD3AnimationRules;
  typography: MD3TypographyRules;
  layout: MD3LayoutRules;
  accessibility: MD3AccessibilityRules;
  reports: MD3ReportRules;
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export interface MD3DesignTokens {
  colors: {
    primary: MD3ColorScale;
    secondary: MD3ColorScale;
    tertiary: MD3ColorScale;
    error: MD3ColorScale;
    neutral: MD3ColorScale;
    neutralVariant: MD3ColorScale;
    semantic: {
      success: MD3ColorScale;
      warning: MD3ColorScale;
      info: MD3ColorScale;
    };
  };
  spacing: {
    unit: number; // 8px base
    scale: Record<string, number>; // xs, sm, md, lg, xl, 2xl, 3xl
  };
  elevation: {
    levels: Record<string, ElevationLevel>; // 0-5
  };
  shape: {
    borderRadius: Record<string, number>; // none, xs, sm, md, lg, xl, full
  };
  motion: {
    duration: Record<string, number>; // instant, short, medium, long
    easing: Record<string, string>; // standard, emphasized, decelerated, accelerated
  };
}

interface MD3ColorScale {
  0: string;   // Pure black
  10: string;  // Darkest
  20: string;
  30: string;
  40: string;  // Default
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  99: string;
  100: string; // Pure white
}

interface ElevationLevel {
  level: number;
  shadow: string;
  overlayOpacity?: number;
}

// ============================================================================
// COMPONENT RULES
// ============================================================================

export interface MD3ComponentRules {
  button: {
    variants: {
      elevated: ComponentVariant;
      filled: ComponentVariant;
      tonal: ComponentVariant;
      outlined: ComponentVariant;
      text: ComponentVariant;
    };
    states: ComponentStates;
    sizes: Record<string, ComponentSize>;
    icons: {
      position: 'leading' | 'trailing' | 'both';
      size: number;
    };
  };
  card: {
    variants: {
      elevated: ComponentVariant;
      filled: ComponentVariant;
      outlined: ComponentVariant;
    };
    states: ComponentStates;
    padding: Record<string, number>;
    borderRadius: number;
  };
  navigation: {
    variants: {
      bar: ComponentVariant;
      rail: ComponentVariant;
      drawer: ComponentVariant;
    };
    states: ComponentStates;
    indicators: {
      type: 'pill' | 'underline';
      animation: string;
    };
  };
  dialog: {
    variants: {
      basic: ComponentVariant;
      fullscreen: ComponentVariant;
    };
    animations: {
      entrance: string;
      exit: string;
    };
    backdrop: {
      color: string;
      blur: number;
    };
  };
  menu: {
    variants: {
      standard: ComponentVariant;
    };
    animations: {
      entrance: string;
      exit: string;
      items: string;
    };
    elevation: number;
  };
  // Add more components as needed
}

interface ComponentVariant {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  elevation?: number;
  stateLayer?: string;
}

interface ComponentStates {
  default: StateProperties;
  hover: StateProperties;
  focus: StateProperties;
  pressed: StateProperties;
  disabled: StateProperties;
}

interface StateProperties {
  opacity?: number;
  stateLayerColor?: string;
  stateLayerOpacity?: number;
  transform?: string;
  transition?: string;
}

interface ComponentSize {
  height: number;
  padding: string;
  fontSize: number;
  iconSize: number;
}

// ============================================================================
// ANIMATION RULES
// ============================================================================

export interface MD3AnimationRules {
  principles: {
    purposeful: string;
    responsive: string;
    natural: string;
  };
  duration: {
    instant: number;      // 0-50ms - Icon animations
    short1: number;       // 50-100ms - Simple transitions
    short2: number;       // 100-150ms - Element transitions
    medium1: number;      // 150-200ms - Component state changes
    medium2: number;      // 200-250ms - Surface transitions
    long1: number;        // 250-300ms - Large surface transitions
    long2: number;        // 300-350ms - Screen transitions
    extraLong: number;    // 350-400ms - Complex animations
  };
  easing: {
    standard: {
      curve: string;       // cubic-bezier(0.2, 0, 0, 1)
      usage: string;
    };
    emphasized: {
      curve: string;       // cubic-bezier(0.05, 0.7, 0.1, 1)
      usage: string;
    };
    emphasizedDecelerate: {
      curve: string;       // cubic-bezier(0.3, 0, 0.8, 0.15)
      usage: string;
    };
    emphasizedAccelerate: {
      curve: string;       // cubic-bezier(0.3, 0, 0.8, 0.15)
      usage: string;
    };
  };
  patterns: {
    fadeIn: AnimationPattern;
    fadeOut: AnimationPattern;
    slideIn: AnimationPattern;
    slideOut: AnimationPattern;
    scale: AnimationPattern;
    expand: AnimationPattern;
    collapse: AnimationPattern;
    stagger: AnimationPattern;
  };
  componentSpecific: {
    button: {
      ripple: AnimationPattern;
      stateChange: AnimationPattern;
    };
    card: {
      entrance: AnimationPattern;
      hover: AnimationPattern;
    };
    dialog: {
      open: AnimationPattern;
      close: AnimationPattern;
    };
    menu: {
      open: AnimationPattern;
      close: AnimationPattern;
    };
    navigation: {
      indicatorMove: AnimationPattern;
      pageTransition: AnimationPattern;
    };
  };
}

interface AnimationPattern {
  duration: number;
  easing: string;
  properties: string[];
  keyframes?: Record<string, any>;
  description: string;
}

// ============================================================================
// TYPOGRAPHY RULES
// ============================================================================

export interface MD3TypographyRules {
  fontFamilies: {
    brand: string;
    plain: string;
    code: string;
  };
  scale: {
    displayLarge: TypeScale;
    displayMedium: TypeScale;
    displaySmall: TypeScale;
    headlineLarge: TypeScale;
    headlineMedium: TypeScale;
    headlineSmall: TypeScale;
    titleLarge: TypeScale;
    titleMedium: TypeScale;
    titleSmall: TypeScale;
    bodyLarge: TypeScale;
    bodyMedium: TypeScale;
    bodySmall: TypeScale;
    labelLarge: TypeScale;
    labelMedium: TypeScale;
    labelSmall: TypeScale;
  };
  colorUsage: {
    onPrimary: string;
    onSecondary: string;
    onTertiary: string;
    onSurface: string;
    onSurfaceVariant: string;
    onError: string;
  };
}

interface TypeScale {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
  textTransform?: string;
}

// ============================================================================
// LAYOUT RULES
// ============================================================================

export interface MD3LayoutRules {
  grid: {
    columns: number;
    gutterWidth: number;
    marginWidth: number;
    breakpoints: Record<string, number>;
  };
  spacing: {
    containerPadding: Record<string, number>;
    componentSpacing: Record<string, number>;
  };
  responsive: {
    compact: ResponsiveRules;
    medium: ResponsiveRules;
    expanded: ResponsiveRules;
  };
}

interface ResponsiveRules {
  breakpoint: number;
  columns: number;
  margin: number;
  gutter: number;
  components: Record<string, any>;
}

// ============================================================================
// ACCESSIBILITY RULES
// ============================================================================

export interface MD3AccessibilityRules {
  colorContrast: {
    minimumRatio: number; // 4.5:1 for normal text
    largeTextRatio: number; // 3:1 for large text
    uiComponentRatio: number; // 3:1 for UI components
  };
  focusIndicators: {
    visible: boolean;
    width: number;
    style: string;
    color: string;
  };
  touchTargets: {
    minimumSize: number; // 48x48dp
    spacing: number; // 8dp between targets
  };
  screenReaders: {
    ariaLabels: boolean;
    semanticHTML: boolean;
    roleAttributes: boolean;
  };
  motionPreferences: {
    respectReducedMotion: boolean;
    fallbackAnimations: boolean;
  };
}

// ============================================================================
// REPORT RULES
// ============================================================================

export interface MD3ReportRules {
  types: {
    web: ReportTypeRules;
    digital: ReportTypeRules;
    printed: ReportTypeRules;
    console: ReportTypeRules;
  };
  dataVisualization: {
    charts: {
      colors: string[];
      accessibility: boolean;
      animations: boolean;
    };
    tables: {
      striping: boolean;
      borders: boolean;
      hover: boolean;
    };
    infographics: {
      icons: boolean;
      illustrations: boolean;
      animations: boolean;
    };
  };
  formatting: {
    headers: {
      hierarchy: boolean;
      spacing: Record<string, number>;
    };
    sections: {
      dividers: boolean;
      spacing: number;
    };
    whitespace: {
      generous: boolean;
      breathingRoom: number;
    };
  };
}

interface ReportTypeRules {
  format: string;
  layout: string;
  colorProfile: string;
  typography: {
    scale: string;
    lineHeight: number;
  };
  animations: {
    enabled: boolean;
    subtle: boolean;
  };
  interactivity: {
    enabled: boolean;
    hover: boolean;
    click: boolean;
  };
  export: {
    formats: string[];
    quality: string;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const defaultMD3StyleguideConfig: MD3StyleguideConfig = {
  version: '3.0.0',
  metadata: {
    name: 'LightDom Material Design 3 Styleguide',
    description: 'Comprehensive Material Design 3 implementation with animation rules and component patterns',
    lastUpdated: new Date().toISOString(),
  },
  tokens: {
    colors: {
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
      // Similar structure for other colors...
      secondary: {} as MD3ColorScale,
      tertiary: {} as MD3ColorScale,
      error: {} as MD3ColorScale,
      neutral: {} as MD3ColorScale,
      neutralVariant: {} as MD3ColorScale,
      semantic: {
        success: {} as MD3ColorScale,
        warning: {} as MD3ColorScale,
        info: {} as MD3ColorScale,
      },
    },
    spacing: {
      unit: 8,
      scale: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
      },
    },
    elevation: {
      levels: {
        '0': { level: 0, shadow: 'none' },
        '1': { level: 1, shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)' },
        '2': { level: 2, shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)' },
        '3': { level: 3, shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)' },
        '4': { level: 4, shadow: '0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)' },
        '5': { level: 5, shadow: '0 4px 4px 0 rgba(0, 0, 0, 0.3), 0 8px 12px 6px rgba(0, 0, 0, 0.15)' },
      },
    },
    shape: {
      borderRadius: {
        none: 0,
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 28,
        full: 9999,
      },
    },
    motion: {
      duration: {
        instant: 0,
        short: 100,
        medium: 200,
        long: 300,
      },
      easing: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        decelerated: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
        accelerated: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
    },
  },
  components: {} as MD3ComponentRules,
  animations: {
    principles: {
      purposeful: 'Animations should have clear purpose and meaning',
      responsive: 'Animations should respond to user input smoothly',
      natural: 'Animations should feel natural and physically plausible',
    },
    duration: {
      instant: 0,
      short1: 50,
      short2: 100,
      medium1: 150,
      medium2: 200,
      long1: 250,
      long2: 300,
      extraLong: 350,
    },
    easing: {
      standard: {
        curve: 'cubic-bezier(0.2, 0, 0, 1)',
        usage: 'For most animations entering and exiting the screen',
      },
      emphasized: {
        curve: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        usage: 'For emphasized movements and important transitions',
      },
      emphasizedDecelerate: {
        curve: 'cubic-bezier(0, 0, 0, 1)',
        usage: 'For elements entering the screen',
      },
      emphasizedAccelerate: {
        curve: 'cubic-bezier(0.3, 0, 1, 1)',
        usage: 'For elements exiting the screen',
      },
    },
    patterns: {} as any,
    componentSpecific: {} as any,
  },
  typography: {} as MD3TypographyRules,
  layout: {} as MD3LayoutRules,
  accessibility: {
    colorContrast: {
      minimumRatio: 4.5,
      largeTextRatio: 3,
      uiComponentRatio: 3,
    },
    focusIndicators: {
      visible: true,
      width: 2,
      style: 'solid',
      color: '#6750A4',
    },
    touchTargets: {
      minimumSize: 48,
      spacing: 8,
    },
    screenReaders: {
      ariaLabels: true,
      semanticHTML: true,
      roleAttributes: true,
    },
    motionPreferences: {
      respectReducedMotion: true,
      fallbackAnimations: true,
    },
  },
  reports: {
    types: {
      web: {
        format: 'HTML',
        layout: 'responsive',
        colorProfile: 'sRGB',
        typography: {
          scale: 'dynamic',
          lineHeight: 1.6,
        },
        animations: {
          enabled: true,
          subtle: true,
        },
        interactivity: {
          enabled: true,
          hover: true,
          click: true,
        },
        export: {
          formats: ['PDF', 'HTML', 'JSON'],
          quality: 'high',
        },
      },
      digital: {
        format: 'PDF',
        layout: 'fixed',
        colorProfile: 'sRGB',
        typography: {
          scale: 'fixed',
          lineHeight: 1.5,
        },
        animations: {
          enabled: false,
          subtle: false,
        },
        interactivity: {
          enabled: false,
          hover: false,
          click: false,
        },
        export: {
          formats: ['PDF'],
          quality: 'high',
        },
      },
      printed: {
        format: 'PDF',
        layout: 'print',
        colorProfile: 'CMYK',
        typography: {
          scale: 'print',
          lineHeight: 1.4,
        },
        animations: {
          enabled: false,
          subtle: false,
        },
        interactivity: {
          enabled: false,
          hover: false,
          click: false,
        },
        export: {
          formats: ['PDF', 'PS'],
          quality: 'print',
        },
      },
      console: {
        format: 'Terminal',
        layout: 'fixed-width',
        colorProfile: 'ANSI',
        typography: {
          scale: 'monospace',
          lineHeight: 1.2,
        },
        animations: {
          enabled: true,
          subtle: true,
        },
        interactivity: {
          enabled: true,
          hover: false,
          click: false,
        },
        export: {
          formats: ['TXT', 'MD'],
          quality: 'ascii',
        },
      },
    },
    dataVisualization: {
      charts: {
        colors: ['#6750A4', '#7F67BE', '#9A82DB', '#B69DF8'],
        accessibility: true,
        animations: true,
      },
      tables: {
        striping: true,
        borders: true,
        hover: true,
      },
      infographics: {
        icons: true,
        illustrations: true,
        animations: true,
      },
    },
    formatting: {
      headers: {
        hierarchy: true,
        spacing: {
          h1: 48,
          h2: 32,
          h3: 24,
          h4: 16,
        },
      },
      sections: {
        dividers: true,
        spacing: 32,
      },
      whitespace: {
        generous: true,
        breathingRoom: 24,
      },
    },
  },
};

export default defaultMD3StyleguideConfig;

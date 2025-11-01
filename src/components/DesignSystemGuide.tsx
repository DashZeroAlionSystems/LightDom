/**
 * Comprehensive Design System & Style Guide
 * Material Design 3.0 + Motion Design Principles
 */

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  Layout,
  MousePointer,
  Zap,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Sun,
  Moon,
  Wind,
  Waves,
  Sparkles,
  Heart,
  Star,
  Award,
  Target,
  Compass,
  Layers,
  Grid3X3,
  Move,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  Code,
  FileText,
  Download,
  Upload,
  Share,
  Link,
  ExternalLink,
  Copy,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  User,
  Users,
  MessageCircle,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Lock,
  Unlock,
  Eye as EyeIcon,
  EyeOff,
  Edit,
  Trash,
  Save,
  RefreshCw,
  MoreHorizontal,
  MoreVertical,
  Menu,
  X as Close,
  Maximize,
  Minimize,
  Loader,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle
} from 'lucide-react';

interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius' | 'motion';
  description: string;
}

interface ComponentVariant {
  name: string;
  description: string;
  usage: string;
  props: Record<string, string>;
}

interface MotionPreset {
  name: string;
  duration: string;
  easing: string;
  description: string;
  useCase: string;
}

const DesignSystemGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [motionEnabled, setMotionEnabled] = useState(true);

  // Material Design 3.0 Color System
  const colorTokens: DesignToken[] = [
    // Primary Colors
    { name: '--md-sys-color-primary', value: '#6750A4', category: 'color', description: 'Primary brand color' },
    { name: '--md-sys-color-on-primary', value: '#FFFFFF', category: 'color', description: 'Text on primary' },
    { name: '--md-sys-color-primary-container', value: '#EADDFF', category: 'color', description: 'Primary container' },
    { name: '--md-sys-color-on-primary-container', value: '#21005D', category: 'color', description: 'Text on primary container' },

    // Secondary Colors
    { name: '--md-sys-color-secondary', value: '#625B71', category: 'color', description: 'Secondary accent color' },
    { name: '--md-sys-color-on-secondary', value: '#FFFFFF', category: 'color', description: 'Text on secondary' },
    { name: '--md-sys-color-secondary-container', value: '#E8DEF8', category: 'color', description: 'Secondary container' },

    // Tertiary Colors
    { name: '--md-sys-color-tertiary', value: '#7D5260', category: 'color', description: 'Tertiary accent color' },
    { name: '--md-sys-color-on-tertiary', value: '#FFFFFF', category: 'color', description: 'Text on tertiary' },
    { name: '--md-sys-color-tertiary-container', value: '#FFD8E4', category: 'color', description: 'Tertiary container' },

    // Error Colors
    { name: '--md-sys-color-error', value: '#B3261E', category: 'color', description: 'Error state color' },
    { name: '--md-sys-color-on-error', value: '#FFFFFF', category: 'color', description: 'Text on error' },
    { name: '--md-sys-color-error-container', value: '#F9DEDC', category: 'color', description: 'Error container' },

    // Surface Colors
    { name: '--md-sys-color-surface', value: '#FFFBFE', category: 'color', description: 'Base surface color' },
    { name: '--md-sys-color-on-surface', value: '#1C1B1F', category: 'color', description: 'Text on surface' },
    { name: '--md-sys-color-surface-variant', value: '#E7E0EC', category: 'color', description: 'Surface variant' },
    { name: '--md-sys-color-on-surface-variant', value: '#49454F', category: 'color', description: 'Text on surface variant' },
  ];

  // Typography Scale
  const typographyTokens: DesignToken[] = [
    { name: '--md-sys-typescale-display-large', value: 'font-size: 57px; line-height: 64px; font-weight: 400', category: 'typography', description: 'Display Large - Headlines' },
    { name: '--md-sys-typescale-display-medium', value: 'font-size: 45px; line-height: 52px; font-weight: 400', category: 'typography', description: 'Display Medium - Headlines' },
    { name: '--md-sys-typescale-display-small', value: 'font-size: 36px; line-height: 44px; font-weight: 400', category: 'typography', description: 'Display Small - Headlines' },
    { name: '--md-sys-typescale-headline-large', value: 'font-size: 32px; line-height: 40px; font-weight: 400', category: 'typography', description: 'Headline Large - Section headers' },
    { name: '--md-sys-typescale-headline-medium', value: 'font-size: 28px; line-height: 36px; font-weight: 400', category: 'typography', description: 'Headline Medium - Section headers' },
    { name: '--md-sys-typescale-headline-small', value: 'font-size: 24px; line-height: 32px; font-weight: 400', category: 'typography', description: 'Headline Small - Section headers' },
    { name: '--md-sys-typescale-title-large', value: 'font-size: 22px; line-height: 28px; font-weight: 400', category: 'typography', description: 'Title Large - Component titles' },
    { name: '--md-sys-typescale-title-medium', value: 'font-size: 16px; line-height: 24px; font-weight: 500', category: 'typography', description: 'Title Medium - Component titles' },
    { name: '--md-sys-typescale-title-small', value: 'font-size: 14px; line-height: 20px; font-weight: 500', category: 'typography', description: 'Title Small - Component titles' },
    { name: '--md-sys-typescale-body-large', value: 'font-size: 16px; line-height: 24px; font-weight: 400', category: 'typography', description: 'Body Large - Primary content' },
    { name: '--md-sys-typescale-body-medium', value: 'font-size: 14px; line-height: 20px; font-weight: 400', category: 'typography', description: 'Body Medium - Secondary content' },
    { name: '--md-sys-typescale-body-small', value: 'font-size: 12px; line-height: 16px; font-weight: 400', category: 'typography', description: 'Body Small - Captions' },
    { name: '--md-sys-typescale-label-large', value: 'font-size: 14px; line-height: 20px; font-weight: 500', category: 'typography', description: 'Label Large - Buttons, input labels' },
    { name: '--md-sys-typescale-label-medium', value: 'font-size: 12px; line-height: 16px; font-weight: 500', category: 'typography', description: 'Label Medium - Input labels' },
    { name: '--md-sys-typescale-label-small', value: 'font-size: 11px; line-height: 16px; font-weight: 500', category: 'typography', description: 'Label Small - Input labels' },
  ];

  // Motion Presets (Material Design 3.0)
  const motionPresets: MotionPreset[] = [
    { name: 'Emphasized', duration: '500ms', easing: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', description: 'For important state changes', useCase: 'Page transitions, major component changes' },
    { name: 'Standard', duration: '300ms', easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)', description: 'For common interactions', useCase: 'Button presses, card reveals, menu opens' },
    { name: 'Emphasized Decelerate', duration: '400ms', easing: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)', description: 'For entering elements', useCase: 'Components entering the screen' },
    { name: 'Emphasized Accelerate', duration: '200ms', easing: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)', description: 'For exiting elements', useCase: 'Components exiting the screen' },
  ];

  // Component Variants
  const buttonVariants: ComponentVariant[] = [
    {
      name: 'Filled Button',
      description: 'High-emphasis button for primary actions',
      usage: 'Primary actions, form submissions, important CTAs',
      props: { variant: 'filled', hierarchy: 'primary' }
    },
    {
      name: 'Outlined Button',
      description: 'Medium-emphasis button for secondary actions',
      usage: 'Secondary actions, alternative options',
      props: { variant: 'outlined', hierarchy: 'secondary' }
    },
    {
      name: 'Text Button',
      description: 'Low-emphasis button for subtle actions',
      usage: 'Cancel actions, less important options',
      props: { variant: 'text', hierarchy: 'tertiary' }
    },
    {
      name: 'Elevated Button',
      description: 'Button with elevation for floating actions',
      usage: 'FABs, prominent secondary actions',
      props: { variant: 'elevated', hierarchy: 'secondary' }
    },
    {
      name: 'Tonal Button',
      description: 'Filled button with secondary color',
      usage: 'Alternative primary actions',
      props: { variant: 'tonal', hierarchy: 'secondary' }
    }
  ];

  const sections = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Layout },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'motion', label: 'Motion', icon: Zap },
    { id: 'responsive', label: 'Responsive', icon: Smartphone },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'code', label: 'Code Examples', icon: Code }
  ];

  const ColorPalette = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {colorTokens.map((token) => (
        <div key={token.name} className="space-y-2">
          <div
            className="h-16 rounded-lg border shadow-sm"
            style={{ backgroundColor: token.value }}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">{token.name.split('--md-sys-color-')[1]}</p>
            <p className="text-xs text-muted-foreground">{token.value}</p>
            <p className="text-xs">{token.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const TypographyScale = () => (
    <div className="space-y-6">
      {typographyTokens.map((token) => (
        <div key={token.name} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{token.name.split('--md-sys-typescale-')[1].replace('-', ' ')}</h4>
            <code className="text-xs bg-muted px-2 py-1 rounded">{token.value}</code>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{token.description}</p>
          <div style={{ fontSize: token.value.split('font-size: ')[1].split(';')[0] }}>
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>
  );

  const MotionShowcase = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {motionPresets.map((preset) => (
          <div key={preset.name} className="border rounded-lg p-6">
            <h4 className="font-semibold mb-2">{preset.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{preset.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <code>{preset.duration}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span>Easing:</span>
                <code className="text-xs">{preset.easing}</code>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{preset.useCase}</p>
          </div>
        ))}
      </div>

      {/* Interactive Motion Demo */}
      <div className="border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Interactive Motion Demo</h4>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              transitionTimingFunction: motionPresets[1].easing,
              transitionDuration: motionPresets[1].duration
            }}
          >
            Hover me (Standard)
          </button>
          <button
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
            style={{
              transitionTimingFunction: motionPresets[0].easing,
              transitionDuration: motionPresets[0].duration
            }}
          >
            Hover me (Emphasized)
          </button>
        </div>
      </div>
    </div>
  );

  const ComponentShowcase = () => (
    <div className="space-y-8">
      {/* Buttons */}
      <div>
        <h4 className="font-semibold mb-4">Button Variants</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buttonVariants.map((variant) => (
            <div key={variant.name} className="border rounded-lg p-4">
              <h5 className="font-medium mb-2">{variant.name}</h5>
              <p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                {variant.name}
              </button>
              <p className="text-xs text-muted-foreground mt-2">{variant.usage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Elements */}
      <div>
        <h4 className="font-semibold mb-4">Form Elements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Text Input</label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Select</label>
              <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Checkbox</label>
              <div className="flex items-center space-x-2 mt-1">
                <input type="checkbox" id="checkbox" className="rounded" />
                <label htmlFor="checkbox" className="text-sm">Check me</label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Radio Buttons</label>
              <div className="space-y-1 mt-1">
                <div className="flex items-center space-x-2">
                  <input type="radio" name="radio" id="radio1" className="text-primary" />
                  <label htmlFor="radio1" className="text-sm">Option 1</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="radio" id="radio2" className="text-primary" />
                  <label htmlFor="radio2" className="text-sm">Option 2</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ResponsiveBreakpoints = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <h4 className="font-medium">Mobile</h4>
          <p className="text-sm text-muted-foreground">320px - 767px</p>
          <p className="text-xs mt-1">Single column, stacked layout</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <Tablet className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <h4 className="font-medium">Tablet</h4>
          <p className="text-sm text-muted-foreground">768px - 1023px</p>
          <p className="text-xs mt-1">2-3 columns, flexible layout</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <Monitor className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <h4 className="font-medium">Desktop</h4>
          <p className="text-sm text-muted-foreground">1024px - 1439px</p>
          <p className="text-xs mt-1">Multi-column, full layout</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <Maximize className="h-8 w-8 mx-auto mb-2 text-orange-600" />
          <h4 className="font-medium">Large Desktop</h4>
          <p className="text-sm text-muted-foreground">1440px+</p>
          <p className="text-xs mt-1">Wide layout, enhanced spacing</p>
        </div>
      </div>

      {/* Responsive Grid Demo */}
      <div className="border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Responsive Grid Demo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-primary/10 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{i + 1}</div>
              <div className="text-sm text-muted-foreground">Grid Item</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AccessibilityGuidelines = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Color Contrast
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-100 text-green-900 rounded">
              <span>Primary on Background</span>
              <span className="font-medium">4.5:1 ✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-100 text-yellow-900 rounded">
              <span>Secondary on Background</span>
              <span className="font-medium">3.2:1 ⚠</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-100 text-red-900 rounded">
              <span>Low contrast text</span>
              <span className="font-medium">2.1:1 ✗</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Focus Management
          </h4>
          <div className="space-y-3">
            <div className="p-3 border-2 border-primary rounded">
              <p className="text-sm">Focused element (visible focus ring)</p>
            </div>
            <div className="p-3 border-2 border-transparent focus-within:border-primary rounded">
              <input
                type="text"
                placeholder="Focus me to see focus ring"
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Accessibility Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'WCAG 2.1 AA compliance',
            'Keyboard navigation support',
            'Screen reader compatibility',
            'High contrast mode support',
            'Reduced motion preferences',
            'Semantic HTML structure',
            'ARIA labels and descriptions',
            'Focus management',
            'Color blindness friendly',
            'Minimum touch targets (44px)'
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold mb-4">Material Design 3.0 + Motion</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A comprehensive design system built on Material Design principles with advanced motion design and accessibility features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 text-center">
                <Palette className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Dynamic Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Adaptive color system that responds to user preferences and content
                </p>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Motion Design</h3>
                <p className="text-sm text-muted-foreground">
                  Expressive animations and transitions following Material motion principles
                </p>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Accessibility First</h3>
                <p className="text-sm text-muted-foreground">
                  WCAG 2.1 AA compliant with comprehensive accessibility features
                </p>
              </div>
            </div>
          </div>
        );
      case 'colors':
        return <ColorPalette />;
      case 'typography':
        return <TypographyScale />;
      case 'motion':
        return <MotionShowcase />;
      case 'components':
        return <ComponentShowcase />;
      case 'responsive':
        return <ResponsiveBreakpoints />;
      case 'accessibility':
        return <AccessibilityGuidelines />;
      case 'code':
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h4 className="font-semibold mb-4">CSS Custom Properties Usage</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`/* Using design tokens */
.my-component {
  color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
  font: var(--md-sys-typescale-body-large);
  border-radius: var(--md-sys-shape-corner-medium);
  transition: all var(--md-sys-motion-duration-standard)
              var(--md-sys-motion-easing-standard);
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .my-component {
    font: var(--md-sys-typescale-title-medium);
  }
}`}
              </pre>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="font-semibold mb-4">React Component Example</h4>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { motion } from 'framer-motion';

const AnimatedButton = ({ children, variant = 'filled' }) => (
  <motion.button
    className={\`btn btn-\${variant}\`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{
      duration: 0.3,
      ease: [0.2, 0.0, 0.0, 1.0] // Material standard easing
    }}
  >
    {children}
  </motion.button>
);`}
              </pre>
            </div>
          </div>
        );
      default:
        return <div>Select a section to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Design System</h1>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Controls */}
          <div className="p-6 border-t space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg hover:bg-muted"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Motion</span>
              <button
                onClick={() => setMotionEnabled(!motionEnabled)}
                className={`p-2 rounded-lg hover:bg-muted ${motionEnabled ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Zap className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemGuide;
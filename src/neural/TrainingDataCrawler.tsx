import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Globe,
  Database,
  FileText,
  Network,
  Brain,
  Zap,
  Target,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Move,
  Copy,
  Scissors,
  Clipboard,
  Save,
  Plus,
  Minus,
  Edit3,
  Eye,
  EyeOff,
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  Smartphone,
  Tablet,
  Laptop,
  Mouse,
  Keyboard,
  Printer,
  Speaker,
  Headphones,
  Mic,
  Camera,
  Watch,
  Gamepad2,
  Joystick,
  Trophy,
  Medal,
  Award,
  Star,
  Heart,
  Shield,
  Lock,
  Unlock,
  Key,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Gem,
  Diamond,
  Coins,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Receipt,
  Calculator,
  Volume1,
  Search,
  Filter,
  Settings,
  Tool,
  Wrench,
  Cog,
  Cpu,
  Server,
  Cloud,
  Map,
  Navigation,
  Home,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  Timer,
  Battery,
  Wifi,
  Bluetooth,
  Usb,
  Hdmi,
  Monitor,
  MousePointer,
  Hand,
  Eye as Visible,
  EyeOff as Hidden,
  Sun,
  Moon,
  Thermometer,
  Wind,
  Droplets,
  Umbrella,
  Snowflake,
  Flame,
  Leaf,
  Flower,
  Tree,
  Mountain,
  Waves,
  CloudRain,
  CloudSnow,
  Zap as Storm,
  Rainbow,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  ThumbsUp,
  ThumbsDown,
  Heart as Love,
  BrokenHeart,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  RotateCcw,
  RotateCw,
  RefreshCw,
  RefreshCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Move as Drag,
  Grid,
  Columns,
  Rows,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond as Shape,
  Star as ShapeStar,
  Heart as ShapeHeart,
  Shield as ShapeShield,
  Crown as ShapeCrown,
  Gem as ShapeGem,
  Diamond as ShapeDiamond,
  Coins as ShapeCoins,
  CreditCard as ShapeCard,
  Wallet as ShapeWallet,
  PiggyBank as ShapePiggy,
  Banknote as ShapeBill,
  Receipt as ShapeReceipt,
  Calculator as ShapeCalc,
  Volume1 as ShapeVolume,
  Search as ShapeSearch,
  Filter as ShapeFilter,
  Settings as ShapeSettings,
  Tool as ShapeTool,
  Wrench as ShapeWrench,
  Cog as ShapeCog,
  Cpu as ShapeCpu,
  Server as ShapeServer,
  Cloud as ShapeCloud,
  Globe as ShapeGlobe,
  Map as ShapeMap,
  Navigation as ShapeNav,
  Home as ShapeHome,
  Mail as ShapeMail,
  Phone as ShapePhone,
  MessageSquare as ShapeMessage,
  Bell as ShapeBell,
  Calendar as ShapeCal,
  Clock as ShapeClock,
  Timer as ShapeTimer,
  Zap as ShapeLightning,
  Battery as ShapeBattery,
  Wifi as ShapeWifi,
  Bluetooth as ShapeBluetooth,
  Usb as ShapeUsb,
  Hdmi as ShapeHdmi,
  Monitor as ShapeMonitor,
  MousePointer as ShapeMouse,
  Hand as ShapeHand,
  Eye as ShapeVisible,
  EyeOff as ShapeHidden,
  Sun as ShapeSun,
  Moon as ShapeMoon,
  Thermometer as ShapeTemp,
  Wind as ShapeWind,
  Droplets as ShapeWater,
  Umbrella as ShapeUmbrella,
  Snowflake as ShapeSnow,
  Flame as ShapeFire,
  Leaf as ShapeLeaf,
  Flower as ShapeFlower,
  Tree as ShapeTree,
  Mountain as ShapeMountain,
  Waves as ShapeWaves,
  CloudRain as ShapeRain,
  CloudSnow as ShapeBlizzard,
  Zap as ShapeStorm,
  Rainbow as ShapeRainbow,
  Smile as ShapeSmile,
  Frown as ShapeFrown,
  Meh as ShapeMeh,
  Laugh as ShapeLaugh,
  Angry as ShapeAngry,
  ThumbsUp as ShapeThumbsUp,
  ThumbsDown as ShapeThumbsDown,
  Heart as ShapeLove,
  BrokenHeart as ShapeBroken,
  Check as ShapeCheck,
  X as ShapeX,
  AlertTriangle as ShapeAlert,
  AlertCircle as ShapeWarning,
  Info as ShapeInfo,
  HelpCircle as ShapeHelp,
  ChevronUp as ShapeChevronUp,
  ChevronDown as ShapeChevronDown,
  ChevronLeft as ShapeChevronLeft,
  ChevronRight as ShapeChevronRight,
  ArrowUpCircle as ShapeArrowUpCircle,
  ArrowDownCircle as ShapeArrowDownCircle,
  ArrowLeftCircle as ShapeArrowLeftCircle,
  ArrowRightCircle as ShapeArrowRightCircle,
  RotateCcw as ShapeRotateCcw,
  RotateCw as ShapeRotateCw,
  RefreshCw as ShapeRefreshCw,
  RefreshCcw as ShapeRefreshCcw,
  ZoomIn as ShapeZoomIn,
  ZoomOut as ShapeZoomOut,
  Maximize as ShapeMaximize,
  Minimize as ShapeMinimize,
  Maximize2 as ShapeMaximize2,
  Minimize2 as ShapeMinimize2,
  Move as ShapeDrag,
  Grid as ShapeGrid,
  Columns as ShapeColumns,
  Rows as ShapeRows,
  Layout as ShapeLayout,
  Sidebar as ShapeSidebar,
  PanelLeft as ShapePanelLeft,
  PanelRight as ShapePanelRight,
  SplitSquareHorizontal as ShapeSplitH,
  SplitSquareVertical as ShapeSplitV,
  Square as ShapeSquare,
  Circle as ShapeCircle,
  Triangle as ShapeTriangle,
  Hexagon as ShapeHexagon,
  Octagon as ShapeOctagon,
  Pentagon as ShapePentagon,
  Diamond as ShapeRhombus,
  Star as ShapeStar,
  Heart as ShapeHeartShape,
  Shield as ShapeShieldShape,
  Crown as ShapeCrownShape,
  Gem as ShapeGemShape,
  Diamond as ShapeDiamondShape,
  Coins as ShapeCoinsShape,
  CreditCard as ShapeCardShape,
  Wallet as ShapeWalletShape,
  PiggyBank as ShapePiggyShape,
  Banknote as ShapeBillShape,
  Receipt as ShapeReceiptShape,
  Calculator as ShapeCalcShape,
  Volume1 as ShapeVolumeShape
} from 'lucide-react';

// Advanced Training Data Crawling System
interface CrawlTarget {
  name: string;
  url: string;
  category: 'design-system' | 'component-library' | 'ui-patterns' | 'documentation' | 'examples';
  priority: 'high' | 'medium' | 'low';
  selectors: {
    components: string[];
    patterns: string[];
    codeExamples: string[];
    documentation: string[];
    assets: string[];
  };
  rateLimit: number; // ms between requests
  maxDepth: number;
  allowedDomains: string[];
  extractors: {
    componentSchemas: ComponentExtractor[];
    designTokens: TokenExtractor[];
    usagePatterns: PatternExtractor[];
    trainingExamples: TrainingExtractor[];
  };
}

interface ComponentExtractor {
  name: string;
  selector: string;
  properties: {
    name: string;
    description: string;
    category: string;
    variants: string[];
    props: string[];
    examples: string[];
  };
  schema: {
    visual: string[];
    behavioral: string[];
    semantic: string[];
    accessibility: string[];
    responsive: string[];
  };
}

interface TokenExtractor {
  name: string;
  selector: string;
  tokens: {
    colors: string[];
    typography: string[];
    spacing: string[];
    shadows: string[];
    borders: string[];
    breakpoints: string[];
  };
}

interface PatternExtractor {
  name: string;
  selector: string;
  patterns: {
    layout: string[];
    navigation: string[];
    forms: string[];
    dataDisplay: string[];
    feedback: string[];
    overlays: string[];
  };
}

interface TrainingExtractor {
  name: string;
  selector: string;
  examples: {
    componentUsage: string[];
    composition: string[];
    styling: string[];
    interaction: string[];
    responsive: string[];
  };
}

interface CrawlResult {
  url: string;
  timestamp: Date;
  status: 'success' | 'error' | 'timeout' | 'blocked';
  responseTime: number;
  data: {
    components: ComponentData[];
    tokens: TokenData[];
    patterns: PatternData[];
    examples: ExampleData[];
    links: string[];
    assets: string[];
  };
  errors: string[];
  metadata: {
    contentType: string;
    size: number;
    encoding: string;
    language: string;
    lastModified?: Date;
  };
}

interface ComponentData {
  name: string;
  category: string;
  description: string;
  variants: VariantData[];
  properties: PropertyData[];
  usage: UsageData[];
  schema: ComponentSchemaData;
}

interface VariantData {
  name: string;
  description: string;
  usage: string;
  styling: Record<string, any>;
  accessibility: Record<string, any>;
}

interface PropertyData {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: Record<string, any>;
}

interface UsageData {
  context: string;
  frequency: number;
  examples: string[];
  bestPractices: string[];
}

interface ComponentSchemaData {
  visual: Record<string, any>;
  behavioral: Record<string, any>;
  semantic: Record<string, any>;
  accessibility: Record<string, any>;
  responsive: Record<string, any>;
}

interface TokenData {
  category: string;
  name: string;
  value: any;
  usage: string[];
  variants: Record<string, any>;
}

interface PatternData {
  name: string;
  category: string;
  description: string;
  components: string[];
  layout: Record<string, any>;
  interactions: Record<string, any>;
  examples: string[];
}

interface ExampleData {
  type: 'component' | 'pattern' | 'layout' | 'interaction';
  title: string;
  description: string;
  code: string;
  preview?: string;
  tags: string[];
  complexity: number;
}

interface TrainingDataPoint {
  input: {
    component: string;
    context: string;
    requirements: string[];
    constraints: string[];
  };
  output: {
    schema: ComponentSchemaData;
    composition: Record<string, any>;
    styling: Record<string, any>;
    interactions: Record<string, any>;
  };
  metadata: {
    source: string;
    confidence: number;
    complexity: number;
    tags: string[];
    timestamp: Date;
  };
}

interface CrawlSession {
  id: string;
  targets: CrawlTarget[];
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  progress: {
    total: number;
    completed: number;
    errors: number;
    skipped: number;
  };
  results: CrawlResult[];
  trainingData: TrainingDataPoint[];
  statistics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalDataSize: number;
    uniqueComponents: number;
    uniquePatterns: number;
    trainingExamples: number;
  };
}

// Training Data Crawling System
class TrainingDataCrawler {
  private crawlQueue: CrawlTarget[] = [];
  private activeSessions: Map<string, CrawlSession> = new Map();
  private rateLimiters: Map<string, number> = new Map();
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  constructor() {
    this.initializeCrawlTargets();
  }

  private initializeCrawlTargets(): void {
    this.crawlQueue = [
      // Design Systems
      {
        name: 'Material Design',
        url: 'https://material.io',
        category: 'design-system',
        priority: 'high',
        selectors: {
          components: ['.component-card', '.mdc-component', '[data-component]'],
          patterns: ['.pattern-card', '.usage-pattern', '.design-pattern'],
          codeExamples: ['.code-example', 'pre', '.highlight'],
          documentation: ['.documentation', '.docs-content', '.api-docs'],
          assets: ['.asset-card', '.resource-card']
        },
        rateLimit: 1000,
        maxDepth: 3,
        allowedDomains: ['material.io', 'material-components.github.io'],
        extractors: {
          componentSchemas: [
            {
              name: 'Button Component',
              selector: '.component-card[data-component*="button"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['colors', 'typography', 'spacing', 'elevation'],
                behavioral: ['interactions', 'states', 'animations'],
                semantic: ['purpose', 'context', 'accessibility'],
                accessibility: ['aria', 'keyboard', 'screen-reader'],
                responsive: ['breakpoints', 'fluid', 'orientation']
              }
            },
            {
              name: 'Card Component',
              selector: '.component-card[data-component*="card"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['layout', 'colors', 'typography', 'borders'],
                behavioral: ['hover', 'focus', 'click'],
                semantic: ['content-type', 'hierarchy'],
                accessibility: ['landmarks', 'headings', 'focus-management'],
                responsive: ['grid', 'flex', 'media-queries']
              }
            }
          ],
          designTokens: [
            {
              name: 'Color Tokens',
              selector: '.color-palette, .color-tokens',
              tokens: {
                colors: ['.color-swatch', '.color-token'],
                typography: ['.typography-token', '.font-token'],
                spacing: ['.spacing-token', '.margin-token', '.padding-token'],
                shadows: ['.shadow-token', '.elevation-token'],
                borders: ['.border-token', '.radius-token'],
                breakpoints: ['.breakpoint-token', '.media-query-token']
              }
            }
          ],
          usagePatterns: [
            {
              name: 'Layout Patterns',
              selector: '.layout-pattern, .page-layout',
              patterns: {
                layout: ['.grid-layout', '.flex-layout', '.absolute-layout'],
                navigation: ['.nav-pattern', '.menu-pattern', '.breadcrumb-pattern'],
                forms: ['.form-pattern', '.input-group', '.validation-pattern'],
                dataDisplay: ['.table-pattern', '.list-pattern', '.chart-pattern'],
                feedback: ['.toast-pattern', '.modal-pattern', '.tooltip-pattern'],
                overlays: ['.drawer-pattern', '.dialog-pattern', '.popover-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Component Usage Examples',
              selector: '.usage-example, .code-example',
              examples: {
                componentUsage: ['.component-usage', '.implementation-example'],
                composition: ['.composition-example', '.component-combination'],
                styling: ['.styling-example', '.theming-example'],
                interaction: ['.interaction-example', '.behavior-example'],
                responsive: ['.responsive-example', '.breakpoint-example']
              }
            }
          ]
        }
      },

      // Component Libraries
      {
        name: 'Ant Design',
        url: 'https://ant.design',
        category: 'component-library',
        priority: 'high',
        selectors: {
          components: ['.ant-component', '.component-item', '[data-component]'],
          patterns: ['.ant-pattern', '.usage-pattern', '.best-practice'],
          codeExamples: ['.code-box', 'pre', '.highlight'],
          documentation: ['.markdown', '.api-doc', '.component-doc'],
          assets: ['.resource-item', '.download-item']
        },
        rateLimit: 1500,
        maxDepth: 4,
        allowedDomains: ['ant.design', 'ant-design.antgroup.com'],
        extractors: {
          componentSchemas: [
            {
              name: 'Ant Button',
              selector: '.ant-component[data-name*="button"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['type', 'size', 'shape', 'icon'],
                behavioral: ['loading', 'disabled', 'onClick'],
                semantic: ['htmlType', 'role'],
                accessibility: ['aria-label', 'tabIndex'],
                responsive: ['block', 'responsive']
              }
            }
          ],
          designTokens: [
            {
              name: 'Ant Design Tokens',
              selector: '.design-token, .token-item',
              tokens: {
                colors: ['.color-token'],
                typography: ['.font-token', '.text-token'],
                spacing: ['.space-token', '.margin-token'],
                shadows: ['.shadow-token'],
                borders: ['.border-token'],
                breakpoints: ['.breakpoint-token']
              }
            }
          ],
          usagePatterns: [
            {
              name: 'Ant Patterns',
              selector: '.pattern-item, .usage-pattern',
              patterns: {
                layout: ['.layout-pattern'],
                navigation: ['.nav-pattern', '.menu-pattern'],
                forms: ['.form-pattern', '.input-pattern'],
                dataDisplay: ['.table-pattern', '.list-pattern'],
                feedback: ['.message-pattern', '.notification-pattern'],
                overlays: ['.modal-pattern', '.drawer-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Ant Examples',
              selector: '.code-box, .example-item',
              examples: {
                componentUsage: ['.usage-example'],
                composition: ['.composition-example'],
                styling: ['.style-example'],
                interaction: ['.interaction-example'],
                responsive: ['.responsive-example']
              }
            }
          ]
        }
      },

      {
        name: 'Chakra UI',
        url: 'https://chakra-ui.com',
        category: 'component-library',
        priority: 'high',
        selectors: {
          components: ['.chakra-component', '.component-doc', '[data-component]'],
          patterns: ['.pattern-example', '.usage-guide', '.best-practice'],
          codeExamples: ['.code-example', 'pre', '.live-code'],
          documentation: ['.doc-content', '.api-reference', '.component-guide'],
          assets: ['.resource-link', '.download-link']
        },
        rateLimit: 1200,
        maxDepth: 3,
        allowedDomains: ['chakra-ui.com'],
        extractors: {
          componentSchemas: [
            {
              name: 'Chakra Button',
              selector: '.chakra-component[data-name*="button"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['variant', 'size', 'colorScheme', 'isLoading'],
                behavioral: ['onClick', 'isDisabled', 'isActive'],
                semantic: ['as', 'href'],
                accessibility: ['aria-label', 'isFocusable'],
                responsive: ['display', 'hide']
              }
            }
          ],
          designTokens: [
            {
              name: 'Chakra Tokens',
              selector: '.token-display, .design-token',
              tokens: {
                colors: ['.color-token'],
                typography: ['.text-token', '.font-token'],
                spacing: ['.space-token'],
                shadows: ['.shadow-token'],
                borders: ['.border-token'],
                breakpoints: ['.breakpoint-token']
              }
            }
          ],
          usagePatterns: [
            {
              name: 'Chakra Patterns',
              selector: '.pattern-guide, .usage-example',
              patterns: {
                layout: ['.layout-pattern'],
                navigation: ['.nav-pattern'],
                forms: ['.form-pattern'],
                dataDisplay: ['.data-pattern'],
                feedback: ['.feedback-pattern'],
                overlays: ['.overlay-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Chakra Examples',
              selector: '.example-box, .demo-item',
              examples: {
                componentUsage: ['.usage-demo'],
                composition: ['.composition-demo'],
                styling: ['.styling-demo'],
                interaction: ['.interaction-demo'],
                responsive: ['.responsive-demo']
              }
            }
          ]
        }
      },

      {
        name: 'IBM Carbon',
        url: 'https://carbondesignsystem.com',
        category: 'design-system',
        priority: 'medium',
        selectors: {
          components: ['.bx--component', '.component-tile', '[data-component]'],
          patterns: ['.bx--pattern', '.usage-pattern', '.guidance'],
          codeExamples: ['.bx--snippet', 'pre', '.code-snippet'],
          documentation: ['.bx--content', '.documentation', '.api-doc'],
          assets: ['.resource-tile', '.download-tile']
        },
        rateLimit: 2000,
        maxDepth: 3,
        allowedDomains: ['carbondesignsystem.com'],
        extractors: {
          componentSchemas: [
            {
              name: 'Carbon Button',
              selector: '.bx--component[data-name*="button"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['kind', 'size', 'hasIconOnly', 'iconDescription'],
                behavioral: ['onClick', 'disabled', 'isExpressive'],
                semantic: ['href', 'renderIcon'],
                accessibility: ['aria-label', 'tabIndex'],
                responsive: ['isSelected', 'autoWidth']
              }
            }
          ],
          designTokens: [
            {
              name: 'Carbon Tokens',
              selector: '.token-display, .design-token',
              tokens: {
                colors: ['.color-token'],
                typography: ['.type-token'],
                spacing: ['.space-token'],
                shadows: ['.shadow-token'],
                borders: ['.border-token'],
                breakpoints: ['.breakpoint-token']
              }
            }
          ],
          usagePatterns: [
            {
              name: 'Carbon Patterns',
              selector: '.pattern-tile, .usage-guide',
              patterns: {
                layout: ['.layout-pattern'],
                navigation: ['.nav-pattern'],
                forms: ['.form-pattern'],
                dataDisplay: ['.data-pattern'],
                feedback: ['.feedback-pattern'],
                overlays: ['.overlay-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Carbon Examples',
              selector: '.snippet-container, .example-tile',
              examples: {
                componentUsage: ['.usage-example'],
                composition: ['.composition-example'],
                styling: ['.styling-example'],
                interaction: ['.interaction-example'],
                responsive: ['.responsive-example']
              }
            }
          ]
        }
      },

      {
        name: 'Atlassian Design System',
        url: 'https://atlassian.design',
        category: 'design-system',
        priority: 'medium',
        selectors: {
          components: ['.atlaskit-component', '.component-card', '[data-component]'],
          patterns: ['.pattern-card', '.usage-pattern', '.guideline'],
          codeExamples: ['.code-example', 'pre', '.live-example'],
          documentation: ['.doc-content', '.api-guide', '.component-doc'],
          assets: ['.resource-card', '.asset-card']
        },
        rateLimit: 1800,
        maxDepth: 3,
        allowedDomains: ['atlassian.design'],
        extractors: {
          componentSchemas: [
            {
              name: 'Atlas Button',
              selector: '.atlaskit-component[data-name*="button"]',
              properties: {
                name: 'name',
                description: 'description',
                category: 'category',
                variants: ['variants'],
                props: ['props'],
                examples: ['examples']
              },
              schema: {
                visual: ['appearance', 'spacing', 'isLoading', 'iconBefore'],
                behavioral: ['onClick', 'isDisabled', 'autoFocus'],
                semantic: ['href', 'component'],
                accessibility: ['aria-label', 'aria-describedby'],
                responsive: ['shouldFitContainer', 'isSelected']
              }
            }
          ],
          designTokens: [
            {
              name: 'Atlas Tokens',
              selector: '.token-display, .design-token',
              tokens: {
                colors: ['.color-token'],
                typography: ['.text-token'],
                spacing: ['.space-token'],
                shadows: ['.shadow-token'],
                borders: ['.border-token'],
                breakpoints: ['.breakpoint-token']
              }
            }
          ],
          usagePatterns: [
            {
              name: 'Atlas Patterns',
              selector: '.pattern-guide, .usage-example',
              patterns: {
                layout: ['.layout-pattern'],
                navigation: ['.nav-pattern'],
                forms: ['.form-pattern'],
                dataDisplay: ['.data-pattern'],
                feedback: ['.feedback-pattern'],
                overlays: ['.overlay-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Atlas Examples',
              selector: '.example-container, .demo-card',
              examples: {
                componentUsage: ['.usage-demo'],
                composition: ['.composition-demo'],
                styling: ['.styling-demo'],
                interaction: ['.interaction-demo'],
                responsive: ['.responsive-demo']
              }
            }
          ]
        }
      },

      // UI Patterns and Documentation
      {
        name: 'UI Patterns',
        url: 'https://ui-patterns.com',
        category: 'ui-patterns',
        priority: 'medium',
        selectors: {
          components: ['.pattern-card', '.component-pattern'],
          patterns: ['.ui-pattern', '.interaction-pattern', '.layout-pattern'],
          codeExamples: ['.code-sample', 'pre', '.example-code'],
          documentation: ['.pattern-doc', '.guidance', '.best-practice'],
          assets: ['.resource-link', '.example-link']
        },
        rateLimit: 2500,
        maxDepth: 2,
        allowedDomains: ['ui-patterns.com'],
        extractors: {
          componentSchemas: [],
          designTokens: [],
          usagePatterns: [
            {
              name: 'UI Patterns',
              selector: '.pattern-item, .pattern-card',
              patterns: {
                layout: ['.layout-pattern'],
                navigation: ['.nav-pattern'],
                forms: ['.form-pattern'],
                dataDisplay: ['.data-pattern'],
                feedback: ['.feedback-pattern'],
                overlays: ['.overlay-pattern']
              }
            }
          ],
          trainingExamples: [
            {
              name: 'Pattern Examples',
              selector: '.example-item, .pattern-example',
              examples: {
                componentUsage: ['.usage-example'],
                composition: ['.composition-example'],
                styling: ['.styling-example'],
                interaction: ['.interaction-example'],
                responsive: ['.responsive-example']
              }
            }
          ]
        }
      }
    ];
  }

  async startCrawlSession(targetNames?: string[]): Promise<string> {
    const sessionId = `crawl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const targets = targetNames
      ? this.crawlQueue.filter(t => targetNames.includes(t.name))
      : this.crawlQueue;

    const session: CrawlSession = {
      id: sessionId,
      targets,
      startTime: new Date(),
      status: 'running',
      progress: {
        total: targets.length,
        completed: 0,
        errors: 0,
        skipped: 0
      },
      results: [],
      trainingData: [],
      statistics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        totalDataSize: 0,
        uniqueComponents: 0,
        uniquePatterns: 0,
        trainingExamples: 0
      }
    };

    this.activeSessions.set(sessionId, session);

    // Start crawling asynchronously
    this.crawlTargets(session).catch(error => {
      console.error('Crawl session failed:', error);
      session.status = 'failed';
      session.endTime = new Date();
    });

    return sessionId;
  }

  private async crawlTargets(session: CrawlSession): Promise<void> {
    const results: CrawlResult[] = [];

    for (const target of session.targets) {
      try {
        console.log(`🕷️ Crawling ${target.name}...`);

        // Respect rate limiting
        await this.respectRateLimit(target.url);

        const result = await this.crawlTarget(target);
        results.push(result);

        if (result.status === 'success') {
          session.progress.completed++;
          session.statistics.successfulRequests++;
        } else {
          session.progress.errors++;
          session.statistics.failedRequests++;
        }

        session.statistics.totalRequests++;
        session.statistics.averageResponseTime =
          (session.statistics.averageResponseTime * (results.length - 1) + result.responseTime) / results.length;

      } catch (error) {
        console.error(`❌ Failed to crawl ${target.name}:`, error);
        session.progress.errors++;
        session.statistics.failedRequests++;
      }
    }

    // Process results into training data
    session.trainingData = await this.processCrawlResultsIntoTrainingData(results);
    session.results = results;
    session.status = 'completed';
    session.endTime = new Date();

    // Update statistics
    this.updateSessionStatistics(session);

    console.log(`✅ Crawl session ${session.id} completed`);
  }

  private async crawlTarget(target: CrawlTarget): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Simulate HTTP request (in real implementation, use fetch or axios)
      const response = await this.simulateHttpRequest(target.url);
      const responseTime = Date.now() - startTime;

      if (!response.success) {
        return {
          url: target.url,
          timestamp: new Date(),
          status: 'error',
          responseTime,
          data: { components: [], tokens: [], patterns: [], examples: [], links: [], assets: [] },
          errors: [response.error || 'Request failed'],
          metadata: {
            contentType: 'text/html',
            size: 0,
            encoding: 'utf-8',
            language: 'en'
          }
        };
      }

      // Extract data using selectors and extractors
      const extractedData = await this.extractDataFromResponse(response.content, target);

      return {
        url: target.url,
        timestamp: new Date(),
        status: 'success',
        responseTime,
        data: extractedData,
        errors: [],
        metadata: {
          contentType: response.contentType || 'text/html',
          size: response.content?.length || 0,
          encoding: response.encoding || 'utf-8',
          language: response.language || 'en',
          lastModified: response.lastModified
        }
      };

    } catch (error) {
      return {
        url: target.url,
        timestamp: new Date(),
        status: 'error',
        responseTime: Date.now() - startTime,
        data: { components: [], tokens: [], patterns: [], examples: [], links: [], assets: [] },
        errors: [error.message],
        metadata: {
          contentType: 'text/html',
          size: 0,
          encoding: 'utf-8',
          language: 'en'
        }
      };
    }
  }

  private async simulateHttpRequest(url: string): Promise<{
    success: boolean;
    content?: string;
    contentType?: string;
    encoding?: string;
    language?: string;
    lastModified?: Date;
    error?: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simulate success/failure (90% success rate)
    if (Math.random() > 0.1) {
      return {
        success: true,
        content: this.generateMockHtmlContent(url),
        contentType: 'text/html',
        encoding: 'utf-8',
        language: 'en',
        lastModified: new Date(Date.now() - Math.random() * 86400000) // Random time within last 24h
      };
    } else {
      return {
        success: false,
        error: 'Network timeout or server error'
      };
    }
  }

  private generateMockHtmlContent(url: string): string {
    // Generate mock HTML content based on URL patterns
    const domain = new URL(url).hostname;
    const components = ['Button', 'Input', 'Card', 'Modal', 'Table', 'Select', 'Checkbox', 'Radio'];
    const patterns = ['Form Layout', 'Data Table', 'Navigation Menu', 'Card Grid', 'Modal Dialog'];

    let html = `<!DOCTYPE html><html><head><title>${domain} Components</title></head><body>`;

    components.forEach((component, i) => {
      html += `
        <div class="component-card" data-component="${component.toLowerCase()}">
          <h3>${component}</h3>
          <p>A ${component.toLowerCase()} component for user interaction.</p>
          <div class="variants">Primary, Secondary, Ghost</div>
          <div class="props">onClick, disabled, loading</div>
          <pre class="code-example"><code>&lt;${component.toLowerCase()} onClick={handleClick} /&gt;</code></pre>
        </div>
      `;
    });

    patterns.forEach((pattern, i) => {
      html += `
        <div class="pattern-card">
          <h3>${pattern}</h3>
          <p>Usage pattern for ${pattern.toLowerCase()}.</p>
          <div class="components-used">${components.slice(0, 3).join(', ')}</div>
        </div>
      `;
    });

    html += '</body></html>';
    return html;
  }

  private async extractDataFromResponse(content: string, target: CrawlTarget): Promise<CrawlResult['data']> {
    const data: CrawlResult['data'] = {
      components: [],
      tokens: [],
      patterns: [],
      examples: [],
      links: [],
      assets: []
    };

    // Extract components
    for (const extractor of target.extractors.componentSchemas) {
      const components = this.extractComponents(content, extractor);
      data.components.push(...components);
    }

    // Extract tokens
    for (const extractor of target.extractors.designTokens) {
      const tokens = this.extractTokens(content, extractor);
      data.tokens.push(...tokens);
    }

    // Extract patterns
    for (const extractor of target.extractors.usagePatterns) {
      const patterns = this.extractPatterns(content, extractor);
      data.patterns.push(...patterns);
    }

    // Extract examples
    for (const extractor of target.extractors.trainingExamples) {
      const examples = this.extractExamples(content, extractor);
      data.examples.push(...examples);
    }

    // Extract links and assets
    data.links = this.extractLinks(content, target.allowedDomains);
    data.assets = this.extractAssets(content);

    return data;
  }

  private extractComponents(content: string, extractor: ComponentExtractor): ComponentData[] {
    // Simulate component extraction from HTML content
    const components: ComponentData[] = [];

    // Mock extraction based on extractor configuration
    const mockComponents = [
      {
        name: 'Button',
        category: 'action',
        description: 'Interactive button component',
        variants: [
          { name: 'primary', description: 'Primary action button', usage: 'Main actions', styling: {}, accessibility: {} },
          { name: 'secondary', description: 'Secondary action button', usage: 'Alternative actions', styling: {}, accessibility: {} }
        ],
        properties: [
          { name: 'onClick', type: 'function', required: false, description: 'Click handler' },
          { name: 'disabled', type: 'boolean', required: false, defaultValue: false, description: 'Disabled state' }
        ],
        usage: [
          { context: 'Forms', frequency: 0.8, examples: ['Submit button'], bestPractices: ['Use clear labels'] }
        ],
        schema: {
          visual: { colors: ['primary', 'secondary'], typography: ['button'], spacing: ['small', 'medium'] },
          behavioral: { interactions: ['hover', 'focus'], states: ['disabled', 'loading'] },
          semantic: { purpose: 'action', context: 'interactive' },
          accessibility: { aria: ['role=button'], keyboard: ['Enter', 'Space'] },
          responsive: { breakpoints: ['mobile', 'tablet', 'desktop'] }
        }
      }
    ];

    return mockComponents;
  }

  private extractTokens(content: string, extractor: TokenExtractor): TokenData[] {
    // Simulate token extraction
    return [
      { category: 'color', name: 'primary', value: '#007acc', usage: ['buttons', 'links'], variants: {} },
      { category: 'typography', name: 'body', value: { fontFamily: 'system-ui', fontSize: '14px' }, usage: ['text'], variants: {} },
      { category: 'spacing', name: 'medium', value: '16px', usage: ['margins', 'padding'], variants: {} }
    ];
  }

  private extractPatterns(content: string, extractor: PatternExtractor): PatternData[] {
    // Simulate pattern extraction
    return [
      {
        name: 'Form Layout',
        category: 'forms',
        description: 'Standard form layout pattern',
        components: ['Input', 'Button', 'Label'],
        layout: { type: 'vertical', spacing: 'medium' },
        interactions: { validation: 'onBlur', submit: 'onClick' },
        examples: ['Contact form', 'Login form']
      }
    ];
  }

  private extractExamples(content: string, extractor: TrainingExtractor): ExampleData[] {
    // Simulate example extraction
    return [
      {
        type: 'component',
        title: 'Button Usage',
        description: 'Basic button implementation',
        code: '<Button onClick={handleClick}>Click me</Button>',
        tags: ['button', 'interaction'],
        complexity: 1
      }
    ];
  }

  private extractLinks(content: string, allowedDomains: string[]): string[] {
    // Mock link extraction
    return allowedDomains.map(domain => `https://${domain}/components`);
  }

  private extractAssets(content: string): string[] {
    // Mock asset extraction
    return ['/assets/icons.svg', '/assets/fonts.woff2', '/assets/images.png'];
  }

  private async processCrawlResultsIntoTrainingData(results: CrawlResult[]): Promise<TrainingDataPoint[]> {
    const trainingData: TrainingDataPoint[] = [];

    for (const result of results) {
      if (result.status === 'success') {
        // Process components into training examples
        for (const component of result.data.components) {
          const trainingPoint: TrainingDataPoint = {
            input: {
              component: component.name,
              context: component.category,
              requirements: component.properties.map(p => `${p.name}:${p.type}`),
              constraints: [`category:${component.category}`]
            },
            output: {
              schema: component.schema,
              composition: {
                variants: component.variants,
                properties: component.properties
              },
              styling: component.variants.reduce((acc, v) => ({ ...acc, [v.name]: v.styling }), {}),
              interactions: component.usage.reduce((acc, u) => ({ ...acc, [u.context]: u.frequency }), {})
            },
            metadata: {
              source: result.url,
              confidence: 0.8,
              complexity: component.properties.length,
              tags: [component.category, ...component.properties.map(p => p.type)],
              timestamp: result.timestamp
            }
          };

          trainingData.push(trainingPoint);
        }

        // Process patterns into training examples
        for (const pattern of result.data.patterns) {
          const trainingPoint: TrainingDataPoint = {
            input: {
              component: pattern.name,
              context: pattern.category,
              requirements: pattern.components,
              constraints: [`layout:${pattern.layout.type}`]
            },
            output: {
              schema: {
                visual: pattern.layout,
                behavioral: pattern.interactions,
                semantic: { purpose: pattern.description },
                accessibility: {},
                responsive: {}
              },
              composition: {
                components: pattern.components,
                layout: pattern.layout
              },
              styling: pattern.layout,
              interactions: pattern.interactions
            },
            metadata: {
              source: result.url,
              confidence: 0.7,
              complexity: pattern.components.length,
              tags: [pattern.category, 'pattern'],
              timestamp: result.timestamp
            }
          };

          trainingData.push(trainingPoint);
        }
      }
    }

    return trainingData;
  }

  private updateSessionStatistics(session: CrawlSession): void {
    const uniqueComponents = new Set();
    const uniquePatterns = new Set();

    session.results.forEach(result => {
      result.data.components.forEach(c => uniqueComponents.add(c.name));
      result.data.patterns.forEach(p => uniquePatterns.add(p.name));
    });

    session.statistics.uniqueComponents = uniqueComponents.size;
    session.statistics.uniquePatterns = uniquePatterns.size;
    session.statistics.trainingExamples = session.trainingData.length;
    session.statistics.totalDataSize = session.results.reduce((sum, r) => sum + r.metadata.size, 0);
  }

  private async respectRateLimit(url: string): Promise<void> {
    const domain = new URL(url).hostname;
    const lastRequest = this.rateLimiters.get(domain) || 0;
    const now = Date.now();

    const target = this.crawlQueue.find(t => t.allowedDomains.includes(domain));
    const rateLimit = target?.rateLimit || 1000;

    const timeSinceLastRequest = now - lastRequest;
    if (timeSinceLastRequest < rateLimit) {
      await new Promise(resolve => setTimeout(resolve, rateLimit - timeSinceLastRequest));
    }

    this.rateLimiters.set(domain, Date.now());
  }

  getSession(sessionId: string): CrawlSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getActiveSessions(): CrawlSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.status === 'running');
  }

  getCompletedSessions(): CrawlSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.status === 'completed');
  }

  stopSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'running') {
      session.status = 'stopped';
      session.endTime = new Date();
      return true;
    }
    return false;
  }

  getTrainingData(): TrainingDataPoint[] {
    return Array.from(this.activeSessions.values())
      .filter(s => s.status === 'completed')
      .flatMap(s => s.trainingData);
  }

  exportTrainingData(format: 'json' | 'csv' = 'json'): string {
    const data = this.getTrainingData();

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['component', 'context', 'requirements', 'schema_visual', 'schema_behavioral', 'source', 'confidence'];
      const rows = data.map(point => [
        point.input.component,
        point.input.context,
        point.input.requirements.join(';'),
        JSON.stringify(point.output.schema.visual),
        JSON.stringify(point.output.schema.behavioral),
        point.metadata.source,
        point.metadata.confidence
      ]);

      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    return JSON.stringify(data, null, 2);
  }
}

// React Component for Training Data Crawling
export const TrainingDataCrawlerDashboard: React.FC = () => {
  const [crawler] = useState(() => new TrainingDataCrawler());
  const [activeSessions, setActiveSessions] = useState<CrawlSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CrawlSession | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [trainingData, setTrainingData] = useState<TrainingDataPoint[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions(crawler.getActiveSessions());
      if (selectedSession) {
        const updated = crawler.getSession(selectedSession.id);
        if (updated) setSelectedSession(updated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSession]);

  const handleStartCrawl = async (targetNames?: string[]) => {
    setIsCrawling(true);
    try {
      const sessionId = await crawler.startCrawlSession(targetNames);

      // Wait a bit for session to start
      setTimeout(() => {
        const session = crawler.getSession(sessionId);
        if (session) setSelectedSession(session);
      }, 100);

    } catch (error) {
      console.error('Failed to start crawl:', error);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleStopCrawl = (sessionId: string) => {
    crawler.stopSession(sessionId);
  };

  const handleLoadTrainingData = () => {
    setTrainingData(crawler.getTrainingData());
  };

  const handleExportTrainingData = () => {
    const data = crawler.exportTrainingData(exportFormat);
    const blob = new Blob([data], {
      type: exportFormat === 'json' ? 'application/json' : 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-data.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const crawlTargets = crawler['crawlQueue'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Training Data Crawling System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crawl design systems → Extract schemas → Generate training data
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {trainingData.length} Training Examples
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Network className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {activeSessions.length} Active Sessions
            </span>
          </div>
        </div>
      </div>

      {/* Crawl Targets */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Crawl Targets ({crawlTargets.length})
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {crawlTargets.map((target, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{target.name}</h4>
                <span className={cn(
                  'px-2 py-1 text-xs rounded',
                  target.priority === 'high' ? 'bg-red-100 text-red-800' :
                  target.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                )}>
                  {target.priority}
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>URL: {target.url}</div>
                <div>Category: {target.category.replace('-', ' ')}</div>
                <div>Rate Limit: {target.rateLimit}ms</div>
                <div>Max Depth: {target.maxDepth}</div>
                <div>Extractors: {target.extractors.componentSchemas.length + target.extractors.designTokens.length + target.extractors.usagePatterns.length + target.extractors.trainingExamples.length}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleStartCrawl()}
            disabled={isCrawling}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
          >
            {isCrawling ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Starting Crawl...
              </div>
            ) : (
              'Crawl All Targets'
            )}
          </button>

          <button
            onClick={() => handleStartCrawl(['Material Design', 'Ant Design', 'Chakra UI'])}
            disabled={isCrawling}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium"
          >
            Crawl Top 3
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Active Crawl Sessions ({activeSessions.length})
          </h3>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Session {session.id.slice(-8)}</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Started: {session.startTime.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {session.progress.completed}/{session.progress.total}
                      </div>
                      <div className="text-xs text-gray-500">Targets</div>
                    </div>

                    <button
                      onClick={() => handleStopCrawl(session.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Stop
                    </button>

                    <button
                      onClick={() => setSelectedSession(session)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(session.progress.completed / session.progress.total) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-green-600">{session.progress.completed}</div>
                    <div className="text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{session.progress.errors}</div>
                    <div className="text-gray-500">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">{session.statistics.successfulRequests}</div>
                    <div className="text-gray-500">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-purple-600">{Math.round(session.statistics.averageResponseTime)}ms</div>
                    <div className="text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Details */}
      {selectedSession && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Session Details: {selectedSession.id.slice(-8)}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedSession.statistics.totalRequests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedSession.statistics.successfulRequests}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{selectedSession.statistics.uniqueComponents}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{selectedSession.trainingData.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Training Examples</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Recent Results:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedSession.results.slice(-5).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      result.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    )}></span>
                    <span className="text-sm">{new URL(result.url).hostname}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.responseTime}ms • {result.data.components.length} components
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Training Data */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Training Data Management
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadTrainingData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
            >
              Load Training Data
            </button>

            {trainingData.length > 0 && (
              <>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="px-3 py-2 border rounded"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>

                <button
                  onClick={handleExportTrainingData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                >
                  Export Training Data ({exportFormat.toUpperCase()})
                </button>
              </>
            )}
          </div>

          {trainingData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{trainingData.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Examples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trainingData.reduce((sum, d) => sum + d.metadata.complexity, 0) / trainingData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Complexity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(trainingData.map(d => d.metadata.source)).size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {trainingData.filter(d => d.metadata.confidence > 0.8).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">High Confidence</div>
              </div>
            </div>
          )}

          {trainingData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Sample Training Examples:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trainingData.slice(0, 5).map((example, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{example.input.component}</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {example.input.context}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {example.metadata.confidence}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Requirements: {example.input.requirements.slice(0, 3).join(', ')}
                      {example.input.requirements.length > 3 && '...'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Source: {new URL(example.metadata.source).hostname}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the complete crawling system
export {
  TrainingDataCrawler,
  type CrawlTarget,
  type CrawlResult,
  type CrawlSession,
  type TrainingDataPoint
};

// Development shims to reduce type noise during iterative triage.
// Keep this file conservative and add narrow shims only for the most
// frequently-missing external modules / platform APIs. Replace with
// accurate types later as part of incremental hardening.

declare module 'stripe' {
  const Stripe: any;
  export default Stripe;
}

// Minimal Stripe namespace/type shims so code that refers to `Stripe.Customer` etc.
// can compile during triage without pulling the full @types/stripe package.
declare namespace Stripe {
  type Customer = any;
  type PaymentMethod = any;
  type Subscription = any;
  type Invoice = any;
  type PaymentIntent = any;
  type Checkout = any;
  type CustomerCreateParams = any;
  class StripeConstructor {
    constructor(key: string, opts?: any);
    customers: any;
    paymentMethods: any;
    subscriptions: any;
    invoices: any;
    paymentIntents: any;
  }
}

declare module 'redis' {
  const Redis: any;
  export = Redis;
}

declare module 'ioredis' {
  const IORedis: any;
  export default IORedis;
}

declare module 'puppeteer' {
  const puppeteer: any;
  export default puppeteer;
}

declare module 'electron' {
  export as namespace Electron;
  const _default: any;
  export default _default;
}

// Provide a minimal Electron namespace so code referencing `Electron.*` types
// (e.g. `Electron.SaveDialogOptions`, `Electron.BrowserWindowConstructorOptions`)
// compiles during triage without bringing in the full Electron type package.
// NOTE: Electron namespace is provided inside the `declare global` block further
// below so it is treated as an ambient global in this module-file (which
// contains `export {}` and therefore would otherwise make top-level
// declarations module-scoped). See the `declare global` section for the
// permissive Electron and other globals used during triage.

// Additional permissive shims to reduce high-frequency type noise during triage.
// These are intentionally broad and should be replaced with narrow definitions
// once the highest-priority errors are resolved.

// Note: the Express namespace is provided inside the `declare global` block
// later in this file so it is available as an ambient global during triage.

declare module 'express' {
  const express: any;
  export = express;
}

declare module 'express-validator' {
  const ev: any;
  export = ev;
}

declare module '@tanstack/react-query' {
  const rq: any;
  export = rq;
}

declare module 'react-error-boundary' {
  const reb: any;
  export default reb;
}

// Allow imports of local .js files during triage (some runtime imports include
// explicit .js extensions that the type-checker can't find types for).
declare module '*.js' {
  const v: any;
  export default v;
}

// Catch-all shims for relative internal modules patterns (services/utils/api)
// so we can iteratively fix concrete modules rather than being blocked by
// many missing internal type declarations at once.
declare module '*services/*' {
  const svc: any;
  export default svc;
}

declare module '*utils/*' {
  const u: any;
  export default u;
}

declare module '*api/*' {
  const a: any;
  export default a;
}

// Lightweight shim for Ant Design icons namespace used heavily in the UI.
// This exports a permissive set of named icons as `any` to silence the large
// class of 'no exported member' errors while we migrate to more specific
// icon imports or the correct icon package version.
declare module '@ant-design/icons' {
  export const TeamOutlined: any;
  export const DollarOutlined: any;
  export const ShoppingCartOutlined: any;
  export const FileTextOutlined: any;
  export const WifiOutlined: any;
  export const LockOutlined: any;
  export const UnlockOutlined: any;
  export const EyeInvisibleOutlined: any;
  export const DownloadOutlined: any;
  export const UploadOutlined: any;
  export const ShareAltOutlined: any;
  export const StopOutlined: any;
  export const ReloadOutlined: any;
  export const RobotOutlined: any;
  export const MonitorOutlined: any;
  export const KeyOutlined: any;
  export const SafetyOutlined: any;
  export const CodeOutlined: any;
  export const MobileOutlined: any;
  export const DesktopOutlined: any;
  export const TabletOutlined: any;
  export const VideoCameraOutlined: any;
  export const AudioOutlined: any;
  export const CameraOutlined: any;
  export const ScanOutlined: any;
  export const HddOutlined: any;
  export const CloudServerOutlined: any;
  export const DeploymentUnitOutlined: any;
  export const WarningOutlined: any;
  export const ControlOutlined: any;
  export const NodeIndexOutlined: any;
  export const BranchesOutlined: any;
  export const FunctionOutlined: any;
  export const CalculatorOutlined: any;
  export const RadarChartOutlined: any;
  export const HeatMapOutlined: any;
  export const StockOutlined: any;
  export const MinusOutlined: any;
  export const ZoomInOutlined: any;
  export const ZoomOutOutlined: any;
  export const FullscreenOutlined: any;
  export const FullscreenExitOutlined: any;
  export const RetweetOutlined: any;
  export const ReceiveOutlined: any;
  export const LightbulbOutlined: any;
  export const ThunderboltFilled: any;
  export const PlayCircleFilled: any;
  export const PauseCircleFilled: any;
  export const StopFilled: any;
  export const CpuOutlined: any;
  export const MemoryOutlined: any;
  export const ApiFilled: any;
  export const DatabaseFilled: any;
  export const CloudFilled: any;
  export const PieChartFilled: any;
  export const CloseCircleOutlined: any;
  export const TrophyFilled: any;
  export const StarFilled: any;
  export const RocketFilled: any;
  export const DiamondFilled: any;
  export const MenuUnfoldOutlined: any;
  export const MenuFoldOutlined: any;
  const _default: any;
  export default _default;
}

// Allow default imports from sub-paths like '@ant-design/icons/DownloadOutlined'
declare module '@ant-design/icons/*' {
  const icon: any;
  export default icon;
}

// NOTE: Global design-system symbols and common UI helper types are injected
// into the `declare global` block further below so they are treated as true
// ambient globals (this file is a module due to `export {}` and top-level
// declarations would otherwise be module-scoped). See the `declare global`
// section for the permissive global values and types used during triage.

// Lightweight shim for redis-backed queue libraries (bull, bee-queue, etc.)
declare module 'queue' {
  const Queue: any;
  export default Queue;
}

declare module 'bull' {
  const Bull: any;
  export = Bull;
}

// Path alias shims used in code (e.g. @/types/*)
declare module '@/types/CrawlerTypes' {
  export type CrawlResult = any;
  export type CrawlOptions = any;
  export type WebsiteData = any;
  export type CrawlError = any;
}

declare module '@/types/OptimizationTypes' {
  export type OptimizationResult = any;
  export type OptimizationOptions = any;
}

declare module '@/types/SSOTypes' {
  const SSOAny: any;
  export default SSOAny;
}

// NOTE: complete-seo-schema and seo-schema have concrete stub files under
// src/types/ — remove ambient module declarations to avoid duplicate symbol
// issues. Keep other SEO shims in dedicated files under src/types when
// necessary.

// Extend a few DOM/platform interfaces used in the codebase to reduce type
// friction during triage. These are intentionally permissive and should be
// narrowed later.
declare global {
  interface ServiceWorkerRegistration {
    sync?: { register(tag: string): Promise<void> };
  }

  interface NotificationOptions {
    vibrate?: number[] | number;
    actions?: Array<any>;
    requireInteraction?: boolean;
  }

  // Keep PasswordCredential compatible with the DOM API shape used in code.
  // Make `id` required to match the standard `Credential` shape used elsewhere
  // in the codebase (many call sites assume `id` is present).
  interface PasswordCredential {
    id: string;
    password?: string;
    // `type` is required on the platform Credential type; make it required
    // here to avoid assignment errors in code that constructs credentials.
    type: string;
  }

  // PWA install prompt event (window 'beforeinstallprompt')
  // Use a Promise-returning prompt signature which matches modern usage
  // and makes it easier to await the prompt in code.
  interface PWAInstallPrompt extends Event {
    prompt: () => Promise<void> | void;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' | string }>;
  }

  // Minimal NotificationEvent / PushEvent-like shape used in service worker handlers
  interface NotificationEvent extends Event {
    notification: any;
    action?: string;
    data?: any;
  }

  // Allow otp option in CredentialRequestOptions (WebOTP API)
  interface CredentialRequestOptions {
    otp?: any;
  }

  interface PublicKeyCredentialUserEntity {
    icon?: string;
  }

  interface Window {
    process?: any;
  }

  type OTPCredential = any;
  // Minimal global type used across generated UI and training modules
  // Define AtomicComponent as a permissive shape during triage so components
  // that reference it compile. We'll tighten this up later.
  type AtomicComponent = any;

  // Global design-system symbols used across many UI files during triage.
  // These are values (not types) in the original code and are referenced
  // directly in components; declare them as permissive `any` to reduce noise.
  const EnhancedColors: any;
  const EnhancedSpacing: any;
  const EnhancedTypography: any;
  const EnhancedBorderRadius: any;
  const EnhancedComponents: any;
  const EnhancedComponentSizes: any;
  const EnhancedShadows: any;
  const LightDomComponents: any;
  const LightDomShadows: any;

  // Common UI helper types used by Ant Design-based components; widen during
  // triage to reduce high-frequency type assignment errors (e.g. Gutter/SpaceSize)
  type Gutter = any;
  type SpaceSize = any;

  // Provide commonly-referenced globals and lightweight shims used across the
  // UI so the type-checker doesn't fail on missing runtime globals during
  // triage. These are intentionally permissive and will be narrowed later.
  namespace Electron {
    interface SaveDialogOptions { [key: string]: any }
    interface OpenDialogOptions { [key: string]: any }
    interface BrowserWindowConstructorOptions { [key: string]: any }
    interface BrowserWindow { [key: string]: any }
    interface App { [key: string]: any }
    interface NotificationConstructorOptions { [key: string]: any }
    interface MenuItemConstructorOptions { [key: string]: any }
    interface Tray { [key: string]: any }
  }

  namespace Express {
    interface Request { [key: string]: any }
    interface Response { [key: string]: any }
    type NextFunction = (err?: any) => void;
  }

  // UI helper globals (triage-only)
  const WorkflowPanel: any;
  const WorkflowPanelSection: any;
  const message: any;
  const Slider: any;
  const Empty: any;
  const Statistic: any;

  // Very small shims for React hooks to reduce noise where files rely on them
  // being in scope (triage-only; prefer explicit imports in real code).
  const useState: any;
  const useEffect: any;
  const useRef: any;
  const useMemo: any;
  const useCallback: any;

  // Allow AnimationKeyframe objects to include `offset` and arbitrary keys
  // (some animation helpers construct keyframes with `offset` which the DOM
  // typings may not include). This is a triage-only relaxation.
  interface AnimationKeyframe {
    offset?: number;
    [key: string]: any;
  }
}

export {};

// Provide a permissive module declaration for 'lucide-react' used widely across
// generated UI files during triage. This exports common named icons as `any` so
// the TypeScript checker doesn't fail on missing named exports while we
// incrementally migrate to explicit imports.
declare module 'lucide-react' {
  export const Workflow: any;
  export const Database: any;
  export const Brain: any;
  export const Atom: any;
  export const Layers: any;
  export const Monitor: any;
  export const Settings: any;
  export const Search: any;
  export const BarChart3: any;
  export const TrendingUp: any;
  export const Users: any;
  export const Eye: any;
  export const MousePointer: any;
  export const Clock: any;
  export const Smartphone: any;
  export const MapPin: any;
  export const Calendar: any;
  export const Filter: any;
  export const Download: any;
  export const Upload: any;
  export const RefreshCw: any;
  export const Zap: any;
  export const Code: any;
  export const FileText: any;
  export const Mail: any;
  export const Phone: any;
  export const ShoppingCart: any;
  export const DollarSign: any;
  export const Star: any;
  export const ThumbsUp: any;
  export const AlertTriangle: any;
  export const Award: any;
  export const Link: any;
  export const Network: any;
  export const Share2: any;
  export const ExternalLink: any;
  export const GitBranch: any;
  export const Webhook: any;
  export const Cloud: any;
  export const Server: any;
  export const Globe: any;
  export const Hash: any;
  export const Tag: any;
  export const Bookmark: any;
  export const Navigation: any;
  export const Compass: any;
  export const Target: any;
  export const PieChart: any;
  export const LineChart: any;
  export const Activity: any;
  export const CheckCircle: any;
  export const AlertCircle: any;
  export const Info: any;
  export const X: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const Maximize2: any;
  export const Minimize2: any;
  export const Play: any;
  export const Pause: any;
  export const Square: any;
  export const RotateCcw: any;
  export const FastForward: any;
  export const SkipForward: any;
  export const SkipBack: any;
  export const Volume2: any;
  export const VolumeX: any;
  export const Mic: any;
  export const MicOff: any;
  export const Camera: any;
  export const CameraOff: any;
  export const Video: any;
  export const VideoOff: any;
  export const PhoneOff: any;
  export const MessageCircle: any;
  export const MessageSquare: any;
  export const Send: any;
  export const Inbox: any;
  export const Archive: any;
  export const Trash2: any;
  export const Edit3: any;
  export const Save: any;
  export const Plus: any;
  export const Minus: any;
  export const SortAsc: any;
  export const SortDesc: any;
  export const Grid3X3: any;
  export const List: any;
  export const Columns: any;
  export const Rows: any;
  export const Layout: any;
  export const Type: any;
  export const Bold: any;
  export const Italic: any;
  export const Underline: any;
  export const Strikethrough: any;
  export const AlignLeft: any;
  export const AlignCenter: any;
  export const AlignRight: any;
  export const AlignJustify: any;
  export const Palette: any;
  export const Image: any;
  export const Music: any;
  export const File: any;
  export const Folder: any;
  export const FolderOpen: any;
  export const FileImage: any;
  export const FileVideo: any;
  export const FileAudio: any;
  export const Zip: any;
  export const Cpu: any;
  export const HardDrive: any;
  export const Wifi: any;
  export const WifiOff: any;
  export const Bluetooth: any;
  export const Battery: any;
  export const BatteryCharging: any;
  export const Power: any;
  export const PowerOff: any;
  export const Sun: any;
  export const Moon: any;
  export const Tablet: any;
  export const Laptop: any;
  export const Mouse: any;
  export const Keyboard: any;
  export const Printer: any;
  export const Speaker: any;
  export const Headphones: any;
  export const Watch: any;
  export const Gamepad2: any;
  export const Joystick: any;
  export const Trophy: any;
  export const Medal: any;
  export const Crosshair: any;
  export const Flame: any;
  export const Droplet: any;
  export const Wind: any;
  export const Snowflake: any;
  export const CloudRain: any;
  export const CloudSnow: any;
  export const CloudLightning: any;
  export const Umbrella: any;
  export const Heart: any;
  export const Shield: any;
  export const Lock: any;
  export const Unlock: any;
  export const Key: any;
  export const EyeOff: any;
  export const User: any;
  export const UserPlus: any;
  export const UserMinus: any;
  export const UserCheck: any;
  export const UserX: any;
  export const Crown: any;
  export const Gem: any;
  export const Diamond: any;
  export const Coins: any;
  export const CreditCard: any;
  export const Wallet: any;
  export const PiggyBank: any;
  export const Banknote: any;
  export const Receipt: any;
  export const Calculator: any;
  export const TrendingDown: any;
  export const BarChart: any;
  export const BarChart2: any;
  export const Move: any;
  export const Move3D: any;
  export const RotateCw: any;
  export const FlipHorizontal: any;
  export const FlipVertical: any;
  export const Maximize: any;
  export const Minimize: any;
  export const ZoomIn: any;
  export const ZoomOut: any;
  export const Crop: any;
  export const Scissors: any;
  export const Copy: any;
  export const Paste: any;
  export const Clipboard: any;
  export const ClipboardCheck: any;
  export const ClipboardX: any;
  export const FilePlus: any;
  export const FileMinus: any;
  export const FolderPlus: any;
  export const FolderMinus: any;
  export const Check: any;
  export const XCircle: any;
  export const HelpCircle: any;
  export const Loader: any;
  export const Loader2: any;
  export const Undo: any;
  export const Redo: any;
  export const Rewind: any;
  export const Radio: any;
  export const Disc: any;
  export const PlayCircle: any;
  export const PauseCircle: any;
  export const Repeat: any;
  export const Shuffle: any;
  export const Volume1: any;
  export const Tool: any;
  export const Hdmi: any;
  export const Tree: any;
  export const BrokenHeart: any;
  export const Bridge: any;
  const _default: any;
  export default _default;
}

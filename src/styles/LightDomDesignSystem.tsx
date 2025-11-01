/**
 * LightDom Design System
 * Exodus wallet-inspired design with modern dark theme and vibrant accents
 * Comprehensive component library for consistent UI/UX across all dashboards
 */

import React from 'react';
import { Button, Card, Typography, Space, Badge, Avatar, Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  WalletOutlined, 
  GlobalOutlined, 
  TrophyOutlined,
  RocketOutlined,
  SearchOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  ExperimentOutlined,
  BugOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  StarOutlined,
  FireOutlined,
  GiftOutlined,
  CrownOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Color Palette - Exodus Inspired
export const LightDomColors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary Blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary Accent Colors
  accent: {
    purple: '#8b5cf6',
    pink: '#ec4899',
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    indigo: '#6366f1',
  },

  // Dark Theme Colors
  dark: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',
    border: '#333333',
    borderLight: '#404040',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textTertiary: '#666666',
  },

  // Gradient Colors
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    dark: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#0ea5e9',
    processing: '#8b5cf6',
  },

  // Mining Theme Colors
  mining: {
    common: '#94a3b8',
    uncommon: '#22d3ee',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b',
    mythical: '#ef4444',
  }
};

// Typography System
export const LightDomTypography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// Spacing System
export const LightDomSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
};

// Border Radius System
export const LightDomBorderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

// Shadow System
export const LightDomShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)',
  glowGreen: '0 0 20px rgba(16, 185, 129, 0.3)',
};

// Animation System
export const LightDomAnimations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  transitions: {
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

// Component Styles
export const LightDomComponents = {
  // Button Styles
  button: {
    primary: {
      background: LightDomColors.gradients.primary,
      border: 'none',
      color: LightDomColors.dark.text,
      fontWeight: LightDomTypography.fontWeight.semibold,
      borderRadius: LightDomBorderRadius.md,
      boxShadow: LightDomShadows.md,
      transition: LightDomAnimations.transitions.all,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: LightDomShadows.lg,
      }
    },
    secondary: {
      background: LightDomColors.dark.surface,
      border: `1px solid ${LightDomColors.dark.border}`,
      color: LightDomColors.dark.text,
      '&:hover': {
        background: LightDomColors.dark.surfaceLight,
        borderColor: LightDomColors.primary[500],
      }
    },
    ghost: {
      background: 'transparent',
      border: 'none',
      color: LightDomColors.dark.textSecondary,
      '&:hover': {
        background: LightDomColors.dark.surface,
        color: LightDomColors.dark.text,
      }
    }
  },

  // Card Styles
  card: {
    default: {
      background: LightDomColors.dark.surface,
      border: `1px solid ${LightDomColors.dark.border}`,
      borderRadius: LightDomBorderRadius.lg,
      boxShadow: LightDomShadows.sm,
      transition: LightDomAnimations.transitions.all,
      '&:hover': {
        borderColor: LightDomColors.primary[500],
        boxShadow: LightDomShadows.md,
      }
    },
    elevated: {
      background: LightDomColors.dark.surface,
      border: `1px solid ${LightDomColors.dark.border}`,
      borderRadius: LightDomBorderRadius.lg,
      boxShadow: LightDomShadows.lg,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: LightDomShadows.xl,
      }
    },
    glass: {
      background: 'rgba(26, 26, 26, 0.8)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${LightDomColors.dark.borderLight}`,
      borderRadius: LightDomBorderRadius.lg,
    }
  },

  // Input Styles
  input: {
    default: {
      background: LightDomColors.dark.surface,
      border: `1px solid ${LightDomColors.dark.border}`,
      borderRadius: LightDomBorderRadius.md,
      color: LightDomColors.dark.text,
      '&:focus': {
        borderColor: LightDomColors.primary[500],
        boxShadow: `0 0 0 2px ${LightDomColors.primary[200]}40`,
      }
    }
  },

  // Navigation Styles
  navigation: {
    sidebar: {
      background: LightDomColors.dark.surface,
      border: `1px solid ${LightDomColors.dark.border}`,
      width: '280px',
    },
    rail: {
      background: LightDomColors.dark.background,
      border: `1px solid ${LightDomColors.dark.border}`,
      width: '80px',
    }
  }
};

// Icon Mapping for Features
export const LightDomIcons = {
  dashboard: DashboardOutlined,
  optimization: ThunderboltOutlined,
  blockchain: WalletOutlined,
  spaceMining: GlobalOutlined,
  metaverse: TrophyOutlined,
  marketplace: RocketOutlined,
  seo: SearchOutlined,
  analytics: BarChartOutlined,
  settings: SettingOutlined,
  notifications: BellOutlined,
  user: UserOutlined,
  api: ApiOutlined,
  database: DatabaseOutlined,
  nodes: ClusterOutlined,
  testing: ExperimentOutlined,
  crawler: BugOutlined,
  star: StarOutlined,
  fire: FireOutlined,
  diamond: GiftOutlined,
  crown: CrownOutlined,
};

// Rarity Colors for Mining/NFT System
export const LightDomRarity = {
  common: { color: LightDomColors.mining.common, label: 'Common', icon: StarOutlined },
  uncommon: { color: LightDomColors.mining.uncommon, label: 'Uncommon', icon: StarOutlined },
  rare: { color: LightDomColors.mining.rare, label: 'Rare', icon: GiftOutlined },
  epic: { color: LightDomColors.mining.epic, label: 'Epic', icon: GiftOutlined },
  legendary: { color: LightDomColors.mining.legendary, label: 'Legendary', icon: CrownOutlined },
  mythical: { color: LightDomColors.mining.mythical, label: 'Mythical', icon: CrownOutlined },
};

// Status Badge Component
export const StatusBadge: React.FC<{ status: 'online' | 'offline' | 'processing' | 'warning'; text?: string }> = ({ 
  status, 
  text 
}) => {
  const statusConfig = {
    online: { color: LightDomColors.status.success, dot: true },
    offline: { color: LightDomColors.status.error, dot: false },
    processing: { color: LightDomColors.status.processing, dot: true },
    warning: { color: LightDomColors.status.warning, dot: true },
  };

  return (
    <Badge 
      status={statusConfig[status].dot ? 'processing' : 'default'} 
      text={text || status}
      style={{ 
        color: statusConfig[status].color,
        fontWeight: LightDomTypography.fontWeight.medium,
      }}
    />
  );
};

// Mining Card Component
export const MiningCard: React.FC<{
  title: string;
  description: string;
  rarity: keyof typeof LightDomRarity;
  progress?: number;
  stats?: { label: string; value: string }[];
}> = ({ title, description, rarity, progress, stats }) => {
  const rarityConfig = LightDomRarity[rarity];
  const Icon = rarityConfig.icon;

  return (
    <Card
      className="mining-card"
      style={{
        ...LightDomComponents.card.elevated,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: rarityConfig.color,
      }} />
      
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: LightDomSpacing.sm }}>
          <Icon style={{ color: rarityConfig.color, fontSize: '20px' }} />
          <Title level={5} style={{ margin: 0, color: LightDomColors.dark.text }}>
            {title}
          </Title>
        </div>
        
        <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
          {description}
        </Text>

        {progress !== undefined && (
          <Progress 
            percent={progress} 
            strokeColor={rarityConfig.color}
            trailColor={LightDomColors.dark.border}
            size="small"
          />
        )}

        {stats && (
          <div style={{ display: 'flex', gap: LightDomSpacing.md, marginTop: LightDomSpacing.sm }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <Text strong style={{ color: LightDomColors.dark.text, display: 'block' }}>
                  {stat.value}
                </Text>
                <Text type="secondary" style={{ fontSize: LightDomTypography.fontSize.xs }}>
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};

// Feature Card Component
export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'inactive' | 'beta';
  onClick?: () => void;
}> = ({ icon, title, description, status, onClick }) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      className="feature-card"
      style={{
        ...LightDomComponents.card.default,
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: LightDomSpacing.md,
            fontSize: '24px',
            color: LightDomColors.primary[500],
          }}>
            {icon}
          </div>
          
          {status && (
            <Badge 
              status={status === 'active' ? 'success' : status === 'beta' ? 'processing' : 'default'}
              text={status}
              style={{ 
                textTransform: 'uppercase',
                fontSize: LightDomTypography.fontSize.xs,
                fontWeight: LightDomTypography.fontWeight.medium,
              }}
            />
          )}
        </div>

        <div>
          <Title level={5} style={{ margin: 0, color: LightDomColors.dark.text }}>
            {title}
          </Title>
          <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
            {description}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

// Stats Card Component
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, change, icon, loading }) => {
  const changeColor = change && change > 0 ? LightDomColors.status.success : 
                    change && change < 0 ? LightDomColors.status.error : 
                    LightDomColors.dark.textSecondary;

  return (
    <Card style={LightDomComponents.card.default} loading={loading}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: LightDomSpacing.sm }}>
          {icon && (
            <div style={{ color: LightDomColors.primary[500], fontSize: '20px' }}>
              {icon}
            </div>
          )}
          <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
            {title}
          </Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: LightDomSpacing.sm }}>
          <Title level={3} style={{ margin: 0, color: LightDomColors.dark.text }}>
            {value}
          </Title>
          {change !== undefined && (
            <Text style={{ color: changeColor, fontSize: LightDomTypography.fontSize.sm }}>
              {change > 0 ? '+' : ''}{change}%
            </Text>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default {
  Colors: LightDomColors,
  Typography: LightDomTypography,
  Spacing: LightDomSpacing,
  BorderRadius: LightDomBorderRadius,
  Shadows: LightDomShadows,
  Animations: LightDomAnimations,
  Components: LightDomComponents,
  Icons: LightDomIcons,
  Rarity: LightDomRarity,
  StatusBadge,
  MiningCard,
  FeatureCard,
  StatsCard,
};

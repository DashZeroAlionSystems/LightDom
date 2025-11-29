/**
 * Dashboard Card Atom - Material Design 3.0
 * 
 * A consistent, reusable card component for dashboard layouts
 * Following Material Design 3.0 principles with elevation, spacing, and typography
 */

import React, { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import { motion } from 'framer-motion';
import { 
  MaterialColors, 
  MaterialSpacing, 
  MaterialElevation, 
  MaterialBorderRadius,
  MaterialTransitions 
} from '../../../../styles/MaterialDesignSystem';

const { Title, Text } = Typography;

export interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  elevation?: 1 | 2 | 3 | 4 | 5;
  size?: 'small' | 'medium' | 'large';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  icon,
  actions,
  loading = false,
  hoverable = true,
  bordered = false,
  className = '',
  style = {},
  onClick,
  elevation = 1,
  size = 'medium',
}) => {
  const sizeStyles = {
    small: {
      padding: MaterialSpacing.xs,
      titleSize: 16,
      subtitleSize: 12,
    },
    medium: {
      padding: MaterialSpacing.md,
      titleSize: 18,
      subtitleSize: 14,
    },
    large: {
      padding: MaterialSpacing.lg,
      titleSize: 20,
      subtitleSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  const cardStyle: React.CSSProperties = {
    borderRadius: MaterialBorderRadius.lg,
    border: bordered ? `1px solid ${MaterialColors.neutral[20]}` : 'none',
    transition: `all ${MaterialTransitions.standard}`,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const cardBodyStyle: React.CSSProperties = {
    padding: currentSize.padding,
  };

  const cardTitle = (title || subtitle || icon) && (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: children ? MaterialSpacing.sm : 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: MaterialSpacing.sm }}>
        {icon && (
          <div style={{ 
            fontSize: 24, 
            color: MaterialColors.primary[50],
            display: 'flex',
            alignItems: 'center',
          }}>
            {icon}
          </div>
        )}
        <div>
          {title && (
            <Title 
              level={5} 
              style={{ 
                margin: 0, 
                fontSize: currentSize.titleSize,
                fontWeight: 600,
                color: MaterialColors.neutral[90],
              }}
            >
              {title}
            </Title>
          )}
          {subtitle && (
            <Text 
              style={{ 
                fontSize: currentSize.subtitleSize, 
                color: MaterialColors.neutral[60],
                display: 'block',
                marginTop: title ? 4 : 0,
              }}
            >
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { 
        boxShadow: MaterialElevation[Math.min(elevation + 1, 5) as keyof typeof MaterialElevation],
        transform: 'translateY(-2px)',
      } : undefined}
    >
      <Card
        loading={loading}
        hoverable={hoverable}
        className={`dashboard-card ${className}`}
        style={cardStyle}
        bodyStyle={cardBodyStyle}
        onClick={onClick}
      >
        {cardTitle}
        {children}
      </Card>
    </motion.div>
  );
};

export default DashboardCard;

/**
 * Dashboard Section Atom - Material Design 3.0
 * 
 * A section container for grouping related dashboard content
 */

import React, { ReactNode } from 'react';
import { Divider, Typography } from 'antd';
import { MaterialColors, MaterialSpacing } from '../../../../styles/MaterialDesignSystem';

const { Title, Text } = Typography;

export interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
  marginTop?: boolean;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions,
  divider = true,
  marginTop = true,
}) => {
  return (
    <div style={{ marginTop: marginTop ? MaterialSpacing.xl : 0 }}>
      {divider && <Divider style={{ marginTop: 0, marginBottom: MaterialSpacing.lg }} />}
      
      {(title || actions) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: MaterialSpacing.md,
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
                <Title level={4} style={{ margin: 0 }}>
                  {title}
                </Title>
              )}
              {subtitle && (
                <Text style={{ color: MaterialColors.neutral[60], display: 'block' }}>
                  {subtitle}
                </Text>
              )}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default DashboardSection;

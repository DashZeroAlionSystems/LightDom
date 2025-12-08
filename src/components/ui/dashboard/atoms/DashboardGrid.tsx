/**
 * Dashboard Grid Atom - Material Design 3.0
 * 
 * A responsive grid component for dashboard layouts
 * Uses Ant Design Row/Col with Material Design spacing
 */

import React, { ReactNode } from 'react';
import { Row, Col } from 'antd';
import { MaterialSpacing } from '../../../../styles/MaterialDesignSystem';

export interface DashboardGridProps {
  children: ReactNode;
  gutter?: number | [number, number];
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  gutter = [Number(MaterialSpacing.md), Number(MaterialSpacing.md)],
  columns = 3,
  align = 'top',
  justify = 'start',
}) => {
  const span = 24 / columns;

  return (
    <Row gutter={gutter} align={align} justify={justify}>
      {React.Children.map(children, (child) => (
        <Col xs={24} sm={12} md={span} lg={span} xl={span}>
          {child}
        </Col>
      ))}
    </Row>
  );
};

export default DashboardGrid;

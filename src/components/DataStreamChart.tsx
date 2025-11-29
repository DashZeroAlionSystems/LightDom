/**
 * DataStreamChart Component
 * Real-time chart visualization for data streams
 */

import React from 'react';
import { Card, Tag } from 'antd';
import { LineChartOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export interface DataStreamChartProps {
  stream: {
    id: string;
    name: string;
    type: string;
    active: boolean;
    lastUpdate?: string;
    data?: any[];
  };
}

export const DataStreamChart: React.FC<DataStreamChartProps> = ({ stream }) => {
  return (
    <Card
      title={
        <span>
          <LineChartOutlined /> {stream.name}
        </span>
      }
      extra={
        stream.active ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Active
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Inactive
          </Tag>
        )
      }
    >
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        <p style={{ marginTop: 16, color: '#888' }}>
          Stream Type: <strong>{stream.type}</strong>
        </p>
        {stream.lastUpdate && (
          <p style={{ color: '#888' }}>
            Last Update: {new Date(stream.lastUpdate).toLocaleString()}
          </p>
        )}
        <p style={{ color: '#888' }}>Data points: {stream.data?.length || 0}</p>
      </div>
    </Card>
  );
};

export default DataStreamChart;

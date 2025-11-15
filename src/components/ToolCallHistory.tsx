/**
 * ToolCallHistory Component
 * Displays history of AI tool calls and their results
 */

import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Collapse } from 'antd';
import { ToolOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ToolCallHistory: React.FC = () => {
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchToolCalls = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/analytics/tool-usage`);
        setToolCalls(response.data.slice(0, 50)); // Last 50 calls
      } catch (error) {
        console.error('Failed to fetch tool calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToolCalls();
    const interval = setInterval(fetchToolCalls, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <List
        loading={loading}
        dataSource={toolCalls}
        locale={{ emptyText: 'No tool calls yet' }}
        renderItem={(call) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                call.success ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
                )
              }
              title={
                <Space>
                  <Tag icon={<ToolOutlined />} color="blue">
                    {call.tool_name}
                  </Tag>
                  <Text type="secondary">{new Date(call.called_at).toLocaleString()}</Text>
                </Space>
              }
              description={
                <Collapse ghost>
                  <Panel header="Details" key="1">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Arguments:</Text>
                        <Paragraph>
                          <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                            {JSON.stringify(call.arguments, null, 2)}
                          </pre>
                        </Paragraph>
                      </div>
                      {call.result && (
                        <div>
                          <Text strong>Result:</Text>
                          <Paragraph>
                            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                              {JSON.stringify(call.result, null, 2)}
                            </pre>
                          </Paragraph>
                        </div>
                      )}
                      <div>
                        <Text type="secondary">
                          Execution Time: {call.execution_time_ms}ms
                        </Text>
                      </div>
                    </Space>
                  </Panel>
                </Collapse>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ToolCallHistory;

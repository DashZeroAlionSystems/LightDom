import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Input, Table, Tag, Alert, Space, Typography, Descriptions, Spin, message, Modal, Select } from 'antd';
import { DatabaseOutlined, PlayCircleOutlined, BulbOutlined, CodeOutlined, SafetyOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { deepseekDatabaseAPI } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const DeepSeekDatabaseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('query');
  const [loading, setLoading] = useState(false);
  
  // Schema state
  const [schema, setSchema] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  
  // Query state
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  // AI Suggestion state
  const [intent, setIntent] = useState('');
  const [suggestion, setSuggestion] = useState<any>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  // Examples state
  const [examples, setExamples] = useState<any[]>([]);
  const [examplesLoading, setExamplesLoading] = useState(false);
  
  // Load schema on mount
  useEffect(() => {
    loadSchema();
    loadExamples();
  }, []);
  
  const loadSchema = async () => {
    setSchemaLoading(true);
    try {
      const data = await deepseekDatabaseAPI.getSchema();
      if (data.success) {
        setSchema(data);
      } else {
        message.error('Failed to load schema');
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to load schema');
    } finally {
      setSchemaLoading(false);
    }
  };
  
  const loadExamples = async () => {
    setExamplesLoading(true);
    try {
      const data = await deepseekDatabaseAPI.getExamples();
      if (data.success) {
        setExamples(data.examples || []);
      }
    } catch (error: any) {
      console.error('Failed to load examples:', error);
    } finally {
      setExamplesLoading(false);
    }
  };
  
  const executeQuery = async () => {
    if (!query.trim()) {
      message.warning('Please enter a query');
      return;
    }
    
    setQueryLoading(true);
    setQueryError(null);
    setQueryResults(null);
    
    try {
      const data = await deepseekDatabaseAPI.executeQuery(query);
      if (data.success) {
        setQueryResults(data);
        message.success('Query executed successfully');
      } else {
        setQueryError(data.error || 'Query failed');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Query execution failed';
      setQueryError(errorMsg);
      if (error.response?.data?.reason) {
        setQueryError(`${errorMsg}: ${error.response.data.reason}`);
      }
    } finally {
      setQueryLoading(false);
    }
  };
  
  const getSuggestion = async () => {
    if (!intent.trim()) {
      message.warning('Please describe what you want to query');
      return;
    }
    
    setSuggestionLoading(true);
    setSuggestion(null);
    
    try {
      const data = await deepseekDatabaseAPI.suggestQuery(intent);
      if (data.success) {
        setSuggestion(data.suggestion);
        if (data.suggestion.safe) {
          message.success('Query suggestion generated');
        } else {
          message.warning('Generated query may not be safe to execute');
        }
      } else {
        message.error('Failed to generate suggestion');
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to generate suggestion');
    } finally {
      setSuggestionLoading(false);
    }
  };
  
  const useSuggestion = () => {
    if (suggestion?.query) {
      setQuery(suggestion.query);
      setActiveTab('query');
      message.success('Suggestion copied to query tab');
    }
  };
  
  const useExample = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setActiveTab('query');
    message.success('Example copied to query tab');
  };
  
  // Render query results as table
  const renderResults = () => {
    if (!queryResults || !queryResults.data) return null;
    
    const { fields, rows, rowCount } = queryResults.data;
    const { executionTime, limited } = queryResults.meta || {};
    
    if (rowCount === 0) {
      return <Alert message="No results found" type="info" showIcon />;
    }
    
    // Create columns from fields
    const columns = fields.map((field: any, index: number) => ({
      title: field.name,
      dataIndex: field.name,
      key: field.name,
      ellipsis: true,
      render: (text: any) => {
        if (text === null) return <Tag>NULL</Tag>;
        if (typeof text === 'boolean') return text ? <Tag color="green">TRUE</Tag> : <Tag color="red">FALSE</Tag>;
        return String(text);
      },
    }));
    
    // Create data from rows
    const dataSource = rows.map((row: any[], rowIndex: number) => {
      const obj: any = { key: rowIndex };
      fields.forEach((field: any, fieldIndex: number) => {
        obj[field.name] = row[fieldIndex];
      });
      return obj;
    });
    
    return (
      <div>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            message={
              <Space>
                <CheckCircleOutlined />
                <Text>
                  {rowCount} row{rowCount !== 1 ? 's' : ''} returned
                  {executionTime && <> in {executionTime}ms</>}
                  {limited && <Tag color="warning" style={{ marginLeft: 8 }}>Result limited to 1000 rows</Tag>}
                </Text>
              </Space>
            }
            type="success"
          />
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 50 }}
            size="small"
          />
        </Space>
      </div>
    );
  };
  
  // Schema tab content
  const schemaTab = (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            onClick={loadSchema}
            loading={schemaLoading}
          >
            Reload Schema
          </Button>
        </div>
        
        {schema && (
          <>
            <Card size="small" title="Safety Configuration">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Read-Only Mode">
                  <Tag color="green">
                    <SafetyOutlined /> Enabled
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Max Rows">
                  {schema.safety?.maxRows || 1000}
                </Descriptions.Item>
                <Descriptions.Item label="Allowed Operations">
                  {schema.safety?.allowedOperations?.join(', ') || 'SELECT'}
                </Descriptions.Item>
                <Descriptions.Item label="Restricted Tables">
                  {schema.safety?.disallowedTables?.length || 0} tables
                </Descriptions.Item>
              </Descriptions>
            </Card>
            
            <Card size="small" title={`Database Schema (${schema.schema?.length || 0} tables)`}>
              {schema.schema?.map((table: any, index: number) => (
                <Card
                  key={index}
                  size="small"
                  type="inner"
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <Text code>{table.table}</Text>
                      <Tag>{table.estimatedRows} rows</Tag>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Table
                    size="small"
                    pagination={false}
                    columns={[
                      { title: 'Column', dataIndex: 'column_name', key: 'column_name' },
                      { title: 'Type', dataIndex: 'data_type', key: 'data_type' },
                      { 
                        title: 'Nullable', 
                        dataIndex: 'is_nullable', 
                        key: 'is_nullable',
                        render: (val: string) => val === 'YES' ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>
                      },
                    ]}
                    dataSource={table.columns.map((col: any, i: number) => ({ ...col, key: i }))}
                  />
                  
                  {table.indexes && table.indexes.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <Text strong>Indexes:</Text>
                      <ul>
                        {table.indexes.map((idx: any, i: number) => (
                          <li key={i}><Text code>{idx.indexname}</Text></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </Card>
          </>
        )}
        
        {schemaLoading && <Spin tip="Loading schema..." />}
      </Space>
    </div>
  );
  
  // Query tab content
  const queryTab = (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="Execute Query">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message={
                <Space direction="vertical" size="small">
                  <Text strong>Safety Features:</Text>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Only SELECT queries allowed</li>
                    <li>Sensitive tables are restricted</li>
                    <li>Results limited to 1000 rows</li>
                    <li>Query timeout: 10 seconds</li>
                    <li>Rate limit: 30 requests per minute</li>
                  </ul>
                </Space>
              }
              type="info"
              icon={<SafetyOutlined />}
              showIcon
            />
            
            <TextArea
              placeholder="Enter your SQL query (SELECT only)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={8}
              style={{ fontFamily: 'monospace' }}
            />
            
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={executeQuery}
              loading={queryLoading}
              size="large"
            >
              Execute Query
            </Button>
          </Space>
        </Card>
        
        {queryError && (
          <Alert
            message="Query Error"
            description={queryError}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            closable
          />
        )}
        
        {queryResults && renderResults()}
      </Space>
    </div>
  );
  
  // AI Suggestion tab content
  const suggestionTab = (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="AI-Powered Query Suggestions">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="Describe what you want to query in natural language, and DeepSeek will generate a safe SQL query for you."
              type="info"
              icon={<BulbOutlined />}
              showIcon
            />
            
            <TextArea
              placeholder="Example: Show me the 10 most recent campaigns with their status..."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={4}
            />
            
            <Button
              type="primary"
              icon={<BulbOutlined />}
              onClick={getSuggestion}
              loading={suggestionLoading}
              size="large"
            >
              Generate Query
            </Button>
          </Space>
        </Card>
        
        {suggestion && (
          <Card
            size="small"
            title={
              <Space>
                <CodeOutlined />
                <Text>Generated Query</Text>
                {suggestion.safe ? (
                  <Tag color="green"><CheckCircleOutlined /> Safe</Tag>
                ) : (
                  <Tag color="red"><ExclamationCircleOutlined /> Unsafe</Tag>
                )}
              </Space>
            }
            extra={
              suggestion.safe && (
                <Button type="primary" onClick={useSuggestion}>
                  Use This Query
                </Button>
              )
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Intent:</Text> {suggestion.intent}
              </div>
              
              <div>
                <Text strong>SQL Query:</Text>
                <pre style={{
                  background: '#f5f5f5',
                  padding: 12,
                  borderRadius: 4,
                  overflow: 'auto'
                }}>
                  {suggestion.query}
                </pre>
              </div>
              
              {!suggestion.safe && suggestion.reason && (
                <Alert
                  message="Safety Warning"
                  description={suggestion.reason}
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
  
  // Examples tab content
  const examplesTab = (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" title="Example Queries">
          <Alert
            message="Click on any example to copy it to the query tab"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {examplesLoading ? (
            <Spin tip="Loading examples..." />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {examples.map((example, index) => (
                <Card
                  key={index}
                  size="small"
                  type="inner"
                  title={example.title}
                  extra={
                    <Button type="link" onClick={() => useExample(example.query)}>
                      Use Example
                    </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph>{example.description}</Paragraph>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      overflow: 'auto',
                      margin: 0
                    }}>
                      {example.query}
                    </pre>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DatabaseOutlined /> DeepSeek Database Integration
        </Title>
        <Paragraph>
          Safe database access with AI-powered query generation. All queries are validated for security and limited to read-only operations.
        </Paragraph>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab={<span><PlayCircleOutlined /> Query</span>} key="query">
          {queryTab}
        </TabPane>
        
        <TabPane tab={<span><BulbOutlined /> AI Suggestions</span>} key="suggestions">
          {suggestionTab}
        </TabPane>
        
        <TabPane tab={<span><DatabaseOutlined /> Schema</span>} key="schema">
          {schemaTab}
        </TabPane>
        
        <TabPane tab={<span><CodeOutlined /> Examples</span>} key="examples">
          {examplesTab}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DeepSeekDatabaseDashboard;

/**
 * Interactive Mermaid Chart Demo Component
 * Showcases interactive Mermaid diagrams with architecture examples
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, Typography, Select, Switch, Slider, InputNumber, Divider, Alert, Tag, Badge, Progress, Tabs } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ExperimentOutlined,
  CodeOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import InteractiveMermaidChart, { MermaidConfig, MermaidNote, MermaidAnnotation } from './InteractiveMermaidChart';
import './InteractiveMermaidDemo.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const InteractiveMermaidDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState('architecture');
  const [chartConfig, setChartConfig] = useState<MermaidConfig>({
    diagram: '',
    theme: 'default',
    title: 'Interactive Architecture Diagram',
    description: 'Click on nodes to add notes, use mouse wheel to zoom, and drag to pan',
    showNotes: true,
    showAnnotations: true,
    enableZoom: true,
    enablePan: true,
    height: 600,
    backgroundColor: '#ffffff',
    fontSize: 14
  });

  // Architecture diagram examples
  const architectureDiagrams = {
    architecture: {
      title: 'System Architecture',
      description: 'High-level system architecture with microservices and data flow',
      diagram: `graph TB
    subgraph "Client Layer"
        A[Web App] --> B[Mobile App]
        A --> C[Desktop App]
    end
    
    subgraph "API Gateway"
        D[Load Balancer] --> E[API Gateway]
        E --> F[Rate Limiter]
        E --> G[Auth Service]
    end
    
    subgraph "Microservices"
        H[User Service] --> I[User DB]
        J[Order Service] --> K[Order DB]
        L[Payment Service] --> M[Payment DB]
        N[Notification Service] --> O[Message Queue]
    end
    
    subgraph "External Services"
        P[Payment Gateway]
        Q[Email Service]
        R[SMS Service]
    end
    
    subgraph "Infrastructure"
        S[Redis Cache]
        T[File Storage]
        U[Monitoring]
    end
    
    A --> D
    B --> D
    C --> D
    
    E --> H
    E --> J
    E --> L
    E --> N
    
    L --> P
    N --> Q
    N --> R
    
    H --> S
    J --> S
    L --> S
    
    H --> T
    J --> T
    
    H --> U
    J --> U
    L --> U
    N --> U`
    },
    
    sequence: {
      title: 'User Registration Flow',
      description: 'Sequence diagram showing user registration process',
      diagram: `sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API Gateway
    participant US as User Service
    participant DB as Database
    participant E as Email Service
    
    U->>W: Fill registration form
    W->>A: POST /register
    A->>A: Validate request
    A->>US: Create user account
    US->>DB: Check if user exists
    DB-->>US: User not found
    US->>DB: Insert new user
    DB-->>US: User created
    US->>E: Send welcome email
    E-->>US: Email sent
    US-->>A: User created successfully
    A-->>W: Registration successful
    W-->>U: Show success message`
    },
    
    flowchart: {
      title: 'Data Processing Pipeline',
      description: 'Flowchart showing data processing and optimization workflow',
      diagram: `flowchart TD
    A[Data Input] --> B{Data Valid?}
    B -->|Yes| C[Parse Data]
    B -->|No| D[Log Error]
    D --> E[Return Error]
    
    C --> F[Transform Data]
    F --> G[Apply Optimizations]
    G --> H{Optimization<br/>Successful?}
    H -->|Yes| I[Store Results]
    H -->|No| J[Rollback Changes]
    J --> K[Log Failure]
    K --> L[Notify Admin]
    
    I --> M[Generate Report]
    M --> N[Send Notifications]
    N --> O[Update Dashboard]
    O --> P[End]
    
    L --> P
    E --> P`
    },
    
    gantt: {
      title: 'Project Timeline',
      description: 'Gantt chart showing project phases and milestones',
      diagram: `gantt
    title Project Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Requirements Gathering    :done,    req, 2024-01-01, 2024-01-15
    System Design           :done,    design, 2024-01-16, 2024-02-01
    Database Setup          :done,    db, 2024-02-02, 2024-02-10
    
    section Phase 2
    Backend Development     :active,  backend, 2024-02-11, 2024-03-15
    API Development         :         api, 2024-02-25, 2024-03-20
    Testing                :         test, 2024-03-16, 2024-03-30
    
    section Phase 3
    Frontend Development    :         frontend, 2024-03-01, 2024-04-15
    Integration            :         integration, 2024-04-01, 2024-04-30
    Deployment             :         deploy, 2024-05-01, 2024-05-15`
    },
    
    class: {
      title: 'Class Diagram',
      description: 'Class diagram showing object relationships and methods',
      diagram: `classDiagram
    class User {
        +String id
        +String email
        +String name
        +Date createdAt
        +login()
        +logout()
        +updateProfile()
    }
    
    class Order {
        +String id
        +String userId
        +Date orderDate
        +String status
        +calculateTotal()
        +updateStatus()
    }
    
    class Product {
        +String id
        +String name
        +Decimal price
        +String description
        +updatePrice()
        +getAvailability()
    }
    
    class Payment {
        +String id
        +String orderId
        +Decimal amount
        +String method
        +processPayment()
        +refund()
    }
    
    User ||--o{ Order : places
    Order ||--o{ Product : contains
    Order ||--|| Payment : has
    Product ||--o{ Order : included_in`
    },
    
    state: {
      title: 'Order State Machine',
      description: 'State diagram showing order lifecycle and transitions',
      diagram: `stateDiagram-v2
    [*] --> Pending : Order Created
    
    Pending --> Confirmed : Payment Received
    Pending --> Cancelled : Customer Cancels
    Pending --> Expired : Timeout
    
    Confirmed --> Processing : Start Fulfillment
    Confirmed --> Cancelled : Customer Cancels
    
    Processing --> Shipped : Items Dispatched
    Processing --> Cancelled : Customer Cancels
    
    Shipped --> Delivered : Delivery Confirmed
    Shipped --> Returned : Customer Returns
    
    Delivered --> Completed : Order Closed
    Delivered --> Returned : Customer Returns
    
    Returned --> Refunded : Refund Processed
    Refunded --> [*]
    
    Completed --> [*]
    Cancelled --> [*]
    Expired --> [*]`
    }
  };

  // Initialize with architecture diagram
  useEffect(() => {
    const diagram = architectureDiagrams[currentDemo as keyof typeof architectureDiagrams];
    if (diagram) {
      setChartConfig(prev => ({
        ...prev,
        diagram: diagram.diagram,
        title: diagram.title,
        description: diagram.description
      }));
    }
  }, [currentDemo]);

  const handleDemoChange = (demoKey: string) => {
    setCurrentDemo(demoKey);
    setIsPlaying(false);
  };

  const handleConfigChange = (newConfig: MermaidConfig) => {
    setChartConfig(newConfig);
  };

  const handleNoteAdd = (note: MermaidNote) => {
    console.log('Note added:', note);
  };

  const handleNoteUpdate = (note: MermaidNote) => {
    console.log('Note updated:', note);
  };

  const handleNoteDelete = (noteId: string) => {
    console.log('Note deleted:', noteId);
  };

  const handleAnnotationAdd = (annotation: MermaidAnnotation) => {
    console.log('Annotation added:', annotation);
  };

  const handleAnnotationUpdate = (annotation: MermaidAnnotation) => {
    console.log('Annotation updated:', annotation);
  };

  const handleAnnotationDelete = (annotationId: string) => {
    console.log('Annotation deleted:', annotationId);
  };

  const currentDiagram = architectureDiagrams[currentDemo as keyof typeof architectureDiagrams];

  return (
    <div className="interactive-mermaid-demo">
      <div className="demo-header">
        <div className="demo-title">
          <Title level={2}>
            <CodeOutlined className="title-icon" />
            Interactive Mermaid Diagrams
          </Title>
          <Paragraph className="demo-description">
            Create, edit, and interact with Mermaid diagrams. Add notes, zoom, pan, and export your diagrams.
          </Paragraph>
        </div>
        
        <div className="demo-controls">
          <Space wrap>
            <Button
              type={isPlaying ? 'primary' : 'default'}
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? 'Pause' : 'Play'} Animation
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                const diagram = architectureDiagrams[currentDemo as keyof typeof architectureDiagrams];
                if (diagram) {
                  setChartConfig(prev => ({
                    ...prev,
                    diagram: diagram.diagram
                  }));
                }
              }}
            >
              Refresh Diagram
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Demo Selection */}
        <Col xs={24} lg={6}>
          <Card title="Diagram Types" className="demo-sidebar">
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(architectureDiagrams).map(([key, diagram]) => (
                <Button
                  key={key}
                  type={currentDemo === key ? 'primary' : 'default'}
                  block
                  onClick={() => handleDemoChange(key)}
                  className="demo-scenario-btn"
                >
                  <div className="scenario-content">
                    <Text strong>{diagram.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {diagram.description}
                    </Text>
                  </div>
                </Button>
              ))}
            </Space>
            
            <Divider />
            
            <div className="feature-highlights">
              <Title level={5}>Interactive Features</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="feature-item">
                  <StarOutlined className="feature-icon" />
                  <div>
                    <Text strong>Add Notes</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Click on any node to add notes
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <ThunderboltOutlined className="feature-icon" />
                  <div>
                    <Text strong>Zoom & Pan</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Mouse wheel to zoom, drag to pan
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <BulbOutlined className="feature-icon" />
                  <div>
                    <Text strong>Annotations</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Highlight and annotate diagram elements
                    </Text>
                  </div>
                </div>
                <div className="feature-item">
                  <ExperimentOutlined className="feature-icon" />
                  <div>
                    <Text strong>Edit & Export</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Edit diagram code and export in multiple formats
                    </Text>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Main Chart */}
        <Col xs={24} lg={18}>
          <Card className="main-chart-card">
            <InteractiveMermaidChart
              config={chartConfig}
              onConfigChange={handleConfigChange}
              onNoteAdd={handleNoteAdd}
              onNoteUpdate={handleNoteUpdate}
              onNoteDelete={handleNoteDelete}
              onAnnotationAdd={handleAnnotationAdd}
              onAnnotationUpdate={handleAnnotationUpdate}
              onAnnotationDelete={handleAnnotationDelete}
              className="demo-chart"
            />
          </Card>
        </Col>
      </Row>

      {/* Feature Showcase */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Mermaid Diagram Features" className="features-showcase">
            <Tabs defaultActiveKey="types">
              <TabPane tab="Diagram Types" key="types">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <NodeIndexOutlined />
                      </div>
                      <Title level={5}>Flowcharts</Title>
                      <Text type="secondary">
                        Create flowcharts, process flows, and decision trees with interactive nodes.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">graph TB</Tag>
                        <Tag color="green">flowchart TD</Tag>
                        <Tag color="orange">Interactive</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <BranchesOutlined />
                      </div>
                      <Title level={5}>Sequence Diagrams</Title>
                      <Text type="secondary">
                        Model interactions between actors and systems over time.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">sequenceDiagram</Tag>
                        <Tag color="green">Actors</Tag>
                        <Tag color="orange">Timeline</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <DatabaseOutlined />
                      </div>
                      <Title level={5}>Class Diagrams</Title>
                      <Text type="secondary">
                        Design object-oriented systems with classes, methods, and relationships.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">classDiagram</Tag>
                        <Tag color="green">OOP</Tag>
                        <Tag color="orange">Relationships</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <CloudOutlined />
                      </div>
                      <Title level={5">Gantt Charts</Title>
                      <Text type="secondary">
                        Plan and track project timelines with interactive Gantt charts.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">gantt</Tag>
                        <Tag color="green">Timeline</Tag>
                        <Tag color="orange">Project</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <ApiOutlined />
                      </div>
                      <Title level={5}>State Diagrams</Title>
                      <Text type="secondary">
                        Model state machines and system behavior with state transitions.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">stateDiagram</Tag>
                        <Tag color="green">States</Tag>
                        <Tag color="orange">Transitions</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={8}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <SecurityScanOutlined />
                      </div>
                      <Title level={5}>Git Graphs</Title>
                      <Text type="secondary">
                        Visualize Git workflows and branching strategies.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">gitgraph</Tag>
                        <Tag color="green">Git</Tag>
                        <Tag color="orange">Branches</Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane tab="Interactive Features" key="features">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <StarOutlined />
                      </div>
                      <Title level={5}>Smart Notes</Title>
                      <Text type="secondary">
                        Add contextual notes to any diagram element. Notes are automatically positioned and can be categorized.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">Click to Add</Tag>
                        <Tag color="green">Categorized</Tag>
                        <Tag color="orange">Searchable</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <ThunderboltOutlined />
                      </div>
                      <Title level={5}>Advanced Zoom</Title>
                      <Text type="secondary">
                        Smooth zoom and pan with mouse wheel and drag. Reset view with one click.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">Mouse Wheel</Tag>
                        <Tag color="green">Drag to Pan</Tag>
                        <Tag color="orange">Reset View</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <BulbOutlined />
                      </div>
                      <Title level={5}>Rich Annotations</Title>
                      <Text type="secondary">
                        Add highlights, boxes, arrows, and text annotations to diagram elements.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">Multiple Types</Tag>
                        <Tag color="green">Customizable</Tag>
                        <Tag color="orange">Exportable</Tag>
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <div className="feature-card">
                      <div className="feature-icon-large">
                        <ExperimentOutlined />
                      </div>
                      <Title level={5}>Live Editing</Title>
                      <Text type="secondary">
                        Edit diagram code in real-time and see changes instantly. Export in multiple formats.
                      </Text>
                      <div className="feature-tags">
                        <Tag color="blue">Live Edit</Tag>
                        <Tag color="green">Real-time</Tag>
                        <Tag color="orange">Multiple Formats</Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Usage Instructions */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Alert
            message="How to Use Interactive Mermaid Diagrams"
            description={
              <div className="usage-instructions">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="1" style={{ backgroundColor: '#1890ff' }} />
                      <div>
                        <Text strong>Add Notes</Text>
                        <br />
                        <Text type="secondary">Click on any node or element to add a note</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="2" style={{ backgroundColor: '#52c41a' }} />
                      <div>
                        <Text strong>Zoom & Pan</Text>
                        <br />
                        <Text type="secondary">Use mouse wheel to zoom, drag to pan around</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="instruction-item">
                      <Badge count="3" style={{ backgroundColor: '#faad14' }} />
                      <div>
                        <Text strong>Edit & Export</Text>
                        <br />
                        <Text type="secondary">Click Edit Diagram to modify code, Export to save</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default InteractiveMermaidDemo;
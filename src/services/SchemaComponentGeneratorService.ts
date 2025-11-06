/**
 * Schema-Based Component and Report Generator
 * Uses configuration schemas to generate components and entertaining reports
 * Created: 2025-11-06
 */

export interface ComponentSchema {
  id: string;
  name: string;
  type: 'dashboard' | 'chart' | 'table' | 'card' | 'form' | '3d-visualization' | 'report';
  dataSource: {
    type: 'api' | 'static' | 'computed';
    endpoint?: string;
    transformation?: string;
  };
  styling: {
    theme?: 'default' | 'dark' | 'light' | 'colorful';
    animation?: 'fade' | 'slide' | 'bounce' | 'rotate';
    layout?: 'grid' | 'flex' | 'stack';
  };
  config: Record<string, any>;
}

export interface ReportSchema {
  id: string;
  title: string;
  sections: ReportSection[];
  visualizations: VisualizationConfig[];
  styling: {
    theme: string;
    animations: boolean;
    interactive: boolean;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'stats' | 'charts' | 'tables' | '3d-viz' | 'insights';
  data: any;
  config: Record<string, any>;
}

export interface VisualizationConfig {
  id: string;
  type: '3d-dom-layers' | 'performance-chart' | 'optimization-map' | 'biome-distribution';
  data: any;
  styling: {
    colors: string[];
    animations: boolean;
    interactive: boolean;
  };
}

export class SchemaComponentGeneratorService {
  /**
   * Generate a component from schema
   */
  static generateComponent(schema: ComponentSchema): string {
    switch (schema.type) {
      case 'dashboard':
        return this.generateDashboardComponent(schema);
      case 'chart':
        return this.generateChartComponent(schema);
      case '3d-visualization':
        return this.generate3DVisualizationComponent(schema);
      case 'report':
        return this.generateReportComponent(schema);
      default:
        return this.generateGenericComponent(schema);
    }
  }

  /**
   * Generate dashboard component
   */
  private static generateDashboardComponent(schema: ComponentSchema): string {
    const { name, dataSource, styling, config } = schema;
    
    return `
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';

export const ${name} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      ${dataSource.type === 'api' ? `
      const response = await fetch('${dataSource.endpoint}');
      const result = await response.json();
      setData(result);
      ` : `
      setData(${JSON.stringify(config.defaultData || {})});
      `}
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className="${styling.theme || 'default'}-theme">
      <h1>${config.title || name}</h1>
      <Row gutter={16}>
        ${config.stats?.map((stat: any, idx: number) => `
        <Col span={6} key="${idx}">
          <Card>
            <Statistic
              title="${stat.title}"
              value={data?.${stat.dataKey} || 0}
              prefix={<${stat.icon} />}
            />
          </Card>
        </Col>
        `).join('') || ''}
      </Row>
      {/* Additional dashboard content */}
    </div>
  );
};
    `.trim();
  }

  /**
   * Generate chart component
   */
  private static generateChartComponent(schema: ComponentSchema): string {
    const { name, config } = schema;
    
    return `
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const ${name} = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: '${config.chartType || 'bar'}',
        data: {
          labels: data.labels,
          datasets: data.datasets
        },
        options: {
          responsive: true,
          animation: {
            duration: ${config.animationDuration || 1000}
          },
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: true,
              text: '${config.title || name}'
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};
    `.trim();
  }

  /**
   * Generate 3D visualization component
   */
  private static generate3DVisualizationComponent(schema: ComponentSchema): string {
    const { name, config } = schema;
    
    return `
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const ${name} = ({ layers }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(${config.backgroundColor || '0x000000'});
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create layer visualizations
    layers?.forEach((layer, index) => {
      const geometry = new THREE.BoxGeometry(
        layer.dimensions.width,
        layer.dimensions.thickness,
        layer.dimensions.height
      );
      const material = new THREE.MeshPhongMaterial({
        color: layer.color,
        opacity: layer.opacity,
        transparent: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(layer.position.x, layer.position.y, layer.position.z);
      scene.add(mesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [layers]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '${config.height || '600px'}' }}
    />
  );
};
    `.trim();
  }

  /**
   * Generate report component
   */
  private static generateReportComponent(schema: ComponentSchema): string {
    const { name } = schema;
    
    return `
import React from 'react';
import { Card, Row, Col, Statistic, Timeline, Progress } from 'antd';
import { TrendingUp, Award, Zap, Database } from 'lucide-react';

export const ${name} = ({ reportData }) => {
  return (
    <div className="animated-report" style={{ padding: '24px' }}>
      {/* Header with key metrics */}
      <Card className="animated-card slide-in">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Space Saved"
              value={reportData.totalSpaceSaved}
              suffix="MB"
              prefix={<Database />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Performance Gain"
              value={reportData.performanceGain}
              suffix="%"
              prefix={<Zap />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Optimizations"
              value={reportData.totalOptimizations}
              prefix={<TrendingUp />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Quality Score"
              value={reportData.qualityScore}
              suffix="/100"
              prefix={<Award />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Progress indicators */}
      <Card className="animated-card fade-in" style={{ marginTop: '24px' }}>
        <h3>Progress Breakdown</h3>
        {reportData.progressItems?.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>{item.label}</div>
            <Progress
              percent={item.percent}
              status={item.status}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        ))}
      </Card>

      {/* Timeline of activities */}
      <Card className="animated-card bounce-in" style={{ marginTop: '24px' }}>
        <h3>Activity Timeline</h3>
        <Timeline>
          {reportData.timeline?.map((event, idx) => (
            <Timeline.Item key={idx} color={event.color}>
              <p>{event.title}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{event.description}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

// Add CSS animations
const styles = \`
.animated-card {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.slide-in {
  animation-name: slideIn;
}

.fade-in {
  animation-name: fadeIn;
  animation-delay: 0.2s;
}

.bounce-in {
  animation-name: bounceIn;
  animation-delay: 0.4s;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0%, 20%, 40%, 60%, 80%, to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
\`;
    `.trim();
  }

  /**
   * Generate generic component
   */
  private static generateGenericComponent(schema: ComponentSchema): string {
    return `
import React from 'react';

export const ${schema.name} = (props) => {
  return (
    <div className="${schema.styling.theme || 'default'}">
      <h2>${schema.name}</h2>
      {/* Component implementation */}
    </div>
  );
};
    `.trim();
  }

  /**
   * Generate entertaining report schema
   */
  static generateEntertainingReportSchema(data: any): ReportSchema {
    return {
      id: 'entertaining-client-report',
      title: 'Website Performance & Optimization Report',
      sections: [
        {
          id: 'hero-stats',
          title: 'At a Glance',
          type: 'stats',
          data: {
            spaceSaved: data.totalSpaceSaved,
            performanceGain: data.averagePerformanceGain,
            optimizations: data.totalOptimizations,
            score: data.qualityScore
          },
          config: {
            animated: true,
            countUp: true,
            icons: true
          }
        },
        {
          id: '3d-dom-visualization',
          title: 'DOM Structure in 3D',
          type: '3d-viz',
          data: data.domLayers,
          config: {
            interactive: true,
            rotationSpeed: 0.5,
            colorScheme: 'viridis'
          }
        },
        {
          id: 'performance-timeline',
          title: 'Performance Over Time',
          type: 'charts',
          data: data.performanceTimeline,
          config: {
            chartType: 'line',
            animated: true,
            showPoints: true
          }
        },
        {
          id: 'optimization-map',
          title: 'Optimization Impact Map',
          type: 'charts',
          data: data.optimizationMap,
          config: {
            chartType: 'heatmap',
            colorScale: 'RdYlGn',
            interactive: true
          }
        },
        {
          id: 'insights',
          title: 'Key Insights & Recommendations',
          type: 'insights',
          data: data.insights,
          config: {
            animated: true,
            actionable: true
          }
        }
      ],
      visualizations: [
        {
          id: 'dom-layers-3d',
          type: '3d-dom-layers',
          data: data.domLayers,
          styling: {
            colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
            animations: true,
            interactive: true
          }
        },
        {
          id: 'biome-distribution',
          type: 'biome-distribution',
          data: data.biomeDistribution,
          styling: {
            colors: ['#52c41a', '#1890ff', '#722ed1', '#fa8c16'],
            animations: true,
            interactive: false
          }
        }
      ],
      styling: {
        theme: 'modern-gradient',
        animations: true,
        interactive: true
      }
    };
  }

  /**
   * Example schema configurations
   */
  static getExampleSchemas(): ComponentSchema[] {
    return [
      {
        id: 'user-stats-dashboard',
        name: 'UserStatsDashboard',
        type: 'dashboard',
        dataSource: {
          type: 'api',
          endpoint: '/api/users/stats/overview'
        },
        styling: {
          theme: 'default',
          animation: 'fade',
          layout: 'grid'
        },
        config: {
          title: 'User Management Dashboard',
          stats: [
            { title: 'Total Users', dataKey: 'total_users', icon: 'Users' },
            { title: 'Active Users', dataKey: 'active_users', icon: 'UserCheck' },
            { title: 'New Users (30d)', dataKey: 'new_users_30d', icon: 'UserPlus' }
          ]
        }
      },
      {
        id: 'optimization-chart',
        name: 'OptimizationChart',
        type: 'chart',
        dataSource: {
          type: 'computed',
          transformation: 'aggregate_by_date'
        },
        styling: {
          theme: 'colorful',
          animation: 'slide'
        },
        config: {
          chartType: 'line',
          title: 'Optimizations Over Time',
          animationDuration: 1500
        }
      },
      {
        id: 'dom-layers-3d-viz',
        name: 'DOMLayersVisualization',
        type: '3d-visualization',
        dataSource: {
          type: 'api',
          endpoint: '/api/analytics/dom-layers'
        },
        styling: {
          theme: 'dark',
          animation: 'rotate'
        },
        config: {
          height: '800px',
          backgroundColor: '0x1a1a2e'
        }
      }
    ];
  }
}

export default SchemaComponentGeneratorService;

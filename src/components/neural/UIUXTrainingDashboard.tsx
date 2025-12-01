/**
 * UI/UX Training Dashboard
 * 
 * Central dashboard for training neural networks to understand great UI/UX
 * Includes training controls, metrics visualization, and real-time feedback
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Statistic, Row, Col, Tabs, message } from 'antd';
import {
  RocketOutlined,
  PauseOutlined,
  ReloadOutlined,
  SaveOutlined,
  ExperimentOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import NeuralNetworkVisualizer, { NetworkArchitecture, TrainingMetrics } from './NeuralNetworkVisualizer';

const { TabPane } = Tabs;

interface Props {
  onTrainingStart?: () => void;
  onTrainingStop?: () => void;
}

export const UIUXTrainingDashboard: React.FC<Props> = ({
  onTrainingStart,
  onTrainingStop,
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs] = useState(100);
  
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    epoch: 0,
    loss: 0.5,
    accuracy: 0.75,
    valLoss: 0.6,
    valAccuracy: 0.72,
  });

  // Example network architecture
  const [architecture] = useState<NetworkArchitecture>({
    layers: [50, 128, 64, 32, 5],
    nodes: [
      // Input layer (sample of 10 nodes for visualization)
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `input-${i}`,
        layer: 0,
        index: i,
        type: 'input' as const,
        label: i === 0 ? 'Colors' : i === 1 ? 'Spacing' : undefined,
      })),
      // Hidden layers
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `hidden0-${i}`,
        layer: 1,
        index: i,
        type: 'hidden' as const,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `hidden1-${i}`,
        layer: 2,
        index: i,
        type: 'hidden' as const,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `hidden2-${i}`,
        layer: 3,
        index: i,
        type: 'hidden' as const,
      })),
      // Output layer
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `output-${i}`,
        layer: 4,
        index: i,
        type: 'output' as const,
        label: ['Accessibility', 'Performance', 'Aesthetics', 'Usability', 'Overall'][i],
      })),
    ],
    links: [],
  });

  // Generate connections between layers
  useEffect(() => {
    const links = [];
    const layers = [
      architecture.nodes.filter(n => n.layer === 0),
      architecture.nodes.filter(n => n.layer === 1),
      architecture.nodes.filter(n => n.layer === 2),
      architecture.nodes.filter(n => n.layer === 3),
      architecture.nodes.filter(n => n.layer === 4),
    ];

    for (let i = 0; i < layers.length - 1; i++) {
      for (const sourceNode of layers[i]) {
        for (const targetNode of layers[i + 1]) {
          links.push({
            source: sourceNode.id,
            target: targetNode.id,
            weight: Math.random() * 2 - 1,
            active: false,
          });
        }
      }
    }

    architecture.links = links;
  }, []);

  // Simulate training process
  const startTraining = () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingProgress(0);
    onTrainingStart?.();

    const interval = setInterval(() => {
      setCurrentEpoch(prev => {
        const next = prev + 1;
        if (next >= totalEpochs) {
          clearInterval(interval);
          setIsTraining(false);
          message.success('Training completed successfully!');
          onTrainingStop?.();
          return totalEpochs;
        }
        
        // Update metrics
        setMetrics({
          epoch: next,
          loss: 0.5 * Math.exp(-next / 30) + Math.random() * 0.05,
          accuracy: 0.75 + (0.20 * (1 - Math.exp(-next / 30))) + (Math.random() * 0.02 - 0.01),
          valLoss: 0.6 * Math.exp(-next / 30) + Math.random() * 0.05,
          valAccuracy: 0.72 + (0.18 * (1 - Math.exp(-next / 30))) + (Math.random() * 0.02 - 0.01),
        });

        setTrainingProgress((next / totalEpochs) * 100);
        
        return next;
      });
    }, 500);
  };

  const pauseTraining = () => {
    setIsTraining(false);
    message.info('Training paused');
    onTrainingStop?.();
  };

  const resetTraining = () => {
    setIsTraining(false);
    setCurrentEpoch(0);
    setTrainingProgress(0);
    setMetrics({
      epoch: 0,
      loss: 0.5,
      accuracy: 0.75,
      valLoss: 0.6,
      valAccuracy: 0.72,
    });
    message.info('Training reset');
  };

  const saveModel = () => {
    message.success('Model saved successfully!');
  };

  return (
    <div className="uiux-training-dashboard" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <ExperimentOutlined /> UI/UX Neural Network Training
      </h1>

      <Row gutter={[16, 16]}>
        {/* Training Controls */}
        <Col span={24}>
          <Card title="Training Controls">
            <div style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={startTraining}
                disabled={isTraining}
                style={{ marginRight: '8px' }}
              >
                Start Training
              </Button>
              <Button
                icon={<PauseOutlined />}
                onClick={pauseTraining}
                disabled={!isTraining}
                style={{ marginRight: '8px' }}
              >
                Pause
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetTraining}
                style={{ marginRight: '8px' }}
              >
                Reset
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={saveModel}
                disabled={currentEpoch === 0}
              >
                Save Model
              </Button>
            </div>

            <Progress
              percent={trainingProgress}
              status={isTraining ? 'active' : 'normal'}
              format={() => `Epoch ${currentEpoch}/${totalEpochs}`}
            />
          </Card>
        </Col>

        {/* Metrics Cards */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Training Loss"
              value={metrics.loss}
              precision={4}
              valueStyle={{ color: metrics.loss < 0.2 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Training Accuracy"
              value={metrics.accuracy * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: metrics.accuracy > 0.9 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Validation Loss"
              value={metrics.valLoss || 0}
              precision={4}
              valueStyle={{ color: (metrics.valLoss || 0) < 0.2 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Validation Accuracy"
              value={(metrics.valAccuracy || 0) * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: (metrics.valAccuracy || 0) > 0.9 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>

        {/* Network Visualization */}
        <Col span={24}>
          <Card title={<><LineChartOutlined /> Network Architecture</>}>
            <NeuralNetworkVisualizer
              architecture={architecture}
              trainingMetrics={metrics}
              isTraining={isTraining}
              width={1200}
              height={600}
            />
          </Card>
        </Col>

        {/* Detailed Metrics */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Training History" key="1">
                <div style={{ padding: '16px' }}>
                  <p>Epoch: {metrics.epoch}</p>
                  <p>Loss: {metrics.loss.toFixed(4)}</p>
                  <p>Accuracy: {(metrics.accuracy * 100).toFixed(2)}%</p>
                </div>
              </TabPane>
              <TabPane tab="Model Configuration" key="2">
                <div style={{ padding: '16px' }}>
                  <pre>{JSON.stringify({
                    architecture: {
                      inputSize: 50,
                      hiddenLayers: [128, 64, 32],
                      outputSize: 5,
                      activation: 'relu',
                    },
                    training: {
                      epochs: totalEpochs,
                      batchSize: 32,
                      learningRate: 0.001,
                      optimizer: 'adam',
                    },
                  }, null, 2)}</pre>
                </div>
              </TabPane>
              <TabPane tab="Dataset Info" key="3">
                <div style={{ padding: '16px' }}>
                  <p>Total Samples: 1,234</p>
                  <p>Training Samples: 987</p>
                  <p>Validation Samples: 247</p>
                  <p>Features: 50</p>
                  <p>Categories: Accessibility, Performance, Aesthetics, Usability, Overall</p>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UIUXTrainingDashboard;

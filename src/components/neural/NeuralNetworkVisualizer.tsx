/**
 * Neural Network Visualizer
 * 
 * Interactive visualization of neural network architecture and training process
 * using D3.js for structure and Anime.js for animations
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import anime from 'animejs';

export interface NetworkNode {
  id: string;
  layer: number;
  index: number;
  type: 'input' | 'hidden' | 'output';
  activation?: number;
  label?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  weight: number;
  active: boolean;
}

export interface NetworkArchitecture {
  layers: number[];
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

interface Props {
  architecture: NetworkArchitecture;
  trainingMetrics?: TrainingMetrics;
  isTraining?: boolean;
  activations?: Map<string, number>;
  onNodeClick?: (node: NetworkNode) => void;
  width?: number;
  height?: number;
}

export const NeuralNetworkVisualizer: React.FC<Props> = ({
  architecture,
  trainingMetrics,
  isTraining = false,
  activations,
  onNodeClick,
  width = 1200,
  height = 800,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Gradient for active connections
    const activeGradient = defs
      .append('linearGradient')
      .attr('id', 'active-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    activeGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#00ff88')
      .attr('stop-opacity', 0.8);
    
    activeGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00ccff')
      .attr('stop-opacity', 0.8);

    // Calculate layer positions
    const layerCount = architecture.layers.length;
    const layerWidth = width / (layerCount + 1);
    
    // Position nodes
    const nodePositions = new Map<string, { x: number; y: number }>();
    architecture.nodes.forEach((node) => {
      const layerSize = architecture.layers[node.layer];
      const layerHeight = height / (layerSize + 1);
      
      const x = layerWidth * (node.layer + 1);
      const y = layerHeight * (node.index + 1);
      
      nodePositions.set(node.id, { x, y });
    });

    // Draw connections
    const linkGroup = svg.append('g').attr('class', 'links');
    
    architecture.links.forEach((link) => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (!sourcePos || !targetPos) return;
      
      const weightStrength = Math.abs(link.weight);
      const isPositive = link.weight > 0;
      
      linkGroup
        .append('line')
        .attr('x1', sourcePos.x)
        .attr('y1', sourcePos.y)
        .attr('x2', targetPos.x)
        .attr('y2', targetPos.y)
        .attr('stroke', link.active ? 'url(#active-gradient)' : (isPositive ? '#4a90e2' : '#e74c3c'))
        .attr('stroke-width', weightStrength * 3 + 0.5)
        .attr('stroke-opacity', link.active ? 0.8 : 0.2)
        .attr('class', 'connection');
    });

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    architecture.nodes.forEach((node) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      const activation = activations?.get(node.id) || 0;
      const nodeRadius = 25;
      
      // Node circle
      nodeGroup
        .append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', nodeRadius)
        .attr('fill', getNodeColor(node.type, activation))
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('class', `node node-${node.type}`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedNode(node);
          onNodeClick?.(node);
        });
      
      // Node label
      if (node.label) {
        nodeGroup
          .append('text')
          .attr('x', pos.x)
          .attr('y', pos.y + nodeRadius + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#333')
          .attr('font-size', '11px')
          .text(node.label);
      }
    });

    // Add layer labels
    const labelGroup = svg.append('g').attr('class', 'layer-labels');
    
    ['Input', ...Array(layerCount - 2).fill('Hidden'), 'Output'].forEach((label, i) => {
      labelGroup
        .append('text')
        .attr('x', layerWidth * (i + 1))
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(label + ' Layer');
    });

  }, [architecture, activations, width, height, onNodeClick]);

  const getNodeColor = (type: string, activation: number): string => {
    const baseColors = {
      input: '#4a90e2',
      hidden: '#9b59b6',
      output: '#e74c3c',
    };
    
    return baseColors[type as keyof typeof baseColors] || '#95a5a6';
  };

  return (
    <div className="neural-network-visualizer">
      <div className="visualization-container" style={{ position: 'relative' }}>
        <svg ref={svgRef} style={{ background: '#f8f9fa', borderRadius: '8px' }} />
        
        {trainingMetrics && (
          <div className="metrics-panel" style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
              Training Metrics
            </h4>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div>Epoch: {trainingMetrics.epoch}</div>
              <div>Loss: {trainingMetrics.loss.toFixed(4)}</div>
              <div>Accuracy: {(trainingMetrics.accuracy * 100).toFixed(2)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralNetworkVisualizer;

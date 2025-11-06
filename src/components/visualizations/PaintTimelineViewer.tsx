/**
 * Paint Timeline Viewer Component
 * 
 * Features:
 * - Timeline visualization with playback controls
 * - Paint event highlighting as they occur
 * - Schema-configurable viewing models
 * - Model A: Rich snippet elements
 * - Model B: Framework components
 * - Real-time paint event streaming
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Select, Slider, Badge, Tag, Tabs, Timeline, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  ForwardOutlined,
  BackwardOutlined,
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';

interface PaintEvent {
  timestamp: number;
  elementId: string;
  eventType: 'paint' | 'composite' | 'layout' | 'style';
  duration: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layerId?: string;
  paintOrder: number;
}

interface PaintSnapshot {
  id: string;
  timestamp: number;
  url: string;
  events: PaintEvent[];
  layerTree: any[];
  paintedElements: string[];
  unpaintedElements: string[];
  metadata: {
    totalPaintTime: number;
    totalElements: number;
    paintedCount: number;
    firstPaint: number;
    largestContentfulPaint: number;
  };
}

interface PaintTimelineModel {
  id: string;
  name: string;
  description: string;
  filterType: 'richSnippet' | 'framework' | 'custom';
  filterConfig: any;
}

interface PaintTimelineViewerProps {
  snapshotId?: string;
  url?: string;
}

export const PaintTimelineViewer: React.FC<PaintTimelineViewerProps> = ({
  snapshotId,
  url,
}) => {
  const [snapshot, setSnapshot] = useState<PaintSnapshot | null>(null);
  const [models, setModels] = useState<PaintTimelineModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<PaintEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [highlightedElements, setHighlightedElements] = useState<Set<string>>(
    new Set()
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load snapshot
  useEffect(() => {
    const loadSnapshot = async () => {
      if (snapshotId) {
        const response = await fetch(
          `/api/workflow/paint-timeline/snapshots/${snapshotId}`
        );
        const data = await response.json();
        setSnapshot(data);
        setFilteredEvents(data.events);
      } else if (url) {
        // Profile URL
        const response = await fetch('/api/workflow/paint-timeline/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        setSnapshot(data);
        setFilteredEvents(data.events);
      }
    };

    loadSnapshot();
  }, [snapshotId, url]);

  // Load timeline models
  useEffect(() => {
    const loadModels = async () => {
      const response = await fetch('/api/workflow/paint-timeline/models');
      const data = await response.json();
      setModels(data);
    };

    loadModels();
  }, []);

  // Apply model filter
  useEffect(() => {
    if (!snapshot || !selectedModel) {
      setFilteredEvents(snapshot?.events || []);
      return;
    }

    const model = models.find((m) => m.id === selectedModel);
    if (!model) return;

    const filtered = filterEventsByModel(snapshot.events, model);
    setFilteredEvents(filtered);
  }, [selectedModel, snapshot, models]);

  // Playback control
  useEffect(() => {
    if (!isPlaying || !snapshot) return;

    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 100 * playbackSpeed;
        if (next > snapshot.metadata.totalPaintTime) {
          setIsPlaying(false);
          return snapshot.metadata.totalPaintTime;
        }
        return next;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, snapshot, playbackSpeed]);

  // Update highlighted elements based on current time
  useEffect(() => {
    if (!filteredEvents.length) return;

    const highlighted = new Set<string>();
    for (const event of filteredEvents) {
      if (event.timestamp <= currentTime) {
        highlighted.add(event.elementId);
      }
    }

    setHighlightedElements(highlighted);
  }, [currentTime, filteredEvents]);

  // Render timeline canvas
  useEffect(() => {
    if (!canvasRef.current || !filteredEvents.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw timeline
    const width = canvas.width;
    const height = canvas.height;
    const maxTime = snapshot?.metadata.totalPaintTime || 1000;

    // Draw background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw events
    for (const event of filteredEvents) {
      const x = (event.timestamp / maxTime) * width;
      const y = (event.paintOrder / filteredEvents.length) * (height - 40);

      // Event marker
      ctx.fillStyle = highlightedElements.has(event.elementId)
        ? '#52c41a'
        : '#d9d9d9';
      ctx.beginPath();
      ctx.arc(x, y + 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Event type indicator
      if (highlightedElements.has(event.elementId)) {
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(event.eventType, x + 6, y + 24);
      }
    }

    // Draw current time marker
    const currentX = (currentTime / maxTime) * width;
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();

    // Draw metrics
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(`Time: ${Math.round(currentTime)}ms`, 10, height - 10);
    ctx.fillText(
      `Painted: ${highlightedElements.size}/${filteredEvents.length}`,
      150,
      height - 10
    );
  }, [filteredEvents, currentTime, highlightedElements, snapshot]);

  const filterEventsByModel = (
    events: PaintEvent[],
    model: PaintTimelineModel
  ): PaintEvent[] => {
    switch (model.filterType) {
      case 'richSnippet':
        return events.filter((event) =>
          snapshot?.paintedElements.some(
            (el) =>
              el.includes('article') ||
              el.includes('product') ||
              el.includes('event')
          )
        );

      case 'framework':
        return events.filter((event) =>
          event.elementId.includes('react') ||
          event.elementId.includes('vue') ||
          event.elementId.includes('angular')
        );

      case 'custom':
        // Apply custom filter from config
        return events;

      default:
        return events;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleForward = () => {
    setCurrentTime((prev) =>
      Math.min(prev + 1000, snapshot?.metadata.totalPaintTime || 0)
    );
  };

  const handleBackward = () => {
    setCurrentTime((prev) => Math.max(prev - 1000, 0));
  };

  if (!snapshot) {
    return <Card loading />;
  }

  const progress = snapshot.metadata.totalPaintTime > 0
    ? (currentTime / snapshot.metadata.totalPaintTime) * 100
    : 0;

  return (
    <div className="paint-timeline-viewer">
      <Card
        title="Paint Timeline Viewer"
        extra={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FilterOutlined />
            <Select
              style={{ width: 200 }}
              placeholder="Select viewing model"
              value={selectedModel}
              onChange={setSelectedModel}
              options={models.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </div>
        }
      >
        <Tabs
          items={[
            {
              key: 'timeline',
              label: 'Timeline View',
              children: (
                <div>
                  {/* Metrics */}
                  <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    <Badge
                      count={`${highlightedElements.size} painted`}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                    <Badge
                      count={`${filteredEvents.length - highlightedElements.size} pending`}
                      style={{ backgroundColor: '#d9d9d9' }}
                    />
                    <Tag color="blue">
                      FP: {snapshot.metadata.firstPaint}ms
                    </Tag>
                    <Tag color="green">
                      LCP: {snapshot.metadata.largestContentfulPaint}ms
                    </Tag>
                  </div>

                  {/* Timeline Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    style={{
                      width: '100%',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  />

                  {/* Progress */}
                  <Progress
                    percent={Math.round(progress)}
                    showInfo={false}
                    style={{ marginTop: 16 }}
                  />

                  {/* Controls */}
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      icon={<BackwardOutlined />}
                      onClick={handleBackward}
                    />
                    <Button
                      type="primary"
                      icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      icon={<ForwardOutlined />}
                      onClick={handleForward}
                    />
                    <Button icon={<ReloadOutlined />} onClick={handleRestart}>
                      Restart
                    </Button>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                      <span>Speed:</span>
                      <Select
                        value={playbackSpeed}
                        onChange={setPlaybackSpeed}
                        style={{ width: 80 }}
                        options={[
                          { label: '0.5x', value: 0.5 },
                          { label: '1x', value: 1 },
                          { label: '2x', value: 2 },
                          { label: '4x', value: 4 },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'events',
              label: `Events (${filteredEvents.length})`,
              children: (
                <Timeline
                  items={filteredEvents.slice(0, 50).map((event) => ({
                    color: highlightedElements.has(event.elementId)
                      ? 'green'
                      : 'gray',
                    children: (
                      <div>
                        <strong>{event.eventType}</strong> - {event.elementId}
                        <br />
                        <small>
                          {event.timestamp}ms | Order: {event.paintOrder}
                        </small>
                      </div>
                    ),
                  }))}
                />
              ),
            },
            {
              key: 'layers',
              label: `Layers (${snapshot.layerTree.length})`,
              children: (
                <div>
                  {snapshot.layerTree.map((layer: any, index: number) => (
                    <Card
                      key={index}
                      size="small"
                      style={{ marginBottom: 8 }}
                    >
                      <div>
                        <strong>Layer {layer.layerId}</strong>
                        <br />
                        Paint count: {layer.paintCount} | Draws content:{' '}
                        {layer.drawsContent ? 'Yes' : 'No'}
                        <br />
                        Bounds: {layer.bounds.width}x{layer.bounds.height}
                      </div>
                    </Card>
                  ))}
                </div>
              ),
            },
            {
              key: 'metadata',
              label: 'Metadata',
              children: (
                <div>
                  <p>
                    <strong>URL:</strong> {snapshot.url}
                  </p>
                  <p>
                    <strong>Total Paint Time:</strong>{' '}
                    {snapshot.metadata.totalPaintTime}ms
                  </p>
                  <p>
                    <strong>First Paint:</strong>{' '}
                    {snapshot.metadata.firstPaint}ms
                  </p>
                  <p>
                    <strong>Largest Contentful Paint:</strong>{' '}
                    {snapshot.metadata.largestContentfulPaint}ms
                  </p>
                  <p>
                    <strong>Total Elements:</strong>{' '}
                    {snapshot.metadata.totalElements}
                  </p>
                  <p>
                    <strong>Painted Elements:</strong>{' '}
                    {snapshot.metadata.paintedCount}
                  </p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PaintTimelineViewer;

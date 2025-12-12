/**
 * Animation Controller Component
 * 
 * A comprehensive animation player UI inspired by animejs.com
 * Features: Timeline player, easing visualizer, property inspector,
 * playback controls, and interactive demos.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Slider, Button, Select, Space, Typography, Row, Col, Tooltip, Switch, Collapse, Tag, Divider } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  FastBackwardOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  RetweetOutlined,
  SwapOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { animate, createTimeline, utils } from 'animejs';
import type { JSAnimation, Timeline } from 'animejs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface AnimationControllerProps {
  /** Animation target selector or element */
  target?: string | HTMLElement;
  /** Initial animation properties */
  initialAnimation?: AnimationConfig;
  /** Show easing visualizer */
  showEasingViz?: boolean;
  /** Show property inspector */
  showInspector?: boolean;
  /** Theme variant */
  variant?: 'default' | 'compact' | 'minimal';
  /** Callback when animation state changes */
  onStateChange?: (state: AnimationState) => void;
}

export interface AnimationConfig {
  translateX?: number | string | number[];
  translateY?: number | string | number[];
  scale?: number | number[];
  rotate?: number | string | number[];
  opacity?: number | number[];
  backgroundColor?: string | string[];
  borderRadius?: string | string[];
  duration?: number;
  easing?: string;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate';
  autoplay?: boolean;
}

export interface AnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  direction: 'normal' | 'reverse' | 'alternate';
  loop: boolean | number;
  playbackRate: number;
}

// =============================================================================
// Easing Options
// =============================================================================

const EASING_OPTIONS = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In Quad', value: 'easeInQuad' },
  { label: 'Ease Out Quad', value: 'easeOutQuad' },
  { label: 'Ease In Out Quad', value: 'easeInOutQuad' },
  { label: 'Ease In Cubic', value: 'easeInCubic' },
  { label: 'Ease Out Cubic', value: 'easeOutCubic' },
  { label: 'Ease In Out Cubic', value: 'easeInOutCubic' },
  { label: 'Ease In Quart', value: 'easeInQuart' },
  { label: 'Ease Out Quart', value: 'easeOutQuart' },
  { label: 'Ease In Out Quart', value: 'easeInOutQuart' },
  { label: 'Ease In Expo', value: 'easeInExpo' },
  { label: 'Ease Out Expo', value: 'easeOutExpo' },
  { label: 'Ease In Out Expo', value: 'easeInOutExpo' },
  { label: 'Ease In Elastic', value: 'easeInElastic(1, .5)' },
  { label: 'Ease Out Elastic', value: 'easeOutElastic(1, .5)' },
  { label: 'Ease In Out Elastic', value: 'easeInOutElastic(1, .5)' },
  { label: 'Ease In Back', value: 'easeInBack' },
  { label: 'Ease Out Back', value: 'easeOutBack' },
  { label: 'Ease In Out Back', value: 'easeInOutBack' },
  { label: 'Ease In Bounce', value: 'easeInBounce' },
  { label: 'Ease Out Bounce', value: 'easeOutBounce' },
  { label: 'Ease In Out Bounce', value: 'easeInOutBounce' },
  { label: 'Spring', value: 'spring(1, 80, 10, 0)' },
];

// =============================================================================
// Animation Controller Component
// =============================================================================

export const AnimationController: React.FC<AnimationControllerProps> = ({
  showEasingViz = true,
  showInspector = true,
}) => {
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [direction, setDirection] = useState<'normal' | 'reverse' | 'alternate'>('normal');
  const [loop, setLoop] = useState<boolean | number>(false);
  const [selectedEasing, setSelectedEasing] = useState('easeOutExpo');
  const [duration, setDuration] = useState(1000);
  
  // Animation properties
  const [translateX, setTranslateX] = useState(250);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  // Refs
  const animationRef = useRef<JSAnimation | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Create animation
  const createAnimation = useCallback(() => {
    if (!targetRef.current) return null;
    
    // Reset target styles
    targetRef.current.style.transform = '';
    targetRef.current.style.opacity = '1';
    
    const anim = animate(targetRef.current, {
      translateX: [0, translateX],
      translateY: [0, translateY],
      scale: [1, scale],
      rotate: [0, rotate],
      opacity: [1, opacity],
      duration,
      ease: selectedEasing,
      loop: loop,
      direction,
      autoplay: false,
      onUpdate: (self) => {
        if (self.currentTime !== undefined && self.duration !== undefined) {
          setProgress((self.currentTime / self.duration) * 100);
          setCurrentTime(self.currentTime);
        }
      },
      onComplete: () => {
        if (!loop) {
          setIsPlaying(false);
        }
      },
    });
    
    return anim;
  }, [translateX, translateY, scale, rotate, opacity, duration, selectedEasing, loop, direction]);
  
  // Initialize animation
  useEffect(() => {
    animationRef.current = createAnimation();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [createAnimation]);
  
  // Playback controls
  const handlePlay = () => {
    if (animationRef.current) {
      animationRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => {
    if (animationRef.current) {
      animationRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleRestart = () => {
    if (animationRef.current) {
      animationRef.current.restart();
      setIsPlaying(true);
    }
  };
  
  const handleReverse = () => {
    if (animationRef.current) {
      animationRef.current.reverse();
    }
  };
  
  const handleSeek = (value: number) => {
    if (animationRef.current) {
      const seekTime = (value / 100) * duration;
      animationRef.current.seek(seekTime);
      setProgress(value);
      setCurrentTime(seekTime);
    }
  };
  
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (animationRef.current) {
      (animationRef.current as any).speed = rate;
    }
  };
  
  // Update animation when properties change
  const handlePropertyChange = () => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
    animationRef.current = createAnimation();
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  };
  
  return (
    <div className="animation-controller">
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#667eea' }} />
            <span>Animation Controller</span>
          </Space>
        }
        style={{ maxWidth: 900 }}
      >
        {/* Animation Preview */}
        <div 
          className="animation-preview"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 12,
            padding: 40,
            marginBottom: 24,
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <div
            ref={targetRef}
            className="animation-target"
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ThunderboltOutlined style={{ fontSize: 24, color: 'white' }} />
          </div>
        </div>
        
        {/* Timeline Progress Bar */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Slider
                value={progress}
                onChange={handleSeek}
                tooltip={{ formatter: (val) => `${val?.toFixed(1)}%` }}
                styles={{
                  track: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' },
                  handle: { borderColor: '#667eea' },
                }}
              />
            </Col>
            <Col>
              <Text type="secondary" style={{ fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </Col>
          </Row>
        </div>
        
        {/* Playback Controls */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
          <Col>
            <Space size="middle">
              <Tooltip title="Restart">
                <Button 
                  icon={<FastBackwardOutlined />} 
                  onClick={handleRestart}
                  size="large"
                />
              </Tooltip>
              <Tooltip title="Step Back">
                <Button 
                  icon={<StepBackwardOutlined />} 
                  onClick={() => handleSeek(Math.max(0, progress - 10))}
                  size="large"
                />
              </Tooltip>
              <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                <Button
                  type="primary"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={isPlaying ? handlePause : handlePlay}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    width: 60,
                    height: 60,
                    fontSize: 24,
                  }}
                />
              </Tooltip>
              <Tooltip title="Step Forward">
                <Button 
                  icon={<StepForwardOutlined />} 
                  onClick={() => handleSeek(Math.min(100, progress + 10))}
                  size="large"
                />
              </Tooltip>
              <Tooltip title="Reverse">
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={handleReverse}
                  size="large"
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        {/* Speed Controls */}
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Text strong>Speed:</Text>
          </Col>
          <Col span={12}>
            <Space>
              {[0.25, 0.5, 1, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  type={playbackRate === rate ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handlePlaybackRateChange(rate)}
                  style={playbackRate === rate ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  } : {}}
                >
                  {rate}x
                </Button>
              ))}
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <Text>Loop:</Text>
              <Switch
                checked={!!loop}
                onChange={(checked) => {
                  setLoop(checked);
                  handlePropertyChange();
                }}
              />
              <Text>Direction:</Text>
              <Select
                value={direction}
                onChange={(val) => {
                  setDirection(val);
                  handlePropertyChange();
                }}
                size="small"
                style={{ width: 100 }}
              >
                <Option value="normal">Normal</Option>
                <Option value="reverse">Reverse</Option>
                <Option value="alternate">Alternate</Option>
              </Select>
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        {/* Animation Properties */}
        <Collapse defaultActiveKey={['properties', 'easing']} ghost>
          <Panel 
            header={<Space><SettingOutlined /> Animation Properties</Space>} 
            key="properties"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text>Translate X: {translateX}px</Text>
                <Slider
                  min={-300}
                  max={500}
                  value={translateX}
                  onChange={(val) => {
                    setTranslateX(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
              <Col span={12}>
                <Text>Translate Y: {translateY}px</Text>
                <Slider
                  min={-100}
                  max={100}
                  value={translateY}
                  onChange={(val) => {
                    setTranslateY(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
              <Col span={12}>
                <Text>Scale: {scale}x</Text>
                <Slider
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={scale}
                  onChange={(val) => {
                    setScale(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
              <Col span={12}>
                <Text>Rotate: {rotate}°</Text>
                <Slider
                  min={-720}
                  max={720}
                  value={rotate}
                  onChange={(val) => {
                    setRotate(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
              <Col span={12}>
                <Text>Opacity: {opacity}</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={opacity}
                  onChange={(val) => {
                    setOpacity(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
              <Col span={12}>
                <Text>Duration: {duration}ms</Text>
                <Slider
                  min={100}
                  max={5000}
                  step={100}
                  value={duration}
                  onChange={(val) => {
                    setDuration(val);
                  }}
                  onChangeComplete={handlePropertyChange}
                />
              </Col>
            </Row>
          </Panel>
          
          {showEasingViz && (
            <Panel 
              header={<Space><DashboardOutlined /> Easing Function</Space>} 
              key="easing"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Select
                    value={selectedEasing}
                    onChange={(val) => {
                      setSelectedEasing(val);
                      handlePropertyChange();
                    }}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder="Select easing"
                  >
                    {EASING_OPTIONS.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={12}>
                  <EasingVisualizer easing={selectedEasing} />
                </Col>
              </Row>
            </Panel>
          )}
        </Collapse>
        
        {/* Current Animation State */}
        {showInspector && (
          <>
            <Divider />
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                <EyeOutlined /> Animation State
              </Title>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Tag color={isPlaying ? 'green' : 'default'}>
                    {isPlaying ? 'Playing' : 'Paused'}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Progress: </Text>
                  <Text strong>{progress.toFixed(1)}%</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Time: </Text>
                  <Text strong code>{formatTime(currentTime)}</Text>
                </Col>
              </Row>
              <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                <Col span={8}>
                  <Text type="secondary">Speed: </Text>
                  <Text strong>{playbackRate}x</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Direction: </Text>
                  <Text strong>{direction}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Loop: </Text>
                  <Text strong>{loop ? 'Yes' : 'No'}</Text>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

// =============================================================================
// Easing Visualizer Component
// =============================================================================

interface EasingVisualizerProps {
  easing: string;
  width?: number;
  height?: number;
}

const EasingVisualizer: React.FC<EasingVisualizerProps> = ({
  easing,
  width = 200,
  height = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * (height / 4));
      ctx.lineTo(width, i * (height / 4));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * (width / 4), 0);
      ctx.lineTo(i * (width / 4), height);
      ctx.stroke();
    }
    
    // Draw easing curve
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const padding = 10;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Animate a test element to get the easing values
    const obj = { progress: 0 };
    const testAnim = animate(obj, {
      progress: 1,
      duration: 1000,
      ease: easing,
      autoplay: false,
    });
    
    // Sample the easing at various points
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      testAnim.seek(t * 1000);
      const value = obj.progress;
      
      const x = padding + t * graphWidth;
      const y = height - padding - value * graphHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw start and end points
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(padding, height - padding, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - padding, padding, 4, 0, Math.PI * 2);
    ctx.fill();
    
  }, [easing, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        background: '#fafafa',
        borderRadius: 8,
        border: '1px solid #e0e0e0',
      }}
    />
  );
};

// =============================================================================
// Stagger Demo Component
// =============================================================================

export interface StaggerDemoProps {
  count?: number;
  staggerDelay?: number;
}

export const StaggerDemo: React.FC<StaggerDemoProps> = ({
  count = 10,
  staggerDelay: initialStaggerDelay = 80,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [staggerFrom, setStaggerFrom] = useState<'first' | 'last' | 'center'>('first');
  const [staggerDirection, setStaggerDirection] = useState<'normal' | 'reverse'>('normal');
  const [staggerDelay, setStaggerDelay] = useState(initialStaggerDelay);
  
  const runAnimation = () => {
    if (!containerRef.current || isAnimating) return;
    
    const elements = containerRef.current.querySelectorAll('.stagger-item');
    if (elements.length === 0) return;
    
    // Reset
    elements.forEach((el) => {
      (el as HTMLElement).style.transform = 'scale(0)';
      (el as HTMLElement).style.opacity = '0';
    });
    
    setIsAnimating(true);
    
    animate(elements, {
      scale: [0, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      delay: utils.stagger(staggerDelay, {
        from: staggerFrom,
        direction: staggerDirection,
      }),
      duration: 400,
      ease: 'easeOutElastic(1, .6)',
      onComplete: () => setIsAnimating(false),
    });
  };
  
  return (
    <Card
      title={
        <Space>
          <RetweetOutlined style={{ color: '#667eea' }} />
          <span>Stagger Animation</span>
        </Space>
      }
      style={{ maxWidth: 600 }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Text>Stagger From:</Text>
          <Select
            value={staggerFrom}
            onChange={setStaggerFrom}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="first">First</Option>
            <Option value="last">Last</Option>
            <Option value="center">Center</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Text>Direction:</Text>
          <Select
            value={staggerDirection}
            onChange={setStaggerDirection}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="normal">Normal</Option>
            <Option value="reverse">Reverse</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Text>Delay: {staggerDelay}ms</Text>
          <Slider
            min={20}
            max={200}
            value={staggerDelay}
            onChange={setStaggerDelay}
            style={{ marginTop: 8 }}
          />
        </Col>
      </Row>
      
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={runAnimation}
        loading={isAnimating}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          marginBottom: 16,
        }}
      >
        Run Animation
      </Button>
      
      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)`,
          gap: 12,
          padding: 20,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 12,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="stagger-item"
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              background: `linear-gradient(135deg, hsl(${240 + i * 10}, 70%, 60%) 0%, hsl(${260 + i * 10}, 50%, 50%) 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              transform: 'scale(0)',
              opacity: 0,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </Card>
  );
};

// =============================================================================
// Timeline Builder Component
// =============================================================================

export interface TimelineBuilderProps {
  onTimelineChange?: (timeline: Timeline) => void;
}

export const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
  onTimelineChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<Timeline | null>(null);
  
  const buildTimeline = useCallback(() => {
    if (!containerRef.current) return;
    
    const boxes = containerRef.current.querySelectorAll('.timeline-box');
    
    // Reset all boxes
    boxes.forEach((box) => {
      (box as HTMLElement).style.transform = '';
      (box as HTMLElement).style.opacity = '1';
      (box as HTMLElement).style.backgroundColor = '';
      (box as HTMLElement).style.borderRadius = '';
    });
    
    const tl = createTimeline({
      defaults: { duration: 500, ease: 'easeOutExpo' },
      autoplay: false,
      onUpdate: (self) => {
        if (self.currentTime !== undefined && self.duration !== undefined) {
          setProgress((self.currentTime / self.duration) * 100);
        }
      },
    });
    
    // Add sequential animations
    tl.add('.timeline-box-1', {
      translateX: [0, 200],
      rotate: [0, 180],
    });
    
    tl.add('.timeline-box-2', {
      translateY: [0, -50],
      scale: [1, 1.5],
      backgroundColor: '#f5222d',
    }, '-=250');
    
    tl.add('.timeline-box-3', {
      translateX: [0, -100],
      translateY: [0, 50],
      borderRadius: ['8px', '50%'],
    }, '-=250');
    
    tl.add(boxes, {
      opacity: [1, 0.5, 1],
    }, '+=250');
    
    timelineRef.current = tl;
    onTimelineChange?.(tl);
  }, [onTimelineChange]);
  
  useEffect(() => {
    buildTimeline();
  }, [buildTimeline]);
  
  const handlePlay = () => {
    if (timelineRef.current) {
      timelineRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => {
    if (timelineRef.current) {
      timelineRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleRestart = () => {
    buildTimeline();
    if (timelineRef.current) {
      timelineRef.current.restart();
      setIsPlaying(true);
    }
  };
  
  const handleSeek = (value: number) => {
    if (timelineRef.current) {
      const totalDuration = (timelineRef.current as any).duration || 2000;
      timelineRef.current.seek((value / 100) * totalDuration);
      setProgress(value);
    }
  };
  
  return (
    <Card
      title={
        <Space>
          <DashboardOutlined style={{ color: '#667eea' }} />
          <span>Timeline Builder</span>
        </Space>
      }
      style={{ maxWidth: 600 }}
    >
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: 40,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          className="timeline-box timeline-box-1"
          style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 8,
          }}
        />
        <div
          className="timeline-box timeline-box-2"
          style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            borderRadius: 8,
          }}
        />
        <div
          className="timeline-box timeline-box-3"
          style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
            borderRadius: 8,
          }}
        />
      </div>
      
      <Slider
        value={progress}
        onChange={handleSeek}
        style={{ marginBottom: 16 }}
      />
      
      <Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRestart}
        >
          Restart
        </Button>
        <Button
          type="primary"
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={isPlaying ? handlePause : handlePlay}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </Space>
      
      <Divider />
      
      <Text type="secondary">
        Timeline shows multiple animations synchronized with offsets. 
        Each box animates with different properties and timing.
      </Text>
    </Card>
  );
};

export default AnimationController;

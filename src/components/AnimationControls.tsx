/**
 * Animation Controls Component
 * 
 * Interactive playground for anime.js animations
 * Inspired by animejs.com interactive demos
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Slider, Select, Space, Row, Col, Typography, Tabs, Switch } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import anime from 'animejs/lib/anime.es.js';
import {
  createControlledAnimation,
  createTimeline,
  featureCardsStagger,
  animatedCounter,
  progressBarAnimation,
  svgDrawAnimation,
  textRevealAnimation,
  product3DRotation,
  productFloating,
  type ControlledAnimation,
} from '../utils/animeControls';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface AnimationControlsProps {
  demoMode?: 'product' | 'data' | 'svg' | 'text' | 'interactive';
  showCode?: boolean;
}

/**
 * Animation Controls - Interactive Demo Component
 */
export const AnimationControls: React.FC<AnimationControlsProps> = ({ 
  demoMode = 'product',
  showCode = true 
}) => {
  const [activeTab, setActiveTab] = useState(demoMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1000);
  const [easing, setEasing] = useState('easeOutExpo');
  const [staggerDelay, setStaggerDelay] = useState(100);
  const [loopEnabled, setLoopEnabled] = useState(false);
  
  const animationRef = useRef<ControlledAnimation | null>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Easing options from anime.js
  const easingOptions = [
    'linear',
    'easeInQuad', 'easeOutQuad', 'easeInOutQuad',
    'easeInCubic', 'easeOutCubic', 'easeInOutCubic',
    'easeInQuart', 'easeOutQuart', 'easeInOutQuart',
    'easeInExpo', 'easeOutExpo', 'easeInOutExpo',
    'easeInElastic', 'easeOutElastic', 'easeInOutElastic',
    'easeInBack', 'easeOutBack', 'easeInOutBack',
    'easeInBounce', 'easeOutBounce', 'easeInOutBounce',
  ];

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

  const createDemo = (type: string) => {
    if (!demoRef.current) return;

    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    const container = demoRef.current;
    container.innerHTML = '';

    switch (type) {
      case 'product':
        // Create product cards
        container.innerHTML = `
          <div style="display: flex; gap: 20px; flex-wrap: wrap; padding: 20px;">
            ${Array.from({ length: 6 }, (_, i) => `
              <div class="demo-card" style="
                width: 150px;
                height: 150px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 24px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                opacity: 0;
              ">
                ${i + 1}
              </div>
            `).join('')}
          </div>
        `;
        
        animationRef.current = createControlledAnimation({
          targets: container.querySelectorAll('.demo-card'),
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.9, 1],
          rotate: [2, 0],
          delay: anime.stagger(staggerDelay),
          duration,
          easing,
          loop: loopEnabled,
          autoplay: false,
        });
        break;

      case 'data':
        // Create progress bars
        container.innerHTML = `
          <div style="padding: 40px;">
            <div style="margin-bottom: 30px;">
              <div style="font-size: 48px; font-weight: bold; color: #667eea;">
                <span class="counter">0</span>
              </div>
              <div style="color: #888; margin-top: 8px;">Total Users</div>
            </div>
            ${Array.from({ length: 4 }, (_, i) => `
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Metric ${i + 1}</span>
                  <span>${60 + i * 10}%</span>
                </div>
                <div style="background: #f0f0f0; height: 12px; border-radius: 6px; overflow: hidden;">
                  <div class="progress-bar-${i}" style="
                    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                    height: 100%;
                    width: 0%;
                    border-radius: 6px;
                  "></div>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        const tl = createTimeline({ loop: loopEnabled });
        
        // Animate counter
        const counterObj = { value: 0 };
        tl.add({
          targets: counterObj,
          value: 12543,
          round: 1,
          duration,
          easing,
          update: () => {
            const counter = container.querySelector('.counter');
            if (counter) counter.textContent = counterObj.value.toLocaleString();
          },
        });

        // Animate progress bars
        Array.from({ length: 4 }, (_, i) => {
          tl.add({
            targets: container.querySelector(`.progress-bar-${i}`),
            width: `${60 + i * 10}%`,
            duration: duration * 0.8,
            easing,
          }, `-=${duration * 0.6}`);
        });

        animationRef.current = {
          instance: tl,
          play: () => tl.play(),
          pause: () => tl.pause(),
          restart: () => tl.restart(),
          reverse: () => tl.reverse(),
          seek: (time) => tl.seek(time),
          isPlaying: () => !tl.paused,
          getProgress: () => tl.progress,
        };
        break;

      case 'svg':
        // Create SVG animation
        container.innerHTML = `
          <div style="padding: 40px; display: flex; justify-content: center;">
            <svg width="300" height="300" viewBox="0 0 300 300">
              <path class="svg-path" d="M150,50 L250,150 L150,250 L50,150 Z" 
                fill="none" 
                stroke="#667eea" 
                stroke-width="4"
                style="stroke-dasharray: 800; stroke-dashoffset: 800;"
              />
              <circle class="svg-circle" cx="150" cy="150" r="0"
                fill="rgba(102, 126, 234, 0.2)"
                stroke="#764ba2"
                stroke-width="2"
              />
            </svg>
          </div>
        `;

        const svgTl = createTimeline({ loop: loopEnabled });
        svgTl.add({
          targets: container.querySelector('.svg-path'),
          strokeDashoffset: [800, 0],
          duration,
          easing,
        })
        .add({
          targets: container.querySelector('.svg-circle'),
          r: [0, 80],
          duration: duration * 0.6,
          easing,
        }, `-=${duration * 0.3}`);

        animationRef.current = {
          instance: svgTl,
          play: () => svgTl.play(),
          pause: () => svgTl.pause(),
          restart: () => svgTl.restart(),
          reverse: () => svgTl.reverse(),
          seek: (time) => svgTl.seek(time),
          isPlaying: () => !svgTl.paused,
          getProgress: () => svgTl.progress,
        };
        break;

      case 'text':
        // Create text animation
        container.innerHTML = `
          <div style="padding: 60px 40px; text-align: center;">
            <h1 class="animated-text" style="
              font-size: 48px;
              font-weight: bold;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">Amazing Animation</h1>
            <p class="animated-subtitle" style="
              font-size: 20px;
              color: #888;
              margin-top: 20px;
              opacity: 0;
            ">Powered by anime.js</p>
          </div>
        `;

        const text = container.querySelector('.animated-text');
        if (text) {
          const originalText = text.textContent || '';
          text.innerHTML = originalText.split('').map(char => 
            `<span style="display:inline-block;opacity:0">${char === ' ' ? '&nbsp;' : char}</span>`
          ).join('');
        }

        const textTl = createTimeline({ loop: loopEnabled });
        textTl.add({
          targets: container.querySelectorAll('.animated-text span'),
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.3, 1],
          delay: anime.stagger(staggerDelay / 2),
          duration: duration * 0.6,
          easing,
        })
        .add({
          targets: container.querySelector('.animated-subtitle'),
          opacity: [0, 1],
          translateY: [20, 0],
          duration: duration * 0.4,
          easing,
        }, `-=${duration * 0.2}`);

        animationRef.current = {
          instance: textTl,
          play: () => textTl.play(),
          pause: () => textTl.pause(),
          restart: () => textTl.restart(),
          reverse: () => textTl.reverse(),
          seek: (time) => textTl.seek(time),
          isPlaying: () => !textTl.paused,
          getProgress: () => textTl.progress,
        };
        break;

      case 'interactive':
        // Create interactive elements
        container.innerHTML = `
          <div style="padding: 40px; display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
            ${Array.from({ length: 12 }, (_, i) => `
              <div class="interactive-box" style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                cursor: pointer;
                transition: transform 0.2s;
              "></div>
            `).join('')}
          </div>
        `;

        // Add click handlers
        container.querySelectorAll('.interactive-box').forEach(box => {
          box.addEventListener('click', () => {
            anime({
              targets: box,
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              duration,
              easing,
            });
          });

          box.addEventListener('mouseenter', () => {
            anime({
              targets: box,
              scale: 1.1,
              duration: 300,
              easing: 'easeOutQuad',
            });
          });

          box.addEventListener('mouseleave', () => {
            anime({
              targets: box,
              scale: 1,
              duration: 300,
              easing: 'easeOutQuad',
            });
          });
        });

        // Create ambient animation
        animationRef.current = createControlledAnimation({
          targets: container.querySelectorAll('.interactive-box'),
          translateY: [-10, 10],
          delay: anime.stagger(100, { from: 'center' }),
          duration: 2000,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutSine',
          autoplay: true,
        });
        break;
    }
  };

  useEffect(() => {
    createDemo(activeTab);
  }, [activeTab, duration, easing, staggerDelay, loopEnabled]);

  const codeExamples = {
    product: `import { featureCardsStagger } from '@/utils/animeControls';

const animation = featureCardsStagger('.feature-card', {
  duration: ${duration},
  easing: '${easing}',
  stagger: ${staggerDelay},
  loop: ${loopEnabled}
});

animation.play();`,
    data: `import { animatedCounter, createTimeline } from '@/utils/animeControls';

const tl = createTimeline();

// Animate counter
tl.add({
  targets: counterObj,
  value: 12543,
  duration: ${duration},
  easing: '${easing}',
});

// Animate progress bars
tl.add({
  targets: '.progress-bar',
  width: '100%',
  duration: ${duration},
  easing: '${easing}',
});`,
    svg: `import { svgDrawAnimation } from '@/utils/animeControls';

const tl = createTimeline();

tl.add({
  targets: '.svg-path',
  strokeDashoffset: [800, 0],
  duration: ${duration},
  easing: '${easing}',
})
.add({
  targets: '.svg-circle',
  r: [0, 80],
  duration: ${duration * 0.6},
});`,
    text: `import { textRevealAnimation } from '@/utils/animeControls';

const animation = textRevealAnimation('.animated-text', {
  duration: ${duration},
  easing: '${easing}',
  stagger: ${staggerDelay},
});`,
    interactive: `import { createControlledAnimation } from '@/utils/animeControls';

element.addEventListener('click', () => {
  anime({
    targets: element,
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    duration: ${duration},
    easing: '${easing}',
  });
});`,
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>
          <ThunderboltOutlined /> Animation Controls
        </Title>
        <Paragraph>
          Interactive playground for anime.js animations. Experiment with different parameters
          and see the results in real-time.
        </Paragraph>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Product Showcase" key="product" />
          <Tabs.TabPane tab="Data Visualization" key="data" />
          <Tabs.TabPane tab="SVG Animation" key="svg" />
          <Tabs.TabPane tab="Text Effects" key="text" />
          <Tabs.TabPane tab="Interactive" key="interactive" />
        </Tabs>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24} lg={16}>
            <Card 
              title="Animation Preview" 
              style={{ 
                minHeight: 400,
                background: '#f5f5f5',
              }}
            >
              <div ref={demoRef} />
            </Card>
          </Col>

          <Col span={24} lg={8}>
            <Card title="Controls">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Duration (ms)</Text>
                  <Slider
                    min={100}
                    max={3000}
                    step={100}
                    value={duration}
                    onChange={setDuration}
                    marks={{ 100: '100ms', 1000: '1s', 3000: '3s' }}
                  />
                  <Text type="secondary">{duration}ms</Text>
                </div>

                <div>
                  <Text strong>Easing Function</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={easing}
                    onChange={setEasing}
                  >
                    {easingOptions.map(option => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text strong>Stagger Delay (ms)</Text>
                  <Slider
                    min={0}
                    max={500}
                    step={50}
                    value={staggerDelay}
                    onChange={setStaggerDelay}
                    marks={{ 0: '0ms', 250: '250ms', 500: '500ms' }}
                  />
                  <Text type="secondary">{staggerDelay}ms</Text>
                </div>

                <div>
                  <Space>
                    <Text strong>Loop Animation</Text>
                    <Switch checked={loopEnabled} onChange={setLoopEnabled} />
                  </Space>
                </div>

                <div style={{ marginTop: 20 }}>
                  <Space wrap>
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />}
                      onClick={handlePlay}
                      disabled={isPlaying}
                    >
                      Play
                    </Button>
                    <Button 
                      icon={<PauseCircleOutlined />}
                      onClick={handlePause}
                      disabled={!isPlaying}
                    >
                      Pause
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={handleRestart}
                    >
                      Restart
                    </Button>
                    <Button 
                      icon={<SwapOutlined />}
                      onClick={handleReverse}
                    >
                      Reverse
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>

            {showCode && (
              <Card title="Code Example" style={{ marginTop: 16 }}>
                <pre style={{ 
                  background: '#1e1e1e', 
                  color: '#d4d4d4', 
                  padding: 16, 
                  borderRadius: 8,
                  overflow: 'auto',
                  fontSize: 12,
                }}>
                  {codeExamples[activeTab as keyof typeof codeExamples]}
                </pre>
              </Card>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AnimationControls;

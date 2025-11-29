import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Switch, Select, Slider, Space, Typography, Row, Col, message, Tag } from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  StarFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';
import anime from 'animejs';
import {
  buttonPressAnimation,
  buttonHoverEnterAnimation,
  buttonHoverLeaveAnimation,
  buttonSuccessAnimation,
  inputFocusAnimation,
  inputBlurAnimation,
  inputErrorShakeAnimation,
  modelCardSelectAnimation,
  modelCardHoverAnimation,
  modelCardHoverLeaveAnimation,
  formFieldsEntranceAnimation,
  dropdownOpenAnimation,
  tabPanelSwitchAnimation,
  modalOpenAnimation,
  toastEnterAnimation,
} from '../../utils/formControlAnimations';
import {
  useAnimatedButton,
  useAnimatedInput,
  useAnimatedCard,
  useAnimatedList,
} from '../../hooks/useAnimations';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// =============================================================================
// Form Control Animations Demo Component
// =============================================================================

interface FormControlAnimationsDemoProps {
  demoMode?: 'buttons' | 'inputs' | 'cards' | 'lists' | 'all';
  showCode?: boolean;
}

const FormControlAnimationsDemo: React.FC<FormControlAnimationsDemoProps> = ({
  demoMode = 'all',
  showCode = true,
}) => {
  const [activeDemo, setActiveDemo] = useState(demoMode);
  
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>
          <ThunderboltOutlined /> Form Control Animations
        </Title>
        <Paragraph>
          Reusable anime.js animation patterns for form controls, buttons, and transitions.
          Click, hover, and interact with the elements below to see animations in action.
        </Paragraph>
        
        <Space style={{ marginBottom: 24 }}>
          <Button 
            type={activeDemo === 'buttons' ? 'primary' : 'default'}
            onClick={() => setActiveDemo('buttons')}
          >
            Buttons
          </Button>
          <Button 
            type={activeDemo === 'inputs' ? 'primary' : 'default'}
            onClick={() => setActiveDemo('inputs')}
          >
            Inputs
          </Button>
          <Button 
            type={activeDemo === 'cards' ? 'primary' : 'default'}
            onClick={() => setActiveDemo('cards')}
          >
            Cards
          </Button>
          <Button 
            type={activeDemo === 'lists' ? 'primary' : 'default'}
            onClick={() => setActiveDemo('lists')}
          >
            Lists
          </Button>
          <Button 
            type={activeDemo === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveDemo('all')}
          >
            All
          </Button>
        </Space>
        
        {(activeDemo === 'buttons' || activeDemo === 'all') && <ButtonAnimationsDemo showCode={showCode} />}
        {(activeDemo === 'inputs' || activeDemo === 'all') && <InputAnimationsDemo showCode={showCode} />}
        {(activeDemo === 'cards' || activeDemo === 'all') && <CardAnimationsDemo showCode={showCode} />}
        {(activeDemo === 'lists' || activeDemo === 'all') && <ListAnimationsDemo showCode={showCode} />}
      </Card>
    </div>
  );
};

// =============================================================================
// Button Animations Demo
// =============================================================================

const ButtonAnimationsDemo: React.FC<{ showCode?: boolean }> = ({ showCode }) => {
  const primaryBtn = useRef<HTMLButtonElement>(null);
  const successBtn = useRef<HTMLButtonElement>(null);
  const downloadBtn = useRef<HTMLButtonElement>(null);
  const [downloading, setDownloading] = useState(false);
  
  const handlePrimaryHover = (isEntering: boolean) => {
    if (primaryBtn.current) {
      if (isEntering) {
        buttonHoverEnterAnimation(primaryBtn.current);
      } else {
        buttonHoverLeaveAnimation(primaryBtn.current);
      }
    }
  };
  
  const handlePrimaryClick = () => {
    if (primaryBtn.current) {
      buttonPressAnimation(primaryBtn.current);
    }
  };
  
  const handleSuccessClick = () => {
    if (successBtn.current) {
      buttonSuccessAnimation(successBtn.current);
      message.success('Action completed!');
    }
  };
  
  const handleDownloadClick = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      if (downloadBtn.current) {
        buttonSuccessAnimation(downloadBtn.current);
      }
      message.success('Download complete!');
    }, 2000);
  };
  
  // Using the hook
  const animatedBtn = useAnimatedButton();
  
  return (
    <Card title="Button Animations" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={4}>Manual Animation Control</Title>
          <Space size="large">
            <Button
              ref={primaryBtn}
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onMouseEnter={() => handlePrimaryHover(true)}
              onMouseLeave={() => handlePrimaryHover(false)}
              onClick={handlePrimaryClick}
              style={{ transition: 'none' }}
            >
              Hover & Click Me
            </Button>
            
            <Button
              ref={successBtn}
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleSuccessClick}
              style={{ transition: 'none' }}
            >
              Success Animation
            </Button>
            
            <Button
              ref={downloadBtn}
              type="default"
              size="large"
              icon={<DownloadOutlined spin={downloading} />}
              onClick={handleDownloadClick}
              loading={downloading}
              style={{ transition: 'none' }}
            >
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
          </Space>
        </Col>
        
        <Col span={24}>
          <Title level={4}>Using useAnimatedButton Hook</Title>
          <Button
            ref={animatedBtn.ref}
            type="primary"
            size="large"
            {...animatedBtn.handlers}
            style={{ transition: 'none' }}
          >
            Hook-based Animation
          </Button>
        </Col>
      </Row>
      
      {showCode && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Code Example</Title>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 16, 
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
          }}>
{`import { useAnimatedButton } from '@/hooks/useAnimations';

// Using the hook
const { ref, handlers } = useAnimatedButton({
  enableHover: true,
  enablePress: true,
});

return (
  <Button ref={ref} {...handlers}>
    Animated Button
  </Button>
);

// Manual control
import { buttonHoverEnterAnimation } from '@/utils/formControlAnimations';

buttonHoverEnterAnimation(buttonRef.current);`}
          </pre>
        </div>
      )}
    </Card>
  );
};

// =============================================================================
// Input Animations Demo
// =============================================================================

const InputAnimationsDemo: React.FC<{ showCode?: boolean }> = ({ showCode }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  
  // Using the hook
  const animatedInput = useAnimatedInput();
  
  const handleFocus = () => {
    if (inputRef.current) {
      inputFocusAnimation(inputRef.current);
    }
  };
  
  const handleBlur = () => {
    if (inputRef.current) {
      inputBlurAnimation(inputRef.current);
    }
  };
  
  const handleValidate = () => {
    if (!value.trim()) {
      setError(true);
      if (inputRef.current) {
        inputErrorShakeAnimation(inputRef.current);
      }
      setTimeout(() => setError(false), 2000);
    } else {
      message.success('Valid input!');
    }
  };
  
  return (
    <Card title="Input Animations" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Title level={4}>Manual Animation Control</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              ref={inputRef as any}
              placeholder="Focus me to see animation"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              status={error ? 'error' : undefined}
              style={{ transition: 'none' }}
            />
            <Button onClick={handleValidate}>Validate (shake on error)</Button>
          </Space>
        </Col>
        
        <Col span={12}>
          <Title level={4}>Using useAnimatedInput Hook</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              ref={animatedInput.ref as any}
              placeholder="Focus me (hook-based)"
              {...animatedInput.handlers}
              style={{ transition: 'none' }}
            />
            <Button onClick={animatedInput.triggerError}>Trigger Error Shake</Button>
          </Space>
        </Col>
      </Row>
      
      {showCode && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Code Example</Title>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 16, 
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
          }}>
{`import { useAnimatedInput } from '@/hooks/useAnimations';

const { ref, handlers, triggerError } = useAnimatedInput();

return (
  <>
    <Input ref={ref} {...handlers} />
    <Button onClick={triggerError}>Validate</Button>
  </>
);`}
          </pre>
        </div>
      )}
    </Card>
  );
};

// =============================================================================
// Card Animations Demo (Model Selector Style)
// =============================================================================

const CardAnimationsDemo: React.FC<{ showCode?: boolean }> = ({ showCode }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  const models = [
    { id: 'llama2:7b', name: 'Llama 2 7B', size: '3.8GB', icon: '🦙', recommended: true },
    { id: 'mistral:7b', name: 'Mistral 7B', size: '4.1GB', icon: '🌪️', recommended: true },
    { id: 'phi:2.7b', name: 'Phi-2', size: '1.6GB', icon: '⚡', recommended: false },
    { id: 'deepseek:6.7b', name: 'DeepSeek Coder', size: '3.8GB', icon: '💻', recommended: true },
  ];
  
  const AnimatedModelCard = ({ model }: { model: typeof models[0] }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isSelected = selectedCard === model.id;
    
    const handleMouseEnter = () => {
      if (cardRef.current && !isSelected) {
        modelCardHoverAnimation(cardRef.current);
      }
    };
    
    const handleMouseLeave = () => {
      if (cardRef.current && !isSelected) {
        modelCardHoverLeaveAnimation(cardRef.current);
      }
    };
    
    const handleClick = () => {
      if (cardRef.current) {
        modelCardSelectAnimation(cardRef.current);
        setSelectedCard(model.id);
        message.success(`Selected: ${model.name}`);
      }
    };
    
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          padding: 16,
          border: isSelected ? '2px solid #667eea' : '1px solid #e0e0e0',
          borderRadius: 12,
          cursor: 'pointer',
          background: isSelected ? 'rgba(102, 126, 234, 0.05)' : 'white',
          marginBottom: 12,
          transition: 'none',
        }}
      >
        <Space align="start">
          <div style={{ fontSize: 36 }}>{model.icon}</div>
          <div>
            <Space>
              <Title level={5} style={{ margin: 0 }}>{model.name}</Title>
              {model.recommended && <Tag color="gold"><StarFilled /> Recommended</Tag>}
              {isSelected && <Tag color="success"><CheckCircleOutlined /> Selected</Tag>}
            </Space>
            <div><Text type="secondary">{model.size}</Text></div>
          </div>
        </Space>
      </div>
    );
  };
  
  // Using the hook
  const animatedCard = useAnimatedCard();
  
  return (
    <Card title="Card Animations (Model Selector Style)" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Title level={4}>Model Cards with Animation</Title>
          {models.map(model => (
            <AnimatedModelCard key={model.id} model={model} />
          ))}
        </Col>
        
        <Col span={12}>
          <Title level={4}>Using useAnimatedCard Hook</Title>
          <div
            ref={animatedCard.ref}
            {...animatedCard.handlers}
            onClick={animatedCard.triggerSelect}
            style={{
              padding: 24,
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'white',
              transition: 'none',
            }}
          >
            <Space>
              <div style={{ fontSize: 36 }}>🎯</div>
              <div>
                <Title level={5} style={{ margin: 0 }}>Hook-based Card</Title>
                <Text type="secondary">Click to trigger select animation</Text>
              </div>
            </Space>
          </div>
        </Col>
      </Row>
      
      {showCode && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Code Example</Title>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 16, 
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
          }}>
{`import { useAnimatedCard } from '@/hooks/useAnimations';

const { ref, handlers, triggerSelect } = useAnimatedCard();

return (
  <div 
    ref={ref} 
    {...handlers}
    onClick={triggerSelect}
  >
    Card Content
  </div>
);`}
          </pre>
        </div>
      )}
    </Card>
  );
};

// =============================================================================
// List Animations Demo
// =============================================================================

const ListAnimationsDemo: React.FC<{ showCode?: boolean }> = ({ showCode }) => {
  const [items, setItems] = useState([
    { id: 1, title: 'Item 1', desc: 'First list item' },
    { id: 2, title: 'Item 2', desc: 'Second list item' },
    { id: 3, title: 'Item 3', desc: 'Third list item' },
  ]);
  const [key, setKey] = useState(0);
  
  const { containerRef, triggerEntrance } = useAnimatedList({
    stagger: 100,
    animateOnMount: false,
  });
  
  const handleReplay = () => {
    // Reset opacity to 0 first
    const container = containerRef.current;
    if (container) {
      const items = container.querySelectorAll('.list-item');
      items.forEach((item) => {
        (item as HTMLElement).style.opacity = '0';
        (item as HTMLElement).style.transform = 'translateY(20px)';
      });
    }
    
    // Then trigger entrance
    setTimeout(() => {
      triggerEntrance('.list-item');
    }, 50);
  };
  
  const handleAddItem = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, title: `Item ${newId}`, desc: `New list item ${newId}` }]);
    setKey(k => k + 1);
  };
  
  useEffect(() => {
    triggerEntrance('.list-item');
  }, [key]);
  
  return (
    <Card title="List Animations" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={handleReplay}>
              <PlayCircleOutlined /> Replay Animation
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </Space>
          
          <div ref={containerRef}>
            {items.map((item) => (
              <div
                key={item.id}
                className="list-item"
                style={{
                  padding: 16,
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  marginBottom: 8,
                  background: 'white',
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
              >
                <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                <Text type="secondary">{item.desc}</Text>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      
      {showCode && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Code Example</Title>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: 16, 
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
          }}>
{`import { useAnimatedList } from '@/hooks/useAnimations';

const { containerRef, triggerEntrance } = useAnimatedList({
  stagger: 100,
  animateOnMount: true,
});

return (
  <div ref={containerRef}>
    {items.map(item => (
      <div key={item.id} className="list-item">
        {item.title}
      </div>
    ))}
  </div>
);`}
          </pre>
        </div>
      )}
    </Card>
  );
};

// =============================================================================
// Storybook Meta & Stories
// =============================================================================

const meta: Meta<typeof FormControlAnimationsDemo> = {
  title: 'Design System/Form Control Animations',
  component: FormControlAnimationsDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Form Control Animations

Reusable anime.js animation patterns for form controls, buttons, and transitions.
Inspired by animejs.com interactive controls.

## Features

- **Button Animations** - Press, hover, loading, and success states
- **Input Animations** - Focus, blur, and error shake effects
- **Card Animations** - Hover, select for model cards and selections
- **List Animations** - Staggered entrance animations
- **React Hooks** - Easy integration with useAnimatedButton, useAnimatedInput, etc.

## Animation Utilities

\`\`\`tsx
import { buttonPressAnimation, inputFocusAnimation } from '@/utils/formControlAnimations';

// Use directly
buttonPressAnimation(buttonRef.current);
\`\`\`

## React Hooks

\`\`\`tsx
import { useAnimatedButton, useAnimatedInput, useAnimatedCard } from '@/hooks/useAnimations';

// Button hook
const { ref, handlers } = useAnimatedButton();

// Input hook
const { ref, handlers, triggerError } = useAnimatedInput();

// Card hook
const { ref, handlers, triggerSelect } = useAnimatedCard();
\`\`\`

## Accessibility

All animations respect the user's \`prefers-reduced-motion\` setting.
Use the \`useReducedMotion\` hook to conditionally disable animations.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    demoMode: {
      control: 'select',
      options: ['buttons', 'inputs', 'cards', 'lists', 'all'],
      description: 'Select which animation demos to display',
    },
    showCode: {
      control: 'boolean',
      description: 'Show code examples for each animation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormControlAnimationsDemo>;

export const AllAnimations: Story = {
  args: {
    demoMode: 'all',
    showCode: true,
  },
};

export const ButtonAnimations: Story = {
  args: {
    demoMode: 'buttons',
    showCode: true,
  },
};

export const InputAnimations: Story = {
  args: {
    demoMode: 'inputs',
    showCode: true,
  },
};

export const CardAnimations: Story = {
  args: {
    demoMode: 'cards',
    showCode: true,
  },
};

export const ListAnimations: Story = {
  args: {
    demoMode: 'lists',
    showCode: true,
  },
};

export const WithoutCode: Story = {
  args: {
    demoMode: 'all',
    showCode: false,
  },
};

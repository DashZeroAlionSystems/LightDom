import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Typography } from '../../atoms/Typography';

const tabsListStyles = cva('flex border-b border-border', {
  variants: {
    variant: {
      default: 'bg-background',
      pills: 'bg-muted rounded-lg p-1 border-none',
      underline: 'bg-transparent border-b-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const tabStyles = cva(
  'relative px-4 py-2 text-sm font-medium transition-all cursor-pointer whitespace-nowrap',
  {
    variants: {
      variant: {
        default: '',
        pills: 'rounded-md',
        underline: '',
      },
      active: {
        true: '',
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        active: true,
        class: 'text-primary border-b-2 border-primary',
      },
      {
        variant: 'pills',
        active: true,
        class: 'bg-background text-foreground shadow-sm',
      },
      {
        variant: 'underline',
        active: true,
        class: 'text-primary border-b-2 border-primary',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  }
);

export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends VariantProps<typeof tabsListStyles> {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  value: controlledValue,
  onChange,
  variant,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(controlledValue || defaultValue || tabs[0]?.value);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const currentValue = controlledValue !== undefined ? controlledValue : activeTab;

  useEffect(() => {
    const activeTabElement = tabRefs.current[currentValue];
    if (activeTabElement && variant !== 'pills') {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft,
      });
    }
  }, [currentValue, variant]);

  const handleTabClick = (tabValue: string, disabled?: boolean) => {
    if (disabled) return;
    
    if (controlledValue === undefined) {
      setActiveTab(tabValue);
    }
    onChange?.(tabValue);
  };

  const activeTabContent = tabs.find((tab) => tab.value === currentValue)?.content;

  return (
    <div className={className}>
      {/* Tabs List */}
      <div className={tabsListStyles({ variant })}>
        {tabs.map((tab) => (
          <div
            key={tab.value}
            ref={(el) => (tabRefs.current[tab.value] = el)}
            className={tabStyles({
              variant,
              active: currentValue === tab.value,
            })}
            onClick={() => handleTabClick(tab.value, tab.disabled)}
            style={{ opacity: tab.disabled ? 0.5 : 1, cursor: tab.disabled ? 'not-allowed' : 'pointer' }}
          >
            {tab.icon && <span className="mr-2 inline-block">{tab.icon}</span>}
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{activeTabContent}</div>
    </div>
  );
};

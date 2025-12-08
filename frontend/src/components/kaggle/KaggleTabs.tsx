import { cn } from '@/lib/utils';
import React from 'react';

export interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface KaggleTabsProps {
  tabs: Tab[];
  defaultActive?: string;
  className?: string;
  onChange?: (key: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * KaggleTabs - Material Design tabs component
 *
 * Extracted from Kaggle's navigation patterns. Supports multiple variants,
 * icons, badges, and keyboard navigation.
 *
 * @example
 * ```tsx
 * <KaggleTabs
 *   tabs={[
 *     { key: 'overview', label: 'Overview', content: <Overview /> },
 *     { key: 'data', label: 'Data', content: <Data />, badge: 5 },
 *     { key: 'code', label: 'Code', content: <Code />, icon: <CodeIcon /> },
 *   ]}
 *   variant="line"
 *   onChange={(key) => console.log('Active tab:', key)}
 * />
 * ```
 */
export const KaggleTabs: React.FC<KaggleTabsProps> = ({
  tabs,
  defaultActive,
  className,
  onChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultActive || tabs[0]?.key);

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(key);
    onChange?.(key);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string, disabled?: boolean) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(key, disabled);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.key === activeTab);
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (!nextTab.disabled) {
        handleTabClick(nextTab.key, false);
      }
    }
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const getTabStyles = (tab: Tab) => {
    const isActive = activeTab === tab.key;

    if (variant === 'line') {
      return cn('font-medium border-b-2 transition-all', sizeStyles[size], {
        'border-blue-600 text-blue-600': isActive,
        'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300':
          !isActive && !tab.disabled,
        'opacity-50 cursor-not-allowed': tab.disabled,
        'cursor-pointer': !tab.disabled,
      });
    }

    if (variant === 'pills') {
      return cn('font-medium rounded-lg transition-all', sizeStyles[size], {
        'bg-blue-600 text-white': isActive,
        'text-gray-600 hover:bg-gray-100': !isActive && !tab.disabled,
        'opacity-50 cursor-not-allowed': tab.disabled,
        'cursor-pointer': !tab.disabled,
      });
    }

    if (variant === 'enclosed') {
      return cn('font-medium border rounded-t-lg transition-all', sizeStyles[size], {
        'border-gray-200 border-b-white bg-white text-gray-900 -mb-px': isActive,
        'border-transparent text-gray-600 hover:text-gray-900': !isActive && !tab.disabled,
        'opacity-50 cursor-not-allowed': tab.disabled,
        'cursor-pointer': !tab.disabled,
      });
    }

    return '';
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn({
          'border-b border-gray-200': variant === 'line' || variant === 'enclosed',
        })}
      >
        <nav
          className={cn('flex', {
            'gap-1': variant === 'pills',
            'gap-4': variant === 'line',
            'gap-0': variant === 'enclosed',
          })}
          role='tablist'
          aria-orientation='horizontal'
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              type='button'
              role='tab'
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.key, tab.disabled)}
              onKeyDown={e => handleKeyDown(e, tab.key, tab.disabled)}
              className={cn('inline-flex items-center gap-2 whitespace-nowrap', getTabStyles(tab), {
                'flex-1 justify-center': fullWidth,
              })}
            >
              {tab.icon && <span className='inline-flex'>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold rounded-full',
                    {
                      'bg-white text-blue-600': activeTab === tab.key && variant === 'pills',
                      'bg-blue-100 text-blue-800': activeTab !== tab.key || variant !== 'pills',
                    }
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className='mt-4'>
        {tabs.map(tab => (
          <div
            key={tab.key}
            id={`panel-${tab.key}`}
            role='tabpanel'
            aria-labelledby={`tab-${tab.key}`}
            hidden={activeTab !== tab.key}
            className={cn({ 'animate-fadeIn': activeTab === tab.key })}
          >
            {activeTab === tab.key && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaggleTabs;

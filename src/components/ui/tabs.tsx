import React, {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';

interface TabsContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> root.');
  }
  return context;
};

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsRoot = ({
  value,
  onValueChange,
  className = '',
  children,
  ...props
}: TabsProps): JSX.Element => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

const TabsListRoot = ({ className = '', children, ...props }: TabsListProps): JSX.Element => {
  return (
    <div role='tablist' className={`flex gap-2 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

const TabsTriggerRoot = ({
  value,
  className = '',
  children,
  onClick,
  ...props
}: TabsTriggerProps): JSX.Element => {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    onValueChange?.(value);
  };

  return (
    <button
      type='button'
      role='tab'
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={`px-3 py-2 rounded-full border transition-colors ${
        isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-outline/20 text-on-surface-variant hover:border-outline/40'
      } ${className}`.trim()}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'hidden'> {
  value: string;
  keepMounted?: boolean;
}

const TabsContentRoot = ({
  value,
  keepMounted = false,
  className = '',
  children,
  ...props
}: TabsContentProps): JSX.Element | null => {
  const { value: activeValue } = useTabsContext();
  const isActive = activeValue === value;

  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <div
      role='tabpanel'
      data-state={isActive ? 'active' : 'inactive'}
      hidden={!isActive && !keepMounted}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export { TabsRoot as Tabs, TabsListRoot as TabsList, TabsTriggerRoot as TabsTrigger, TabsContentRoot as TabsContent };

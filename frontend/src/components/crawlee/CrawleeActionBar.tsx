import { Button, Card, CardContent } from '@/components/ui';
import type {
  CrawleeActionConfig,
  CrawleeActionTone,
  LucideIconName,
} from '@/config/crawleeUiConfig';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import React from 'react';

const toneClasses: Record<CrawleeActionTone | 'primary', string> = {
  primary: 'bg-primary/10 text-primary hover:bg-primary/15',
  success: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

type ActionCallback = (action: CrawleeActionConfig) => void;

const resolveIcon = (iconName: LucideIconName) => {
  const IconComponent = (LucideIcons as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>)[
    iconName
  ];
  return IconComponent ?? LucideIcons.Circle;
};

interface CrawleeActionBarProps {
  actions: CrawleeActionConfig[];
  onActionSelect?: ActionCallback;
}

export const CrawleeActionBar: React.FC<CrawleeActionBarProps> = ({ actions, onActionSelect }) => {
  return (
    <Card className='border border-outline/20 bg-surface-container-high'>
      <CardContent className='flex flex-wrap gap-3 p-4'>
        {actions.map(action => {
          const Icon = resolveIcon(action.icon);
          const tone = action.tone ?? 'primary';
          return (
            <Button
              key={action.id}
              variant='text'
              className={cn(
                'group flex-1 min-w-[220px] items-start justify-start gap-3 rounded-2xl border border-outline/20 bg-surface px-4 py-3 text-left text-on-surface shadow-none transition-colors',
                toneClasses[tone]
              )}
              onClick={() => onActionSelect?.(action)}
            >
              <span className='mt-1 rounded-xl bg-background/60 p-2 shadow-inner'>
                <Icon className='h-5 w-5' />
              </span>
              <span className='flex-1 min-w-0'>
                <span className='block text-sm font-semibold text-on-surface'>{action.label}</span>
                <span className='block text-xs leading-relaxed text-on-surface-variant'>
                  {action.description}
                </span>
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

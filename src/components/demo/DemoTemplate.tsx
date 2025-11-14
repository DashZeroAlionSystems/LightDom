/**
 * Reusable Demo Component Template
 * 
 * This template demonstrates how to create demo components using the LightDom design system.
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui';
import { 
  Play, 
  Pause, 
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';

export interface DemoTemplateProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showControls?: boolean;
  showStatus?: boolean;
  initialState?: 'idle' | 'running' | 'paused' | 'completed';
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export const DemoTemplate: React.FC<DemoTemplateProps> = ({
  title,
  description,
  children,
  showControls = true,
  showStatus = true,
  initialState = 'idle',
  onStart,
  onPause,
  onReset,
}) => {
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>(initialState);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === 'running' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state, startTime]);

  const handleStart = () => {
    setState('running');
    setStartTime(Date.now());
    onStart?.();
  };

  const handlePause = () => {
    setState('paused');
    onPause?.();
  };

  const handleReset = () => {
    setState('idle');
    setStartTime(null);
    setElapsedTime(0);
    onReset?.();
  };

  const getStatusBadge = () => {
    const statusConfig = {
      idle: { variant: 'default' as const, label: 'Ready', icon: Info },
      running: { variant: 'success' as const, label: 'Running', icon: Play },
      paused: { variant: 'warning' as const, label: 'Paused', icon: Pause },
      completed: { variant: 'success' as const, label: 'Completed', icon: CheckCircle },
    };

    const config = statusConfig[state];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {showStatus && getStatusBadge()}
          </div>
        </CardHeader>
        
        {showControls && (
          <CardFooter>
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                {state === 'idle' || state === 'paused' ? (
                  <Button
                    variant="filled"
                    leftIcon={Play}
                    onClick={handleStart}
                  >
                    {state === 'paused' ? 'Resume' : 'Start Demo'}
                  </Button>
                ) : (
                  <Button
                    variant="filled-tonal"
                    leftIcon={Pause}
                    onClick={handlePause}
                  >
                    Pause
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  leftIcon={RefreshCw}
                  onClick={handleReset}
                  disabled={state === 'idle'}
                >
                  Reset
                </Button>
              </div>
              
              {state !== 'idle' && (
                <div className="flex-1 flex items-center justify-end gap-4 text-sm text-on-surface-variant">
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

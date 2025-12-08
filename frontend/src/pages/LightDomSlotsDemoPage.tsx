import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Activity,
  Boxes,
  Layers,
  MonitorPlay,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';

type SlotPriority = 'high' | 'medium' | 'low';
type SlotOptimizationLevel = 'aggressive' | 'moderate' | 'conservative';
type SlotStatus = 'idle' | 'optimizing' | 'optimized';

type SlotRecord = {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'lazy';
  optimizationLevel: SlotOptimizationLevel;
  priority: SlotPriority;
  status: SlotStatus;
  optimizationsApplied: number;
  lastSpaceSavedKb: number;
};

type LogSeverity = 'info' | 'success' | 'warning';

type LogEntry = {
  id: string;
  message: string;
  severity: LogSeverity;
  timestamp: string;
};

const INITIAL_SLOTS: SlotRecord[] = [
  {
    id: 'demo-header',
    name: 'Header slot',
    type: 'static',
    optimizationLevel: 'moderate',
    priority: 'high',
    status: 'idle',
    optimizationsApplied: 2,
    lastSpaceSavedKb: 620,
  },
  {
    id: 'demo-content',
    name: 'Content slot',
    type: 'dynamic',
    optimizationLevel: 'aggressive',
    priority: 'high',
    status: 'idle',
    optimizationsApplied: 5,
    lastSpaceSavedKb: 1140,
  },
  {
    id: 'demo-widget-1',
    name: 'Widget slot #1',
    type: 'lazy',
    optimizationLevel: 'conservative',
    priority: 'medium',
    status: 'idle',
    optimizationsApplied: 1,
    lastSpaceSavedKb: 210,
  },
  {
    id: 'demo-widget-2',
    name: 'Widget slot #2',
    type: 'lazy',
    optimizationLevel: 'moderate',
    priority: 'low',
    status: 'idle',
    optimizationsApplied: 0,
    lastSpaceSavedKb: 0,
  },
];

const severityVariant: Record<LogSeverity, 'outline' | 'success' | 'warning'> = {
  info: 'outline',
  success: 'success',
  warning: 'warning',
};

const priorityVariant: Record<SlotPriority, 'primary' | 'secondary' | 'outline'> = {
  high: 'primary',
  medium: 'secondary',
  low: 'outline',
};

const optimizationVariant: Record<SlotOptimizationLevel, 'primary' | 'warning' | 'secondary'> = {
  aggressive: 'primary',
  moderate: 'secondary',
  conservative: 'warning',
};

const initialLogs: LogEntry[] = [
  {
    id: 'log-boot',
    severity: 'info',
    message: '🚀 LightDom slot system initialised — monitoring ready',
    timestamp: new Date(Date.now() - 18_000).toISOString(),
  },
  {
    id: 'log-ready',
    severity: 'success',
    message: '✅ Registered 4 watcher-driven slots for optimisation',
    timestamp: new Date(Date.now() - 12_000).toISOString(),
  },
  {
    id: 'log-await',
    severity: 'info',
    message: 'ℹ️ Awaiting optimisation triggers…',
    timestamp: new Date(Date.now() - 6_000).toISOString(),
  },
];

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const LightDomSlotsDemoPage: React.FC = () => {
  const [slots, setSlots] = useState<SlotRecord[]>(INITIAL_SLOTS);
  const [activeSlots, setActiveSlots] = useState(() => INITIAL_SLOTS.length);
  const [spaceSavedKb, setSpaceSavedKb] = useState(() => INITIAL_SLOTS.reduce((total, slot) => total + slot.lastSpaceSavedKb, 0));
  const [optimisationCount, setOptimisationCount] = useState(() =>
    INITIAL_SLOTS.reduce((total, slot) => total + slot.optimizationsApplied, 0),
  );
  const [performanceGain, setPerformanceGain] = useState(14);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [monitoring, setMonitoring] = useState(false);
  const monitoringRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (severity: LogSeverity, message: string) => {
    setLogs((prev) => [
      ...prev.slice(-99),
      { id: `log-${Date.now()}`, severity, message, timestamp: new Date().toISOString() },
    ]);
  };

  const updateSlot = (slotId: string, updater: (slot: SlotRecord) => SlotRecord) => {
    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? updater(slot) : slot)));
  };

  const optimiseSlot = (slotId: string, skipLog = false) => {
    const slot = slots.find((item) => item.id === slotId);
    if (!slot) return;

    updateSlot(slotId, (current) => ({ ...current, status: 'optimizing' }));
    if (!skipLog) {
      addLog('warning', `⚡ Optimising slot: ${slot.name} (${slot.optimizationLevel})`);
    }

    const optimisationWindowMs = Math.random() * 700 + 400;
    window.setTimeout(() => {
      const saved = Math.floor(Math.random() * 420) + 120;
      updateSlot(slotId, (current) => ({
        ...current,
        status: 'optimized',
        optimizationsApplied: current.optimizationsApplied + 1,
        lastSpaceSavedKb: saved,
      }));
      setSpaceSavedKb((value) => value + saved);
      setOptimisationCount((value) => value + 1);
      setPerformanceGain((value) => Math.min(100, value + Math.random() * 3));
      addLog('success', `✅ Slot ${slot.name} saved ${saved}KB`);
    }, optimisationWindowMs);
  };

  const optimiseAll = () => {
    slots.forEach((slot, index) => {
      window.setTimeout(() => optimiseSlot(slot.id, true), index * 150);
    });
    addLog('warning', '⚡ Batch optimisation triggered across all slots');
  };

  const startMonitoring = () => {
    if (monitoringRef.current) return;
    setMonitoring(true);
    addLog('info', '▶️ Watcher monitoring started — observing slot drift');
    monitoringRef.current = setInterval(() => {
      setSlots((currentSlots) => {
        const candidate = currentSlots[Math.floor(Math.random() * currentSlots.length)];
        if (!candidate) return currentSlots;
        optimiseSlot(candidate.id, true);
        return currentSlots;
      });
    }, 6500);
  };

  const stopMonitoring = () => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
    setMonitoring(false);
    addLog('info', '⏹️ Monitoring paused — awaiting manual triggers');
  };

  const toggleMonitoring = () => {
    if (monitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const resetDemo = () => {
    stopMonitoring();
    setSlots(INITIAL_SLOTS);
    setActiveSlots(INITIAL_SLOTS.length);
    setSpaceSavedKb(INITIAL_SLOTS.reduce((total, slot) => total + slot.lastSpaceSavedKb, 0));
    setOptimisationCount(INITIAL_SLOTS.reduce((total, slot) => total + slot.optimizationsApplied, 0));
    setPerformanceGain(14);
    addLog('info', '🔄 Demo reset to initial state');
  };

  const addDynamicContent = () => {
    const newId = `dynamic-slot-${Date.now()}`;
    const newSlot: SlotRecord = {
      id: newId,
      name: `Dynamic widget ${slots.length + 1}`,
      type: 'dynamic',
      optimizationLevel: 'moderate',
      priority: 'medium',
      status: 'idle',
      optimizationsApplied: 0,
      lastSpaceSavedKb: 0,
    };
    setSlots((prev) => [...prev, newSlot]);
    setActiveSlots((value) => value + 1);
    addLog('success', `➕ Added dynamic content slot: ${newSlot.name}`);
  };

  useEffect(() => () => stopMonitoring(), []);

  const metrics = useMemo(
    () => [
      {
        label: 'Active slots',
        value: activeSlots,
        icon: <Boxes className='h-5 w-5 text-primary' />,
        description: 'Watcher-registered LightDom nodes',
      },
      {
        label: 'Space saved',
        value: `${spaceSavedKb.toLocaleString()} KB`,
        icon: <Layers className='h-5 w-5 text-secondary' />,
        description: 'Aggregation of latest optimisations',
      },
      {
        label: 'Optimisations',
        value: optimisationCount,
        icon: <Activity className='h-5 w-5 text-success' />,
        description: 'Total optimisation events recorded',
      },
      {
        label: 'Performance gain',
        value: `${performanceGain.toFixed(1)}%`,
        icon: <MonitorPlay className='h-5 w-5 text-warning' />,
        description: 'Estimated paint/render improvement',
      },
    ],
    [activeSlots, optimisationCount, performanceGain, spaceSavedKb],
  );

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/10 bg-surface-container-high p-6 shadow-level-1'>
        <div className='flex flex-wrap items-start justify-between gap-6'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              <Zap className='h-4 w-4' />
              LightDom slot optimisation
            </div>
            <div>
              <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Slot orchestration demo</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Explore how LightDom slots register with watcher services, optimise payloads, and publish activity logs. Buttons below simulate optimisation batches, dynamic content, and monitoring toggles.
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-3'>
            <div className='flex gap-2'>
              <Badge variant={monitoring ? 'success' : 'outline'}>{monitoring ? 'Monitoring active' : 'Monitoring paused'}</Badge>
              <Badge variant='secondary'>Slots: {slots.length}</Badge>
            </div>
            <div className='flex gap-2'>
              <Button leftIcon={<Zap className='h-4 w-4' />} onClick={optimiseAll}>
                Optimise all slots
              </Button>
              <Button
                variant='filled'
                leftIcon={<Zap className='h-4 w-4' />}
                onClick={toggleMonitoring}
              >
                {monitoring ? 'Pause monitoring' : 'Start monitoring'}
              </Button>
            </div>
            <div className='flex gap-2'>
              <Button variant='text' leftIcon={<RefreshCw className='h-4 w-4' />} onClick={resetDemo}>
                Reset demo
              </Button>
              <Button variant='text' leftIcon={<Plus className='h-4 w-4' />} onClick={addDynamicContent}>
                Add dynamic content
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric) => (
          <Card key={metric.label} className='border-outline/15 bg-surface'>
            <CardHeader className='flex items-center justify-between gap-3'>
              <CardTitle className='text-on-surface'>{metric.label}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-semibold text-on-surface'>{metric.value}</p>
              <p className='mt-1 text-sm text-on-surface-variant/80'>{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Registered slots</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {slots.map((slot) => (
              <Card key={slot.id} className='border-outline/15 bg-surface-container-low'>
                <CardHeader className='space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <CardTitle className='text-on-surface'>{slot.name}</CardTitle>
                    <Badge variant={priorityVariant[slot.priority]}>Priority · {slot.priority}</Badge>
                  </div>
                  <div className='flex flex-wrap gap-2 text-xs text-on-surface-variant/70'>
                    <span className='rounded-full bg-outline/20 px-2 py-1'>Type · {slot.type}</span>
                    <Badge variant={optimizationVariant[slot.optimizationLevel]}>
                      {slot.optimizationLevel} optimisation
                    </Badge>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 font-medium',
                        slot.status === 'optimizing' && 'bg-warning/20 text-warning',
                        slot.status === 'optimized' && 'bg-success/20 text-success',
                        slot.status === 'idle' && 'bg-outline/20 text-on-surface-variant/80',
                      )}
                    >
                      {slot.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='text-sm text-on-surface-variant'>
                    <p>Optimisations: {slot.optimizationsApplied}</p>
                    <p>Last space saved: {slot.lastSpaceSavedKb} KB</p>
                  </div>
                  <Button variant='outlined' size='sm' onClick={() => optimiseSlot(slot.id)}>
                    Optimise slot
                  </Button>
                </CardContent>
              </Card>
            ))}
            {slots.length === 0 && <p className='text-sm text-on-surface-variant/80'>No slots registered.</p>}
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.4fr,0.6fr]'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Optimisation log</CardTitle>
          </CardHeader>
          <CardContent className='max-h-[320px] space-y-2 overflow-y-auto pr-2'>
            {logs
              .slice()
              .reverse()
              .map((entry) => (
                <div key={entry.id} className='rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3'>
                  <div className='flex items-center justify-between gap-3 text-xs text-on-surface-variant/70'>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    <Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge>
                  </div>
                  <p className='mt-2 text-sm leading-relaxed text-on-surface'>{entry.message}</p>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Slot health summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-on-surface-variant'>
            <p>• High-priority slots optimise every ~6.5 seconds while monitoring is active.</p>
            <p>• Space savings represent lightweight payload reductions per render cycle.</p>
            <p>• Use “Add dynamic content” to register new slots and trigger watcher logs.</p>
            <p>• Replace these mocked handlers with Template Watcher API integration when available.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LightDomSlotsDemoPage;

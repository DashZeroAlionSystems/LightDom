import React, { useEffect, useState } from 'react';
import {
  Activity,
  Database,
  Globe,
  Wallet,
  Zap,
  Shield,
  Target,
  FileText,
  Settings,
  Bell,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import axios from 'axios';
import {
  KpiGrid,
  KpiCard,
  WorkflowPanel,
  WorkflowPanelSection,
  AsyncStateLoading,
  AsyncStateError,
  AsyncStateEmpty,
  Fab,
} from '@/components/ui';

const API_BASE = 'http://localhost:3001/api';

interface ClientStats {
  optimizationsSubmitted: number;
  tokensEarned: number;
  storageUsed: number;
  activeProjects: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'pending' | 'failed';
  }>;
}

interface WalletInfo {
  LDC: number;
  USD: number;
  BTC: number;
  ETH: number;
}

export const ClientDashboardPage: React.FC = () => {
  const [clientStats, setClientStats] = useState<ClientStats>({
    optimizationsSubmitted: 0,
    tokensEarned: 0,
    storageUsed: 0,
    activeProjects: 0,
    recentActivity: []
  });

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    LDC: 0,
    USD: 0,
    BTC: 0,
    ETH: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchClientData();
    const interval = setInterval(fetchClientData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchClientData = async () => {
    try {
      const [optimizations, wallet, storage] = await Promise.all([
        axios.get(`${API_BASE}/optimization/list?limit=10`),
        axios.get(`${API_BASE}/wallet/balance`),
        axios.get(`${API_BASE}/storage/stats`)
      ]);

      // Update client stats
      setClientStats({
        optimizationsSubmitted: optimizations.data.total || 0,
        tokensEarned: Math.floor((optimizations.data.total || 0) * 10),
        storageUsed: storage.data?.data?.usedSpace || 0,
        activeProjects: 3, // Mock data
        recentActivity: optimizations.data.data?.slice(0, 5).map((opt: any, idx: number) => ({
          id: opt.proof_hash || `activity-${idx}`,
          type: 'optimization',
          description: `Optimized ${opt.url || 'website'}`,
          timestamp: opt.created_at || new Date().toISOString(),
          status: 'success' as const
        })) || []
      });

      // Update wallet info
      if (wallet.data) {
        setWalletInfo(wallet.data);
      }

      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      setError(error as Error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <AsyncStateLoading className="min-h-[40vh]">Loading your dashboard…</AsyncStateLoading>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AsyncStateError
          description={error.message}
          icon={<AlertCircle className="h-10 w-10" />}
          actionLabel="Retry"
          onAction={fetchClientData}
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface">Client dashboard</h1>
          <p className="md3-body-medium text-on-surface-variant">
            Welcome back! Review your optimization performance, wallet balances, and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-outline bg-surface-container-high text-on-surface">
            <Bell className="h-5 w-5" />
          </button>
          <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-outline bg-surface-container-high text-on-surface">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <KpiGrid columns={4}>
        <KpiCard
          label="Optimizations"
          value={clientStats.optimizationsSubmitted.toLocaleString()}
          delta="Last 24h"
          tone="primary"
          icon={<Zap className="h-4 w-4" />}
        />
        <KpiCard
          label="Tokens earned"
          value={`${clientStats.tokensEarned.toLocaleString()} LDC`}
          tone="success"
          delta="Rewards accumulated"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Storage used"
          value={formatBytes(clientStats.storageUsed)}
          tone="warning"
          delta="75% of quota"
          icon={<Database className="h-4 w-4" />}
        />
        <KpiCard
          label="Active projects"
          value={clientStats.activeProjects}
          tone="neutral"
          delta="Currently tracked"
          icon={<FileText className="h-4 w-4" />}
        />
      </KpiGrid>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <WorkflowPanel title="Wallet overview" description="Track balances across your LightDom wallet and associated assets.">
          <WorkflowPanelSection>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <WalletAsset label="LightDom" amount={walletInfo.LDC} symbol="LDC" color="text-primary" />
              <WalletAsset label="USD value" amount={walletInfo.USD} symbol="USD" color="text-success" />
              <WalletAsset label="Bitcoin" amount={walletInfo.BTC} symbol="BTC" color="text-warning" />
              <WalletAsset label="Ethereum" amount={walletInfo.ETH} symbol="ETH" color="text-tertiary" />
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>

        <WorkflowPanel title="Quick actions" description="Access frequent client operations with a single tap.">
          <WorkflowPanelSection>
            <div className="space-y-3">
              <ActionButton icon={<Upload className="h-4 w-4" />} label="Upload files" />
              <ActionButton icon={<Download className="h-4 w-4" />} label="Export data" />
              <ActionButton icon={<Target className="h-4 w-4" />} label="New optimization" />
              <ActionButton icon={<Settings className="h-4 w-4" />} label="Settings" />
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkflowPanel title="Recent activity" description="Latest optimization submissions and automation events.">
          {clientStats.recentActivity.length === 0 ? (
            <AsyncStateEmpty
              title="No recent activity"
              description="Once new optimizations are processed they will appear here."
              icon={<Activity className="h-10 w-10" />}
              compact
            />
          ) : (
            <WorkflowPanelSection>
              <div className="space-y-3">
                {clientStats.recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    description={activity.description}
                    timestamp={getTimeAgo(activity.timestamp)}
                    status={activity.status}
                    type={activity.type}
                  />
                ))}
              </div>
            </WorkflowPanelSection>
          )}
        </WorkflowPanel>

        <WorkflowPanel title="Performance" description="Monitor success metrics and resource usage trends.">
          <WorkflowPanelSection>
            <div className="space-y-4">
              <PerformanceMetric label="Success rate" value={95} color="bg-success" />
              <PerformanceMetric label="Average speed" value={78} color="bg-primary" />
              <PerformanceMetric label="Optimization quality" value={88} color="bg-tertiary" />
              <PerformanceMetric label="Resource usage" value={65} color="bg-warning" />
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>
      </div>

      <WorkflowPanel title="Active projects" description="Track progress across ongoing optimization efforts.">
        <WorkflowPanelSection>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProjectCard name="Website Optimization" progress={75} status="In Progress" lastUpdate="2 hours ago" />
            <ProjectCard name="SEO Enhancement" progress={100} status="Completed" lastUpdate="1 day ago" />
            <ProjectCard name="Performance Audit" progress={45} status="In Progress" lastUpdate="30 minutes ago" />
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      <div className="fixed bottom-8 right-8">
        <Fab extended icon={<Plus className="h-5 w-5" />} aria-label="Create optimization">
          New optimization
        </Fab>
      </div>
    </div>
  );
};

const WalletAsset: React.FC<{
  label: string;
  amount: number;
  symbol: string;
  color: string;
}> = ({ label, amount, symbol, color }) => (
  <div className="flex flex-col items-start gap-1 rounded-2xl border border-outline bg-surface px-4 py-3">
    <span className="md3-label-medium text-on-surface-variant">{label}</span>
    <span className={`md3-title-large ${color}`}>{amount.toFixed(2)}</span>
    <span className="md3-label-small text-on-surface-variant/80">{symbol}</span>
  </div>
);

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
}> = ({ icon, label }) => (
  <button className="flex w-full items-center gap-3 rounded-2xl border border-outline px-4 py-2 text-on-surface transition-colors hover:border-primary">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-primary">
      {icon}
    </span>
    <span className="md3-body-medium font-medium">{label}</span>
  </button>
);

const ActivityItem: React.FC<{
  type?: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}> = ({ description, timestamp, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline bg-surface px-4 py-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high">
        {getStatusIcon()}
      </span>
      <div className="flex-1">
        <div className="md3-body-medium text-on-surface">{description}</div>
        <div className="md3-label-small text-on-surface-variant">{timestamp}</div>
      </div>
    </div>
  );
};

const PerformanceMetric: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div>
    <div className="flex items-center justify-between">
      <span className="md3-body-medium text-on-surface-variant">{label}</span>
      <span className="md3-label-medium text-on-surface">{value}%</span>
    </div>
    <div className="mt-2 h-2 w-full rounded-full bg-surface-container-high">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const ProjectCard: React.FC<{
  name: string;
  progress: number;
  status: string;
  lastUpdate: string;
}> = ({ name, progress, status, lastUpdate }) => (
  <div className="rounded-2xl border border-outline bg-surface px-4 py-3 transition-colors hover:border-primary">
    <div className="flex items-center justify-between">
      <h3 className="md3-title-small text-on-surface">{name}</h3>
      <span
        className={`md3-label-small rounded-full px-3 py-1 ${
          progress === 100 ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'
        }`}
      >
        {status}
      </span>
    </div>
    <div className="mt-3 h-2 w-full rounded-full bg-surface-container-high">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
    </div>
    <div className="md3-label-small text-on-surface-variant mt-3">Updated {lastUpdate}</div>
  </div>
);

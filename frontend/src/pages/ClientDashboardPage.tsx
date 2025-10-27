import React, { useEffect, useState } from 'react';
import {
  Activity,
  Database,
  Globe,
  TrendingUp,
  Wallet,
  Cpu,
  Code,
  Zap,
  Users,
  BarChart3,
  Shield,
  Target,
  FileText,
  Settings,
  Bell,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

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
    } catch (error) {
      console.error('Failed to fetch client data:', error);
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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-exodus-text-primary">Client Dashboard</h1>
          <p className="text-exodus-text-secondary mt-1">
            Welcome back! Here's your activity overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-card hover:bg-card-hover border border-border">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-card hover:bg-card-hover border border-border">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Optimizations"
          value={clientStats.optimizationsSubmitted}
          icon={<Zap className="w-6 h-6 text-blue-500" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Tokens Earned"
          value={`${clientStats.tokensEarned} LDC`}
          icon={<Wallet className="w-6 h-6 text-green-500" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Storage Used"
          value={formatBytes(clientStats.storageUsed)}
          icon={<Database className="w-6 h-6 text-purple-500" />}
          trend="75% of quota"
          trendUp={false}
        />
        <StatCard
          title="Active Projects"
          value={clientStats.activeProjects}
          icon={<FileText className="w-6 h-6 text-orange-500" />}
          trend="3 running"
          trendUp={true}
        />
      </div>

      {/* Wallet Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Overview
            </h2>
            <button className="text-sm text-primary hover:underline">View Details</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <WalletAsset label="LightDom" amount={walletInfo.LDC} symbol="LDC" color="blue" />
            <WalletAsset label="USD Value" amount={walletInfo.USD} symbol="USD" color="green" />
            <WalletAsset label="Bitcoin" amount={walletInfo.BTC} symbol="BTC" color="orange" />
            <WalletAsset label="Ethereum" amount={walletInfo.ETH} symbol="ETH" color="purple" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <ActionButton icon={<Upload className="w-4 h-4" />} label="Upload Files" />
            <ActionButton icon={<Download className="w-4 h-4" />} label="Export Data" />
            <ActionButton icon={<Target className="w-4 h-4" />} label="New Optimization" />
            <ActionButton icon={<Settings className="w-4 h-4" />} label="Settings" />
          </div>
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {clientStats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              clientStats.recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  type={activity.type}
                  description={activity.description}
                  timestamp={getTimeAgo(activity.timestamp)}
                  status={activity.status}
                />
              ))
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance
          </h2>
          <div className="space-y-6">
            <PerformanceMetric label="Success Rate" value={95} color="green" />
            <PerformanceMetric label="Average Speed" value={78} color="blue" />
            <PerformanceMetric label="Optimization Quality" value={88} color="purple" />
            <PerformanceMetric label="Resource Usage" value={65} color="orange" />
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Active Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProjectCard
            name="Website Optimization"
            progress={75}
            status="In Progress"
            lastUpdate="2 hours ago"
          />
          <ProjectCard
            name="SEO Enhancement"
            progress={100}
            status="Completed"
            lastUpdate="1 day ago"
          />
          <ProjectCard
            name="Performance Audit"
            progress={45}
            status="In Progress"
            lastUpdate="30 minutes ago"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}> = ({ title, value, icon, trend, trendUp }) => (
  <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <span className="text-muted-foreground text-sm">{title}</span>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-2">{value}</div>
    <div className={`text-sm flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-muted-foreground'}`}>
      <TrendingUp className="w-4 h-4" />
      {trend}
    </div>
  </div>
);

const WalletAsset: React.FC<{
  label: string;
  amount: number;
  symbol: string;
  color: string;
}> = ({ label, amount, symbol, color }) => (
  <div className="text-center p-4 bg-background rounded-lg">
    <div className="text-sm text-muted-foreground mb-1">{label}</div>
    <div className={`text-2xl font-bold text-${color}-500`}>
      {amount.toFixed(2)}
    </div>
    <div className="text-xs text-muted-foreground mt-1">{symbol}</div>
  </div>
);

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
}> = ({ icon, label }) => (
  <button className="w-full flex items-center gap-3 p-3 bg-background hover:bg-primary/10 rounded-lg transition-colors border border-border hover:border-primary/50">
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const ActivityItem: React.FC<{
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}> = ({ type, description, timestamp, status }) => {
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
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
      {getStatusIcon()}
      <div className="flex-1">
        <div className="text-sm font-medium">{description}</div>
        <div className="text-xs text-muted-foreground">{timestamp}</div>
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
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}%</span>
    </div>
    <div className="w-full bg-background rounded-full h-2">
      <div
        className={`bg-${color}-500 h-2 rounded-full transition-all`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ProjectCard: React.FC<{
  name: string;
  progress: number;
  status: string;
  lastUpdate: string;
}> = ({ name, progress, status, lastUpdate }) => (
  <div className="p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold">{name}</h3>
      <span className={`text-xs px-2 py-1 rounded-full ${
        progress === 100 ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
      }`}>
        {status}
      </span>
    </div>
    <div className="mb-3">
      <div className="w-full bg-card rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    <div className="text-xs text-muted-foreground">Updated {lastUpdate}</div>
  </div>
);

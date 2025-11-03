import React, { useEffect, useState, useRef } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

interface ServiceStatus {
  [key: string]: any;
  error?: string;
}

interface CompleteDashboard {
  timestamp: string;
  services: {
    crawler?: ServiceStatus;
    mining?: ServiceStatus;
    blockchain?: ServiceStatus;
    spaceMining?: ServiceStatus;
    metaverse?: ServiceStatus;
    seo?: ServiceStatus;
  };
}

const API_BASE = 'http://localhost:3001';

export const CompleteDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<CompleteDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard/complete`);
      setDashboardData(response.data);
      setLoading(false);
      setErrorMessage(null);
      hasWarnedRef.current = false;
    } catch (error) {
      const message =
        axios.isAxiosError?.(error) && error.response
          ? `API responded with ${error.response.status}`
          : 'Unable to reach the dashboard backend service.';
      if (!hasWarnedRef.current) {
        console.warn('Complete dashboard request failed. Showing fallback data.', error);
        hasWarnedRef.current = true;
      }
      setDashboardData((previous) =>
        previous ?? {
          timestamp: new Date().toISOString(),
          services: {},
        }
      );
      setErrorMessage(message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading complete system data...</p>
        </div>
      </div>
    );
  }

  const services = dashboardData?.services || {};
  const systemHealthy = !errorMessage;

  return (
    <div className="p-6 space-y-6">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-1 h-5 w-5 text-destructive" />
          <div className="space-y-1">
            <h2 className="font-semibold text-destructive">Dashboard data unavailable</h2>
            <p className="text-sm text-on-surface-variant">
              {errorMessage}. Please ensure the API at {`${API_BASE}/api/dashboard/complete`} is running or retry once the
              backend is healthy.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Complete System Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <div
              className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm font-medium">
              {systemHealthy ? 'System Online' : 'Awaiting backend response'}
            </span>
          </div>
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ServiceStatusCard
          name="Crawler"
          icon={<Globe className="w-5 h-5" />}
          status={services.crawler && !services.crawler.error}
          data={services.crawler}
        />
        <ServiceStatusCard
          name="Mining"
          icon={<Cpu className="w-5 h-5" />}
          status={services.mining && !services.mining.error}
          data={services.mining}
        />
        <ServiceStatusCard
          name="Blockchain"
          icon={<Shield className="w-5 h-5" />}
          status={services.blockchain && !services.blockchain.error}
          data={services.blockchain}
        />
        <ServiceStatusCard
          name="Space Mining"
          icon={<Zap className="w-5 h-5" />}
          status={services.spaceMining && !services.spaceMining.error}
          data={services.spaceMining}
        />
        <ServiceStatusCard
          name="Metaverse"
          icon={<Users className="w-5 h-5" />}
          status={services.metaverse && !services.metaverse.error}
          data={services.metaverse}
        />
        <ServiceStatusCard
          name="SEO"
          icon={<Target className="w-5 h-5" />}
          status={services.seo && !services.seo.error}
          data={services.seo}
        />
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Crawler Metrics */}
        {services.crawler && !services.crawler.error && (
          <MetricCard
            title="Sites Crawled"
            value={services.crawler.crawledCount || 0}
            icon={<Globe className="w-6 h-6 text-blue-500" />}
            subtitle={`${services.crawler.discoveredCount || 0} discovered`}
          />
        )}

        {/* Mining Metrics */}
        {services.mining && !services.mining.error && (
          <MetricCard
            title="Active Mining"
            value={services.mining.activeSessions || 0}
            icon={<Cpu className="w-6 h-6 text-purple-500" />}
            subtitle="mining sessions"
          />
        )}

        {/* Blockchain Metrics */}
        {services.blockchain && !services.blockchain.error && (
          <MetricCard
            title="Blockchain"
            value={services.blockchain.totalNodes || 0}
            icon={<Shield className="w-6 h-6 text-green-500" />}
            subtitle="total nodes"
          />
        )}

        {/* Space Mining Metrics */}
        {services.spaceMining && !services.spaceMining.error && (
          <MetricCard
            title="Space Mined"
            value={services.spaceMining.totalSpaceMined || 0}
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            subtitle="structures analyzed"
          />
        )}
      </div>

      {/* Detailed Service Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crawler Details */}
        {services.crawler && !services.crawler.error && (
          <ServicePanel
            title="Web Crawler Service"
            icon={<Globe className="w-5 h-5" />}
            data={services.crawler}
          />
        )}

        {/* Mining Details */}
        {services.mining && !services.mining.error && (
          <ServicePanel
            title="Mining Service"
            icon={<Cpu className="w-5 h-5" />}
            data={services.mining}
          />
        )}

        {/* Blockchain Details */}
        {services.blockchain && !services.blockchain.error && (
          <ServicePanel
            title="Blockchain Service"
            icon={<Shield className="w-5 h-5" />}
            data={services.blockchain}
          />
        )}

        {/* Space Mining Details */}
        {services.spaceMining && !services.spaceMining.error && (
          <ServicePanel
            title="Space Mining Engine"
            icon={<Zap className="w-5 h-5" />}
            data={services.spaceMining}
          />
        )}

        {/* Metaverse Details */}
        {services.metaverse && !services.metaverse.error && (
          <ServicePanel
            title="Metaverse Service"
            icon={<Users className="w-5 h-5" />}
            data={services.metaverse}
          />
        )}

        {/* SEO Details */}
        {services.seo && !services.seo.error && (
          <ServicePanel
            title="SEO Analytics"
            icon={<Target className="w-5 h-5" />}
            data={services.seo}
          />
        )}
      </div>

      {/* Raw Data Viewer (for debugging) */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Raw Service Data
        </h2>
        <pre className="bg-background p-4 rounded-lg overflow-auto max-h-96 text-xs">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Service Status Card Component
const ServiceStatusCard: React.FC<{
  name: string;
  icon: React.ReactNode;
  status: boolean;
  data?: any;
}> = ({ name, icon, status, data }) => {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted-foreground">{icon}</div>
        <div
          className={`w-2 h-2 rounded-full ${
            status ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
      </div>
      <div className="text-sm font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {status ? 'Active' : data?.error ? 'Error' : 'Inactive'}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, icon, subtitle }) => {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
};

// Service Panel Component
const ServicePanel: React.FC<{
  title: string;
  icon: React.ReactNode;
  data: any;
}> = ({ title, icon, data }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'error') return null;
          return (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-semibold">
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

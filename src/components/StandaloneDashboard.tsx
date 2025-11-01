/**
 * Standalone Dashboard - Guaranteed to Work
 * No external dependencies, completely self-contained
 */

import React, { useState, useEffect } from 'react';

const StandaloneDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [stats, setStats] = useState({
    totalUsers: 15420,
    activeUsers: 8932,
    totalRevenue: 2847500,
    growthRate: 23.5,
    seoScore: 94.2,
    keywords: 1250,
    backlinks: 890,
    rankings: 156,
    transactions: 45670,
    walletBalance: 125000,
    stakedAmount: 50000,
    rewards: 8920,
    activeWorlds: 12,
    metaverseUsers: 5670,
    bridges: 8,
    economy: 2340000,
    activeWorkflows: 15,
    completedTasks: 1250,
    successRate: 94.5,
    averageTime: 45,
    totalModels: 8,
    trainingJobs: 2,
    deployedModels: 5,
    accuracy: 92.3,
    cpu: 67.8,
    memory: 72.3,
    disk: 45.6,
    network: 23.4,
    gpu: 78.4,
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10 - 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 8 - 4),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000 - 500),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const colors = {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    surface: '#1f2937',
    surfaceLight: '#374151',
    background: '#111827',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
  };

  const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: colors.surface,
      padding: `${spacing.lg} ${spacing.xl}`,
      borderBottom: `1px solid ${colors.border}`,
      height: '72px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    },
    logo: {
      width: '40px',
      height: '40px',
      backgroundColor: colors.primary,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: colors.text,
      margin: 0,
    },
    subtitle: {
      fontSize: '12px',
      color: colors.textSecondary,
      margin: '2px 0 0 0',
    },
    content: {
      padding: spacing.xl,
    },
    tabs: {
      display: 'flex',
      gap: spacing.sm,
      marginBottom: spacing.xl,
      borderBottom: `1px solid ${colors.border}`,
      flexWrap: 'wrap' as const,
    },
    tab: {
      padding: `${spacing.md} ${spacing.lg}`,
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.textSecondary,
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      transition: 'all 0.2s ease',
    },
    tabActive: {
      color: colors.primary,
      borderBottomColor: colors.primary,
    },
    tabHover: {
      color: colors.text,
    },
    card: {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: spacing.xl,
      marginBottom: spacing.lg,
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: colors.text,
      margin: `0 0 ${spacing.lg} 0`,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: spacing.lg,
      marginBottom: spacing.xl,
    },
    statCard: {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: spacing.lg,
      textAlign: 'center',
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: spacing.sm,
    },
    statLabel: {
      fontSize: '14px',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    progress: {
      width: '100%',
      height: '8px',
      backgroundColor: colors.border,
      borderRadius: '4px',
      overflow: 'hidden',
      margin: `${spacing.sm} 0`,
    },
    progressBar: {
      height: '100%',
      background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
      transition: 'width 0.3s ease',
    },
    button: {
      backgroundColor: colors.primary,
      color: 'white',
      border: 'none',
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.sm,
      transition: 'all 0.2s ease',
    },
    buttonSuccess: {
      backgroundColor: colors.success,
    },
    buttonWarning: {
      backgroundColor: colors.warning,
    },
    buttonInfo: {
      backgroundColor: colors.info,
    },
    buttonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: spacing.xl,
    },
    notification: {
      backgroundColor: colors.surfaceLight,
      padding: spacing.md,
      borderRadius: '8px',
      marginBottom: spacing.sm,
      borderLeft: `4px solid ${colors.success}`,
    },
    notificationWarning: {
      borderLeftColor: colors.warning,
    },
    notificationError: {
      borderLeftColor: colors.error,
    },
    notificationTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    notificationMessage: {
      fontSize: '12px',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    notificationTime: {
      fontSize: '10px',
      color: colors.textTertiary,
    },
    select: {
      backgroundColor: colors.surfaceLight,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: '6px',
      fontSize: '14px',
    },
    switch: {
      position: 'relative' as const,
      width: '44px',
      height: '24px',
      backgroundColor: colors.border,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    switchActive: {
      backgroundColor: colors.primary,
    },
    switchKnob: {
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'transform 0.2s ease',
    },
    switchKnobActive: {
      transform: 'translateX(20px)',
    },
    iconButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text,
      cursor: 'pointer',
      fontSize: '18px',
      padding: spacing.sm,
      borderRadius: '6px',
      transition: 'background-color 0.2s ease',
    },
    iconButtonHover: {
      backgroundColor: colors.surfaceLight,
    },
  };

  const handleQuickAction = (action: string) => {
    console.log(`${action} clicked`);
    setActiveTab(action.toLowerCase().replace(' ', ''));
  };

  const renderOverview = () => (
    <div>
      {/* Quick Actions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          ⚡ Quick Actions
        </h3>
        <div style={styles.quickActions}>
          <button
            style={styles.button}
            onClick={() => handleQuickAction('SEO Generator')}
          >
            🤖 Generate SEO Content
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSuccess }}
            onClick={() => handleQuickAction('Automation')}
          >
            ⚡ Start Workflow
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonWarning }}
            onClick={() => handleQuickAction('TensorFlow')}
          >
            🧠 Train Model
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonInfo }}
            onClick={() => handleQuickAction('Metaverse')}
          >
            🌐 Enter Metaverse
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.primary }}>
            {stats.totalUsers.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Total Users</div>
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: '23.5%' }} />
          </div>
          <small style={{ color: colors.textTertiary }}>+23.5% from last month</small>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            {stats.activeUsers.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Active Users</div>
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: '57.9%', background: `linear-gradient(90deg, ${colors.success}, #34d399)` }} />
          </div>
          <small style={{ color: colors.textTertiary }}>57.9% of total users</small>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Revenue</div>
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: '18.2%', background: `linear-gradient(90deg, ${colors.warning}, #fbbf24)` }} />
          </div>
          <small style={{ color: colors.textTertiary }}>+18.2% growth rate</small>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            {stats.growthRate}%
          </div>
          <div style={styles.statLabel}>Growth Rate</div>
          <div style={styles.progress}>
            <div style={{ ...styles.progressBar, width: '23.5%', background: `linear-gradient(90deg, ${colors.info}, #60a5fa)` }} />
          </div>
          <small style={{ color: colors.textTertiary }}>Monthly growth</small>
        </div>
      </div>

      {/* System Status & Notifications */}
      <div style={styles.grid}>
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              📊 System Resources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              <div>
                <strong style={{ color: colors.text }}>CPU Usage</strong>
                <div style={styles.progress}>
                  <div style={{ ...styles.progressBar, width: `${stats.cpu}%` }} />
                </div>
                <small style={{ color: colors.textTertiary }}>{stats.cpu}% utilized</small>
              </div>
              <div>
                <strong style={{ color: colors.text }}>Memory Usage</strong>
                <div style={styles.progress}>
                  <div style={{ ...styles.progressBar, width: `${stats.memory}%`, background: `linear-gradient(90deg, ${colors.warning}, #fbbf24)` }} />
                </div>
                <small style={{ color: colors.textTertiary }}>{stats.memory}% utilized</small>
              </div>
              <div>
                <strong style={{ color: colors.text }}>Disk Usage</strong>
                <div style={styles.progress}>
                  <div style={{ ...styles.progressBar, width: `${stats.disk}%`, background: `linear-gradient(90deg, ${colors.error}, #f87171)` }} />
                </div>
                <small style={{ color: colors.textTertiary }}>{stats.disk}% utilized</small>
              </div>
              <div>
                <strong style={{ color: colors.text }}>Network Usage</strong>
                <div style={styles.progress}>
                  <div style={{ ...styles.progressBar, width: `${stats.network}%`, background: `linear-gradient(90deg, ${colors.success}, #34d399)` }} />
                </div>
                <small style={{ color: colors.textTertiary }}>{stats.network}% utilized</small>
              </div>
              <div>
                <strong style={{ color: colors.text }}>GPU Usage</strong>
                <div style={styles.progress}>
                  <div style={{ ...styles.progressBar, width: `${stats.gpu}%`, background: `linear-gradient(90deg, ${colors.info}, #60a5fa)` }} />
                </div>
                <small style={{ color: colors.textTertiary }}>{stats.gpu}% utilized</small>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              🔔 Recent Notifications
            </h3>
            <div style={styles.notification}>
              <div style={styles.notificationTitle}>✅ SEO Campaign Completed</div>
              <div style={styles.notificationMessage}>Your SEO optimization campaign has been completed successfully.</div>
              <div style={styles.notificationTime}>2 minutes ago</div>
            </div>
            <div style={{ ...styles.notification, ...styles.notificationWarning }}>
              <div style={styles.notificationTitle}>⚠️ Mining Efficiency Drop</div>
              <div style={styles.notificationMessage}>Mining efficiency has dropped by 5%. Consider optimizing parameters.</div>
              <div style={styles.notificationTime}>1 hour ago</div>
            </div>
            <div style={styles.notification}>
              <div style={styles.notificationTitle}>ℹ️ New Metaverse Bridge</div>
              <div style={styles.notificationMessage}>A new metaverse bridge has been established in Tokyo.</div>
              <div style={styles.notificationTime}>2 hours ago</div>
            </div>
            <div style={styles.notification}>
              <div style={styles.notificationTitle}>🧠 Model Training Complete</div>
              <div style={styles.notificationMessage}>TensorFlow model training completed with 92.3% accuracy.</div>
              <div style={styles.notificationTime}>3 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        🤖 SEO Content Generator
      </h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            {stats.seoScore}%
          </div>
          <div style={styles.statLabel}>SEO Score</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            {stats.keywords.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Keywords</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            {stats.backlinks.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Backlinks</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.primary }}>
            {stats.rankings.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Rankings</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button style={styles.button}>🚀 Generate New Content</button>
        <button style={{ ...styles.button, ...styles.buttonSuccess }}>📊 View Analytics</button>
        <button style={{ ...styles.button, ...styles.buttonInfo }}>⚙️ Settings</button>
      </div>
    </div>
  );

  const renderBlockchain = () => (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        💎 Blockchain Rewards
      </h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.primary }}>
            {stats.transactions.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Transactions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            ${stats.walletBalance.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Wallet Balance</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            ${stats.stakedAmount.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Staked Amount</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            ${stats.rewards.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Rewards</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button style={styles.button}>💰 Claim Rewards</button>
        <button style={{ ...styles.button, ...styles.buttonSuccess }}>🎯 Stake Tokens</button>
        <button style={{ ...styles.button, ...styles.buttonInfo }}>📈 View Portfolio</button>
      </div>
    </div>
  );

  const renderMetaverse = () => (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        🌐 Metaverse Portal
      </h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            {stats.activeWorlds}
          </div>
          <div style={styles.statLabel}>Active Worlds</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            {stats.metaverseUsers.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            {stats.bridges}
          </div>
          <div style={styles.statLabel}>Bridges</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.primary }}>
            ${stats.economy.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Economy</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button style={styles.button}>🌍 Explore Worlds</button>
        <button style={{ ...styles.button, ...styles.buttonSuccess }}>💬 Chat Nodes</button>
        <button style={{ ...styles.button, ...styles.buttonInfo }}>🏪 Marketplace</button>
      </div>
    </div>
  );

  const renderAutomation = () => (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        ⚡ Automation Workflows
      </h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.primary }}>
            {stats.activeWorkflows}
          </div>
          <div style={styles.statLabel}>Active Workflows</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            {stats.completedTasks.toLocaleString()}
          </div>
          <div style={styles.statLabel}>Completed Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            {stats.successRate}%
          </div>
          <div style={styles.statLabel}>Success Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            {stats.averageTime}s
          </div>
          <div style={styles.statLabel}>Avg Time</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button style={styles.button}>▶️ Start Workflow</button>
        <button style={{ ...styles.button, ...styles.buttonSuccess }}>📋 Templates</button>
        <button style={{ ...styles.button, ...styles.buttonInfo }}>📊 Analytics</button>
      </div>
    </div>
  );

  const renderTensorFlow = () => (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        🧠 TensorFlow Admin
      </h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.error }}>
            {stats.totalModels}
          </div>
          <div style={styles.statLabel}>Total Models</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.warning }}>
            {stats.trainingJobs}
          </div>
          <div style={styles.statLabel}>Training Jobs</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.success }}>
            {stats.deployedModels}
          </div>
          <div style={styles.statLabel}>Deployed Models</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: colors.info }}>
            {stats.accuracy}%
          </div>
          <div style={styles.statLabel}>Accuracy</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button style={styles.button}>🚀 Train Model</button>
        <button style={{ ...styles.button, ...styles.buttonSuccess }}>📦 Deploy Model</button>
        <button style={{ ...styles.button, ...styles.buttonInfo }}>📊 Performance</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'seo':
        return renderSEO();
      case 'blockchain':
        return renderBlockchain();
      case 'metaverse':
        return renderMetaverse();
      case 'automation':
        return renderAutomation();
      case 'tensorflow':
        return renderTensorFlow();
      default:
        return renderOverview();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>LD</div>
          <div>
            <h1 style={styles.title}>LightDom Dashboard</h1>
            <p style={styles.subtitle}>Professional Admin Interface</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <select
            style={styles.select}
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last Week</option>
            <option value="30d">Last Month</option>
          </select>
          <div
            style={{
              ...styles.switch,
              ...(autoRefresh ? styles.switchActive : {})
            }}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <div
              style={{
                ...styles.switchKnob,
                ...(autoRefresh ? styles.switchKnobActive : {})
              }}
            />
          </div>
          <button
            style={styles.iconButton}
            title="Notifications"
          >
            🔔
          </button>
          <button
            style={styles.iconButton}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'overview' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'seo' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('seo')}
          >
            🤖 SEO Generator
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'blockchain' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('blockchain')}
          >
            💎 Blockchain Rewards
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'metaverse' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('metaverse')}
          >
            🌐 Metaverse Portal
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'automation' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('automation')}
          >
            ⚡ Automation Workflows
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'tensorflow' ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab('tensorflow')}
          >
            🧠 TensorFlow Admin
          </button>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default StandaloneDashboard;

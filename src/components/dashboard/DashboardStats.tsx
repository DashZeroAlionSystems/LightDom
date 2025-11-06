/**
 * Dashboard Stats Component
 * Displays key metrics for users based on their subscription plan
 */

import React from 'react';
import { 
  Zap, 
  Database, 
  Award, 
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    optimizations: number;
    spaceSaved: number;
    tokensEarned: string;
    reputation: number;
    activeProjects?: number;
    teamMembers?: number;
  };
  plan: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, plan }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statsCards = [
    {
      icon: Zap,
      value: stats.optimizations.toString(),
      label: 'Optimizations',
      color: 'primary',
      trend: '+12%',
      show: true
    },
    {
      icon: Database,
      value: formatBytes(stats.spaceSaved),
      label: 'Space Saved',
      color: 'success',
      trend: '+24%',
      show: true
    },
    {
      icon: Award,
      value: stats.reputation.toString(),
      label: 'Reputation',
      color: 'warning',
      trend: '+5%',
      show: true
    },
    {
      icon: Activity,
      value: stats.tokensEarned,
      label: 'LDOM Earned',
      color: 'secondary',
      trend: '+18%',
      show: ['pro', 'enterprise', 'admin'].includes(plan)
    },
    {
      icon: TrendingUp,
      value: stats.activeProjects?.toString() || '0',
      label: 'Active Projects',
      color: 'info',
      trend: '+2',
      show: ['pro', 'enterprise', 'admin'].includes(plan)
    },
    {
      icon: Users,
      value: stats.teamMembers?.toString() || '0',
      label: 'Team Members',
      color: 'purple',
      trend: '0',
      show: ['enterprise', 'admin'].includes(plan)
    }
  ];

  const visibleStats = statsCards.filter(stat => stat.show);

  return (
    <div className="dashboard-stats">
      {visibleStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className={`stat-change ${stat.trend.startsWith('+') ? 'positive' : 'neutral'}`}>
                <TrendingUp size={16} />
                <span>{stat.trend}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;



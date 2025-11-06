/**
 * Recent Activity Component
 * Shows user's recent actions and achievements
 */

import React from 'react';
import { 
  Zap, 
  Database, 
  Award,
  Globe,
  Users,
  FileText,
  CheckCircle
} from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      zap: Zap,
      database: Database,
      award: Award,
      globe: Globe,
      users: Users,
      file: FileText,
      check: CheckCircle
    };
    const Icon = icons[iconName] || Zap;
    return <Icon size={16} />;
  };

  const getIconColor = (type: string) => {
    const colors: Record<string, string> = {
      optimization: 'primary',
      mining: 'success',
      achievement: 'warning',
      team: 'purple',
      api: 'info',
      error: 'error'
    };
    return colors[type] || 'primary';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (activities.length === 0) {
    return (
      <div className="recent-activity-empty">
        <p>No recent activity to display</p>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${getIconColor(activity.type)}`}>
              {getIcon(activity.icon)}
            </div>
            <div className="activity-content">
              <div className="activity-description">{activity.description}</div>
              <div className="activity-time">{formatTime(activity.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;



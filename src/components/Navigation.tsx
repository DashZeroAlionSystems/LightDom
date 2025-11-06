import React, { useState } from 'react';
import { 
  Home, 
  Pickaxe, 
  Globe, 
  Zap, 
  Network, 
  Wallet, 
  Database, 
  TestTube, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface NavigationProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

/**
 * Navigation - Collapsible sidebar navigation component
 */
const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentPath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/dashboard/client-zone', label: 'Client Zone', icon: User },
    { path: '/space-mining', label: 'Space Mining', icon: Pickaxe },
    { path: '/harvester', label: 'Web Crawler', icon: Globe },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/advanced-nodes', label: 'Advanced Nodes', icon: Network },
    { path: '/optimization', label: 'Optimization', icon: Zap },
    { path: '/blockchain-models', label: 'Blockchain Models', icon: Database },
    { path: '/workflow-simulation', label: 'Workflow Simulation', icon: TestTube },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`discord-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="discord-sidebar-header">
        <h2 className="discord-sidebar-title">{!isCollapsed && 'LightDom'}</h2>
        <button 
          className="discord-sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="discord-sidebar-nav">
        <ul className="discord-sidebar-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.path}>
                <button
                  className={`discord-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNavigate(item.path)}
                  title={item.label}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="discord-sidebar-footer">
          <p className="text-xs text-gray-500">v1.0.0</p>
        </div>
      )}
    </div>
  );
};

export default Navigation;



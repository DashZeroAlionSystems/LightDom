import React, { useState } from 'react';
import { 
  Home, 
  Menu, 
  X, 
  Settings, 
  Wallet, 
  Zap, 
  Globe, 
  Database, 
  TestTube,
  Workflow,
  Mining,
  Blockchain,
  Cpu,
  User
} from 'lucide-react';

interface NavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath = '/', onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/dashboard/client-zone', label: 'Client Zone', icon: User },
    { path: '/space-mining', label: 'Space Mining', icon: Mining },
    { path: '/harvester', label: 'Web Crawler', icon: Globe },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/advanced-nodes', label: 'Advanced Nodes', icon: Cpu },
    { path: '/optimization', label: 'Optimization', icon: Zap },
    { path: '/metaverse-mining', label: 'Metaverse Mining', icon: Blockchain },
    { path: '/blockchain-models', label: 'Blockchain Models', icon: Database },
    { path: '/workflow-simulation', label: 'Workflow Simulation', icon: Workflow },
    { path: '/testing', label: 'Testing', icon: TestTube },
    { path: '/lightdom-slots', label: 'LightDom Slots', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.pathname = path;
    }
  };


  return (
    <div className={`discord-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="discord-sidebar-header">
        {!isCollapsed && (
          <h1 className="discord-sidebar-title">LightDom</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="discord-sidebar-toggle"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="discord-sidebar-nav">
        <ul className="discord-sidebar-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`discord-sidebar-item ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="discord-sidebar-footer">
        {!isCollapsed && (
          <div className="discord-sidebar-footer-text">
            LightDom Space-Bridge Platform
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;

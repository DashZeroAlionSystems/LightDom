import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Server,
  FileContract,
  Vote,
  Settings,
  User,
  Brain,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth';
import toast from 'react-hot-toast';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-card hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navLinks = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/ai-content', icon: <Brain className="w-5 h-5" />, label: 'AI Content' },
    { to: '/seo-training', icon: <TrendingUp className="w-5 h-5" />, label: 'SEO Training' },
    { to: '/files', icon: <FileText className="w-5 h-5" />, label: 'Files' },
    { to: '/upload', icon: <Upload className="w-5 h-5" />, label: 'Upload' },
    { to: '/hosts', icon: <Server className="w-5 h-5" />, label: 'Hosts' },
    { to: '/contracts', icon: <FileContract className="w-5 h-5" />, label: 'Contracts' },
    { to: '/governance', icon: <Vote className="w-5 h-5" />, label: 'Governance' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-card border-r border-border w-64 p-4 flex flex-col">
      {/* Logo/Brand */}
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-exodus flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <span className="text-xl font-bold">LightDom</span>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 p-3 bg-background rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-exodus" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={location.pathname === link.to}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-card hover:text-red-500 transition-colors w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

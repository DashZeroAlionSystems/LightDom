import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';

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
    {
      to: '/dashboard',
      icon: <LucideIcons.Layout className='w-5 h-5' />,
      label: 'Complete Dashboard',
    },
    {
      to: '/admin-dashboard',
      icon: <LucideIcons.PanelRight className='w-5 h-5' />,
      label: 'Admin Console',
    },
    {
      to: '/admin-navigation',
      icon: <LucideIcons.Map className='w-5 h-5' />,
      label: 'Admin Navigation Demo',
    },
    {
      to: '/unified-dashboard',
      icon: <LucideIcons.Layers className='w-5 h-5' />,
      label: 'Unified Dashboard Demo',
    },
    {
      to: '/workflow-wizard',
      icon: <LucideIcons.Wand2 className='w-5 h-5' />,
      label: 'Workflow Wizard Demo',
    },
    {
      to: '/security-audit-report',
      icon: <LucideIcons.ShieldCheck className='w-5 h-5' />,
      label: 'Security Audit Demo',
    },
    {
      to: '/self-organizing-dashboard',
      icon: <LucideIcons.Cpu className='w-5 h-5' />,
      label: 'Self-Organizing Demo',
    },
    {
      to: '/devcontainer-admin-dashboard',
      icon: <LucideIcons.MonitorSmartphone className='w-5 h-5' />,
      label: 'DevContainer Admin Demo',
    },
    {
      to: '/lightdom-slot-demo',
      icon: <LucideIcons.Layers className='w-5 h-5' />,
      label: 'LightDom Slot Demo',
    },
    {
      to: '/component-bundles',
      icon: <LucideIcons.PackagePlus className='w-5 h-5' />,
      label: 'Component Bundles Demo',
    },
    {
      to: '/space-mining',
      icon: <LucideIcons.Rocket className='w-5 h-5' />,
      label: 'Space Mining Demo',
    },
    {
      to: '/service-graph',
      icon: <LucideIcons.Activity className='w-5 h-5' />,
      label: 'Service Graph Demo',
    },
    {
      to: '/metaverse-nft',
      icon: <LucideIcons.Wand2 className='w-5 h-5' />,
      label: 'Metaverse NFT Demo',
    },
    {
      to: '/client-integration',
      icon: <LucideIcons.PlugZap className='w-5 h-5' />,
      label: 'Client Integration Demo',
    },
    {
      to: '/enterprise-container',
      icon: <LucideIcons.ServerCog className='w-5 h-5' />,
      label: 'Enterprise Container Demo',
    },
    {
      to: '/data-mining',
      icon: <LucideIcons.Database className='w-5 h-5' />,
      label: 'Data Mining Demo',
    },
  ];

  return (
    <div className='min-h-screen bg-card border-r border-border w-64 p-4 flex flex-col'>
      {/* Logo/Brand */}
      <div className='mb-8'>
        <Link to='/dashboard' className='flex items-center gap-2'>
          <div className='w-10 h-10 rounded-xl bg-gradient-exodus flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>L</span>
          </div>
          <span className='text-xl font-bold'>LightDom</span>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className='mb-6 p-3 bg-background rounded-lg'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-gradient-exodus' />
            <div className='flex-1 min-w-0'>
              <p className='font-medium truncate'>{user.name || user.email}</p>
              <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className='flex-1 space-y-1'>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            active={location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className='flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-card hover:text-red-500 transition-colors w-full'
      >
        <LucideIcons.LogOut className='w-5 h-5' />
        <span>Logout</span>
      </button>
    </div>
  );
};

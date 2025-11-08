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

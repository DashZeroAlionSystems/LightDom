import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth';
import toast from 'react-hot-toast';
import {
  SidebarContainer,
  SidebarHeader,
  SidebarNavItem,
  SidebarCategory,
  SidebarProfile,
  SidebarDivider,
} from '@/components/ui/sidebar';

/**
 * Main Navigation Sidebar Component
 * 
 * Features:
 * - Collapsible sidebar with smooth transitions
 * - Categorized navigation items
 * - User profile section with actions
 * - Responsive and accessible
 * - Integrated with routing and authentication
 */
export const NavigationSidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleNotifications = () => {
    toast.success('Notifications feature coming soon!');
  };

  return (
    <SidebarContainer defaultCollapsed={false}>
      {/* Header with logo and collapse button */}
      <SidebarHeader
        brandName="LightDom"
        brandSubtitle="Professional Platform"
      />

      {/* Scrollable navigation area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Main Navigation */}
        <SidebarCategory title="Main" defaultOpen={true}>
          <SidebarNavItem
            to="/dashboard"
            icon={<LucideIcons.Layout className="w-5 h-5" />}
            label="Dashboard"
            description="Overview and stats"
          />
          <SidebarNavItem
            to="/admin-dashboard"
            icon={<LucideIcons.PanelRight className="w-5 h-5" />}
            label="Admin Console"
            description="Admin operations"
          />
          <SidebarNavItem
            to="/workflows"
            icon={<LucideIcons.GitBranch className="w-5 h-5" />}
            label="Workflows"
            description="Workflow management"
          />
          <SidebarNavItem
            to="/files"
            icon={<LucideIcons.FolderOpen className="w-5 h-5" />}
            label="Files"
            description="File management"
          />
        </SidebarCategory>

        <SidebarDivider />

        {/* Demo & Features */}
        <SidebarCategory title="Features" defaultOpen={true}>
          <SidebarNavItem
            to="/admin-navigation"
            icon={<LucideIcons.Map className="w-5 h-5" />}
            label="Admin Navigation"
          />
          <SidebarNavItem
            to="/unified-dashboard"
            icon={<LucideIcons.Layers className="w-5 h-5" />}
            label="Unified Dashboard"
          />
          <SidebarNavItem
            to="/workflow-wizard"
            icon={<LucideIcons.Wand2 className="w-5 h-5" />}
            label="Workflow Wizard"
          />
          <SidebarNavItem
            to="/component-schema-tool"
            icon={<LucideIcons.Code className="w-5 h-5" />}
            label="Component Schema"
          />
          <SidebarNavItem
            to="/prompt-console"
            icon={<LucideIcons.Terminal className="w-5 h-5" />}
            label="Prompt Console"
          />
          <SidebarNavItem
            to="/crawlee-manager"
            icon={<LucideIcons.Sitemap className="w-5 h-5" />}
            label="Crawler Dashboard"
            description="Manage crawlers & seeding"
          />
        </SidebarCategory>

        <SidebarDivider />

        {/* Advanced */}
        <SidebarCategory title="Advanced" defaultOpen={false}>
          <SidebarNavItem
            to="/space-mining"
            icon={<LucideIcons.Rocket className="w-5 h-5" />}
            label="Space Mining"
          />
          <SidebarNavItem
            to="/metaverse-nft"
            icon={<LucideIcons.Sparkles className="w-5 h-5" />}
            label="Metaverse NFT"
          />
          <SidebarNavItem
            to="/client-integration"
            icon={<LucideIcons.PlugZap className="w-5 h-5" />}
            label="Client Integration"
          />
          <SidebarNavItem
            to="/enterprise-container"
            icon={<LucideIcons.ServerCog className="w-5 h-5" />}
            label="Enterprise Container"
          />
          <SidebarNavItem
            to="/data-mining"
            icon={<LucideIcons.Database className="w-5 h-5" />}
            label="Data Mining"
          />
          <SidebarNavItem
            to="/neural-network-management"
            icon={<LucideIcons.Brain className="w-5 h-5" />}
            label="Neural Networks"
            description="AI & ML management"
          />
          />
        </SidebarCategory>

        <SidebarDivider />

        {/* System */}
        <SidebarCategory title="System" defaultOpen={false}>
          <SidebarNavItem
            to="/security-audit-report"
            icon={<LucideIcons.ShieldCheck className="w-5 h-5" />}
            label="Security Audit"
          />
          <SidebarNavItem
            to="/self-organizing-dashboard"
            icon={<LucideIcons.Cpu className="w-5 h-5" />}
            label="Self-Organizing"
          />
          <SidebarNavItem
            to="/service-graph"
            icon={<LucideIcons.Activity className="w-5 h-5" />}
            label="Service Graph"
          />
          <SidebarNavItem
            to="/component-bundles"
            icon={<LucideIcons.PackagePlus className="w-5 h-5" />}
            label="Component Bundles"
          />
        </SidebarCategory>
      </div>

      {/* User Profile Section */}
      <SidebarProfile
        user={{
          name: user?.name || user?.email,
          email: user?.email,
          role: 'Administrator',
        }}
        onSettingsClick={handleSettings}
        onNotificationsClick={handleNotifications}
        onLogoutClick={handleLogout}
        notificationCount={0}
      />
    </SidebarContainer>
  );
};

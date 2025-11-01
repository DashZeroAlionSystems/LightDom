/**
 * Professional Integrated Dashboard
 * Complete Material Design 3.0 dashboard with sidebar and main content
 * Responsive design with consistent component sizing
 */

import React, { useState } from 'react';
import { Layout } from '@/components/ui/layout/Layout';
import ProfessionalSidebar from './ProfessionalSidebar';
import ProfessionalMainDashboard from './ProfessionalMainDashboard';
import MaterialDesignSystem, {
  MaterialColors,
  MaterialSpacing,
  MaterialTypography,
  MaterialElevation,
  MaterialBorderRadius,
  MaterialComponentSizes,
  MaterialDarkTheme,
  MaterialTransitions,
  MaterialBreakpoints,
} from '../styles/MaterialDesignSystem';

interface ProfessionalDashboardIntegratedProps {
  defaultCollapsed?: boolean;
}

const ProfessionalDashboardIntegrated: React.FC<ProfessionalDashboardIntegratedProps> = ({
  defaultCollapsed = false,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [miningActive, setMiningActive] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState('dashboard');

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
  };

  const handleMenuSelect = (key: string) => {
    setSelectedMenuKey(key);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-surface" style={{ 
      backgroundColor: MaterialDarkTheme.background.default,
    }}>
      {/* Professional Sidebar */}
      <ProfessionalSidebar
        collapsed={sidebarCollapsed}
        onCollapse={handleSidebarCollapse}
        miningActive={miningActive}
        onMiningToggle={handleMiningToggle}
        selectedKey={selectedMenuKey}
        onMenuSelect={handleMenuSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1" style={{ 
        marginLeft: sidebarCollapsed ? 0 : 0,
        transition: `all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard}`,
      }}>
        <main style={{ 
          backgroundColor: MaterialDarkTheme.background.default,
          overflow: 'hidden',
        }}>
          <ProfessionalMainDashboard />
        </main>
      </div>

      {/* Responsive Design CSS */}
      <style>{`
        @media (max-width: ${MaterialBreakpoints.md}) {
          .professional-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1001;
          }
          
          .professional-sidebar.collapsed {
            left: -80px !important;
          }
          
          .main-content {
            margin-left: 0 !important;
          }
        }
        
        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${MaterialDarkTheme.background.surface};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${MaterialDarkTheme.border.default};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${MaterialDarkTheme.text.tertiary};
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, box-shadow, transform;
          transition-duration: ${MaterialTransitions.duration.short};
          transition-timing-function: ${MaterialTransitions.easing.standard};
        }
        
        /* Focus styles for accessibility */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid ${MaterialColors.primary[60]};
          outline-offset: 2px;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .card {
            border-width: 2px;
          }
          
          .button {
            border-width: 2px;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalDashboardIntegrated;

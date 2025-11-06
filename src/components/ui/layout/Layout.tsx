import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils/validation/cn';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  fullHeight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  className,
  showHeader = true,
  showFooter = true,
  fullHeight = true,
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      {showHeader && <Header />}
      
      <main className={cn('flex-1', fullHeight && 'min-h-screen')}>
        <Outlet />
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
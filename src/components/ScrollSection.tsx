/**
 * Enhanced Scroll Section Component
 * Wraps sections with scroll-triggered animations
 */

import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

interface ScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;
}

export const ScrollSection: React.FC<ScrollSectionProps> = ({ 
  children, 
  className = '',
  animation = 'fade-up',
  delay = 0
}) => {
  const ref = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={`scroll-animate scroll-${animation} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollSection;

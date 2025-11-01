/**
 * Main Navigation Component
 * Reusable navigation with all pages including Neural Network and SEO Content Generator
 */

import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Trophy,
  Globe,
  FlaskConical,
  Brain,
} from 'lucide-react';
import NeuralNetworkPage from '../pages/NeuralNetworkPage';
import SEOContentGeneratorPage from '../pages/SEOContentGeneratorPage';

export interface NavigationItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

export const mainNavigationItems: NavigationItem[] = [
  {
    key: 'overview',
    label: (
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        <span>Overview</span>
      </div>
    ),
    children: null, // This will be rendered by the parent component
  },
  {
    key: 'seo',
    label: (
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4" />
        <span>SEO Generator</span>
      </div>
    ),
    children: <SEOContentGeneratorPage />,
  },
  {
    key: 'rewards',
    label: (
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        <span>Blockchain Rewards</span>
      </div>
    ),
    children: null, // Placeholder for future implementation
  },
  {
    key: 'metaverse',
    label: (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>Metaverse Portal</span>
      </div>
    ),
    children: null, // Placeholder for future implementation
  },
  {
    key: 'automation',
    label: (
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4" />
        <span>Automation Workflows</span>
      </div>
    ),
    children: null, // Placeholder for future implementation
  },
  {
    key: 'tensorflow',
    label: (
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4" />
        <span>Neural Networks</span>
      </div>
    ),
    children: <NeuralNetworkPage />,
  },
];

export default mainNavigationItems;

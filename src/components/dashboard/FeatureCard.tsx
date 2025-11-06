/**
 * Feature Card Component
 * Displays a feature with lock status based on user's plan
 */

import React from 'react';
import { Lock } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  requiresPlan?: string;
}

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  const Icon = feature.icon;

  return (
    <div 
      className={`feature-card ${!feature.enabled ? 'disabled' : ''}`}
      onClick={feature.enabled ? onClick : undefined}
    >
      <div className="feature-icon">
        <Icon size={32} />
      </div>
      <h3 className="feature-name">{feature.name}</h3>
      {!feature.enabled && (
        <div className="feature-locked">
          <Lock size={16} />
          <span>Requires {feature.requiresPlan} plan</span>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;



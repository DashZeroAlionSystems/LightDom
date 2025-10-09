/**
 * Upgrade Prompt Component
 * Shows upgrade benefits to free users
 */

import React from 'react';
import { Zap, Check, Crown, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  currentPlan: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ currentPlan }) => {
  const proBenefits = [
    '100 optimizations per month',
    'Advanced analytics dashboard',
    'API access for automation',
    'Space mining features',
    'Priority support'
  ];

  const enterpriseBenefits = [
    'Unlimited optimizations',
    'Team collaboration tools',
    'Custom automation workflows',
    'Dedicated account manager',
    'Custom integrations'
  ];

  return (
    <div className="upgrade-prompt">
      <div className="upgrade-header">
        <Sparkles className="upgrade-icon" />
        <h3>Unlock More Power</h3>
      </div>
      
      <div className="upgrade-plans">
        <div className="upgrade-plan pro">
          <div className="plan-header">
            <Zap className="plan-icon" />
            <h4>Pro Plan</h4>
            <div className="plan-price">$29/month</div>
          </div>
          <ul className="plan-benefits">
            {proBenefits.map((benefit, index) => (
              <li key={index}>
                <Check size={16} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <button 
            className="upgrade-btn primary"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade to Pro
          </button>
        </div>

        <div className="upgrade-plan enterprise">
          <div className="plan-badge">Most Popular</div>
          <div className="plan-header">
            <Crown className="plan-icon" />
            <h4>Enterprise Plan</h4>
            <div className="plan-price">Custom pricing</div>
          </div>
          <ul className="plan-benefits">
            {enterpriseBenefits.map((benefit, index) => (
              <li key={index}>
                <Check size={16} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <button 
            className="upgrade-btn secondary"
            onClick={() => window.location.href = '/contact-sales'}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;



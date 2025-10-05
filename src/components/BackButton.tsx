import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack, className = '' }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`discord-btn discord-btn-secondary ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--discord-spacing-sm)' }}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
};

export default BackButton;

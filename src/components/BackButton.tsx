import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
  className?: string;
}

/**
 * BackButton - Reusable back button component
 */
const BackButton: React.FC<BackButtonProps> = ({ onBack, className = '' }) => {
  return (
    <button
      onClick={onBack}
      className={`discord-btn discord-btn-secondary ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </button>
  );
};

export default BackButton;



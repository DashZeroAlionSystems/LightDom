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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-md hover:shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors ${className}`}
    >
      <ArrowLeft size={16} />
      <span className="font-medium">Back</span>
    </button>
  );
};

export default BackButton;

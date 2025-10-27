import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../../../src/components/ui/admin/AdminDashboard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard onBack={handleBack} />
    </div>
  );
};

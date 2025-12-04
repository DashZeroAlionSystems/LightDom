import React from 'react';
import { Header } from '../organisms/Header/Header';

interface LandingTemplateProps {
  children: React.ReactNode;
  showCTA?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const LandingTemplate: React.FC<LandingTemplateProps> = ({
  children,
  showCTA = true,
  user,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header
        showSearch={false}
        notificationCount={0}
        user={user}
      />
      <main className="pt-16">
        {children}
      </main>
      {showCTA && (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">Join thousands of users already using our platform.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started Free
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

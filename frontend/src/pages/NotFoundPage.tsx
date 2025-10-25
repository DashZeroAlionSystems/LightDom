import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Link to="/" className="px-6 py-3 bg-gradient-exodus rounded-xl font-semibold hover:opacity-90 transition-opacity inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
};

/**
 * Analytics Page - Performance Analytics and Reports
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white m-0">
          Analytics
        </h1>
        <p className="text-gray-400 mt-2">
          Detailed performance analytics and reports
        </p>
      </div>

      <Card className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
        <CardContent className="space-y-6">
          <BarChart3 className="h-16 w-16 text-blue-400 mx-auto" />
          <h2 className="text-xl font-semibold text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-400">
            Comprehensive performance analytics and reporting features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;

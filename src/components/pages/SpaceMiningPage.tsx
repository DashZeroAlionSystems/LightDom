/**
 * Space Mining Page - DOM Space Optimization
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Rocket } from 'lucide-react';

const SpaceMiningPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white m-0">
          Space Mining
        </h1>
        <p className="text-gray-400 mt-2">
          DOM space optimization and mining operations
        </p>
      </div>

      <Card className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
        <CardContent className="space-y-6">
          <Rocket className="h-16 w-16 text-purple-400 mx-auto" />
          <h2 className="text-xl font-semibold text-white">
            Space Mining Features
          </h2>
          <p className="text-gray-400">
            Advanced DOM space optimization and mining operations coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpaceMiningPage;

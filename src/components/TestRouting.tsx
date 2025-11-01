/**
 * Test Routing Component - Simple verification component
 */

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

const TestRouting: React.FC = () => {
  useEffect(() => {
    console.log('✅ TestRouting component mounted successfully!');
    document.title = '✅ ROUTING TEST - LightDom Dashboard';
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-900">
      <Card className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white text-center">
            ✅ Routing Test Successful!
          </h2>
          <p className="text-gray-400 text-center mb-4">
            This component confirms that the routing is working correctly.
          </p>
          <div className="bg-purple-600 text-white p-3 rounded-lg text-center font-bold">
            Enhanced Professional Dashboard is Loading
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Check the browser console for debugging messages
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRouting;

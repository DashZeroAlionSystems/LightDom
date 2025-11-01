/**
 * Simple Test Dashboard
 * Minimal component to test rendering
 */

import React from 'react';

const SimpleTestDashboard: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>LightDom Desktop Dashboard</h1>
      <p>Test dashboard is working!</p>
      <div style={{ 
        backgroundColor: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Mining Stats</h2>
        <p>Hash Rate: 2500 MH/s</p>
        <p>Earnings: $45.67</p>
        <p>Efficiency: 87%</p>
      </div>
    </div>
  );
};

export default SimpleTestDashboard;

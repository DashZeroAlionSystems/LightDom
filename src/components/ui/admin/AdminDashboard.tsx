/**
 * Admin Dashboard Component - Simplified Test Version
 */

import React from 'react';

const AdminDashboard: React.FC = () => {
  console.log('AdminDashboard rendering - SIMPLIFIED VERSION');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f0f0', 
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Test element to verify component is rendering */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        ✅ ADMIN DASHBOARD IS LOADING
      </div>
      
      <h1 style={{ color: 'blue', fontSize: '32px' }}>ADMIN DASHBOARD</h1>
      <p style={{ fontSize: '18px' }}>If you can see this, the admin dashboard is working!</p>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Sidebar Test</h2>
        <p>This is a simplified version to test if the component renders.</p>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            background: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
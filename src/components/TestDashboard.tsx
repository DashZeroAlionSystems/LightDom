/**
 * Simple Test Dashboard - Just to verify routing works
 */

import React from 'react';

const TestDashboard: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: '#ffffff',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#7c3aed', fontSize: '48px', marginBottom: '20px' }}>
        🚀 Test Dashboard Working!
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '40px' }}>
        If you can see this, the routing is working correctly.
      </p>
      
      <div style={{
        backgroundColor: '#1f2937',
        padding: '30px',
        borderRadius: '12px',
        border: '1px solid #374151',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '15px' }}>✅ Success!</h2>
        <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
          The basic React component is rendering. This means:<br/>
          • The development server is working<br/>
          • The routing is working<br/>
          • The App.tsx is correctly configured<br/>
          • Now we can add the beautiful dashboard components
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#7c3aed', marginBottom: '10px' }}>📊 Overview</h3>
          <p style={{ color: '#d1d5db' }}>Dashboard statistics and metrics</p>
        </div>
        
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#10b981', marginBottom: '10px' }}>🤖 SEO</h3>
          <p style={{ color: '#d1d5db' }}>Content generation and optimization</p>
        </div>
        
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#f59e0b', marginBottom: '10px' }}>💎 Blockchain</h3>
          <p style={{ color: '#d1d5db' }}>Rewards and staking management</p>
        </div>
        
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#3b82f6', marginBottom: '10px' }}>🌐 Metaverse</h3>
          <p style={{ color: '#d1d5db' }}>Virtual worlds and chat nodes</p>
        </div>
        
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#7c3aed', marginBottom: '10px' }}>⚡ Automation</h3>
          <p style={{ color: '#d1d5db' }}>Workflow management and tasks</p>
        </div>
        
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>🧠 TensorFlow</h3>
          <p style={{ color: '#d1d5db' }}>Model training and deployment</p>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#374151',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', margin: 0 }}>
          Test Dashboard - Basic routing verification ✅
        </p>
      </div>
    </div>
  );
};

export default TestDashboard;

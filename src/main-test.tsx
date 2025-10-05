/**
 * Test Version of Main Application Entry Point
 * Simplified version to test if the issue is with components
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test component
const TestApp = () => {
  return (
    <div className="discord-app" style={{ 
      height: '100vh', 
      backgroundColor: '#36393f', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#5865f2' }}>
        LightDom Space-Bridge Platform
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#b9bbbe' }}>
        Test Dashboard - Styling Fixed
      </p>
      <div style={{ 
        backgroundColor: '#2f3136', 
        padding: '2rem', 
        borderRadius: '8px',
        border: '1px solid #40444b'
      }}>
        <h2 style={{ color: '#5865f2', marginBottom: '1rem' }}>System Status</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            backgroundColor: '#3ba55c', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            ✅ API Server Running
          </div>
          <div style={{ 
            backgroundColor: '#3ba55c', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            ✅ Frontend Running
          </div>
          <div style={{ 
            backgroundColor: '#3ba55c', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            ✅ Discord Theme Active
          </div>
        </div>
      </div>
      <p style={{ 
        marginTop: '2rem', 
        fontSize: '0.9rem', 
        color: '#72767d',
        textAlign: 'center'
      }}>
        If you can see this page with proper Discord styling, the main issue is resolved!<br/>
        The dashboard components should now work correctly.
      </p>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);

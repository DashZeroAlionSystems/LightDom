/**
 * Exodus Test Dashboard - To verify the original styling works
 */

import React from 'react';

const ExodusTest: React.FC = () => {
  const Colors = {
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    surface: '#1f2937',
    surfaceLight: '#374151',
    background: '#111827',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
    gradients: {
      primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      secondary: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.background,
      color: Colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px'
    }}>
      <div style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          background: Colors.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          🚀 Exodus Dashboard Test
        </h1>
        <p style={{ color: Colors.textSecondary, fontSize: '18px' }}>
          If you can see this with the gradient title, the Exodus styling is working!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: Colors.primary,
            marginBottom: '8px'
          }}>
            15,420
          </div>
          <div style={{ color: Colors.textSecondary, marginBottom: '12px' }}>
            Total Users
          </div>
          <div style={{
            height: '8px',
            background: Colors.border,
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              height: '100%',
              width: '67%',
              background: Colors.gradients.success
            }} />
          </div>
          <div style={{ color: Colors.textTertiary, fontSize: '12px' }}>
            +23.5% from last month
          </div>
        </div>

        <div style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: Colors.success,
            marginBottom: '8px'
          }}>
            8,932
          </div>
          <div style={{ color: Colors.textSecondary, marginBottom: '12px' }}>
            Active Users
          </div>
          <div style={{
            height: '8px',
            background: Colors.border,
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              height: '100%',
              width: '57.9%',
              background: Colors.gradients.primary
            }} />
          </div>
          <div style={{ color: Colors.textTertiary, fontSize: '12px' }}>
            57.9% of total users
          </div>
        </div>

        <div style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: Colors.warning,
            marginBottom: '8px'
          }}>
            $2.8M
          </div>
          <div style={{ color: Colors.textSecondary, marginBottom: '12px' }}>
            Revenue
          </div>
          <div style={{
            height: '8px',
            background: Colors.border,
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              height: '100%',
              width: '82.3%',
              background: Colors.gradients.warning
            }} />
          </div>
          <div style={{ color: Colors.textTertiary, fontSize: '12px' }}>
            +18.2% growth rate
          </div>
        </div>
      </div>

      <div style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        borderRadius: '16px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: Colors.text,
          marginBottom: '16px'
        }}>
          ✅ Exodus Styling Confirmed
        </h2>
        <p style={{ color: Colors.textSecondary, lineHeight: '1.6' }}>
          This test confirms that:<br/>
          • The gradient text effect is working<br/>
          • The color system is properly applied<br/>
          • The card styling and borders are correct<br/>
          • The progress bars with gradients are working<br/>
          • The overall Exodus design system is functional
        </p>
      </div>
    </div>
  );
};

export default ExodusTest;

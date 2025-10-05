/**
 * Simplified Dashboard for LightDom
 * Basic Discord-style layout without complex components
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  HardDrive, 
  Coins, 
  Award, 
  Play, 
  Pause,
  Star,
  Map,
  TrendingUp,
  Wallet
} from 'lucide-react';

interface SimpleDashboardProps {
  className?: string;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ className = '' }) => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [stats, setStats] = useState({
    optimizations: 1247,
    spaceSaved: 456789,
    tokensEarned: 12345,
    rank: 42
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`discord-app ${className}`} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="discord-header" style={{ 
        height: '48px',
        backgroundColor: '#36393f',
        borderBottom: '1px solid #40444b',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}>
        <h1 style={{ 
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          margin: 0
        }}>
          LightDom Space-Bridge Platform
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#3ba55c' 
          }} />
          <span style={{ fontSize: '12px', color: '#b9bbbe' }}>Online</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="discord-content" style={{ 
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        backgroundColor: '#36393f'
      }}>
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#2f3136',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #40444b',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={20} style={{ color: '#5865f2' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Optimizations
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5865f2', margin: 0 }}>
              {stats.optimizations}
            </div>
          </div>

          <div style={{
            backgroundColor: '#2f3136',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #40444b',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HardDrive size={20} style={{ color: '#3ba55c' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Space Saved
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3ba55c', margin: 0 }}>
              {formatBytes(stats.spaceSaved)}
            </div>
          </div>

          <div style={{
            backgroundColor: '#2f3136',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #40444b',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coins size={20} style={{ color: '#faa81a' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tokens Earned
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#faa81a', margin: 0 }}>
              {stats.tokensEarned.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#2f3136',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #40444b',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={20} style={{ color: '#00b0f4' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rank
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00b0f4', margin: 0 }}>
              #{stats.rank}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div style={{
          backgroundColor: '#2f3136',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #40444b',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 16px 0'
          }}>
            Crawler Control
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsCrawling(!isCrawling)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '8px',
                backgroundColor: isCrawling ? '#ed4245' : '#3ba55c',
                color: 'white'
              }}
            >
              {isCrawling ? <Pause size={16} /> : <Play size={16} />}
              {isCrawling ? 'Stop' : 'Start'} Crawling
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#2f3136',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #40444b'
        }}>
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 16px 0'
          }}>
            Quick Actions
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <button
              onClick={() => window.location.href = '/space-mining'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#5865f2',
                color: 'white'
              }}
            >
              <Star size={16} />
              Space Mining Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/metaverse-mining'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#40444b',
                color: '#ffffff'
              }}
            >
              <Map size={16} />
              Metaverse Mining
            </button>
            <button
              onClick={() => window.location.href = '/optimization'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#40444b',
                color: '#ffffff'
              }}
            >
              <TrendingUp size={16} />
              Space Optimization
            </button>
            <button
              onClick={() => window.location.href = '/wallet'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: '#40444b',
                color: '#ffffff'
              }}
            >
              <Wallet size={16} />
              Wallet Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;

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
  Wallet,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface SimpleDashboardProps {
  className?: string;
}

interface RealStats {
  optimizations: number;
  spaceSaved: number;
  tokensEarned: number;
  rank: number;
  crawledUrls: number;
  activeBridges: number;
  totalSpace: number;
  usedSpace: number;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ className = '' }) => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [stats, setStats] = useState<RealStats>({
    optimizations: 0,
    spaceSaved: 0,
    tokensEarned: 0,
    rank: 0,
    crawledUrls: 0,
    activeBridges: 0,
    totalSpace: 0,
    usedSpace: 0
  });

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRealData = async () => {
    setIsLoading(true);
    try {
      // Check API health
      const healthResponse = await axios.get('http://localhost:3001/api/health');
      setApiStatus(healthResponse.data.status === 'ok' ? 'online' : 'offline');

      // Fetch real stats
      const [statsResponse, bridgeResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/stats').catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:3001/api/bridge/analytics').catch(() => ({ data: { data: {} } }))
      ]);

      const apiStats = statsResponse.data.data || {};
      const bridgeStats = bridgeResponse.data.data || {};

      setStats({
        optimizations: apiStats.totalOptimizations || 0,
        spaceSaved: apiStats.totalSpace || 0,
        tokensEarned: apiStats.totalTokens || 0,
        rank: apiStats.userRank || 0,
        crawledUrls: apiStats.crawledUrls || 0,
        activeBridges: bridgeStats.operationalBridges || 0,
        totalSpace: bridgeStats.totalSpace || 0,
        usedSpace: bridgeStats.usedSpace || 0
      });
    } catch (error) {
      console.error('Failed to fetch real data:', error);
      setApiStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        /* Discord Theme Inline Styles */
        .discord-app {
          display: flex;
          height: 100vh;
          background-color: #36393f;
          color: #ffffff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .discord-header {
          height: 48px;
          background-color: #36393f;
          border-bottom: 1px solid #40444b;
          display: flex;
          align-items: center;
          padding: 0 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .discord-content {
          flex: 1;
          overflow: auto;
          padding: 16px;
          background-color: #36393f;
        }
        
        .discord-card {
          background-color: #2f3136;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #40444b;
          margin-bottom: 16px;
        }
        
        .discord-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }
        
        .discord-button-primary {
          background-color: #5865f2;
        }
        
        .discord-button-primary:hover {
          background-color: #4752c4;
        }
        
        .discord-button-secondary {
          background-color: #40444b;
        }
        
        .discord-button-secondary:hover {
          background-color: #4f545c;
        }
      `}</style>
      
      <div className="discord-app"
        style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#36393f',
          color: '#ffffff',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
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
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            marginRight: '16px',
            background: 'none',
            border: '1px solid #40444b',
            borderRadius: '4px',
            color: '#b9bbbe',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#40444b';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#b9bbbe';
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        
        <h1 style={{ 
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          margin: 0
        }}>
          LightDom Space-Bridge Platform
        </h1>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={fetchRealData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              background: 'none',
              border: '1px solid #40444b',
              borderRadius: '4px',
              color: '#b9bbbe',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#40444b';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#b9bbbe';
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {apiStatus === 'checking' ? (
              <>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#faa61a',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
                <span style={{ fontSize: '12px', color: '#b9bbbe' }}>Checking...</span>
              </>
            ) : apiStatus === 'online' ? (
              <>
                <CheckCircle size={16} style={{ color: '#3ba55c' }} />
                <span style={{ fontSize: '12px', color: '#3ba55c' }}>API Online</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} style={{ color: '#ed4245' }} />
                <span style={{ fontSize: '12px', color: '#ed4245' }}>API Offline</span>
              </>
            )}
          </div>
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
          <div className="discord-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={20} style={{ color: '#5865f2' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Optimizations
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5865f2', margin: 0 }}>
              {isLoading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                stats.optimizations.toLocaleString()
              )}
            </div>
          </div>

          <div className="discord-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HardDrive size={20} style={{ color: '#3ba55c' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Space Saved
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3ba55c', margin: 0 }}>
              {isLoading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                formatBytes(stats.spaceSaved)
              )}
            </div>
          </div>

          <div className="discord-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coins size={20} style={{ color: '#faa81a' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tokens Earned
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#faa61a', margin: 0 }}>
              {isLoading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                `${stats.tokensEarned.toLocaleString()} LDOM`
              )}
            </div>
          </div>

          <div className="discord-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={20} style={{ color: '#00b0f4' }} />
              <span style={{ fontSize: '12px', color: '#b9bbbe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Rank
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00b0f4', margin: 0 }}>
              {isLoading ? (
                <span style={{ opacity: 0.5 }}>...</span>
              ) : (
                stats.rank > 0 ? `#${stats.rank}` : 'Unranked'
              )}
            </div>
          </div>
        </div>

        {/* Bridge Stats */}
        <div className="discord-card">
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Map size={20} />
            Bridge Network Status
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '4px' }}>Active Bridges</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#3ba55c' }}>
                {isLoading ? '...' : stats.activeBridges}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '4px' }}>Total Space</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#5865f2' }}>
                {isLoading ? '...' : formatBytes(stats.totalSpace)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '4px' }}>Space Used</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#faa61a' }}>
                {isLoading ? '...' : formatBytes(stats.usedSpace)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#b9bbbe', marginBottom: '4px' }}>Utilization</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#00b0f4' }}>
                {isLoading ? '...' : stats.totalSpace > 0 ? `${Math.round((stats.usedSpace / stats.totalSpace) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="discord-card">
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
        <div className="discord-card">
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
    </>
  );
};

export default SimpleDashboard;

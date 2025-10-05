import React from 'react';

/**
 * SimpleDashboard - Main landing dashboard
 * Displays overview of the LightDom Space-Bridge Platform
 */
const SimpleDashboard: React.FC = () => {
  return (
    <div className="discord-content">
      <div className="discord-card">
        <h1 className="discord-heading">🚀 LightDom Space-Bridge Platform</h1>
        <p className="discord-text">
          Welcome to the LightDom Space-Bridge Platform - A blockchain-based DOM optimization ecosystem
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="discord-card">
            <h3 className="discord-subheading">🌐 Space Mining</h3>
            <p className="discord-text-secondary">Mine DOM space from websites and earn rewards</p>
          </div>
          
          <div className="discord-card">
            <h3 className="discord-subheading">🔗 Metaverse Integration</h3>
            <p className="discord-text-secondary">Connect to the metaverse mining network</p>
          </div>
          
          <div className="discord-card">
            <h3 className="discord-subheading">⚡ Optimization Engine</h3>
            <p className="discord-text-secondary">Optimize DOM structures for performance</p>
          </div>
          
          <div className="discord-card">
            <h3 className="discord-subheading">💰 Blockchain Wallet</h3>
            <p className="discord-text-secondary">Manage your crypto assets and tokens</p>
          </div>
          
          <div className="discord-card">
            <h3 className="discord-subheading">🕷️ Web Crawler</h3>
            <p className="discord-text-secondary">Crawl and analyze websites automatically</p>
          </div>
          
          <div className="discord-card">
            <h3 className="discord-subheading">📊 Analytics</h3>
            <p className="discord-text-secondary">View real-time system statistics</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="discord-subheading mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="discord-stat">
              <div className="discord-stat-value">380</div>
              <div className="discord-stat-label">URLs Crawled</div>
            </div>
            <div className="discord-stat">
              <div className="discord-stat-value">1,900</div>
              <div className="discord-stat-label">URLs Discovered</div>
            </div>
            <div className="discord-stat">
              <div className="discord-stat-value">15+</div>
              <div className="discord-stat-label">Dashboards</div>
            </div>
            <div className="discord-stat">
              <div className="discord-stat-value">70%</div>
              <div className="discord-stat-label">Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;



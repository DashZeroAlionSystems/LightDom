/**
 * Database Monitor Component
 * Database health, queries, and performance monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Database,
  Activity,
  Clock,
  HardDrive,
  Zap,
  AlertTriangle,
  TrendingUp,
  Server
} from 'lucide-react';

const DatabaseMonitor: React.FC = () => {
  const [dbStats, setDbStats] = useState({
    connections: {
      active: 15,
      idle: 10,
      max: 100
    },
    performance: {
      avgQueryTime: 45,
      slowQueries: 3,
      queriesPerSecond: 125
    },
    storage: {
      used: 2.4,
      total: 10,
      tables: 24,
      indexes: 48
    }
  });

  const slowQueries = [
    {
      id: '1',
      query: 'SELECT * FROM optimizations WHERE user_id = $1 ORDER BY created_at DESC',
      time: 1250,
      calls: 450,
      avgTime: 125
    },
    {
      id: '2',
      query: 'UPDATE users SET reputation_score = reputation_score + $1 WHERE id = $2',
      time: 850,
      calls: 120,
      avgTime: 85
    },
    {
      id: '3',
      query: 'SELECT COUNT(*) FROM blockchain_events WHERE created_at > NOW() - INTERVAL \'24 hours\'',
      time: 650,
      calls: 60,
      avgTime: 65
    }
  ];

  const tableStats = [
    { name: 'users', rows: 2150, size: '125 MB', lastVacuum: '2 hours ago' },
    { name: 'optimizations', rows: 45280, size: '850 MB', lastVacuum: '1 day ago' },
    { name: 'blockchain_events', rows: 125600, size: '1.2 GB', lastVacuum: '3 hours ago' },
    { name: 'metaverse_infrastructure', rows: 850, size: '45 MB', lastVacuum: '1 week ago' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDbStats(prev => ({
        connections: {
          ...prev.connections,
          active: 10 + Math.floor(Math.random() * 20)
        },
        performance: {
          ...prev.performance,
          queriesPerSecond: 100 + Math.floor(Math.random() * 50)
        },
        storage: prev.storage
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const connectionUsagePercent = (dbStats.connections.active / dbStats.connections.max) * 100;
  const storageUsagePercent = (dbStats.storage.used / dbStats.storage.total) * 100;

  return (
    <div className="database-monitor">
      {/* Connection Pool */}
      <div className="db-section">
        <h3>Connection Pool</h3>
        <div className="connection-stats">
          <div className="connection-overview">
            <div className="connection-meter">
              <div className="meter-label">Active Connections</div>
              <div className="meter-bar">
                <div 
                  className="meter-fill"
                  style={{ 
                    width: `${connectionUsagePercent}%`,
                    backgroundColor: connectionUsagePercent > 80 ? '#ef4444' : '#22c55e'
                  }}
                />
              </div>
              <div className="meter-values">
                <span>{dbStats.connections.active} / {dbStats.connections.max}</span>
                <span>{connectionUsagePercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="connection-details">
            <div className="detail-card">
              <Activity size={20} />
              <div>
                <span className="detail-value">{dbStats.connections.active}</span>
                <span className="detail-label">Active</span>
              </div>
            </div>
            <div className="detail-card">
              <Clock size={20} />
              <div>
                <span className="detail-value">{dbStats.connections.idle}</span>
                <span className="detail-label">Idle</span>
              </div>
            </div>
            <div className="detail-card">
              <Server size={20} />
              <div>
                <span className="detail-value">{dbStats.connections.max}</span>
                <span className="detail-label">Max Pool</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="db-section">
        <h3>Performance Metrics</h3>
        <div className="performance-grid">
          <div className="perf-card">
            <div className="perf-icon">
              <Zap size={24} />
            </div>
            <div className="perf-content">
              <div className="perf-value">{dbStats.performance.avgQueryTime}ms</div>
              <div className="perf-label">Avg Query Time</div>
            </div>
          </div>
          
          <div className="perf-card warning">
            <div className="perf-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="perf-content">
              <div className="perf-value">{dbStats.performance.slowQueries}</div>
              <div className="perf-label">Slow Queries</div>
            </div>
          </div>
          
          <div className="perf-card">
            <div className="perf-icon">
              <TrendingUp size={24} />
            </div>
            <div className="perf-content">
              <div className="perf-value">{dbStats.performance.queriesPerSecond}</div>
              <div className="perf-label">Queries/Second</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slow Queries */}
      <div className="db-section">
        <h3>Slow Queries</h3>
        <div className="slow-queries-table">
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th>Total Time</th>
                <th>Calls</th>
                <th>Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {slowQueries.map(query => (
                <tr key={query.id}>
                  <td className="query-text">
                    <code>{query.query.substring(0, 60)}...</code>
                  </td>
                  <td>{query.time}ms</td>
                  <td>{query.calls}</td>
                  <td>{query.avgTime}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage */}
      <div className="db-section">
        <h3>Storage Usage</h3>
        <div className="storage-overview">
          <div className="storage-meter">
            <div className="meter-label">Database Size</div>
            <div className="meter-bar large">
              <div 
                className="meter-fill"
                style={{ 
                  width: `${storageUsagePercent}%`,
                  backgroundColor: storageUsagePercent > 80 ? '#ef4444' : '#3b82f6'
                }}
              />
            </div>
            <div className="meter-values">
              <span>{dbStats.storage.used}GB / {dbStats.storage.total}GB</span>
              <span>{storageUsagePercent.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="storage-stats">
            <div className="stat-item">
              <Database size={20} />
              <span>{dbStats.storage.tables} Tables</span>
            </div>
            <div className="stat-item">
              <HardDrive size={20} />
              <span>{dbStats.storage.indexes} Indexes</span>
            </div>
          </div>
        </div>

        <div className="table-stats">
          <h4>Table Statistics</h4>
          <table>
            <thead>
              <tr>
                <th>Table</th>
                <th>Rows</th>
                <th>Size</th>
                <th>Last Vacuum</th>
              </tr>
            </thead>
            <tbody>
              {tableStats.map(table => (
                <tr key={table.name}>
                  <td>{table.name}</td>
                  <td>{table.rows.toLocaleString()}</td>
                  <td>{table.size}</td>
                  <td>{table.lastVacuum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMonitor;



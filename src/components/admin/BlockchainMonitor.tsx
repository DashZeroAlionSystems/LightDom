/**
 * Blockchain Monitor Component
 * Real-time blockchain status and metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  Blocks,
  Activity,
  Cpu,
  Clock,
  Hash,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const BlockchainMonitor: React.FC = () => {
  const [blockchainData, setBlockchainData] = useState({
    currentBlock: 12345,
    gasPrice: 15,
    networkHashRate: '125.4 TH/s',
    difficulty: '2.5M',
    pendingTransactions: 42,
    totalOptimizations: 8542,
    totalLDOMSupply: '1000000',
    circulatingSupply: '250000'
  });

  const recentBlocks = [
    {
      number: 12345,
      hash: '0xabc...def',
      miner: '0x123...789',
      transactions: 15,
      gasUsed: 8500000,
      timestamp: Date.now() - 15000
    },
    {
      number: 12344,
      hash: '0xdef...123',
      miner: '0x456...abc',
      transactions: 23,
      gasUsed: 12000000,
      timestamp: Date.now() - 30000
    },
    {
      number: 12343,
      hash: '0x789...456',
      miner: '0x789...def',
      transactions: 8,
      gasUsed: 5000000,
      timestamp: Date.now() - 45000
    }
  ];

  const contracts = [
    {
      name: 'LightDomToken',
      address: '0x1234567890123456789012345678901234567890',
      type: 'ERC20',
      status: 'verified',
      balance: '750000 LDOM'
    },
    {
      name: 'ProofOfOptimization',
      address: '0x0987654321098765432109876543210987654321',
      type: 'Custom',
      status: 'verified',
      balance: '0 ETH'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainData(prev => ({
        ...prev,
        currentBlock: prev.currentBlock + 1,
        pendingTransactions: Math.floor(Math.random() * 100),
        gasPrice: 15 + Math.floor(Math.random() * 10)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="blockchain-monitor">
      {/* Blockchain Stats */}
      <div className="blockchain-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Blocks size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{blockchainData.currentBlock}</div>
            <div className="stat-label">Current Block</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{blockchainData.gasPrice} Gwei</div>
            <div className="stat-label">Gas Price</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{blockchainData.pendingTransactions}</div>
            <div className="stat-label">Pending Txns</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Hash size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{blockchainData.networkHashRate}</div>
            <div className="stat-label">Hash Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Blocks */}
      <div className="blockchain-section">
        <h3>Recent Blocks</h3>
        <div className="blocks-table">
          <table>
            <thead>
              <tr>
                <th>Block</th>
                <th>Hash</th>
                <th>Miner</th>
                <th>Txns</th>
                <th>Gas Used</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {recentBlocks.map(block => (
                <tr key={block.number}>
                  <td className="block-number">#{block.number}</td>
                  <td className="block-hash">{block.hash}</td>
                  <td className="block-miner">{block.miner}</td>
                  <td>{block.transactions}</td>
                  <td>{(block.gasUsed / 1000000).toFixed(2)}M</td>
                  <td>{Math.floor((Date.now() - block.timestamp) / 1000)}s ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Contracts */}
      <div className="blockchain-section">
        <h3>Deployed Contracts</h3>
        <div className="contracts-grid">
          {contracts.map(contract => (
            <div key={contract.address} className="contract-card">
              <div className="contract-header">
                <h4>{contract.name}</h4>
                <span className={`contract-badge ${contract.status}`}>
                  {contract.status}
                </span>
              </div>
              <div className="contract-details">
                <div className="detail-item">
                  <span>Address:</span>
                  <code>{contract.address.slice(0, 10)}...{contract.address.slice(-8)}</code>
                </div>
                <div className="detail-item">
                  <span>Type:</span>
                  <span>{contract.type}</span>
                </div>
                <div className="detail-item">
                  <span>Balance:</span>
                  <span>{contract.balance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Metrics */}
      <div className="blockchain-section">
        <h3>LDOM Token Metrics</h3>
        <div className="token-metrics">
          <div className="metric-item">
            <DollarSign size={20} />
            <div>
              <span className="metric-label">Total Supply</span>
              <span className="metric-value">{blockchainData.totalLDOMSupply} LDOM</span>
            </div>
          </div>
          <div className="metric-item">
            <TrendingUp size={20} />
            <div>
              <span className="metric-label">Circulating Supply</span>
              <span className="metric-value">{blockchainData.circulatingSupply} LDOM</span>
            </div>
          </div>
          <div className="metric-item">
            <Activity size={20} />
            <div>
              <span className="metric-label">Total Optimizations</span>
              <span className="metric-value">{blockchainData.totalOptimizations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainMonitor;



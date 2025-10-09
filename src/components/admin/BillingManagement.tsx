/**
 * Billing Management Component
 * Admin interface for managing subscriptions and revenue
 */

import React, { useState } from 'react';
import { 
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const BillingManagement: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');
  const [planFilter, setPlanFilter] = useState('all');

  // Mock revenue data
  const revenueStats = {
    mrr: 45280,
    arr: 543360,
    growth: 12.5,
    churn: 2.3,
    arpu: 67.50
  };

  const subscriptionBreakdown = [
    { plan: 'Free', count: 1250, percentage: 62.5, revenue: 0 },
    { plan: 'Pro', count: 650, percentage: 32.5, revenue: 18850 },
    { plan: 'Enterprise', count: 100, percentage: 5, revenue: 26430 }
  ];

  const recentTransactions = [
    {
      id: '1',
      user: 'alice@example.com',
      amount: 29,
      plan: 'Pro',
      type: 'subscription',
      status: 'completed',
      date: new Date().toISOString()
    },
    {
      id: '2',
      user: 'bob@company.com',
      amount: 299,
      plan: 'Enterprise',
      type: 'upgrade',
      status: 'completed',
      date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      user: 'charlie@startup.io',
      amount: -29,
      plan: 'Pro',
      type: 'refund',
      status: 'refunded',
      date: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return (
    <div className="billing-management">
      {/* Revenue Overview */}
      <div className="revenue-overview">
        <div className="revenue-card primary">
          <div className="revenue-icon">
            <DollarSign size={24} />
          </div>
          <div className="revenue-content">
            <div className="revenue-label">Monthly Recurring Revenue</div>
            <div className="revenue-value">${revenueStats.mrr.toLocaleString()}</div>
            <div className="revenue-change positive">
              <TrendingUp size={16} />
              <span>+{revenueStats.growth}%</span>
            </div>
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-icon">
            <Calendar size={24} />
          </div>
          <div className="revenue-content">
            <div className="revenue-label">Annual Run Rate</div>
            <div className="revenue-value">${revenueStats.arr.toLocaleString()}</div>
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-icon">
            <Users size={24} />
          </div>
          <div className="revenue-content">
            <div className="revenue-label">Avg Revenue Per User</div>
            <div className="revenue-value">${revenueStats.arpu.toFixed(2)}</div>
          </div>
        </div>

        <div className="revenue-card warning">
          <div className="revenue-icon">
            <TrendingUp size={24} />
          </div>
          <div className="revenue-content">
            <div className="revenue-label">Churn Rate</div>
            <div className="revenue-value">{revenueStats.churn}%</div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="subscription-section">
        <h3>Subscription Breakdown</h3>
        <div className="subscription-grid">
          {subscriptionBreakdown.map(sub => (
            <div key={sub.plan} className="subscription-card">
              <div className="sub-header">
                <h4>{sub.plan}</h4>
                <span className="sub-count">{sub.count} users</span>
              </div>
              <div className="sub-stats">
                <div className="sub-percentage">
                  <div className="percentage-bar">
                    <div 
                      className="percentage-fill"
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                  <span>{sub.percentage}%</span>
                </div>
                <div className="sub-revenue">
                  ${sub.revenue.toLocaleString()}/mo
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <div className="section-actions">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-secondary btn-sm">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.user}</td>
                  <td className={transaction.amount < 0 ? 'amount negative' : 'amount positive'}>
                    ${Math.abs(transaction.amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${transaction.plan.toLowerCase()}`}>
                      {transaction.plan}
                    </span>
                  </td>
                  <td>{transaction.type}</td>
                  <td>
                    <span className={`status ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{new Date(transaction.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;



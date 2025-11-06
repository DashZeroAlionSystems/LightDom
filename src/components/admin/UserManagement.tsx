/**
 * User Management Component
 * Admin interface for managing users, subscriptions, and permissions
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle,
  XCircle,
  Mail,
  Key,
  Crown,
  Users as UsersIcon
} from 'lucide-react';
import { databaseIntegration } from '../../services/DatabaseIntegration';

interface UserData {
  id: string;
  walletAddress: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  stats: {
    reputation: number;
    optimizations: number;
    spaceSaved: number;
  };
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterPlan, filterStatus]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.subscription.plan === filterPlan);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedUsers)
        })
      });

      if (response.ok) {
        setSelectedUsers(new Set());
        loadUsers();
      }
    } catch (error) {
      console.error(`Failed to perform bulk action:`, error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'free': return 'badge-gray';
      case 'pro': return 'badge-blue';
      case 'enterprise': return 'badge-purple';
      case 'admin': return 'badge-gold';
      default: return 'badge-gray';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'suspended': return 'badge-yellow';
      case 'banned': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2 className="management-title">User Management</h2>
          <div className="user-count">{filteredUsers.length} users</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={filterPlan} 
            onChange={(e) => setFilterPlan(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="admin">Admin</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.size} users selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => handleBulkAction('suspend')}
            >
              Suspend
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                    } else {
                      setSelectedUsers(new Set());
                    }
                  }}
                />
              </th>
              <th>User</th>
              <th>Wallet</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Stats</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="table-loading">Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-empty">No users found</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-info">
                        <div className="user-name">
                          {user.username || 'Anonymous'}
                          {user.role === 'admin' && <Crown size={14} className="admin-icon" />}
                        </div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="wallet-address">
                      {user.walletAddress ? 
                        `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                        '-'
                      }
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getPlanBadgeClass(user.subscription.plan)}`}>
                      {user.subscription.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="user-stats">
                      <div className="stat-item">
                        <span className="stat-label">Rep:</span>
                        <span className="stat-value">{user.stats.reputation}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Opt:</span>
                        <span className="stat-value">{user.stats.optimizations}</span>
                      </div>
                    </div>
                  </td>
                  <td className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="date-cell">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleUserAction('reset-password', user.id)}
                        title="Reset password"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleUserAction('send-email', user.id)}
                        title="Send email"
                      >
                        <Mail size={16} />
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          className="action-btn danger"
                          onClick={() => handleUserAction('suspend', user.id)}
                          title="Suspend user"
                        >
                          <Ban size={16} />
                        </button>
                      ) : (
                        <button 
                          className="action-btn success"
                          onClick={() => handleUserAction('activate', user.id)}
                          title="Activate user"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Summary */}
      <div className="user-summary">
        <div className="summary-item">
          <UsersIcon size={20} />
          <span>Total Users: {users.length}</span>
        </div>
        <div className="summary-item">
          <span className="badge badge-green">Active: {users.filter(u => u.status === 'active').length}</span>
        </div>
        <div className="summary-item">
          <span className="badge badge-blue">Pro: {users.filter(u => u.subscription.plan === 'pro').length}</span>
        </div>
        <div className="summary-item">
          <span className="badge badge-purple">Enterprise: {users.filter(u => u.subscription.plan === 'enterprise').length}</span>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;



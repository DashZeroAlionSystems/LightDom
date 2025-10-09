/**
 * Metaverse Dashboard - Comprehensive view of the dom_space_harvester database
 * Displays space bridges, chat rooms, mining data, and economy metrics
 */

import React, { useState, useEffect } from 'react';
import { dataIntegrationService, IntegratedDashboardData } from '@/services/DataIntegrationService';
import { 
  Database, 
  Globe, 
  MessageSquare, 
  Coins, 
  TrendingUp, 
  Users, 
  Activity, 
  Zap, 
  Shield, 
  BarChart3,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  Link,
  Cpu,
  HardDrive,
  Network,
  Star,
  Award,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';

interface MetaverseStats {
  totalBridges: number;
  activeBridges: number;
  totalSpaceMined: number;
  totalSpaceAvailable: number;
  totalChatRooms: number;
  activeUsers: number;
  totalMessages: number;
  totalRevenue: number;
  averageEfficiency: number;
  lastUpdate: string;
}

interface SpaceBridge {
  id: string;
  bridge_id: string;
  source_url: string;
  source_site_id: string;
  source_chain: string;
  target_chain: string;
  space_available: number;
  space_used: number;
  efficiency: number;
  is_operational: boolean;
  status: string;
  current_volume: number;
  bridge_capacity: number;
  created_at: string;
  last_optimized: string;
  metadata: any;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  owner_address: string;
  total_space: number;
  price: number;
  revenue: number;
  participants: any[];
  coordinates: any;
  primary_bridge_id: string;
  created_at: string;
  expires_at: string;
}

interface BridgeMessage {
  id: string;
  message_id: string;
  bridge_id: string;
  user_name: string;
  user_id: string;
  message_text: string;
  message_type: string;
  created_at: string;
  metadata: any;
}

interface EconomyData {
  total_users: number;
  total_balance: number;
  total_staked: number;
  total_transactions: number;
  total_rewards: number;
  marketplace_listings: number;
  items_sold: number;
}

const MetaverseDashboard: React.FC = () => {
  const [stats, setStats] = useState<MetaverseStats | null>(null);
  const [spaceBridges, setSpaceBridges] = useState<SpaceBridge[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [recentMessages, setRecentMessages] = useState<BridgeMessage[]>([]);
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integratedData, setIntegratedData] = useState<IntegratedDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bridges' | 'chatrooms' | 'economy' | 'analytics'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [bridgeDraft, setBridgeDraft] = useState<Partial<SpaceBridge>>({ source_chain: 'Ethereum', target_chain: 'Metaverse', bridge_capacity: 1000000 } as any);
  const [editingBridge, setEditingBridge] = useState<SpaceBridge | null>(null);
  const [roomDraft, setRoomDraft] = useState<Partial<ChatRoom>>({ id: '', name: '', owner_address: '' } as any);
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);
  const [messageDraft, setMessageDraft] = useState<Partial<BridgeMessage>>({ message_text: '', user_name: '', bridge_id: '' } as any);
  const [selectedBridgeForMessage, setSelectedBridgeForMessage] = useState<string | null>(null);

  // Load metaverse data
  const loadMetaverseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load overview stats
      const statsResponse = await fetch('/api/metaverse/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load space bridges
      const bridgesResponse = await fetch('/api/metaverse/bridges');
      if (bridgesResponse.ok) {
        const bridgesData = await bridgesResponse.json();
        setSpaceBridges(bridgesData);
      }

      // Load chat rooms
      const roomsResponse = await fetch('/api/metaverse/chatrooms');
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setChatRooms(roomsData);
      }

      // Load recent messages
      const messagesResponse = await fetch('/api/metaverse/messages');
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setRecentMessages(messagesData);
      }

      // Load economy data
      const economyResponse = await fetch('/api/metaverse/economy');
      if (economyResponse.ok) {
        const economyData = await economyResponse.json();
        setEconomyData(economyData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metaverse data');
      console.error('Error loading metaverse data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegratedData = async () => {
    try {
      const data = await dataIntegrationService.getIntegratedData();
      setIntegratedData(data);
    } catch (e) {
      console.error('Failed to load integrated data:', e);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    loadMetaverseData();
    loadIntegratedData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMetaverseData();
        loadIntegratedData();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter bridges based on search and status
  const filteredBridges = spaceBridges.filter(bridge => {
    const matchesSearch = searchQuery === '' || 
      bridge.source_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bridge.bridge_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bridge.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter chat rooms based on search
  const filteredChatRooms = chatRooms.filter(room => 
    searchQuery === '' || 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100';
      case 'inactive': return 'text-red-500 bg-red-100';
      case 'maintenance': return 'text-yellow-500 bg-yellow-100';
      case 'upgrading': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  // Get efficiency color
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- Bridges CRUD ---
  const createBridge = async () => {
    try {
      const res = await fetch('/api/metaverse/bridges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bridgeDraft)
      });
      if (!res.ok) throw new Error('Create bridge failed');
      const created = await res.json();
      setSpaceBridges(prev => [created, ...prev]);
      setBridgeDraft({ source_chain: 'Ethereum', target_chain: 'Metaverse', bridge_capacity: 1000000 } as any);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const updateBridge = async (id: string, patch: Partial<SpaceBridge>) => {
    try {
      const res = await fetch(`/api/metaverse/bridge/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error('Update bridge failed');
      const updated = await res.json();
      setSpaceBridges(prev => prev.map(b => b.bridge_id === updated.bridge_id || b.id === updated.id ? { ...b, ...updated } : b));
      setEditingBridge(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const deleteBridge = async (id: string) => {
    if (!confirm('Delete this bridge?')) return;
    try {
      const res = await fetch(`/api/metaverse/bridge/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete bridge failed');
      setSpaceBridges(prev => prev.filter(b => (b.bridge_id || b.id) !== id));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // --- Chat Rooms CRUD ---
  const createRoom = async () => {
    try {
      const payload = { ...roomDraft } as any;
      if (!payload.id || !payload.name || !payload.owner_address) {
        alert('id, name, owner_address are required');
        return;
      }
      const res = await fetch('/api/metaverse/chatrooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Create chat room failed');
      const created = await res.json();
      setChatRooms(prev => [created, ...prev]);
      setRoomDraft({ id: '', name: '', owner_address: '' } as any);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const updateRoom = async (id: string, patch: Partial<ChatRoom>) => {
    try {
      const res = await fetch(`/api/metaverse/chatrooms/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error('Update chat room failed');
      const updated = await res.json();
      setChatRooms(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      setEditingRoom(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this chat room?')) return;
    try {
      const res = await fetch(`/api/metaverse/chatrooms/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete chat room failed');
      setChatRooms(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // --- Messages CRUD ---
  const createMessage = async () => {
    try {
      const payload = { ...messageDraft } as any;
      if (!payload.message_text || !payload.user_name || !payload.bridge_id) {
        alert('message_text, user_name, bridge_id are required');
        return;
      }
      payload.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      payload.message_id = payload.id;
      payload.user_id = payload.user_name; // Simple mapping
      payload.message_type = payload.message_type || 'text';
      payload.metadata = payload.metadata || {};
      const res = await fetch('/api/metaverse/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Create message failed');
      const created = await res.json();
      setRecentMessages(prev => [created, ...prev]);
      setMessageDraft({ message_text: '', user_name: '', bridge_id: '' } as any);
      setSelectedBridgeForMessage(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/metaverse/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete message failed');
      setRecentMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Metaverse Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ld-animate-fade-in" style={{ background: 'var(--ld-gradient-hero)' }}>
      {/* Header */}
      <div className="ld-card ld-card--elevated ld-animate-slide-down" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
        <div className="ld-container ld-container--2xl">
          <div className="ld-flex ld-flex--between ld-flex--center">
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                <div className="ld-flex ld-flex--center" style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: 'var(--ld-radius-lg)', 
                  background: 'var(--ld-gradient-primary)' 
                }}>
                  <Database className="h-5 w-5" style={{ color: 'var(--ld-text-primary)' }} />
                </div>
                <h1 className="ld-text-2xl ld-font-bold ld-text-primary">Metaverse Dashboard</h1>
              </div>
              <div className="ld-text-sm ld-text-secondary">
                Database: dom_space_harvester
                {integratedData && (
                  <div className="ld-flex ld-items--center ld-gap-2 ld-mt-1">
                    <div className={`ld-w-2 ld-h-2 ld-rounded-full ${
                      integratedData.systemHealth === 'excellent' ? 'ld-bg-success' :
                      integratedData.systemHealth === 'good' ? 'ld-bg-success' :
                      integratedData.systemHealth === 'warning' ? 'ld-bg-warning' : 'ld-bg-danger'
                    }`}></div>
                    <span className="ld-text-xs">
                      System: <span className={`ld-font-medium ${
                        integratedData.systemHealth === 'excellent' ? 'ld-text-success' :
                        integratedData.systemHealth === 'good' ? 'ld-text-success' :
                        integratedData.systemHealth === 'warning' ? 'ld-text-warning' : 'ld-text-danger'
                      }`}>
                        {integratedData.systemHealth.charAt(0).toUpperCase() + integratedData.systemHealth.slice(1)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`ld-btn ld-btn--md ld-hover-lift ${autoRefresh ? 'ld-btn--success' : 'ld-btn--secondary'}`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>Auto-refresh</span>
              </button>
              <button
                onClick={() => {
                  loadMetaverseData();
                  loadIntegratedData();
                }}
                className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="ld-toast ld-toast--error" style={{ position: 'relative', top: 0, right: 0, left: 0, maxWidth: 'none', borderRadius: 0, margin: 0 }}>
          <div className="ld-toast__content">
            <div className="ld-toast__body">
              <p className="ld-text-sm ld-font-medium">Error: {error}</p>
              <button 
                onClick={loadMetaverseData}
                className="ld-btn ld-btn--error ld-btn--sm ld-mt-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="ld-container ld-container--2xl ld-py-4">
        <div className="ld-card ld-card--elevated ld-flex ld-animate-slide-up" style={{ gap: 'var(--ld-space-1)', padding: 'var(--ld-space-1)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'bridges', label: 'Space Bridges', icon: Network },
            { id: 'chatrooms', label: 'Chat Rooms', icon: MessageSquare },
            { id: 'economy', label: 'Economy', icon: Coins },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`ld-btn ld-btn--md ld-flex ld-flex--center ld-hover-scale ${
                activeTab === tab.id 
                  ? 'ld-btn--primary'
                  : 'ld-btn--ghost'
              }`}
              style={{ gap: 'var(--ld-space-2)', padding: 'var(--ld-space-2) var(--ld-space-4)' }}
            >
              <tab.icon className="h-4 w-4" />
              <span className="ld-text-sm ld-font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="ld-container ld-container--2xl ld-pb-8">
        {activeTab === 'overview' && (
          <div className="ld-grid ld-grid--gap-lg">
            {/* Stats Grid */}
            {stats && (
              <div className="ld-grid ld-grid--cols-1 ld-grid--cols-2 lg:ld-grid--cols-4 ld-grid--gap-lg">
                <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                  <div className="ld-flex ld-flex--between ld-mb-4">
                    <Network className="ld-text-primary" size={24} />
                    <span className="ld-text-2xl">🌉</span>
                  </div>
                  <div className="ld-text-3xl ld-font-bold ld-text-primary ld-mb-1">
                    {stats.totalBridges}
                  </div>
                  <div className="ld-text-secondary ld-text-sm">Total Bridges</div>
                  <div className="ld-mt-2 ld-text-xs ld-text-muted">
                    {stats.activeBridges} active
                  </div>
                </div>

                <div className="ld-card ld-card--interactive ld-animate-scale-in ld-hover-lift">
                  <div className="ld-flex ld-flex--between ld-mb-4">
                    <HardDrive className="ld-text-success" size={24} />
                    <span className="ld-text-2xl">💾</span>
                  </div>
                  <div className="ld-text-3xl ld-font-bold ld-text-success ld-mb-1">
                    {formatBytes(stats.totalSpaceMined)}
                  </div>
                  <div className="ld-text-secondary ld-text-sm">Space Mined</div>
                  <div className="ld-mt-2 ld-text-xs ld-text-muted">
                    {formatBytes(stats.totalSpaceAvailable)} available
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <MessageSquare className="text-purple-400" size={24} />
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {stats.totalChatRooms}
                  </div>
                  <div className="text-slate-400 text-sm">Chat Rooms</div>
                  <div className="mt-2 text-xs text-slate-500">
                    {stats.activeUsers} active users
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <Coins className="text-yellow-400" size={24} />
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {formatNumber(stats.totalRevenue)}
                  </div>
                  <div className="text-slate-400 text-sm">Total Revenue</div>
                  <div className="mt-2 text-xs text-slate-500">
                    LDOM tokens
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-blue-400" />
                Recent Activity
              </h3>
              {/* Message Creation */}
              <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                  <input 
                    className="bg-slate-600 border border-slate-500 rounded px-2 py-1" 
                    placeholder="User name" 
                    value={(messageDraft as any).user_name || ''} 
                    onChange={e=>setMessageDraft(prev=>({...(prev as any), user_name:e.target.value}))} 
                  />
                  <select 
                    className="bg-slate-600 border border-slate-500 rounded px-2 py-1" 
                    value={(messageDraft as any).bridge_id || ''} 
                    onChange={e=>setMessageDraft(prev=>({...(prev as any), bridge_id:e.target.value}))}
                  >
                    <option value="">Select Bridge</option>
                    {spaceBridges.map(bridge => (
                      <option key={bridge.bridge_id || bridge.id} value={bridge.bridge_id || bridge.id}>
                        {bridge.bridge_id || bridge.id}
                      </option>
                    ))}
                  </select>
                  <input 
                    className="bg-slate-600 border border-slate-500 rounded px-2 py-1" 
                    placeholder="Message text" 
                    value={(messageDraft as any).message_text || ''} 
                    onChange={e=>setMessageDraft(prev=>({...(prev as any), message_text:e.target.value}))} 
                  />
                  <button 
                    onClick={createMessage} 
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {recentMessages.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{message.user_name}</div>
                      <div className="text-xs text-slate-400">{message.message_text}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={()=>deleteMessage(message.id)} 
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        Delete
                      </button>
                      <div className="text-xs text-slate-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bridges' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="text-blue-400" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-400 hover:text-white"
                >
                  {showFilters ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search bridges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="upgrading">Upgrading</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Create Bridge</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm" placeholder="Source chain" value={(bridgeDraft as any).source_chain || ''} onChange={e=>setBridgeDraft(prev=>({...(prev as any), source_chain:e.target.value}))} />
                      <input className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm" placeholder="Target chain" value={(bridgeDraft as any).target_chain || ''} onChange={e=>setBridgeDraft(prev=>({...(prev as any), target_chain:e.target.value}))} />
                      <button onClick={createBridge} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm">Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bridges List */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Network className="text-blue-400" />
                Space Bridges ({filteredBridges.length})
              </h3>
              <div className="space-y-4">
                {filteredBridges.map((bridge) => (
                  <div key={bridge.bridge_id || bridge.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Network className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{bridge.bridge_id || bridge.id}</div>
                          <div className="text-sm text-slate-400">{bridge.source_url || bridge.source_chain + ' → ' + bridge.target_chain}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bridge.status || 'active')}`}>
                          {bridge.status || 'active'}
                        </span>
                        <span className={`text-sm font-medium ${getEfficiencyColor(bridge.efficiency || 0)}`}>
                          {(bridge.efficiency || 0)}% efficiency
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Space Used:</span>
                        <span className="ml-1 font-mono">{formatBytes(bridge.space_used || 0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Space Available:</span>
                        <span className="ml-1 font-mono">{formatBytes(bridge.space_available || 0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Capacity:</span>
                        <span className="ml-1 font-mono">{formatBytes(bridge.bridge_capacity || 0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Volume:</span>
                        <span className="ml-1 font-mono">{formatBytes(bridge.current_volume || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setEditingBridge(bridge)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">Edit</button>
                        <button onClick={()=>deleteBridge(bridge.bridge_id || bridge.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded">Delete</button>
                      </div>
                      <span>Created: {bridge.created_at ? new Date(bridge.created_at).toLocaleDateString() : '-'}</span>
                    </div>

                    {editingBridge && (editingBridge.bridge_id || editingBridge.id) === (bridge.bridge_id || bridge.id) && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" defaultValue={editingBridge.source_chain} onChange={e=>setEditingBridge(prev=>prev?{...prev, source_chain:e.target.value}:prev)} />
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" defaultValue={editingBridge.target_chain} onChange={e=>setEditingBridge(prev=>prev?{...prev, target_chain:e.target.value}:prev)} />
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" placeholder="capacity" defaultValue={editingBridge.bridge_capacity} onChange={e=>setEditingBridge(prev=>prev?{...prev, bridge_capacity: Number(e.target.value)||0}:prev)} />
                        <div className="flex gap-2">
                          <button onClick={()=>updateBridge((bridge.bridge_id || bridge.id), editingBridge)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
                          <button onClick={()=>setEditingBridge(null)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chatrooms' && (
          <div className="space-y-6">
            {/* Chat Rooms List */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="text-purple-400" />
                Chat Rooms ({filteredChatRooms.length})
              </h3>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <input className="bg-slate-700 border border-slate-600 rounded px-3 py-2" placeholder="id" value={(roomDraft as any).id || ''} onChange={e=>setRoomDraft(prev=>({...(prev as any), id:e.target.value}))} />
                <input className="bg-slate-700 border border-slate-600 rounded px-3 py-2" placeholder="name" value={(roomDraft as any).name || ''} onChange={e=>setRoomDraft(prev=>({...(prev as any), name:e.target.value}))} />
                <input className="bg-slate-700 border border-slate-600 rounded px-3 py-2" placeholder="owner address" value={(roomDraft as any).owner_address || ''} onChange={e=>setRoomDraft(prev=>({...(prev as any), owner_address:e.target.value}))} />
                <button onClick={createRoom} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded">Add Room</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChatRooms.map((room) => (
                  <div key={room.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-purple-400" />
                        <div className="font-semibold">{room.name}</div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {room.participants?.length || 0} users
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-300 mb-3">
                      {room.description || 'No description'}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-slate-400">Space:</span>
                        <span className="ml-1 font-mono">{formatBytes(room.total_space)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Price:</span>
                        <span className="ml-1 font-mono">{room.price} LDOM</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Revenue:</span>
                        <span className="ml-1 font-mono">{room.revenue} LDOM</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Owner:</span>
                        <span className="ml-1 font-mono">{room.owner_address.slice(0, 8)}...</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <button onClick={()=>setEditingRoom(room)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">Edit</button>
                        <button onClick={()=>deleteRoom(room.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded">Delete</button>
                      </div>
                      <div className="text-slate-500">Created: {room.created_at ? new Date(room.created_at).toLocaleDateString() : '-'}</div>
                    </div>

                    {editingRoom && editingRoom.id === room.id && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded border border-slate-600 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" defaultValue={editingRoom.name} onChange={e=>setEditingRoom(prev=>prev?{...prev, name:e.target.value}:prev)} />
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" defaultValue={editingRoom.description} onChange={e=>setEditingRoom(prev=>prev?{...prev, description:e.target.value}:prev)} />
                        <input className="bg-slate-700 border border-slate-600 rounded px-2 py-1" placeholder="space" defaultValue={editingRoom.total_space} onChange={e=>setEditingRoom(prev=>prev?{...prev, total_space:Number(e.target.value)||0}:prev)} />
                        <div className="flex gap-2">
                          <button onClick={()=>updateRoom(room.id, editingRoom)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded">Save</button>
                          <button onClick={()=>setEditingRoom(null)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economy' && economyData && (
          <div className="space-y-6">
            {/* Economy Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Users className="text-blue-400" size={24} />
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {formatNumber(economyData.total_users)}
                </div>
                <div className="text-slate-400 text-sm">Total Users</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Coins className="text-yellow-400" size={24} />
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {formatNumber(economyData.total_balance)}
                </div>
                <div className="text-slate-400 text-sm">Total Balance</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="text-green-400" size={24} />
                  <span className="text-2xl">🛡️</span>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {formatNumber(economyData.total_staked)}
                </div>
                <div className="text-slate-400 text-sm">Total Staked</div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="text-purple-400" size={24} />
                  <span className="text-2xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {formatNumber(economyData.total_transactions)}
                </div>
                <div className="text-slate-400 text-sm">Transactions</div>
              </div>
            </div>

            {/* Economy Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Rewards & Marketplace
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Rewards:</span>
                    <span className="font-mono">{formatNumber(economyData.total_rewards)} LDOM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Marketplace Listings:</span>
                    <span className="font-mono">{formatNumber(economyData.marketplace_listings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Items Sold:</span>
                    <span className="font-mono">{formatNumber(economyData.items_sold)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-400" />
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Staking Ratio:</span>
                    <span className="font-mono">
                      {((economyData.total_staked / economyData.total_balance) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Marketplace Activity:</span>
                    <span className="font-mono">
                      {((economyData.items_sold / economyData.marketplace_listings) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Balance per User:</span>
                    <span className="font-mono">
                      {formatNumber(economyData.total_balance / economyData.total_users)} LDOM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-400" />
                Analytics Dashboard
              </h3>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Analytics charts and visualizations coming soon...</p>
                <p className="text-sm text-slate-500 mt-2">
                  This will include bridge utilization charts, user activity graphs, and economy trends.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaverseDashboard;

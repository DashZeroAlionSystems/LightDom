/**
 * Metaverse Chat Component
 * 3D visualization of chatrooms in the LightDOM metaverse
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  MessageSquare, 
  Users, 
  Zap,
  Database,
  Navigation,
  DollarSign,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  MapPin,
  Portal,
  Sparkles
} from 'lucide-react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { metaverseChatService, MetaverseChatRoom } from '../../services/MetaverseChatService';
import { unifiedSpaceBridgeService } from '../../services/UnifiedSpaceBridgeService';
import { ldomEconomy } from '../../services/LDOMEconomyService';
import { io, Socket } from 'socket.io-client';

interface MetaverseMapProps {
  onRoomSelect: (room: MetaverseChatRoom) => void;
  selectedRoom?: string;
}

const MetaverseChat: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [rooms, setRooms] = useState<MetaverseChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MetaverseChatRoom | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [bridgeStats, setBridgeStats] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [currentBridge, setCurrentBridge] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMetaverseData();
    connectToSocket();
    const interval = setInterval(loadMetaverseData, 30000); // Refresh every 30s
    
    // Subscribe to chat events
    metaverseChatService.on('broadcast', handleBroadcast);
    
    // Subscribe to bridge events
    unifiedSpaceBridgeService.on('bridge_message', handleBridgeMessage);
    unifiedSpaceBridgeService.on('bridge_status_changed', handleBridgeStatusChange);
    unifiedSpaceBridgeService.on('space_allocation_changed', handleSpaceAllocationChange);
    
    return () => {
      clearInterval(interval);
      metaverseChatService.off('broadcast', handleBroadcast);
      unifiedSpaceBridgeService.removeAllListeners();
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMetaverseData = async () => {
    try {
      // Load rooms
      const allRooms = metaverseChatService.searchChatRooms('', {
        publicOnly: true
      });
      setRooms(allRooms);

      // Load user balance
      if (user) {
        const economy = await ldomEconomy.getUserEconomy(user.walletAddress);
        setUserBalance(economy.balance);
      }

      // Load bridge analytics
      const analytics = unifiedSpaceBridgeService.getBridgeAnalytics();
      setBridgeStats(analytics);
    } catch (error) {
      console.error('Failed to load metaverse data:', error);
    }
  };

  const connectToSocket = () => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to bridge socket');
      setBridgeConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from bridge socket');
      setBridgeConnected(false);
    });

    newSocket.on('bridge_message', handleBridgeMessage);
    newSocket.on('user_joined', (data) => {
      console.log('User joined bridge:', data);
    });
    newSocket.on('user_left', (data) => {
      console.log('User left bridge:', data);
    });

    setSocket(newSocket);
  };

  const handleBroadcast = (data: any) => {
    if (data.event === 'message' && data.roomId === selectedRoom?.id) {
      setMessages(prev => [...prev, data.data]);
    }
  };

  const handleBridgeMessage = (message: any) => {
    console.log('Bridge message received:', message);
    if (currentBridge && message.bridge_id === currentBridge.id) {
      setMessages(prev => [...prev, {
        ...message,
        isBridge: true
      }]);
    }
  };

  const handleBridgeStatusChange = (data: any) => {
    console.log('Bridge status changed:', data);
    if (currentBridge && data.bridgeId === currentBridge.id) {
      setCurrentBridge(prev => ({
        ...prev,
        status: data.status,
        operational: data.operational
      }));
    }
  };

  const handleSpaceAllocationChange = (data: any) => {
    console.log('Space allocation changed:', data);
    // Update bridge stats if needed
    loadMetaverseData();
  };

  const handleRoomSelect = async (room: MetaverseChatRoom) => {
    try {
      if (user) {
        await metaverseChatService.joinChatRoom(room.id, user.walletAddress, user.username);
      }
      
      setSelectedRoom(room);
      setMessages(room.messages || []);

      // Check if room has associated bridges
      const bridges = unifiedSpaceBridgeService.getBridgesForChatRoom(room.id);
      if (bridges.length > 0 && socket) {
        const bridge = bridges[0]; // Use first available bridge
        setCurrentBridge(bridge);
        
        // Join bridge via socket
        socket.emit('join_bridge', {
          bridgeId: bridge.id,
          userId: user?.walletAddress || 'anonymous'
        });
        
        // Get bridge stats
        const stats = await unifiedSpaceBridgeService.getBridgeStats(bridge.id);
        console.log('Bridge stats:', stats);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !newMessage.trim() || !user) return;

    try {
      await metaverseChatService.sendMessage(
        selectedRoom.id,
        user.walletAddress,
        {
          content: newMessage,
          type: 'text'
        }
      );
      
      // Also send to bridge if connected
      if (currentBridge && socket && bridgeConnected) {
        await unifiedSpaceBridgeService.sendBridgeMessage(
          currentBridge.id,
          user.walletAddress,
          user.username || 'Anonymous',
          newMessage,
          'text'
        );
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateRoom = async (roomData: any) => {
    if (!user) return;

    try {
      const room = await metaverseChatService.createChatRoom(
        user.walletAddress,
        roomData.name,
        roomData.description,
        roomData.spaceKB * 1024,
        roomData.settings
      );
      
      // Allocate space from bridges
      await spaceBridgeService.allocateSpaceForChatRoom(
        room.id,
        roomData.spaceKB * 1024,
        user.walletAddress
      );
      
      setShowCreateModal(false);
      await loadMetaverseData();
      handleRoomSelect(room);
    } catch (error: any) {
      alert(`Failed to create room: ${error.message}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = filterSector === 'all' || room.coordinates.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="metaverse-chat">
      {/* Header */}
      <div className="metaverse-header">
        <div className="header-left">
          <Globe className="metaverse-icon" size={32} />
          <h1>LightDOM Metaverse</h1>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <Database size={18} />
            <span>{bridgeStats?.totalBridges || 0} Bridges</span>
          </div>
          <div className="stat-item">
            <Zap size={18} />
            <span>{(bridgeStats?.totalSpace / 1024 / 1024).toFixed(2) || 0} MB Space</span>
          </div>
          <div className="stat-item">
            <DollarSign size={18} />
            <span>{userBalance} LDOM</span>
          </div>
          {bridgeConnected && (
            <div className="stat-item bridge-connected">
              <Sparkles size={18} />
              <span>Bridge Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="metaverse-container">
        {/* Sidebar */}
        <div className="metaverse-sidebar">
          {/* Search and Filters */}
          <div className="sidebar-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <Filter size={18} />
              <select 
                value={filterSector} 
                onChange={(e) => setFilterSector(e.target.value)}
              >
                <option value="all">All Sectors</option>
                <option value="tech">Tech</option>
                <option value="social">Social</option>
                <option value="gaming">Gaming</option>
                <option value="business">Business</option>
              </select>
            </div>

            <button 
              className="create-room-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              Create Room
            </button>
          </div>

          {/* Room List */}
          <div className="room-list">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className={`room-item ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="room-header">
                  <h3>{room.name}</h3>
                  <div className="room-badges">
                    {room.settings.public ? (
                      <Unlock size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                    {parseFloat(room.price) > 0 && (
                      <span className="price-badge">{room.price} LDOM</span>
                    )}
                  </div>
                </div>
                <p className="room-description">{room.description}</p>
                <div className="room-stats">
                  <span>
                    <Users size={14} />
                    {room.participants.length}
                  </span>
                  <span>
                    <MapPin size={14} />
                    {room.coordinates.sector}
                  </span>
                  <span>
                    <Database size={14} />
                    {(room.totalSpace / 1024).toFixed(1)}KB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedRoom ? (
          <div className="chat-area">
            {/* Room Header */}
            <div className="chat-header">
              <div className="room-info">
                <h2>{selectedRoom.name}</h2>
                <div className="room-meta">
                  <span>{selectedRoom.participants.length} participants</span>
                  <span>•</span>
                  <span>{selectedRoom.coordinates.sector} sector</span>
                  <span>•</span>
                  <span>{(selectedRoom.totalSpace / 1024).toFixed(1)}KB allocated</span>
                </div>
              </div>
              <div className="room-actions">
                <button className="action-btn">
                  <Portal size={18} />
                  Portals
                </button>
                <button className="action-btn">
                  <Sparkles size={18} />
                  Upgrade
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`message ${message.sender === 'system' ? 'system' : ''} ${
                    message.sender === user?.walletAddress ? 'own' : ''
                  }`}
                >
                  {message.type === 'system' ? (
                    <div className="system-message">
                      <Navigation size={14} />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <>
                      <div className="message-header">
                        <span className="sender">
                          {message.sender === user?.walletAddress ? 'You' : 
                           `User_${message.sender.slice(-6)}`}
                        </span>
                        <span className="timestamp">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-content">{message.content}</div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="no-room-selected">
            <Globe size={64} />
            <h2>Welcome to the LightDOM Metaverse</h2>
            <p>Select a room to start chatting or create your own!</p>
          </div>
        )}

        {/* 3D Map Visualization (simplified) */}
        <div className="metaverse-map">
          <h3>Metaverse Map</h3>
          <div className="map-container">
            {['tech', 'social', 'gaming', 'business'].map(sector => (
              <div key={sector} className={`sector sector-${sector}`}>
                <h4>{sector.charAt(0).toUpperCase() + sector.slice(1)}</h4>
                <div className="sector-rooms">
                  {rooms
                    .filter(r => r.coordinates.sector === sector)
                    .slice(0, 5)
                    .map(room => (
                      <div
                        key={room.id}
                        className="map-room"
                        style={{
                          left: `${(room.coordinates.x % 100)}%`,
                          top: `${(room.coordinates.y % 100)}%`
                        }}
                        onClick={() => handleRoomSelect(room)}
                        title={room.name}
                      >
                        <div className="room-dot" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
          userBalance={userBalance}
        />
      )}
    </div>
  );
};

// Create Room Modal Component
const CreateRoomModal: React.FC<{
  onClose: () => void;
  onCreate: (data: any) => void;
  userBalance: string;
}> = ({ onClose, onCreate, userBalance }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    spaceKB: 100,
    settings: {
      public: true,
      maxParticipants: 50,
      minReputation: 0,
      allowGuests: true
    }
  });

  const cost = roomData.spaceKB * 1; // 1 LDOM per KB

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(userBalance) < cost) {
      alert('Insufficient LDOM balance');
      return;
    }
    onCreate(roomData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Metaverse Chatroom</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData({...roomData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={roomData.description}
              onChange={(e) => setRoomData({...roomData, description: e.target.value})}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Space Allocation (KB)</label>
            <input
              type="number"
              min="10"
              max="10000"
              value={roomData.spaceKB}
              onChange={(e) => setRoomData({...roomData, spaceKB: parseInt(e.target.value)})}
            />
            <small>Cost: {cost} LDOM (Balance: {userBalance} LDOM)</small>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={roomData.settings.public}
                onChange={(e) => setRoomData({
                  ...roomData,
                  settings: {...roomData.settings, public: e.target.checked}
                })}
              />
              Public Room
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Room ({cost} LDOM)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetaverseChat;



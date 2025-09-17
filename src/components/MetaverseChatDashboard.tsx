/**
 * MetaverseChatDashboard - Advanced chat interface for metaverse items
 * Provides real-time chat, node browsing, and metaverse integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Search, 
  Filter, 
  Send, 
  Smile, 
  Paperclip, 
  Volume2, 
  VolumeX,
  Layers,
  Globe,
  Zap,
  Database,
  Anchor,
  Bridge,
  Crown,
  Shield,
  Lock,
  Unlock,
  Star
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChatNode {
  id: string;
  itemId: string;
  itemType: 'virtual_land' | 'ai_node' | 'storage_shard' | 'bridge' | 'reality_anchor';
  name: string;
  description: string;
  chatType: 'public' | 'private' | 'governance' | 'technical' | 'bridge_coordination';
  securityLevel: 'open' | 'restricted' | 'encrypted' | 'token_gated';
  participantCount: number;
  activeParticipants: number;
  lastActivity: number;
  messageCount: number;
  isParticipant: boolean;
}

interface ChatMessage {
  id: string;
  nodeId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'system' | 'governance' | 'file' | 'voice' | 'reaction';
  timestamp: number;
  replyTo?: string;
  reactions?: { emoji: string; userAddress: string; timestamp: number }[];
}

interface ChatParticipant {
  address: string;
  name: string;
  role: 'owner' | 'moderator' | 'member' | 'guest';
  reputation: number;
  lastActive: number;
  isOnline: boolean;
}

interface TypingUser {
  address: string;
  name: string;
}

const ItemTypeIcons = {
  virtual_land: Globe,
  ai_node: Zap,
  storage_shard: Database,
  bridge: Bridge,
  reality_anchor: Anchor
};

const SecurityLevelIcons = {
  open: Unlock,
  restricted: Lock,
  encrypted: Shield,
  token_gated: Crown
};

const MetaverseChatDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ address: string; name: string } | null>(null);
  
  // Chat nodes and navigation
  const [chatNodes, setChatNodes] = useState<ChatNode[]>([]);
  const [currentNode, setCurrentNode] = useState<ChatNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNodeBrowser, setShowNodeBrowser] = useState(true);
  
  // Messages and chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  
  // UI state
  const [showParticipants, setShowParticipants] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${window.location.protocol}//${window.location.host}`, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Disconnected from chat server');
    });

    // Authentication response
    newSocket.on('authenticated', (data: { success: boolean; user?: any; error?: string }) => {
      if (data.success) {
        setCurrentUser(data.user);
        fetchChatNodes();
      } else {
        console.error('Authentication failed:', data.error);
      }
    });

    // Chat events
    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      if (soundEnabled && message.senderId !== currentUser?.address) {
        playNotificationSound();
      }
    });

    newSocket.on('user_joined', (data: { nodeId: string; user: { address: string; name: string } }) => {
      if (currentNode?.id === data.nodeId) {
        fetchParticipants(data.nodeId);
      }
    });

    newSocket.on('user_left', (data: { nodeId: string; user: { address: string; name: string } }) => {
      if (currentNode?.id === data.nodeId) {
        fetchParticipants(data.nodeId);
      }
    });

    newSocket.on('user_typing', (data: { nodeId: string; user: TypingUser }) => {
      if (currentNode?.id === data.nodeId) {
        setTypingUsers(prev => {
          const existing = prev.find(u => u.address === data.user.address);
          if (!existing) {
            return [...prev, data.user];
          }
          return prev;
        });
      }
    });

    newSocket.on('user_stopped_typing', (data: { nodeId: string; user: TypingUser }) => {
      if (currentNode?.id === data.nodeId) {
        setTypingUsers(prev => prev.filter(u => u.address !== data.user.address));
      }
    });

    newSocket.on('recent_messages', (data: { nodeId: string; messages: ChatMessage[] }) => {
      if (currentNode?.id === data.nodeId) {
        setMessages(data.messages);
      }
    });

    newSocket.on('node_participants', (data: { nodeId: string; participants: ChatParticipant[] }) => {
      if (currentNode?.id === data.nodeId) {
        setParticipants(data.participants);
      }
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('Chat error:', error.message);
    });

    setSocket(newSocket);

    // Auto-authenticate with mock user for demo
    setTimeout(() => {
      const mockUser = {
        address: '0x1234567890123456789012345678901234567890',
        name: 'MetaverseMiner',
        signature: 'mock_signature'
      };
      newSocket.emit('authenticate', mockUser);
    }, 1000);

    return () => {
      newSocket.close();
    };
  }, [currentNode, soundEnabled, currentUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // Simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const fetchChatNodes = async () => {
    try {
      const response = await fetch(`/api/chat/nodes?userAddress=${currentUser?.address}`);
      const data = await response.json();
      if (data.success) {
        setChatNodes(data.data.nodes);
      }
    } catch (error) {
      console.error('Failed to fetch chat nodes:', error);
    }
  };

  const fetchParticipants = (nodeId: string) => {
    if (socket) {
      socket.emit('get_participants', { nodeId });
    }
  };

  const joinNode = async (node: ChatNode) => {
    if (!socket || !currentUser) return;

    try {
      socket.emit('join_node', { nodeId: node.id });
      setCurrentNode(node);
      setMessages([]);
      setTypingUsers([]);
      setShowNodeBrowser(false);
      fetchParticipants(node.id);
    } catch (error) {
      console.error('Failed to join node:', error);
    }
  };

  const leaveNode = () => {
    if (!socket || !currentNode) return;

    socket.emit('leave_node', { nodeId: currentNode.id });
    setCurrentNode(null);
    setMessages([]);
    setTypingUsers([]);
    setParticipants([]);
    setShowNodeBrowser(true);
  };

  const sendMessage = () => {
    if (!socket || !currentNode || !messageInput.trim()) return;

    socket.emit('send_message', {
      nodeId: currentNode.id,
      content: messageInput.trim(),
      messageType: 'text',
      replyTo: replyingTo?.id
    });

    setMessageInput('');
    setReplyingTo(null);
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing_stop', { nodeId: currentNode.id });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    if (!socket || !currentNode) return;

    // Send typing indicator
    socket.emit('typing_start', { nodeId: currentNode.id });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { nodeId: currentNode.id });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredNodes = chatNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || node.itemType === filterType || node.chatType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar - Node Browser */}
      {showNodeBrowser && (
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="text-purple-400" />
                Metaverse Chat
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded hover:bg-slate-700"
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search chat nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="virtual_land">Virtual Land</option>
                <option value="ai_node">AI Nodes</option>
                <option value="storage_shard">Storage Shards</option>
                <option value="bridge">Bridges</option>
                <option value="reality_anchor">Reality Anchors</option>
                <option value="public">Public Chats</option>
                <option value="governance">Governance</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredNodes.map(node => {
              const ItemIcon = ItemTypeIcons[node.itemType] || Globe;
              const SecurityIcon = SecurityLevelIcons[node.securityLevel] || Unlock;
              
              return (
                <div
                  key={node.id}
                  onClick={() => joinNode(node)}
                  className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-600/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ItemIcon size={16} className="text-blue-400" />
                      <h3 className="font-medium text-sm truncate">{node.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <SecurityIcon size={12} className="text-slate-400" />
                      {node.isParticipant && <Star size={12} className="text-yellow-400" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{node.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {node.activeParticipants}/{node.participantCount}
                    </span>
                    <span>{formatTimestamp(node.lastActivity)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      node.chatType === 'public' ? 'bg-green-600/20 text-green-400' :
                      node.chatType === 'governance' ? 'bg-purple-600/20 text-purple-400' :
                      node.chatType === 'technical' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {node.chatType}
                    </span>
                    <span className="text-xs text-slate-500">{node.messageCount} msgs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentNode ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNodeBrowser(!showNodeBrowser)}
                  className="p-2 rounded hover:bg-slate-700"
                >
                  <Layers size={18} />
                </button>
                
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {React.createElement(ItemTypeIcons[currentNode.itemType], { size: 18, className: "text-blue-400" })}
                    {currentNode.name}
                  </h3>
                  <p className="text-sm text-slate-400">{currentNode.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-700 text-sm"
                >
                  <Users size={16} />
                  {participants.length}
                </button>
                <button
                  onClick={leaveNode}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Leave
                </button>
              </div>
            </div>

            <div className="flex-1 flex">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-sm font-bold">
                        {message.senderName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <span className="text-xs text-slate-500">{formatTimestamp(message.timestamp)}</span>
                          {message.messageType === 'system' && (
                            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">SYSTEM</span>
                          )}
                        </div>
                        
                        {message.replyTo && (
                          <div className="mb-2 p-2 bg-slate-700/50 rounded text-sm text-slate-400 border-l-2 border-purple-400">
                            Replying to message...
                          </div>
                        )}
                        
                        <div className="text-sm">{message.content}</div>
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {Object.entries(
                              message.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([emoji, count]) => (
                              <span
                                key={emoji}
                                className="px-2 py-1 bg-slate-700 rounded text-xs flex items-center gap-1"
                              >
                                {emoji} {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicators */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply indicator */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-slate-700/50 border-t border-slate-600 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Replying to {replyingTo.senderName}: {replyingTo.content.substring(0, 50)}...
                    </span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${currentNode.name}...`}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                      disabled={!isConnected}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim() || !isConnected}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Participants Panel */}
              {showParticipants && (
                <div className="w-64 bg-slate-800/50 border-l border-slate-700 p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users size={16} />
                    Participants ({participants.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {participants.map(participant => (
                      <div key={participant.address} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-sm font-bold">
                            {participant.name.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                            participant.isOnline ? 'bg-green-400' : 'bg-slate-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{participant.name}</span>
                            {participant.role === 'owner' && <Crown size={12} className="text-yellow-400" />}
                            {participant.role === 'moderator' && <Shield size={12} className="text-purple-400" />}
                          </div>
                          <div className="text-xs text-slate-400">
                            Rep: {participant.reputation} • {formatTimestamp(participant.lastActive)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <MessageCircle size={64} className="mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Metaverse Chat</h2>
              <p className="text-slate-400 mb-6">
                Connect with other users in chat nodes created for each metaverse item. 
                Select a node from the sidebar to start chatting!
              </p>
              {!showNodeBrowser && (
                <button
                  onClick={() => setShowNodeBrowser(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Browse Chat Nodes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaverseChatDashboard;
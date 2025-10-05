import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Zap, Globe, Link, Activity, TrendingUp, Database } from 'lucide-react';
import SpaceBridgeService from '../services/SpaceBridgeService';
import type { Bridge, BridgeMessage, SpaceBridgeConnection, OptimizationResult } from '../services/SpaceBridgeService';

interface SpaceBridgeIntegrationProps {
  optimizationResults: OptimizationResult[];
  onSpaceMined?: (result: OptimizationResult) => void;
}

const SpaceBridgeIntegration: React.FC<SpaceBridgeIntegrationProps> = ({ 
  optimizationResults, 
  onSpaceMined 
}) => {
  const [spaceBridgeService] = useState(() => new SpaceBridgeService());
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);
  const [messages, setMessages] = useState<BridgeMessage[]>([]);
  const [connections, setConnections] = useState<SpaceBridgeConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('Anonymous');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await spaceBridgeService.initialize();
        setIsConnected(true);
        
        // Load bridges
        const bridgesData = await spaceBridgeService.getBridges();
        setBridges(bridgesData);
        
        // Register message handler
        spaceBridgeService.onMessage((message) => {
          setMessages(prev => [...prev, message]);
        });
        
      } catch (error) {
        console.error('Failed to initialize Space-Bridge service:', error);
      }
    };
    
    initializeService();
    
    return () => {
      spaceBridgeService.disconnect();
    };
  }, [spaceBridgeService]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-connect space mining results to bridges
  useEffect(() => {
    if (autoConnect && optimizationResults.length > 0) {
      const latestResult = optimizationResults[0];
      autoConnectSpaceMining(latestResult);
    }
  }, [optimizationResults, autoConnect]);

  // Load bridge messages when bridge is selected
  useEffect(() => {
    if (selectedBridge) {
      loadBridgeMessages(selectedBridge.bridge_id);
      loadBridgeConnections(selectedBridge.bridge_id);
    }
  }, [selectedBridge]);

  const loadBridgeMessages = async (bridgeId: string) => {
    try {
      const messagesData = await spaceBridgeService.getBridgeMessages(bridgeId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load bridge messages:', error);
    }
  };

  const loadBridgeConnections = async (bridgeId: string) => {
    try {
      const connectionsData = await spaceBridgeService.getSpaceBridgeConnections(bridgeId);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Failed to load bridge connections:', error);
    }
  };

  const joinBridge = async (bridge: Bridge) => {
    try {
      await spaceBridgeService.joinBridge(bridge.bridge_id);
      setSelectedBridge(bridge);
      setShowChat(true);
    } catch (error) {
      console.error('Failed to join bridge:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedBridge || !newMessage.trim()) return;
    
    try {
      await spaceBridgeService.sendMessage(selectedBridge.bridge_id, newMessage.trim(), userName);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const autoConnectSpaceMining = async (result: OptimizationResult) => {
    try {
      await spaceBridgeService.autoConnectSpaceMining(result);
      if (onSpaceMined) {
        onSpaceMined(result);
      }
    } catch (error) {
      console.error('Failed to auto-connect space mining:', error);
    }
  };

  const connectSpaceToBridge = async (bridgeId: string) => {
    if (optimizationResults.length === 0) return;
    
    const latestResult = optimizationResults[0];
    try {
      await spaceBridgeService.connectSpaceToBridge(latestResult, bridgeId);
      loadBridgeConnections(bridgeId);
    } catch (error) {
      console.error('Failed to connect space to bridge:', error);
    }
  };

  const getBiomeEmoji = (biome: string) => {
    switch (biome) {
      case 'digital': return '💻';
      case 'commercial': return '🏢';
      case 'knowledge': return '📚';
      case 'social': return '👥';
      case 'community': return '🌐';
      default: return '🌍';
    }
  };

  const getBridgeStatusColor = (isOperational: boolean) => {
    return isOperational ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-bridge-integration">
      {/* Bridge Selection Panel */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Link className="text-blue-400" size={24} />
            Space-Bridge Connections
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Auto-connect:</label>
            <input
              type="checkbox"
              checked={autoConnect}
              onChange={(e) => setAutoConnect(e.target.checked)}
              className="rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bridges.map((bridge) => (
            <div key={bridge.bridge_id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="text-blue-400" size={20} />
                  <span className="font-semibold text-blue-300">
                    {bridge.source_chain} → {bridge.target_chain}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${bridge.is_operational ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>
              
              <div className="text-sm text-slate-400 mb-3">
                <div>Capacity: {bridge.bridge_capacity.toLocaleString()}</div>
                <div>Volume: {bridge.current_volume.toLocaleString()}</div>
                <div>Validators: {bridge.validator_count}</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => joinBridge(bridge)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <MessageCircle size={16} />
                  Chat
                </button>
                <button
                  onClick={() => connectSpaceToBridge(bridge.bridge_id)}
                  className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Zap size={16} />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && selectedBridge && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="text-green-400" size={24} />
              Bridge Chat: {selectedBridge.source_chain} → {selectedBridge.target_chain}
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm"
            >
              Close
            </button>
          </div>

          {/* Chat Messages */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-600 h-64 overflow-y-auto p-4 mb-4">
            {messages.map((message, index) => (
              <div key={index} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 font-medium text-sm">
                    {message.user_name}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                  {message.message_type !== 'text' && (
                    <span className="px-2 py-1 bg-slate-600 rounded text-xs">
                      {message.message_type}
                    </span>
                  )}
                </div>
                <div className="text-slate-200 ml-4">{message.message_text}</div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="text-slate-400 text-sm italic">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-32 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Space-Bridge Connections */}
      {selectedBridge && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Database className="text-purple-400" size={24} />
            Space Connections for {selectedBridge.source_chain} → {selectedBridge.target_chain}
          </h3>
          
          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>No space connections yet</p>
                <p className="text-sm">Connect space mining results to see them here</p>
              </div>
            ) : (
              connections.map((connection) => (
                <div key={connection.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold">
                        {getBiomeEmoji(connection.biome_type || 'default')} {connection.space_mined_kb}KB
                      </span>
                      <span className="text-slate-400 text-sm">
                        {connection.biome_type || 'unknown'} biome
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(connection.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    Connection strength: {(connection.connection_strength * 100).toFixed(0)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recent Space Mining Results */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mt-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-yellow-400" size={24} />
          Recent Space Mining Results
        </h3>
        
        <div className="space-y-3">
          {optimizationResults.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>No space mining results yet</p>
              <p className="text-sm">Start crawling to see optimization results</p>
            </div>
          ) : (
            optimizationResults.slice(0, 5).map((result) => (
              <div key={result.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-semibold">
                      {getBiomeEmoji(result.biome_type)} {result.space_saved_kb}KB
                    </span>
                    <span className="text-slate-400 text-sm">{result.optimization_type}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm text-slate-300 font-mono">
                  {result.url}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {result.biome_type} biome • Ready for bridge connection
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceBridgeIntegration;
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

interface BridgeChatPageProps {
  bridgeId: string;
}

const BridgeChatPage: React.FC<BridgeChatPageProps> = ({ bridgeId }) => {
  const [bridge, setBridge] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load bridge details and chat history
  useEffect(() => {
    const loadBridgeData = async () => {
      try {
        const [bridgeRes, messagesRes] = await Promise.all([
          fetch(`/api/metaverse/bridge/${bridgeId}`),
          fetch(`/api/metaverse/bridge/${bridgeId}/chat`)
        ]);
        
        if (bridgeRes.ok) {
          const bridgeData = await bridgeRes.json();
          setBridge(bridgeData);
        }
        
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Failed to load bridge data:', error);
      }
    };
    
    loadBridgeData();
  }, [bridgeId]);

  // WebSocket connection
  useEffect(() => {
    const socket = io((location.origin || '').replace('http', 'ws'));
    socketRef.current = socket;
    
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('bridge_join', bridgeId);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('bridge_message', (msg: any) => {
      if (msg.bridgeId === bridgeId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    
    socket.on('bridge_typing', ({ user, isTyping }: any) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(user);
        else next.delete(user);
        return next;
      });
    });
    
    return () => {
      socket.emit('bridge_leave', bridgeId);
      socket.close();
    };
  }, [bridgeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!socketRef.current || !newMessage.trim()) return;
    
    socketRef.current.emit('bridge_message', {
      bridgeId,
      user: 'you',
      text: newMessage.trim()
    });
    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('bridge_typing', {
      bridgeId,
      user: 'you',
      isTyping: e.target.value.length > 0
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Bridge chat URL copied to clipboard!');
  };

  if (!bridge) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading bridge chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              {bridge.source_chain} → {bridge.target_chain} Bridge Chat
            </h1>
            <div className="text-sm text-slate-400 mt-1">
              Status: <span className={bridge.is_operational ? 'text-green-400' : 'text-red-400'}>
                {bridge.is_operational ? 'Online' : 'Offline'}
              </span>
              {' • '}
              Capacity: {Number(bridge.bridge_capacity || 0).toLocaleString()}
              {' • '}
              Volume: {Number(bridge.current_volume || 0).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyUrl}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Copy URL
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-medium text-sm">
                    {msg.user_name || msg.user}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {new Date(msg.created_at || msg.ts).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-200 ml-4">{msg.message_text}</div>
              </div>
            ))}
            {typingUsers.size > 0 && (
              <div className="text-slate-400 text-sm italic">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Send
              </button>
            </div>
            {!isConnected && (
              <div className="text-red-400 text-sm mt-2">
                Disconnected from chat server
              </div>
            )}
          </div>
        </div>

        {/* Bridge Info */}
        <div className="mt-4 bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="font-semibold mb-2">Bridge Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Bridge ID:</span>
              <span className="ml-2 font-mono">{bridge.bridge_id}</span>
            </div>
            <div>
              <span className="text-slate-400">Validators:</span>
              <span className="ml-2">{bridge.validator_count}</span>
            </div>
            <div>
              <span className="text-slate-400">Last Transaction:</span>
              <span className="ml-2">
                {bridge.last_transaction 
                  ? new Date(bridge.last_transaction).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div>
              <span className="text-slate-400">Connection:</span>
              <span className={`ml-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgeChatPage;

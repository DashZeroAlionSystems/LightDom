/**
 * Chat Bridge - Real-time communication through mined storage bridges
 * Connects Light DOM nodes across the metaverse
 */

class ChatBridge {
  constructor() {
    this.bridges = new Map();
    this.activeBridgeId = null;
    this.messages = new Map();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize chat bridge system
   */
  async initialize() {
    console.log('🌉 Initializing Chat Bridge...');
    
    // Load stored bridges
    await this.loadBridges();
    
    // Connect to WebSocket server
    this.connectWebSocket();
    
    // Set up message handlers
    this.setupMessageHandlers();
    
    console.log('✅ Chat Bridge initialized');
  }

  /**
   * Connect to WebSocket server
   */
  connectWebSocket() {
    const wsUrl = 'ws://localhost:3001/bridge';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 Connected to Chat Bridge WebSocket');
        this.reconnectAttempts = 0;
        this.sendIdentification();
      };
      
      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`⏳ Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Send identification to server
   */
  sendIdentification() {
    const identification = {
      type: 'identify',
      clientId: this.getClientId(),
      timestamp: Date.now()
    };
    
    this.sendMessage(identification);
  }

  /**
   * Get or create client ID
   */
  getClientId() {
    let clientId = localStorage.getItem('lightdom_client_id');
    
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('lightdom_client_id', clientId);
    }
    
    return clientId;
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleWebSocketMessage(data) {
    try {
      const message = JSON.parse(data);
      
      // Sanitize message type
      const messageType = String(message.type || '').slice(0, 50);
      
      switch (messageType) {
        case 'chat_message':
          this.handleChatMessage(message);
          break;
        
        case 'bridge_status':
          this.handleBridgeStatus(message);
          break;
        
        case 'user_joined':
          this.handleUserJoined(message);
          break;
        
        case 'user_left':
          this.handleUserLeft(message);
          break;
        
        default:
          console.log('Unknown message type');
      }
    } catch (error) {
   * Handle chat message
   */
  handleChatMessage(message) {
    const bridgeId = message.bridgeId;
    
    if (!this.messages.has(bridgeId)) {
      this.messages.set(bridgeId, []);
    }
    
    const chatMessage = {
      id: message.messageId,
      user: message.user,
      message: message.message,
      timestamp: message.timestamp,
      type: message.messageType || 'user'
    };
    
    this.messages.get(bridgeId).push(chatMessage);
    
    // Notify UI
    this.notifyUI('chat_message', chatMessage);
    
    // Store in local storage
    this.saveMessages();
    
    console.log(`💬 Chat message received on bridge ${bridgeId}:`, chatMessage);
  }

  /**
   * Handle bridge status update
   */
  handleBridgeStatus(message) {
    const bridgeId = message.bridgeId;
    const status = message.status;
    
    if (this.bridges.has(bridgeId)) {
      const bridge = this.bridges.get(bridgeId);
      bridge.status = status;
      bridge.connectedUsers = message.connectedUsers || 0;
      
      this.saveBridges();
      this.notifyUI('bridge_status', { bridgeId, status });
    }
  }

  /**
   * Handle user joined event
   */
  handleUserJoined(message) {
    const bridgeId = String(message.bridgeId || '').slice(0, 100);
    const user = String(message.user || '').slice(0, 100);
    console.log('User joined bridge:', { bridgeId, user });
    
    this.notifyUI('user_joined', {
      bridgeId: bridgeId,
      user: user
    });
  }

  /**
   * Handle user left event
   */
  handleUserLeft(message) {
    const bridgeId = String(message.bridgeId || '').slice(0, 100);
    const user = String(message.user || '').slice(0, 100);
    console.log('User left bridge:', { bridgeId, user });
    
    this.notifyUI('user_left', {
      bridgeId: bridgeId,
      user: user
    });
  }

  /**
   * Create a new bridge
   */
  async createBridge(sourceDomain, targetDomain, isolatedDomId) {
    const bridgeId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
      id: bridgeId,
      sourceDomain,
      targetDomain,
      isolatedDomId,
      status: 'active',
      createdAt: Date.now(),
      connectedUsers: 0,
      capabilities: ['chat', 'data_transfer', 'asset_sharing']
    };
    
    this.bridges.set(bridgeId, bridge);
    await this.saveBridges();
    
    // Notify server
    this.sendMessage({
      type: 'create_bridge',
      bridge
    });
    
    console.log('🌉 Bridge created:', bridge);
    
    return bridge;
  }

  /**
   * Connect to a bridge
   */
  async connectToBridge(bridgeId) {
    const bridge = this.bridges.get(bridgeId);
    
    if (!bridge) {
      console.error('Bridge not found:', bridgeId);
      return false;
    }
    
    this.activeBridgeId = bridgeId;
    
    // Notify server
    this.sendMessage({
      type: 'join_bridge',
      bridgeId,
      clientId: this.getClientId()
    });
    
    console.log('🔗 Connected to bridge:', bridgeId);
    
    return true;
  }

  /**
   * Disconnect from current bridge
   */
  disconnectFromBridge() {
    if (this.activeBridgeId) {
      this.sendMessage({
        type: 'leave_bridge',
        bridgeId: this.activeBridgeId,
        clientId: this.getClientId()
      });
      
      console.log('🔌 Disconnected from bridge:', this.activeBridgeId);
      
      this.activeBridgeId = null;
    }
  }

  /**
   * Send a chat message
   */
  sendChatMessage(bridgeId, message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    const chatMessage = {
      type: 'chat_message',
      bridgeId,
      clientId: this.getClientId(),
      message,
      timestamp: Date.now()
    };
    
    this.sendMessage(chatMessage);
    
    return true;
  }

  /**
   * Send message through WebSocket
   */
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, queueing message');
    }
  }

  /**
   * Get messages for a bridge
   */
  getBridgeMessages(bridgeId) {
    return this.messages.get(bridgeId) || [];
  }

  /**
   * Get all bridges
   */
  getBridges() {
    return Array.from(this.bridges.values());
  }

  /**
   * Get active bridge
   */
  getActiveBridge() {
    return this.activeBridgeId ? this.bridges.get(this.activeBridgeId) : null;
  }

  /**
   * Load bridges from storage
   */
  async loadBridges() {
    try {
      const stored = localStorage.getItem('lightdom_bridges');
      if (stored) {
        const bridgesData = JSON.parse(stored);
        this.bridges = new Map(bridgesData);
        console.log(`📦 Loaded ${this.bridges.size} bridges from storage`);
      }
      
      const messagesStored = localStorage.getItem('lightdom_bridge_messages');
      if (messagesStored) {
        const messagesData = JSON.parse(messagesStored);
        this.messages = new Map(messagesData);
        console.log(`💬 Loaded bridge messages from storage`);
      }
    } catch (error) {
      console.error('Error loading bridges:', error);
    }
  }

  /**
   * Save bridges to storage
   */
  async saveBridges() {
    try {
      const bridgesData = Array.from(this.bridges.entries());
      localStorage.setItem('lightdom_bridges', JSON.stringify(bridgesData));
    } catch (error) {
      console.error('Error saving bridges:', error);
    }
  }

  /**
   * Save messages to storage
   */
  async saveMessages() {
    try {
      const messagesData = Array.from(this.messages.entries());
      localStorage.setItem('lightdom_bridge_messages', JSON.stringify(messagesData));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  /**
   * Setup message handlers for extension communication
   */
  setupMessageHandlers() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
          case 'getChatBridges':
            sendResponse({ bridges: this.getBridges() });
            break;
          
          case 'connectToBridge':
            this.connectToBridge(request.bridgeId).then(success => {
              sendResponse({ success });
            });
            return true;
          
          case 'sendMessage':
            const sent = this.sendChatMessage(request.bridgeId, request.message);
            sendResponse({ sent });
            break;
          
          case 'getBridgeMessages':
            sendResponse({ messages: this.getBridgeMessages(request.bridgeId) });
            break;
          
          default:
            console.log('Unknown action:', request.action);
        }
      });
    }
  }

  /**
   * Notify UI of updates
   */
  notifyUI(event, data) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'chat_bridge_event',
        event,
        data
      }).catch(error => {
        // Ignore errors if no listeners
      });
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.disconnectFromBridge();
    
    console.log('🧹 Chat Bridge cleaned up');
  }
}

// Initialize chat bridge
const chatBridge = new ChatBridge();
chatBridge.initialize();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatBridge;
}

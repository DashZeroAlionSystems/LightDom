# LightDom Desktop Application Guide

**Exodus Wallet-Inspired Electron Application**  
**Version**: 1.0.0  
**Last Updated**: 2025-10-27

---

## 🎯 Overview

LightDom Desktop is a sophisticated Electron application inspired by Exodus wallet's design principles, featuring real-time dashboards, advanced security, and comprehensive system integration. The application provides both client and admin interfaces with live data streaming, WebSocket communication, and native desktop capabilities.

---

## 🏗️ Architecture

### **Multi-Window System**
- **Client Dashboard**: Main user interface for mining and optimization
- **Admin Dashboard**: Comprehensive system management and analytics
- **Monitoring Dashboard**: Real-time system performance and alerts
- **Settings Window**: Configuration and preferences management

### **Security Architecture**
- **Context Isolation**: Enabled for secure renderer-main communication
- **Node Integration**: Disabled in renderer processes
- **Content Security Policy**: Strict CSP headers for XSS protection
- **Sandbox Mode**: Configurable sandboxing for enhanced security
- **Preload Scripts**: Secure bridge for IPC communication

### **Real-Time Communication**
- **WebSocket Integration**: Live data streaming and updates
- **Socket.IO**: Bidirectional event-based communication
- **Event Listeners**: Comprehensive event handling system
- **Auto-Reconnection**: Exponential backoff reconnection strategy

---

## 🚀 Getting Started

### **Prerequisites**
```bash
# Node.js 18+ required
node --version

# npm or yarn
npm --version
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/lightdom/lightdom-desktop.git
cd lightdom-desktop

# Install dependencies
npm install

# Install Electron-specific dependencies
npm install electron electron-builder electron-updater electron-is-dev --save-dev
```

### **Development**
```bash
# Start development server with Electron
npm run electron:dev:enhanced

# Start with hot reload
npm run electron:dev

# Build and run
npm run electron:build-and-run
```

### **Production Build**
```bash
# Build for production
npm run electron:prod

# Create distributable packages
npm run electron:dist

# Platform-specific builds
npm run electron:pack  # Unpacked build
```

---

## 🎨 Design System

### **Exodus-Inspired Theme**
```css
/* Dark Theme Palette */
--background-primary: #0a0a0a;
--background-secondary: #1a1a1a;
--surface: #2a2a2a;
--border: #3a3a3a;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;

/* Gradient System */
--gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
--gradient-secondary: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
--gradient-accent: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
```

### **Animation System**
- **Scroll Reveal**: Intersection Observer-based animations
- **Parallax Effects**: Multi-layer depth scrolling
- **Micro-interactions**: Hover states and transitions
- **Loading Animations**: Skeleton screens and spinners
- **Real-time Updates**: Smooth data transitions

---

## 📊 Dashboard Components

### **Client Dashboard** (`DesktopClientDashboard.tsx`)

**Features:**
- Real-time mining statistics
- DOM optimization tools
- Portfolio management
- Achievement system
- Interactive tour
- Settings drawer

**Key Components:**
```typescript
interface MiningStats {
  hashRate: number;
  blocksMined: number;
  difficulty: number;
  earnings: number;
  uptime: number;
  efficiency: number;
}

// Real-time updates every 2 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (miningActive) {
      updateMiningStats();
    }
  }, 2000);
  return () => clearInterval(interval);
}, [miningActive]);
```

### **Admin Dashboard** (`AdminDashboard.tsx`)

**Features:**
- User management system
- Security monitoring
- Analytics and reporting
- Service management
- Alert handling
- System configuration

**Key Capabilities:**
```typescript
// User management
const handleUserAction = (action: string, userId: string) => {
  switch (action) {
    case 'suspend':
      suspendUser(userId);
      break;
    case 'activate':
      activateUser(userId);
      break;
    case 'delete':
      deleteUser(userId);
      break;
  }
};

// Real-time alerts
const handleResolveAlert = (alertId: string) => {
  setAlerts(prev => 
    prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    )
  );
};
```

### **Monitoring Dashboard** (`MonitoringDashboard.tsx`)

**Features:**
- System performance metrics
- Service health monitoring
- Real-time alerts
- Log streaming
- Performance charts
- Resource utilization

**Monitoring Features:**
```typescript
// System metrics tracking
const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);

// Real-time data simulation
const generateMetrics = (): SystemMetrics => ({
  timestamp: new Date().toISOString(),
  cpu: Math.random() * 40 + 30,
  memory: Math.random() * 30 + 50,
  disk: Math.random() * 20 + 65,
  network: Math.random() * 60 + 20,
  temperature: Math.random() * 20 + 45,
});
```

---

## 🔌 Services Integration

### **WebSocket Service** (`WebSocketService.tsx`)

**Real-time Communication:**
```typescript
// Initialize WebSocket service
const wsService = getWebSocketService({
  url: 'ws://localhost:3001',
  token: 'auth-token',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
});

// Subscribe to real-time updates
wsService.subscribe('mining-updates', (data) => {
  updateMiningStats(data);
});

// React hook integration
const { socket, status, lastData } = useWebSocket({
  url: 'ws://localhost:3001',
  token: userToken,
});
```

**Event Types:**
- `real-time-update`: Comprehensive data updates
- `mining-update`: Mining statistics changes
- `system-update`: System performance metrics
- `analytics-update`: User analytics data
- `alert`: New system alerts
- `user-activity`: User action tracking

### **Electron Service** (`ElectronService.tsx`)

**Desktop Integration:**
```typescript
// Get Electron service instance
const electronService = getElectronService();

// Check if running in Electron
if (electronService.isElectronApp()) {
  // Access native APIs
  const systemInfo = electronService.getSystemInfo();
  
  // Show desktop notification
  electronService.showNotification({
    title: 'Mining Complete',
    body: 'Block #12345 mined successfully',
    icon: '/assets/icon.png',
  });
  
  // Open admin dashboard
  await electronService.openAdminDashboard();
}
```

**Available Features:**
- File operations (save/open dialogs)
- System notifications
- Multi-window management
- Secure storage
- External link handling
- Application restart

---

## 🔒 Security Features

### **Content Security Policy**
```javascript
// Main process security
const securityConfig = {
  nodeIntegration: false,
  contextIsolation: true,
  enableRemoteModule: false,
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false,
  sandbox: false, // Enable for maximum security
};
```

### **Secure IPC Communication**
```javascript
// Preload script security bridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Only expose necessary APIs
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  openAdminDashboard: () => ipcRenderer.invoke('open-admin-dashboard'),
  // ... other secure APIs
});
```

### **Authentication & Authorization**
- **WebAuthn Integration**: Hardware-based authentication
- **Token Management**: Secure token storage and refresh
- **Role-based Access**: Admin vs client permissions
- **Session Management**: Secure session handling

---

## 📈 Performance Optimization

### **Memory Management**
```typescript
// Efficient data handling
const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);

// Limit data points to prevent memory leaks
useEffect(() => {
  const interval = setInterval(() => {
    setSystemMetrics(prev => {
      const updated = [...prev, generateMetrics()];
      return updated.slice(-50); // Keep last 50 points
    });
  }, 2000);
  
  return () => clearInterval(interval);
}, []);
```

### **Rendering Optimization**
- **Virtual Scrolling**: For large data sets
- **Lazy Loading**: Components and data
- **Memoization**: Expensive computations
- **Debouncing**: Search and filter inputs
- **Throttling**: Real-time updates

### **Resource Management**
```javascript
// Process cleanup on app exit
app.on('before-quit', () => {
  // Clean up backend processes
  if (backendProcess) {
    backendProcess.kill();
  }
  
  // Close WebSocket connections
  wsConnections.forEach(ws => ws.close());
  wsConnections.clear();
  
  // Clear event listeners
  removeAllListeners();
});
```

---

## 🛠️ Development Tools

### **Debugging**
```bash
# Enable DevTools in development
npm run electron:dev

# Remote debugging
electron --inspect=5858 --remote-debugging-port=9223

# Performance profiling
electron --inspect-brk
```

### **Testing**
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Electron-specific tests
npm run test:desktop

# Performance tests
npm run test:performance
```

### **Code Quality**
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Security audit
npm run security:audit

# Bundle analysis
npm run analyze:bundle
```

---

## 📦 Build & Distribution

### **Build Configuration**
```json
{
  "build": {
    "appId": "com.lightdom.space-bridge",
    "productName": "LightDom Desktop",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "src/**/*"
    ],
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png"
    }
  }
}
```

### **Auto-Updater**
```typescript
// Update checking
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version of LightDom is available.',
    buttons: ['OK'],
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded. Restart to apply.',
    buttons: ['Restart Now', 'Later'],
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

### **Distribution Channels**
- **GitHub Releases**: Primary distribution channel
- **Auto-updates**: Seamless update delivery
- **Code Signing**: Security verification
- **Notarization**: macOS security compliance

---

## 🔧 Configuration

### **Environment Variables**
```bash
# Development
NODE_ENV=development
FRONTEND_PORT=3000
BACKEND_PORT=3001

# Production
NODE_ENV=production
LIGHTDOM_ENV=production
UPDATE_SERVER=https://updates.lightdom.io
```

### **Application Settings**
```typescript
// Default configuration
const defaultConfig = {
  mining: {
    autoStart: false,
    maxCpuUsage: 80,
    enableGpu: false,
  },
  notifications: {
    desktop: true,
    sound: false,
    email: false,
  },
  appearance: {
    theme: 'dark',
    animations: true,
    compactMode: false,
  },
  security: {
    autoLock: true,
    sessionTimeout: 3600,
    requireAuth: true,
  },
};
```

---

## 🚨 Troubleshooting

### **Common Issues**

**Application won't start:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**WebSocket connection issues:**
```bash
# Check backend server
curl http://localhost:3001/health

# Verify WebSocket port
netstat -an | grep 3001
```

**Build failures:**
```bash
# Check build dependencies
npm run electron:pack

# Verify electron-builder
npx electron-builder --help
```

### **Performance Issues**

**High memory usage:**
- Monitor data retention in arrays
- Implement virtual scrolling
- Use React.memo for expensive components
- Clear unused event listeners

**Slow startup:**
- Optimize import statements
- Lazy load heavy components
- Minimize initial API calls
- Enable code splitting

### **Debugging Tools**

**Chrome DevTools:**
- Performance profiling
- Memory leak detection
- Network request analysis
- Console error tracking

**Electron DevTools:**
- Main process debugging
- Renderer process inspection
- IPC communication monitoring
- Native module debugging

---

## 📚 API Reference

### **Electron API**
```typescript
interface ElectronAPI {
  getAppInfo(): Promise<AppInfo>;
  openAdminDashboard(): Promise<void>;
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
  showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
  restartApp(): Promise<void>;
  // ... other methods
}
```

### **WebSocket API**
```typescript
interface WebSocketEvents {
  'connect': () => void;
  'disconnect': () => void;
  'real-time-update': (data: RealTimeData) => void;
  'mining-update': (data: MiningData) => void;
  'alert': (alert: Alert) => void;
  // ... other events
}
```

### **Service APIs**
```typescript
// Mining service
interface MiningService {
  startMining(config: MiningConfig): Promise<MiningSession>;
  stopMining(): Promise<void>;
  getMiningStats(): Promise<MiningStats>;
}

// Optimization service
interface OptimizationService {
  optimizeDom(url: string): Promise<OptimizationResult>;
  getOptimizationHistory(): Promise<OptimizationResult[]>;
}
```

---

## 🎯 Best Practices

### **Security**
- Always enable context isolation
- Disable node integration in renderers
- Use preload scripts for IPC communication
- Implement proper authentication
- Validate all user inputs
- Keep dependencies updated

### **Performance**
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Debounce search and filter inputs
- Throttle real-time updates
- Monitor memory usage
- Optimize bundle size

### **User Experience**
- Provide loading states for async operations
- Implement proper error handling
- Use consistent design patterns
- Ensure responsive design
- Add keyboard shortcuts
- Provide offline functionality

### **Code Quality**
- Follow TypeScript best practices
- Implement proper error boundaries
- Use consistent naming conventions
- Write comprehensive tests
- Document complex logic
- Use linting and formatting tools

---

## 🔄 Version History

### **v1.0.0** (2025-10-27)
- ✅ Initial release
- ✅ Exodus wallet-inspired design
- ✅ Real-time WebSocket communication
- ✅ Multi-window dashboard system
- ✅ Advanced security features
- ✅ Cross-platform support
- ✅ Auto-updater integration
- ✅ Comprehensive monitoring

### **Upcoming Features**
- 🔄 GPU mining support
- 🔄 Advanced analytics
- 🔄 Mobile companion app
- 🔄 Cloud synchronization
- 🔄 Plugin system
- 🔄 Theme customization

---

## 📞 Support & Community

### **Getting Help**
- **Documentation**: https://docs.lightdom.io
- **Community**: https://discord.gg/lightdom
- **Issues**: https://github.com/lightdom/issues
- **Discussions**: https://github.com/lightdom/discussions

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **License**
MIT License - see LICENSE file for details

---

**Built with ❤️ by the LightDom Team**

# LightDom Desktop Application

A powerful desktop application for the LightDom web crawling and DOM space harvesting platform, built with Electron and featuring a modern dark-themed interface.

## Features

- **🖥️ Native Desktop Experience**: Full-featured desktop application with native menus and system integration
- **🕷️ Integrated Web Crawling**: Built-in headless Chrome services for real-time web crawling
- **🎨 Modern Dark Theme**: Beautiful dark interface inspired by the dom-space-harvester.tsx design
- **⚡ Real-time Updates**: Live dashboard with WebSocket connections for instant data updates
- **🔧 Service Management**: Automatic startup and management of backend services
- **📊 Comprehensive Analytics**: Multiple dashboard views for different aspects of the platform

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```

## Running the Desktop App

### Development Mode
```bash
# Start development version (with hot reload)
npm run electron:dev
```

### Production Mode
```bash
# Quick launcher (automatically builds if needed)
npm run start:desktop

# Or manually
npm run build
npm run electron
```

### Building Distributables
```bash
# Build for current platform
npm run dist

# Build with electron-builder
npm run electron:build
```

## Architecture

### Main Process (`electron/main.js`)
- **Window Management**: Creates and manages the main application window
- **Service Orchestration**: Automatically starts backend API server and headless Chrome services
- **IPC Communication**: Handles communication between main and renderer processes
- **Menu System**: Provides native application menus with service controls

### Preload Script (`electron/preload.js`)
- **Secure IPC**: Exposes safe communication methods to the renderer
- **API Bridge**: Connects frontend with backend services
- **Version Info**: Provides access to Electron, Node, and Chrome versions

### Frontend Integration
The desktop app loads the same React frontend that runs in the browser, with additional Electron-specific features:

- **Service Status Monitoring**: Real-time status of headless Chrome services
- **Backend Logs**: Live view of backend service logs and errors
- **Crawler Controls**: Desktop-specific controls for starting/stopping crawlers
- **App Information**: Access to platform and version details

## Services Started by Desktop App

### 1. API Server (`api-server-express.js`)
- Main backend API server
- Handles HTTP requests from the frontend
- Manages database connections and operations

### 2. Headless Chrome Services
- **Chrome Service**: Browser automation and page control
- **Crawler Service**: Web crawling and data extraction
- **Optimization Engine**: Performance optimization and analysis

### 3. Background Workers
- Queue processing
- Data analysis
- Periodic maintenance tasks

## UI Theme and Styling

The desktop app features a consistent dark theme across all components:

### Color Scheme
- **Background**: Dark slate gradients (`slate-900`, `slate-800`)
- **Text**: White and light slate (`slate-300`, `slate-400`)
- **Accents**: Blue, purple, and pink gradients
- **Cards**: Semi-transparent backgrounds with backdrop blur
- **Borders**: Subtle slate borders (`slate-700`)

### Components Using the Theme
- ✅ **dom-space-harvester.tsx**: Reference implementation
- ✅ **TestingDashboard.tsx**: Comprehensive testing interface
- ✅ **SpaceOptimizationDashboard.tsx**: Space optimization tracking
- ✅ **BlockchainModelStorageDashboard.tsx**: Blockchain integration
- ✅ **MetaverseMiningDashboard.tsx**: Metaverse functionality
- ✅ **AdvancedNodeDashboard.tsx**: Node management
- ✅ **WorkflowSimulationDashboard.tsx**: Workflow automation

### Ant Design Components
Dashboard components in `/src/components/dashboard/` use Ant Design's design system for consistency with their component library.

## Development

### File Structure
```
electron/
├── main.js          # Main Electron process
├── preload.js       # Preload script for secure IPC
└── assets/          # Application icons and assets

src/
├── components/      # React components with dark theme
├── hooks/          # React hooks for state management
├── services/       # Backend service integrations
└── styles/         # CSS and styling files

dist/               # Built frontend files
start-desktop.js    # Desktop app launcher script
```

### Adding New Features

1. **Frontend Features**: Add React components in `src/components/`
2. **Backend Integration**: Add service calls in `src/services/`
3. **Electron Features**: Extend `electron/main.js` for system integration
4. **IPC Communication**: Update `electron/preload.js` for secure data exchange

## System Requirements

- **Node.js**: Version 16 or higher
- **npm**: Latest version
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space for application and data

## Troubleshooting

### Build Issues
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild native dependencies
npm rebuild
```

### Service Startup Issues
- Check that ports 3000 and 3001 are available
- Verify Node.js and npm versions
- Check system permissions for network access

### Performance Optimization
- Increase memory allocation: `NODE_OPTIONS="--max-old-space-size=4096"`
- Close unnecessary applications to free resources
- Monitor system resources in Activity Monitor/Task Manager

## License

This project is part of the LightDom platform. See the main project README for licensing information.
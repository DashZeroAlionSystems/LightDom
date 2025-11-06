# Chrome React Dev Container - Manual Startup Guide

## Quick Start (Recommended)

### Option 1: Cross-Platform Demo (Safest)
```bash
node cross-platform-chrome-react-demo.js
```
This will diagnose your system and provide specific startup instructions.

### Option 2: Windows Batch Script
```batch
start-chrome-react-windows.bat
```

### Option 3: PowerShell Script
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\Start-ChromeReactWorkflow.ps1
```

### Option 4: Direct Node Execution
```bash
node enterprise-chrome-react-workflow.js
```

## Manual Component Startup (For Debugging)

If the full workflow fails, start components individually:

### Step 1: Start Chrome React Container
```bash
node chrome-react-dev-container.js
```
This starts the headless Chrome browser and React environment.

### Step 2: Open Admin Dashboard
Open `admin-dashboard.html` in your web browser, or serve it:
```bash
# Using Python
python -m http.server 3003

# Using Node.js
npx http-server -p 3003
```

### Step 3: Access Your System
- **Live React Editor**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3003
- **Health Check**: http://localhost:3001/health

## Troubleshooting

### Error: spawn node ENOENT

**Cause**: Node.js not found in system PATH.

**Solutions**:

1. **Install Node.js**:
   - Download from: https://nodejs.org/
   - Install LTS version (18.x or later)

2. **Windows PATH Setup**:
   - Open System Properties → Advanced → Environment Variables
   - Add to PATH: `C:\Program Files\nodejs\`
   - Restart command prompt/PowerShell

3. **Use Full Path**:
   ```batch
   "C:\Program Files\nodejs\node.exe" enterprise-chrome-react-workflow.js
   ```

4. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

### Error: Ports Already in Use

**Solution**: Kill processes using the ports
```bash
# Windows
taskkill /f /im node.exe

# Linux/Mac
pkill -f node

# Or kill specific ports
netstat -ano | findstr :3001
taskkill /pid <PID> /f
```

### Error: Puppeteer Not Found

**Solution**: Install Puppeteer
```bash
npm install puppeteer

# Or globally
npm install -g puppeteer
```

### Error: Chrome Browser Issues

**Solutions**:

1. **Install Chrome Browser**:
   - Download from: https://www.google.com/chrome/

2. **Use Alternative Browser**:
   ```javascript
   // In chrome-react-dev-container.js, modify:
   const browser = await puppeteer.launch({
     executablePath: '/path/to/chrome' // or chromium
   });
   ```

3. **Headless Mode Issues**:
   ```javascript
   // Try without headless for debugging:
   headless: false
   ```

## System Requirements

### Minimum Requirements
- **Node.js**: 16.x or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Network**: Internet connection for npm packages

### Recommended Setup
- **Node.js**: 18.x LTS
- **RAM**: 8GB or more
- **Chrome Browser**: Latest version
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## Component Architecture

```
Chrome React Dev Container
├── chrome-react-dev-container.js     # Main container system
├── admin-dashboard.html              # Web-based management UI
├── enterprise-chrome-react-workflow.js # Self-creating workflow
├── cross-platform-chrome-react-demo.js # Diagnostic and demo tool
├── start-chrome-react-windows.bat    # Windows startup script
└── Start-ChromeReactWorkflow.ps1     # PowerShell startup script
```

## API Endpoints

### Container API (Port 3001)
- `GET /health` - System health status
- `POST /execute` - Execute code in browser
- `GET /status` - Container status information

### Dashboard API (Port 3003)
- `GET /api/container/status` - Container status
- `POST /api/container/execute` - Execute code
- `POST /api/container/restart` - Restart container
- `GET /api/monitoring/health` - Health metrics

### WebSocket (Port 3002)
- Real-time communication
- Live code execution results
- System status updates

## Features Overview

### ✅ Core Features
- **Live React Execution**: Write and run React code in real-time
- **Headless Chrome Integration**: Full browser automation
- **Code Editor**: Syntax-highlighted code editing
- **Live Preview**: Real-time component rendering
- **Error Handling**: Comprehensive error display and recovery

### ✅ Advanced Features
- **Self-Healing**: Automatic error recovery and retries
- **Performance Monitoring**: Real-time metrics and optimization
- **Admin Dashboard**: Web-based management interface
- **Cross-Platform**: Windows, macOS, Linux support
- **API Integration**: REST and WebSocket APIs

### ✅ Enterprise Features
- **Security Hardening**: Input validation and sanitization
- **Scalability**: Horizontal scaling capabilities
- **Monitoring**: Comprehensive logging and alerting
- **Deployment Ready**: Docker and Kubernetes support

## Development Workflow

1. **Start System**: Use one of the startup methods above
2. **Open Editor**: Navigate to http://localhost:3001
3. **Write Code**: Use the code editor to write React components
4. **Run Code**: Click "Run Code" to execute in browser
5. **Monitor**: Use admin dashboard at http://localhost:3003
6. **Debug**: Check logs and use browser DevTools
7. **Optimize**: Monitor performance and apply optimizations

## Performance Tips

- **Close Unused Tabs**: Reduce browser memory usage
- **Clear Console**: Regularly clear browser console logs
- **Monitor Resources**: Use admin dashboard for performance metrics
- **Restart Regularly**: Periodic restarts prevent memory leaks
- **Use Latest Versions**: Keep Node.js and Chrome updated

## Support

### Getting Help
1. Run the diagnostic demo: `node cross-platform-chrome-react-demo.js`
2. Check system requirements and troubleshooting guide
3. Verify all components are running correctly
4. Check browser console for JavaScript errors

### Common Issues
- **Slow Performance**: Check available RAM and CPU
- **Browser Crashes**: Update Chrome to latest version
- **Port Conflicts**: Free up ports 3001-3003
- **Memory Issues**: Close other applications and restart

### Logs and Debugging
- **Container Logs**: Check terminal output
- **Browser Console**: Open DevTools in Chrome
- **Network Tab**: Monitor API calls and WebSocket
- **Admin Dashboard**: Real-time monitoring and logs

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `node enterprise-chrome-react-workflow.js`
4. Make changes and test
5. Submit pull request

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## License

This project is part of the Enterprise Dev Container system.
See project root for license information.

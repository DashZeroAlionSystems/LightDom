# LightDom Electron & PWA Enhancements

## Overview

This document describes the comprehensive enhancements made to the LightDom Electron application and PWA features, implementing 2025 best practices for desktop and progressive web applications.

## Table of Contents

1. [Architecture](#architecture)
2. [Electron Features](#electron-features)
3. [PWA Features](#pwa-features)
4. [UI Components](#ui-components)
5. [Usage Guide](#usage-guide)
6. [Development](#development)
7. [Security](#security)

---

## Architecture

### Project Structure

```
LightDom/
├── electron/
│   ├── main-enhanced.cjs           # Modern Electron main process
│   ├── preload-enhanced.js         # Type-safe IPC bridge
│   ├── main.cjs                    # Legacy main process
│   ├── preload.js                  # Legacy preload
│   └── workers/
│       └── puppeteer-worker.js     # Worker pool for web automation
├── src/
│   ├── components/
│   │   ├── NotificationSystem.tsx  # Universal notifications
│   │   ├── DataVisualization.tsx   # Chart components
│   │   └── EnhancedDashboard.tsx   # Example dashboard
│   ├── hooks/
│   │   └── useElectron.ts          # React hooks for Electron API
│   └── types/
│       └── electron.d.ts           # TypeScript definitions
└── public/
    ├── sw.js                       # Basic service worker
    └── sw-enhanced.js              # Enhanced service worker
```

---

## Electron Features

### 1. Enhanced Main Process

**File**: `electron/main-enhanced.cjs`

#### Features:

- **Security Best Practices**
  - Context isolation enabled
  - Sandbox mode enabled
  - Node integration disabled
  - Content Security Policy (CSP)
  - Navigation protection
  - External link handling

- **Window Management**
  - Custom window configuration
  - Frameless/custom title bar support
  - Prevent visual flash with `ready-to-show`
  - macOS-specific features (traffic lights)

- **Auto-Updates**
  - Electron-updater integration
  - Automatic update checks
  - Download progress tracking
  - User-friendly update dialogs

- **System Tray**
  - Quick access menu
  - Show/hide window
  - Navigate to routes
  - Start/stop services
  - Quit application

- **Global Shortcuts**
  - `Cmd/Ctrl+Shift+L`: Toggle window
  - `Cmd/Ctrl+Shift+D`: Open dashboard
  - `Cmd/Ctrl+Shift+M`: Open space mining
  - `Cmd/Ctrl+Shift+W`: Open wallet

- **Native Notifications**
  - Cross-platform support
  - Click handlers
  - Custom actions

### 2. Type-Safe IPC

**File**: `electron/preload-enhanced.js`

Secure bridge between renderer and main process with minimal API surface:

```javascript
window.electron.app.getInfo()
window.electron.window.minimize()
window.electron.notification.show(title, body)
window.electron.puppeteer.crawl(options)
window.electron.file.select()
window.electron.system.openExternal(url)
```

### 3. Worker Pool System

**File**: `electron/workers/puppeteer-worker.js`

Multi-process architecture for intensive tasks:

#### Features:
- **Isolated Processes**: Each worker runs in a separate Node.js process
- **Parallel Processing**: 4 workers by default (configurable)
- **Task Distribution**: Automatic load balancing
- **Crash Recovery**: Workers auto-restart on failure

#### Supported Tasks:
- `crawl`: Web scraping with Puppeteer
- `screenshot`: Full-page screenshots
- `analyzeDom`: DOM structure analysis
- `monitorPerformance`: Performance metrics collection

#### Example Usage:

```javascript
const result = await window.electron.puppeteer.crawl({
  url: 'https://example.com',
  selectors: {
    title: 'h1',
    description: 'meta[name="description"]'
  },
  timeout: 30000
});
```

### 4. React Hooks

**File**: `src/hooks/useElectron.ts`

Easy-to-use React hooks for Electron features:

#### Available Hooks:

- `useIsElectron()`: Check if running in Electron
- `useAppInfo()`: Get application information
- `useWindowControls()`: Minimize, maximize, close
- `useElectronTheme()`: Theme toggle
- `useElectronNotification()`: Show notifications
- `usePuppeteerCrawl()`: Web crawling with state
- `useBackendLogs()`: Backend log stream
- `useServiceStatus()`: Service status monitoring
- `useElectronNavigation()`: Handle tray/shortcut navigation
- `useFileOperations()`: File select/save dialogs
- `useExternalLinks()`: Open external URLs

#### Example:

```tsx
import { useWindowControls, useElectronNotification } from '@/hooks/useElectron';

function MyComponent() {
  const { minimize, maximize, close } = useWindowControls();
  const { showNotification } = useElectronNotification();

  return (
    <div>
      <button onClick={minimize}>Minimize</button>
      <button onClick={() => showNotification('Hello', 'World')}>
        Notify
      </button>
    </div>
  );
}
```

---

## PWA Features

### Enhanced Service Worker

**File**: `public/sw-enhanced.js`

#### Features:

1. **Advanced Caching Strategies**
   - **Cache First**: Images and static assets
   - **Network First**: API calls and navigation
   - **Stale While Revalidate**: Other resources

2. **Background Sync**
   - Queue offline actions
   - Sync when connection restored
   - Examples: crawl data, mining results

3. **Periodic Background Sync**
   - Check mining status
   - Update crawler stats
   - Automatic notifications

4. **Push Notifications**
   - Server-triggered notifications
   - Action buttons
   - Click handlers

5. **Share Target**
   - Receive shared content from OS
   - Handle web share API

#### Registration:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-enhanced.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.error('SW error:', err));
}
```

#### Background Sync Usage:

```javascript
// Queue data for sync
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-crawl-data');
});

// Listen for sync completion
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'sync-complete') {
    console.log('Synced', event.data.data.count, 'records');
  }
});
```

---

## UI Components

### 1. Notification System

**File**: `src/components/NotificationSystem.tsx`

Universal notification system that works in both web and Electron:

#### Features:
- Toast-style notifications
- Multiple types: success, error, info, warning
- Auto-dismiss with progress bar
- Action buttons
- Stacking and animations
- Native Electron notifications (when available)

#### Usage:

```tsx
import { NotificationProvider, useNotifications } from '@/components/NotificationSystem';

function App() {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
}

function YourComponent() {
  const { success, error, info, warning } = useNotifications();

  return (
    <button onClick={() => success('Done!', 'Task completed')}>
      Show Success
    </button>
  );
}
```

### 2. Data Visualization

**File**: `src/components/DataVisualization.tsx`

Beautiful, animated charts for metrics:

#### Components:

**StatCard**
```tsx
<StatCard
  title="Tokens Earned"
  value={1250}
  change={12.5}
  icon={<Zap />}
  color="blue"
/>
```

**BarChart**
```tsx
<BarChart
  data={[
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 180 },
  ]}
  height={300}
  showValues
  animated
/>
```

**LineChart**
```tsx
<LineChart
  data={[
    { timestamp: '00:00', value: 0 },
    { timestamp: '12:00', value: 250 },
  ]}
  height={300}
  color="#6C7BFF"
  showGrid
/>
```

**DonutChart**
```tsx
<DonutChart
  data={[
    { label: 'CPU', value: 45, color: '#6C7BFF' },
    { label: 'Memory', value: 62, color: '#7C5CFF' },
  ]}
  height={300}
/>
```

**ProgressRing**
```tsx
<ProgressRing
  value={750}
  max={1000}
  size={120}
  color="#6C7BFF"
  label="Daily Goal"
/>
```

### 3. Enhanced Dashboard

**File**: `src/components/EnhancedDashboard.tsx`

Complete example showcasing all features:

- Custom title bar with window controls
- Service status monitoring
- Real-time backend logs
- Interactive charts
- Notification testing
- Puppeteer integration

---

## Usage Guide

### Running the Enhanced Electron App

1. **Development Mode**:
   ```bash
   # Terminal 1: Start Vite dev server
   npm run dev

   # Terminal 2: Start Electron (using enhanced version)
   ELECTRON_MAIN=electron/main-enhanced.cjs npm run electron
   ```

2. **Build for Production**:
   ```bash
   # Build frontend
   npm run build

   # Build Electron app
   npm run electron:build
   ```

3. **Platform-Specific Builds**:
   ```bash
   # Windows
   npm run dist -- --win

   # macOS
   npm run dist -- --mac

   # Linux
   npm run dist -- --linux
   ```

### Using Worker Pool

```javascript
// From renderer process
const result = await window.electron.worker.execute({
  type: 'crawl',
  options: {
    url: 'https://example.com',
    timeout: 30000
  }
});

if (result.success) {
  console.log('Crawl data:', result.result.data);
} else {
  console.error('Crawl failed:', result.error);
}
```

### Enabling PWA Features

1. **Install as PWA** (in browser):
   - Chrome: Settings → Install LightDom
   - Edge: App available → Install

2. **Enable Background Sync**:
   ```javascript
   // Request permission
   const status = await navigator.permissions.query({
     name: 'periodic-background-sync'
   });

   if (status.state === 'granted') {
     // Register periodic sync
     await registration.periodicSync.register('check-mining-status', {
       minInterval: 24 * 60 * 60 * 1000 // 24 hours
     });
   }
   ```

3. **Enable Push Notifications**:
   ```javascript
   // Request permission
   const permission = await Notification.requestPermission();

   if (permission === 'granted') {
     // Subscribe to push
     const subscription = await registration.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: YOUR_PUBLIC_KEY
     });
   }
   ```

---

## Development

### TypeScript Support

All Electron APIs are fully typed:

```typescript
import type { CrawlOptions, CrawlResult } from '@/types/electron';

const options: CrawlOptions = {
  url: 'https://example.com',
  selectors: { title: 'h1' },
  timeout: 30000
};

const result: CrawlResult = await window.electron.puppeteer.crawl(options);
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Debugging

1. **Main Process**:
   ```bash
   electron --inspect=5858 .
   ```
   Then attach Chrome DevTools to `chrome://inspect`

2. **Renderer Process**:
   - DevTools opens automatically in development
   - Or use `Cmd/Ctrl+Shift+I`

3. **Worker Processes**:
   Workers log to main process console

---

## Security

### Best Practices Implemented

1. **Context Isolation**: ✅ Enabled
2. **Node Integration**: ✅ Disabled in renderer
3. **Sandbox**: ✅ Enabled
4. **Remote Module**: ✅ Disabled
5. **CSP**: ✅ Implemented
6. **Navigation Protection**: ✅ Blocks unauthorized navigation
7. **External Links**: ✅ Opens in default browser
8. **IPC Validation**: ✅ Type-safe with minimal surface

### Security Checklist

- [ ] Review all `ipcMain.handle` calls
- [ ] Validate all user inputs
- [ ] Use `contextBridge` only (no `remote`)
- [ ] Never disable `webSecurity`
- [ ] Always use HTTPS for external resources
- [ ] Keep Electron updated
- [ ] Review `package.json` for vulnerabilities

```bash
npm audit
npm audit fix
```

---

## Migration from Legacy

### Switching to Enhanced Version

1. Update `package.json`:
   ```json
   {
     "main": "electron/main-enhanced.cjs"
   }
   ```

2. Update preload path in renderers:
   ```html
   <script>
     // Old API still works via legacy interface
     window.electron.legacy.getAppInfo()

     // New API
     window.electron.app.getInfo()
   </script>
   ```

3. Migrate components to use hooks:
   ```tsx
   // Old
   ipcRenderer.invoke('get-app-info')

   // New
   const { appInfo } = useAppInfo();
   ```

---

## Troubleshooting

### Common Issues

**1. "electron is undefined"**
- Check if running in Electron: `useIsElectron()`
- Verify preload script is loaded
- Check browser console for errors

**2. Worker pool not starting**
- Check if Puppeteer is installed: `npm ls puppeteer`
- Verify worker script path
- Check main process logs

**3. Service worker not updating**
- Unregister old SW: DevTools → Application → Service Workers
- Hard refresh: `Cmd/Ctrl+Shift+R`
- Check SW scope and registration

**4. Auto-update not working**
- Auto-update only works in production builds
- Requires code signing (macOS/Windows)
- Check update server configuration

---

## Performance

### Optimization Tips

1. **Worker Pool Size**: Adjust based on CPU cores
   ```javascript
   initializeWorkerPool(navigator.hardwareConcurrency || 4)
   ```

2. **Cache Strategy**: Choose appropriate strategy per resource type

3. **Service Worker**: Update cache version on app updates

4. **Memory**: Monitor worker memory usage
   ```javascript
   // In worker
   process.memoryUsage()
   ```

---

## Future Enhancements

### Planned Features

- [ ] Deep linking support
- [ ] Custom protocol handlers
- [ ] Encrypted local storage
- [ ] Multi-window support
- [ ] Touchbar support (macOS)
- [ ] Windows toast notifications
- [ ] Linux system tray icons
- [ ] App menu customization
- [ ] Crash reporting
- [ ] Analytics integration

---

## Resources

### Documentation
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Puppeteer Docs](https://pptr.dev/)

### Tools
- [Electron Forge](https://www.electronforge.io/)
- [Electron Builder](https://www.electron.build/)
- [Workbox](https://developers.google.com/web/tools/workbox) (SW library)

---

## Contributing

When adding new Electron features:

1. Add IPC handlers in `main-enhanced.cjs`
2. Expose via `preload-enhanced.js`
3. Add TypeScript types in `electron.d.ts`
4. Create React hook in `useElectron.ts`
5. Update this documentation
6. Add tests

---

## License

Same as LightDom project license.

---

## Support

For issues related to Electron enhancements, please file an issue with:
- OS version
- Electron version
- Node version
- Steps to reproduce
- Console logs (main and renderer)

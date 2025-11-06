# LightDom Enhanced - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom

# Install dependencies
npm install
```

### Running the App

#### Option 1: Web Browser (PWA)

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

#### Option 2: Electron Desktop App (Recommended)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Electron with enhanced features
npm run electron:enhanced
```

Or use the shortcut script:
```bash
npm run start:enhanced
```

### Try the Features

1. **Notifications**
   - Click "Test Notification" button
   - See both in-app and native notifications

2. **Window Controls** (Electron only)
   - Use custom title bar to minimize/maximize/close
   - Try keyboard shortcuts:
     - `Cmd/Ctrl+Shift+L`: Toggle window
     - `Cmd/Ctrl+Shift+D`: Open dashboard

3. **System Tray** (Electron only)
   - Find LightDom icon in system tray
   - Right-click for quick actions

4. **Web Crawling** (Electron only)
   - Click "Start Crawl" to test Puppeteer worker
   - Watch real-time progress

5. **Data Visualization**
   - Explore interactive charts
   - Hover over elements for details

6. **PWA Features** (Browser only)
   - Install as PWA from browser menu
   - Try offline mode

### Building for Production

```bash
# Build web version
npm run build

# Build Electron app
npm run electron:build

# Or build for specific platform
npm run dist -- --win   # Windows
npm run dist -- --mac   # macOS
npm run dist -- --linux # Linux
```

### Next Steps

- Read [Full Documentation](./ELECTRON_ENHANCEMENTS.md)
- Explore example components in `src/components/EnhancedDashboard.tsx`
- Check out React hooks in `src/hooks/useElectron.ts`

### Need Help?

- Check [Troubleshooting](./ELECTRON_ENHANCEMENTS.md#troubleshooting)
- File an issue on GitHub
- Read Electron security guide

## 📦 What's Included

### Enhanced Electron Features
- ✅ Modern main process with security best practices
- ✅ Type-safe IPC communication
- ✅ Puppeteer worker pool for web automation
- ✅ Auto-updates
- ✅ System tray integration
- ✅ Global keyboard shortcuts
- ✅ Native notifications

### PWA Features
- ✅ Enhanced service worker
- ✅ Background sync
- ✅ Periodic sync
- ✅ Push notifications
- ✅ Offline support
- ✅ Install as app

### UI Components
- ✅ Universal notification system
- ✅ Data visualization (charts)
- ✅ Stat cards with trends
- ✅ Progress rings
- ✅ Animated transitions

### Developer Experience
- ✅ TypeScript support
- ✅ React hooks for Electron
- ✅ Comprehensive documentation
- ✅ Example components
- ✅ Hot reload in development

## 🎯 Quick Examples

### Show a Notification

```tsx
import { useNotifications } from '@/components/NotificationSystem';

function MyComponent() {
  const { success } = useNotifications();

  return (
    <button onClick={() => success('Hello', 'World!')}>
      Notify
    </button>
  );
}
```

### Use Puppeteer Worker

```tsx
import { usePuppeteerCrawl } from '@/hooks/useElectron';

function MyCrawler() {
  const { crawl, loading, result } = usePuppeteerCrawl();

  const handleCrawl = () => {
    crawl({
      url: 'https://example.com',
      selectors: { title: 'h1' }
    });
  };

  return (
    <div>
      <button onClick={handleCrawl} disabled={loading}>
        {loading ? 'Crawling...' : 'Start Crawl'}
      </button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### Display a Chart

```tsx
import { BarChart } from '@/components/DataVisualization';

function MyChart() {
  const data = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 180 },
    { label: 'Wed', value: 150 },
  ];

  return <BarChart data={data} height={300} />;
}
```

## 🔥 Pro Tips

1. **Development**: Keep both terminals open (dev server + electron)
2. **Debugging**: Use Chrome DevTools (Cmd/Ctrl+Shift+I)
3. **Performance**: Monitor worker pool in enhanced dashboard
4. **Security**: Never disable context isolation or web security
5. **Updates**: Keep Electron and dependencies updated

Happy coding! 🎉

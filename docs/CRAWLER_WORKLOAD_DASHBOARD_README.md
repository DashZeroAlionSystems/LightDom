# Crawler Workload Management System

## Overview

The Crawler Workload Management System is a comprehensive dashboard for monitoring, configuring, and managing parallel web crawlers in the LightDom platform. It combines real-time monitoring, AI-powered URL seeding, and centralized crawler configuration.

## Features

### 🔴 Live Crawler Monitoring
- **Real-time status updates** - 2-second polling interval with auto-refresh
- **Parallel crawler visibility** - See all active crawlers and their workloads
- **Individual crawler cards** - Detailed view of each crawler's performance
- **Live metrics** - Pages/second, efficiency, queue size, progress
- **Smooth animations** - Counters, progress bars, and status transitions

### 🌱 AI-Powered URL Seeding
- **Natural language prompts** - Describe what to crawl in plain English
- **Automatic configuration** - AI generates complete crawler configs
- **Schema-based seeding** - Automatic attribute and category selection
- **Manual seed entry** - Add URLs manually when needed
- **Workload estimation** - See estimated pages and completion time

### 📊 Workload Analysis
- **Domain distribution** - Visual breakdown of crawler workload
- **Performance trends** - Historical metrics and efficiency analysis
- **Resource usage** - CPU, memory, and network monitoring

### ⚙️ Global Settings
- **Max parallel crawlers** - Control system-wide crawler limits
- **Rate limiting** - Configure requests per second
- **Timeout settings** - Adjust page load timeouts
- **Robots.txt compliance** - Enable/disable robots.txt respect
- **Auto-restart** - Automatically retry failed crawlers

## Components

### Main Dashboard
**Component:** `CrawlerWorkloadDashboard`  
**Path:** `/admin/crawler-workload`

Tab-based interface with four main sections:
1. Live Monitoring
2. URL Seeding
3. Workload Analysis
4. Settings

### Enhanced Crawler Monitoring
**Component:** `EnhancedCrawlerMonitoringDashboard`  
**Features:**
- Real-time crawler status cards
- Live metric cards (Active Crawlers, Pages/Sec, Total Pages, Efficiency)
- Auto-refresh toggle
- Manual refresh button

### URL Seeding Service
**Component:** `URLSeedingService`  
**Features:**
- AI prompt input for configuration generation
- Generated config display with stats
- Manual URL seed entry
- Start crawling button

## Atomic Design System Components

### Live Data Components

#### LiveStatusIndicator
Real-time status indicator with pulsing animation.

```tsx
<LiveStatusIndicator
  status="active"
  label="Crawler"
  count={5}
  pulse={true}
/>
```

**Props:**
- `status`: 'active' | 'idle' | 'warning' | 'error' | 'processing'
- `label`: string
- `count`: number (optional)
- `showDot`: boolean (default: true)
- `pulse`: boolean (default: false)

#### LiveMetricCard
Metric card with trend indicators.

```tsx
<LiveMetricCard
  label="Active Crawlers"
  value={10}
  unit="/ 20"
  status="active"
  trend="up"
  trendValue="+20%"
  icon={<Activity />}
/>
```

#### LiveCounter
Animated counter with smooth transitions.

```tsx
<LiveCounter
  value={1234567}
  format="compact"
  decimals={2}
/>
// Displays: 1.23M
```

**Formats:**
- `number`: Standard number formatting
- `compact`: 1K, 1M, 1B notation
- `bytes`: 1KB, 1MB, 1GB notation

#### LiveProgressBar
Animated progress bar with status colors.

```tsx
<LiveProgressBar
  value={75}
  max={100}
  status="success"
  showLabel={true}
  animated={true}
/>
```

#### LiveBadge
Status badge with optional pulse.

```tsx
<LiveBadge
  variant="success"
  pulse={true}
  icon={<CheckCircle />}
>
  Active
</LiveBadge>
```

#### LiveTimestamp
Auto-updating relative timestamp.

```tsx
<LiveTimestamp
  timestamp={new Date()}
  format="relative"
  updateInterval={1000}
/>
// Displays: "2m ago"
```

#### ActivityPulse
Minimal animated activity indicator.

```tsx
<ActivityPulse
  active={true}
  size="md"
  color="green"
/>
```

## API Integration

### Generate Crawler Configuration
**Endpoint:** `POST /api/crawler/generate-config`

**Request:**
```json
{
  "prompt": "Crawl top 10 SaaS landing pages and extract pricing tables, features, and testimonials"
}
```

**Response:**
```json
{
  "seeds": [...],
  "parallelCrawlers": 3,
  "maxDepth": 3,
  "rateLimit": 10,
  "timeout": 30000,
  "schemaKey": "seo-content",
  "attributes": ["metaTags", "keywords", "contentBlocks"],
  "categories": ["Metadata", "Content Intelligence"],
  "estimatedPages": 1000,
  "estimatedTime": "2 hours"
}
```

### Start Crawl Job
**Endpoint:** `POST /api/crawler/start-job`

**Request:**
```json
{
  "seeds": ["https://example.com"],
  "config": {
    "parallelCrawlers": 3,
    "maxDepth": 3
  },
  "schemaKey": "seo-content",
  "attributes": ["metaTags", "keywords"]
}
```

**Response:**
```json
{
  "jobId": "job-1234567890-abc123",
  "status": "queued",
  "message": "Crawl job created successfully",
  "seedCount": 1,
  "estimatedStartTime": "Within 1 minute"
}
```

### Get Active Crawlers
**Endpoint:** `GET /api/crawler/active`

**Response:**
```json
[
  {
    "crawler_id": "crawler-1",
    "status": "active",
    "current_url": "https://example.com/page",
    "queue_size": 45,
    "pages_per_second": 2.5,
    "efficiency_percent": 85,
    "total_pages_processed": 1234
  }
]
```

### Get Crawler Statistics
**Endpoint:** `GET /api/crawler/stats`

**Response:**
```json
{
  "total_urls_crawled": 50000,
  "total_space_saved": 1073741824,
  "total_tokens_earned": 5000,
  "avg_space_per_url": 21474,
  "active_workers": 5
}
```

## Schema Linking

All components are schema-linked with complete definitions in `crawler-component-schemas.ts`.

### Component Schema Structure
- Data sources (API endpoints, tables, fields)
- Atomic components used
- Design system components used
- User interactions
- Workflows

### Database Tables
- `active_crawlers` - Currently running crawlers
- `crawl_targets` - URLs queued for crawling
- `crawler_configurations` - Saved crawler configs
- `crawl_jobs` - Crawl job history and status

## Usage Examples

### Basic Monitoring
```tsx
import EnhancedCrawlerMonitoringDashboard from '@/components/ui/admin/EnhancedCrawlerMonitoringDashboard';

function MyComponent() {
  return <EnhancedCrawlerMonitoringDashboard />;
}
```

### URL Seeding
```tsx
import URLSeedingService from '@/components/ui/admin/URLSeedingService';

function MyComponent() {
  return <URLSeedingService />;
}
```

### Full Dashboard
```tsx
import CrawlerWorkloadDashboard from '@/components/ui/admin/CrawlerWorkloadDashboard';

function MyComponent() {
  return <CrawlerWorkloadDashboard />;
}
```

## Development

### Running Locally
```bash
# Start the development server
npm run dev

# Navigate to the crawler dashboard
# http://localhost:3000/admin/crawler-workload
```

### Testing
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm run test
```

### Building
```bash
# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Design System Integration

All components follow the LightDom Design System guidelines:
- Material Design 3 principles
- Tailwind CSS for styling
- CVA (class-variance-authority) for variants
- Consistent spacing and typography
- Accessibility-first design

### Color Palette
- Success: Green-500 (#10b981)
- Warning: Yellow-500 (#f59e0b)
- Error: Red-500 (#ef4444)
- Info: Blue-500 (#3b82f6)
- Neutral: Gray-500 (#6b7280)

### Animation Timing
- Fast (UI feedback): 100-200ms
- Medium (state changes): 200-400ms
- Slow (attention): 400-600ms
- Background (pulse): 1000-2000ms

## Performance Optimization

- **Debounced updates** - Prevent excessive re-renders
- **Memoized components** - Cache expensive calculations
- **Virtual scrolling** - Handle large crawler lists
- **CSS transforms** - Hardware-accelerated animations
- **Request batching** - Combine multiple API calls

## Accessibility

- **ARIA labels** - Screen reader support
- **Keyboard navigation** - Full keyboard accessibility
- **Color contrast** - WCAG AA compliant
- **Focus indicators** - Visible focus states
- **Reduced motion** - Respect prefers-reduced-motion

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- [ ] WebSocket support for instant updates (upgrade from polling)
- [ ] Advanced workload analytics with charts
- [ ] Crawler performance profiling
- [ ] Custom crawler presets
- [ ] Crawler scheduling system
- [ ] Export crawl data to CSV/JSON
- [ ] Crawler templates library
- [ ] Multi-user crawler assignments

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

See [LICENSE](../LICENSE) for details.

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-02  
**Maintainers:** LightDom Development Team

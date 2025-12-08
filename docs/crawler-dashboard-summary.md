# Crawler Dashboard Overview

The `src/components/ui/admin/CrawlerDashboard.tsx` component renders the admin-facing dashboard for live crawler telemetry.

## Data Fetching

- Pulls crawler statistics, recent optimizations, and active crawler sessions from `/api/crawler/stats`, `/api/crawler/optimizations`, and `/api/crawler/active`.
- Auto-refreshes data every five seconds through a managed interval; exposes a manual refresh button for on-demand updates.

## Key Visual Sections

- **KPI Cards:** Displays URLs crawled, total space saved, tokens earned, and count of active workers with Ant Design statistics.
- **Status Breakdown:** Optional section summarizing crawl states (completed, processing, error, etc.) with contextual icons.
- **Trend Charts:** Recharts area and line charts plot recent crawl space savings (KB) and tokens earned per crawl.
- **Data Tabs:** Ant Design tables list recent optimizations (with URLs, space saved, token payouts, optimization tags) and currently active crawler instances (including performance metrics and status tags).

## Utilities

- Formats byte counts into human readable strings and maps crawler statuses to colored Ant Design tags to aid quick scanning.

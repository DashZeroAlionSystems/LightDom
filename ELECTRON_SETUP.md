# Electron App Setup Guide

## Problem
The Electron app couldn't find the frontend build because:
- No production build exists in `dist/`
- No development server is running
- Electron defaults to production mode

## Solutions

### Option 1: Use Development Mode (Recommended)
Run both the Vite dev server and Electron together:

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server on port 3000
2. Wait for it to be ready
3. Launch Electron with hot-reload support

### Option 2: Build and Run Production Mode
Build the frontend first, then run Electron:

```bash
npm run electron:build-and-run
```

Or manually:
```bash
npm run build
npm run electron
```

### Option 3: Run Dev Server Separately
In one terminal:
```bash
npm run dev
```

In another terminal:
```bash
npm run electron
```

## Configuration Changes Made

### package.json Scripts
- `electron:dev` - Starts dev server and Electron together
- `electron:build-and-run` - Builds frontend then launches Electron
- `electron` - Just launches Electron (looks for dev server on port 3000, falls back to dist/)

### electron/main.cjs
- Added CSP headers to fix security warnings
- Added sandbox configuration
- Improved error handling

## Security Warnings Fixed

The CSP (Content Security Policy) warning was fixed by adding proper headers:
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Required for React hot-reload
- `style-src 'self' 'unsafe-inline'` - For CSS
- `img-src 'self' data: https:` - For images
- `connect-src 'self' ws: wss: http: https:` - For WebSocket and API calls

Note: `unsafe-eval` is only needed in development. For production builds, this can be removed.

## Troubleshooting

### "Failed to load URL" Error
**Cause:** No frontend running or built
**Solution:** Run `npm run build` or `npm run electron:dev`

### "Port already in use" Error
**Cause:** Another service is using port 3000
**Solution:** Kill the process or change the port in `vite.config.ts`

### Backend Not Running
**Cause:** The backend API (port 3001) is not started
**Solution:** The Electron app will start the backend automatically via `simple-api-server.js`

## Development Workflow

1. **First time setup:**
   ```bash
   npm install
   npm run build  # Build the frontend
   ```

2. **Daily development:**
   ```bash
   npm run electron:dev  # Best for active development
   ```

3. **Production testing:**
   ```bash
   npm run electron:build-and-run
   ```

## Architecture

```
Electron App
├── Main Process (electron/main.cjs)
│   ├── Backend API server (port 3001)
│   ├── Window management
│   └── IPC handlers
├── Renderer Process
│   ├── Dev mode: Vite dev server (port 3000)
│   └── Production: Built files (dist/)
└── Services
    ├── Web crawler
    ├── DOM optimizer
    └── Blockchain integration
```

## Notes

- The backend API runs on port 3001
- The frontend dev server runs on port 3000
- Electron connects to frontend (dev or built)
- Frontend proxies `/api` calls to backend
- All services start automatically when Electron launches


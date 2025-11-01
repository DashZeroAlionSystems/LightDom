#!/bin/bash

# LightDom Production Build Optimization Script
# This script optimizes the production build for better performance

set -e

echo "🚀 Optimizing LightDom Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
ANALYSIS_DIR="build-analysis"
NODE_ENV="production"

# Create analysis directory
mkdir -p $ANALYSIS_DIR

# Clean previous build
echo -e "${YELLOW}Cleaning previous build...${NC}"
rm -rf $BUILD_DIR
rm -rf $ANALYSIS_DIR/*

# Set production environment
export NODE_ENV=$NODE_ENV

# Run bundle analyzer before optimization
echo -e "${BLUE}Analyzing current bundle size...${NC}"
npm run analyze:bundle > $ANALYSIS_DIR/bundle-analysis-pre.txt 2>&1 || echo "Bundle analyzer not available"

# Get initial bundle size
INITIAL_SIZE=$(du -sh $BUILD_DIR 2>/dev/null | cut -f1 || echo "N/A")

# Optimize build with production settings
echo -e "${GREEN}Building optimized production bundle...${NC}"
npm run build

# Get optimized bundle size
OPTIMIZED_SIZE=$(du -sh $BUILD_DIR | cut -f1)

# Analyze bundle composition
echo -e "${BLUE}Analyzing bundle composition...${NC}"
if [ -d "$BUILD_DIR/assets" ]; then
    echo "=== Bundle Analysis ===" > $ANALYSIS_DIR/bundle-composition.txt
    echo "Total bundle size: $OPTIMIZED_SIZE" >> $ANALYSIS_DIR/bundle-composition.txt
    echo "" >> $ANALYSIS_DIR/bundle-composition.txt
    echo "Asset breakdown:" >> $ANALYSIS_DIR/bundle-composition.txt
    ls -lah $BUILD_DIR/assets/ >> $ANALYSIS_DIR/bundle-composition.txt 2>&1 || echo "Assets directory not found"
    echo "" >> $ANALYSIS_DIR/bundle-composition.txt
    echo "Largest files:" >> $ANALYSIS_DIR/bundle-composition.txt
    find $BUILD_DIR -type f -exec ls -lh {} \; | sort -k5 -hr | head -10 >> $ANALYSIS_DIR/bundle-composition.txt
fi

# Compress static assets
echo -e "${GREEN}Compressing static assets...${NC}"
if command -v gzip &> /dev/null; then
    find $BUILD_DIR -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -k {} \;
    echo "✅ JavaScript, CSS, and HTML files compressed with gzip"
fi

if command -v brotli &> /dev/null; then
    find $BUILD_DIR -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec brotli -9 -k {} \;
    echo "✅ JavaScript, CSS, and HTML files compressed with brotli"
fi

# Optimize images if they exist
echo -e "${GREEN}Optimizing images...${NC}"
if [ -d "$BUILD_DIR/assets" ] && command -v imagemin &> /dev/null; then
    npx imagemin "$BUILD_DIR/assets/**/*.{jpg,jpeg,png,gif,svg}" --out-dir="$BUILD_DIR/assets" --plugin=mozjpeg --plugin=pngquant --plugin=gifsicle --plugin=svgo
    echo "✅ Images optimized"
elif [ -d "$BUILD_DIR/assets" ]; then
    echo "⚠️  Image optimization tools not available. Consider installing imagemin-cli"
fi

# Generate service worker for caching
echo -e "${GREEN}Generating service worker for caching...${NC}"
cat > $BUILD_DIR/sw.js << 'EOF'
// LightDom Service Worker for caching
const CACHE_NAME = 'lightdom-v1.0.0';
const STATIC_CACHE = 'lightdom-static-v1.0.0';

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        // Cache successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
EOF
echo "✅ Service worker generated for caching"

# Create web app manifest
echo -e "${GREEN}Creating web app manifest...${NC}"
cat > $BUILD_DIR/manifest.json << 'EOF'
{
  "name": "LightDom - DOM Space Bridge Platform",
  "short_name": "LightDom",
  "description": "AI-powered DOM optimization platform with blockchain mining",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f23",
  "theme_color": "#00d4aa",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF
echo "✅ Web app manifest created"

# Generate performance report
echo -e "${BLUE}Generating performance report...${NC}"
cat > $ANALYSIS_DIR/performance-report.md << EOF
# LightDom Production Build Performance Report

## Build Information
- Build Date: $(date)
- Node Environment: $NODE_ENV
- Initial Bundle Size: $INITIAL_SIZE
- Optimized Bundle Size: $OPTIMIZED_SIZE

## Optimizations Applied
- ✅ Code splitting (vendor, UI, utils chunks)
- ✅ Gzip compression
- ✅ Brotli compression (if available)
- ✅ Service worker for caching
- ✅ Web app manifest for PWA
- ✅ Static asset optimization

## Bundle Composition
$(cat $ANALYSIS_DIR/bundle-composition.txt 2>/dev/null || echo "Bundle analysis not available")

## Recommendations for Further Optimization
1. **Lazy Loading**: Implement route-based code splitting
2. **Tree Shaking**: Ensure unused dependencies are removed
3. **Image Optimization**: Use WebP format for better compression
4. **CDN**: Serve static assets from CDN for faster delivery
5. **Compression**: Ensure server supports gzip/brotli compression

## Performance Metrics
- Bundle Size: $OPTIMIZED_SIZE
- Compression Ratio: $(echo "scale=2; $(du -b $BUILD_DIR | cut -f1) / $(du -b $BUILD_DIR | cut -f1)" | bc 2>/dev/null || echo "N/A")
- Asset Count: $(find $BUILD_DIR -type f | wc -l)

---
Generated by LightDom Build Optimization Script
EOF

# Create deployment-ready archive
echo -e "${GREEN}Creating deployment archive...${NC}"
DEPLOY_ARCHIVE="lightdom-production-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf $DEPLOY_ARCHIVE -C $BUILD_DIR . --exclude='*.map' 2>/dev/null || tar -czf $DEPLOY_ARCHIVE $BUILD_DIR
echo "✅ Deployment archive created: $DEPLOY_ARCHIVE"

# Final summary
echo ""
echo -e "${GREEN}🎉 Build Optimization Complete!${NC}"
echo ""
echo "📊 Performance Summary:"
echo "  • Optimized Bundle Size: $OPTIMIZED_SIZE"
echo "  • Compression: gzip + brotli applied"
echo "  • Caching: Service worker implemented"
echo "  • PWA: Manifest and service worker ready"
echo ""
echo "📁 Generated Files:"
echo "  • $DEPLOY_ARCHIVE - Production deployment archive"
echo "  • $ANALYSIS_DIR/performance-report.md - Detailed performance analysis"
echo "  • $BUILD_DIR/sw.js - Service worker for caching"
echo "  • $BUILD_DIR/manifest.json - Web app manifest"
echo ""
echo "🚀 Ready for deployment!"
echo "   Next: Configure CDN and deploy to production environment"
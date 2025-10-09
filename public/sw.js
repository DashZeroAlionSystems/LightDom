/**
 * LightDOM Service Worker
 * Enables offline functionality and PWA features
 */

const CACHE_NAME = 'lightdom-v2';
const API_CACHE_NAME = 'lightdom-api-v2';
const STATIC_CACHE_NAME = 'lightdom-static-v2';

const isDev = (() => {
  try {
    return self && self.location && self.location.hostname === 'localhost';
  } catch (_) {
    return false;
  }
})();

const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/src/styles/design-tokens.css',
  '/src/styles/component-system.css',
  '/src/styles/animations.css',
  '/src/discord-theme.css'
];

const apiEndpointsToCache = [
  '/api/wallet/balance',
  '/api/metaverse/stats',
  '/api/blockchain/stats',
  '/api/crawler/stats',
  '/api/optimization/stats'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  if (!isDev) {
    event.waitUntil(
      Promise.all([
        // Cache static assets
        caches.open(STATIC_CACHE_NAME).then(cache => {
          console.log('[ServiceWorker] Caching static assets');
          return cache.addAll(urlsToCache);
        }),
        // Cache API endpoints
        caches.open(API_CACHE_NAME).then(cache => {
          console.log('[ServiceWorker] Caching API endpoints');
          return Promise.all(apiEndpointsToCache.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                cache.put(url, response.clone());
              }
            }).catch(() => {
              // Ignore errors for optional API caching
            })
          ));
        })
      ]).catch(err => {
        console.error('[ServiceWorker] Failed to cache:', err);
      })
    );
  }
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  if (!isDev) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE_NAME, API_CACHE_NAME].includes(cacheName)) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
  // Claim all clients
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Vite dev client, HMR, and source files in dev
  if (isDev) {
    const url = event.request.url;
    if (
      url.includes('/@vite') ||
      url.includes('/@react-refresh') ||
      url.includes('/node_modules/') ||
      url.includes('/src/') ||
      url.includes('/__vite-browser-external')
    ) {
      return; // let the network handle it
    }
  }

  event.respondWith(
    (isDev ? Promise.resolve(undefined) : caches.match(event.request))
      .then(response => {
        if (response) {
          console.log('[ServiceWorker] Found in cache:', event.request.url);
          return response;
        }

        console.log('[ServiceWorker] Fetching:', event.request.url);
        
        return fetch(event.request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          if (!isDev) {
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.error('[ServiceWorker] Cache put failed:', err);
                  });
                }
              })
              .catch(err => {
                console.error('[ServiceWorker] Open cache failed:', err);
              });
          }

          return response;
        });
      })
      .catch(err => {
        console.error('[ServiceWorker] Fetch failed:', err);
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for offline optimization submissions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-optimizations') {
    event.waitUntil(syncOptimizations());
  }
});

// Push notifications for mining rewards
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push event');
  
  const options = {
    body: event.data ? event.data.text() : 'New LightDOM reward earned!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Dashboard',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('LightDOM Space Harvester', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Sync optimizations when back online
async function syncOptimizations() {
  try {
    // Get pending optimizations from IndexedDB
    const pendingOptimizations = await getPendingOptimizations();
    
    // Send to server
    for (const optimization of pendingOptimizations) {
      await fetch('/api/optimizations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(optimization)
      });
      
      // Remove from pending
      await removePendingOptimization(optimization.id);
    }
    
    console.log('[ServiceWorker] Synced', pendingOptimizations.length, 'optimizations');
  } catch (err) {
    console.error('[ServiceWorker] Sync failed:', err);
    throw err;
  }
}

// Helper functions for IndexedDB
async function getPendingOptimizations() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingOptimization(id) {
  // Implementation would use IndexedDB
}

// Enhanced Background Sync
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'optimization-sync') {
    event.waitUntil(syncOptimizations());
  } else if (event.tag === 'wallet-sync') {
    event.waitUntil(syncWalletData());
  } else if (event.tag === 'blockchain-sync') {
    event.waitUntil(syncBlockchainData());
  } else if (event.tag === 'crawler-sync') {
    event.waitUntil(syncCrawlerData());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'LightDom Update', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/explore.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    tag: data.tag || 'lightdom-update',
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LightDom Space Harvester', options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll().then(clientList => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync wallet data
async function syncWalletData() {
  try {
    console.log('[ServiceWorker] Syncing wallet data...');
    const response = await fetch('/api/wallet/balance');
    if (response.ok) {
      const data = await response.json();
      await updateCachedWalletData(data);
    }
  } catch (error) {
    console.error('[ServiceWorker] Wallet sync failed:', error);
    throw error;
  }
}

// Sync blockchain data
async function syncBlockchainData() {
  try {
    console.log('[ServiceWorker] Syncing blockchain data...');
    const response = await fetch('/api/blockchain/stats');
    if (response.ok) {
      const data = await response.json();
      await updateCachedBlockchainData(data);
    }
  } catch (error) {
    console.error('[ServiceWorker] Blockchain sync failed:', error);
    throw error;
  }
}

// Sync crawler data
async function syncCrawlerData() {
  try {
    console.log('[ServiceWorker] Syncing crawler data...');
    const response = await fetch('/api/crawler/stats');
    if (response.ok) {
      const data = await response.json();
      await updateCachedCrawlerData(data);
    }
  } catch (error) {
    console.error('[ServiceWorker] Crawler sync failed:', error);
    throw error;
  }
}

// Helper functions for data management
async function updateCachedWalletData(data) {
  const cache = await caches.open(API_CACHE_NAME);
  await cache.put('/api/wallet/balance', new Response(JSON.stringify(data)));
}

async function updateCachedBlockchainData(data) {
  const cache = await caches.open(API_CACHE_NAME);
  await cache.put('/api/blockchain/stats', new Response(JSON.stringify(data)));
}

async function updateCachedCrawlerData(data) {
  const cache = await caches.open(API_CACHE_NAME);
  await cache.put('/api/crawler/stats', new Response(JSON.stringify(data)));
}

// Periodic background sync for system health
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'REGISTER_BACKGROUND_SYNC') {
    // Register background sync for different data types
    self.registration.sync.register('optimization-sync');
    self.registration.sync.register('wallet-sync');
    self.registration.sync.register('blockchain-sync');
    self.registration.sync.register('crawler-sync');
  }
});

console.log('[ServiceWorker] Enhanced version loaded');
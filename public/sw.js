/**
 * LightDOM Advanced Service Worker
 * Enables offline functionality, PWA features, and data mining capabilities
 * 
 * Features:
 * - Multi-tier caching strategy (static, dynamic, API)
 * - IndexedDB for structured data storage
 * - Offline mining capabilities
 * - Network activity monitoring
 * - Cache inspection for training data
 */

const CACHE_NAME = 'lightdom-v3';
const API_CACHE_NAME = 'lightdom-api-v3';
const STATIC_CACHE_NAME = 'lightdom-static-v3';
const DYNAMIC_CACHE_NAME = 'lightdom-dynamic-v3';
const MINING_CACHE_NAME = 'lightdom-mining-v3';

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
  '/api/optimization/stats',
  '/api/cache/stats',
  '/api/mining/status'
];

// IndexedDB configuration for structured data
const DB_NAME = 'LightDomCache';
const DB_VERSION = 1;
const STORES = {
  CRAWL_DATA: 'crawlData',
  SCREENSHOTS: 'screenshots',
  OCR_RESULTS: 'ocrResults',
  NETWORK_LOGS: 'networkLogs',
  TRAINING_DATA: 'trainingData'
};

// Initialize IndexedDB
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.CRAWL_DATA)) {
        const crawlStore = db.createObjectStore(STORES.CRAWL_DATA, { keyPath: 'url' });
        crawlStore.createIndex('timestamp', 'timestamp', { unique: false });
        crawlStore.createIndex('hash', 'hash', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.SCREENSHOTS)) {
        const screenshotStore = db.createObjectStore(STORES.SCREENSHOTS, { keyPath: 'hash' });
        screenshotStore.createIndex('url', 'url', { unique: false });
        screenshotStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.OCR_RESULTS)) {
        const ocrStore = db.createObjectStore(STORES.OCR_RESULTS, { keyPath: 'screenshotHash' });
        ocrStore.createIndex('confidence', 'confidence', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.NETWORK_LOGS)) {
        const networkStore = db.createObjectStore(STORES.NETWORK_LOGS, { autoIncrement: true });
        networkStore.createIndex('url', 'url', { unique: false });
        networkStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.TRAINING_DATA)) {
        const trainingStore = db.createObjectStore(STORES.TRAINING_DATA, { keyPath: 'hash' });
        trainingStore.createIndex('type', 'type', { unique: false });
        trainingStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Install event - cache essential files and initialize IndexedDB
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  if (!isDev) {
    event.waitUntil(
      Promise.all([
        // Initialize IndexedDB
        initDB().then(() => {
          console.log('[ServiceWorker] IndexedDB initialized');
        }),
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
        }),
        // Create mining cache
        caches.open(MINING_CACHE_NAME).then(() => {
          console.log('[ServiceWorker] Mining cache created');
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
  const validCaches = [STATIC_CACHE_NAME, API_CACHE_NAME, DYNAMIC_CACHE_NAME, MINING_CACHE_NAME];
  
  if (!isDev) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCaches.includes(cacheName)) {
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

// Helper functions for IndexedDB operations
async function saveToIndexedDB(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromIndexedDB(storeName, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromIndexedDB(storeName, limit = 100) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll(null, limit);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Log network activity to IndexedDB
async function logNetworkActivity(url, request, response) {
  try {
    const log = {
      url,
      requestUrl: request.url,
      method: request.method,
      timestamp: Date.now(),
      status: response ? response.status : null,
      fromCache: response ? response.headers.get('x-from-cache') === 'true' : false,
      type: request.destination || 'unknown'
    };
    
    await saveToIndexedDB(STORES.NETWORK_LOGS, log);
  } catch (error) {
    console.error('[ServiceWorker] Failed to log network activity:', error);
  }
}

// Save crawl data to IndexedDB
async function saveCrawlData(url, data) {
  try {
    const crawlData = {
      url,
      hash: await hashContent(JSON.stringify(data)),
      timestamp: Date.now(),
      data
    };
    
    await saveToIndexedDB(STORES.CRAWL_DATA, crawlData);
    console.log('[ServiceWorker] Crawl data saved for:', url);
  } catch (error) {
    console.error('[ServiceWorker] Failed to save crawl data:', error);
  }
}

// Hash content for deduplication
async function hashContent(content) {
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Enhanced fetch handler with network monitoring
async function handleFetch(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  // Log network activity
  const startTime = Date.now();
  
  try {
    // Try cache first for static assets
    if (request.method === 'GET' && isStaticAsset(url)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[ServiceWorker] Serving from cache:', request.url);
        await logNetworkActivity(url.href, request, cachedResponse);
        return cachedResponse;
      }
    }
    
    // Network first for API requests with cache fallback
    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await fetch(request);
        
        if (response.ok) {
          // Cache successful API responses
          const cache = await caches.open(API_CACHE_NAME);
          cache.put(request, response.clone());
        }
        
        await logNetworkActivity(url.href, request, response);
        return response;
      } catch (error) {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log('[ServiceWorker] Network failed, serving from cache:', request.url);
          return cachedResponse;
        }
        throw error;
      }
    }
    
    // Stale-while-revalidate for dynamic content
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE_NAME);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    });
    
    return cachedResponse || fetchPromise;
    
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    
    // Return cached response or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Network error', { status: 503 });
  } finally {
    const duration = Date.now() - startTime;
    console.log(`[ServiceWorker] Request took ${duration}ms:`, request.url);
  }
}

function isStaticAsset(url) {
  const extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  return extensions.some(ext => url.pathname.endsWith(ext));
}

console.log('[ServiceWorker] Enhanced version loaded');
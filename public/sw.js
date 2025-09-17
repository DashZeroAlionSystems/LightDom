// LightDom Service Worker
const CACHE_NAME = 'lightdom-v1.0.0';
const urlsToCache = [
  '/',
  '/dashboard',
  '/optimize',
  '/wallet',
  '/settings',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/css/main.css',
  '/js/main.js',
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Install event');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All files cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate event');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetch event for', event.request.url);

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch from network
      if (response) {
        console.log('Service Worker: Serving from cache', event.request.url);
        return response;
      }

      console.log('Service Worker: Fetching from network', event.request.url);
      return fetch(event.request)
        .then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(error => {
          console.error('Service Worker: Fetch failed', error);

          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});

// Background sync
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push event');

  const options = {
    body: event.data ? event.data.text() : 'New notification from LightDom',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/action-view.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('LightDom', options));
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/dashboard'));
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(clients.openWindow('/'));
  }
});

// Message handling
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');

    // Sync optimization data
    const optimizationData = await getStoredOptimizationData();
    if (optimizationData.length > 0) {
      await syncOptimizationData(optimizationData);
    }

    // Sync user preferences
    const userPreferences = await getStoredUserPreferences();
    if (userPreferences) {
      await syncUserPreferences(userPreferences);
    }

    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Get stored optimization data
async function getStoredOptimizationData() {
  try {
    const data = await new Promise(resolve => {
      const request = indexedDB.open('lightdom-optimizations', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['optimizations'], 'readonly');
        const store = transaction.objectStore('optimizations');
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    });
    return data || [];
  } catch (error) {
    console.error('Service Worker: Failed to get optimization data', error);
    return [];
  }
}

// Sync optimization data
async function syncOptimizationData(data) {
  try {
    const response = await fetch('/api/optimizations/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('Service Worker: Optimization data synced');
      // Clear local data after successful sync
      await clearStoredOptimizationData();
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync optimization data', error);
  }
}

// Get stored user preferences
async function getStoredUserPreferences() {
  try {
    const data = await new Promise(resolve => {
      const request = indexedDB.open('lightdom-preferences', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['preferences'], 'readonly');
        const store = transaction.objectStore('preferences');
        const getRequest = store.get('user-preferences');
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
    return data;
  } catch (error) {
    console.error('Service Worker: Failed to get user preferences', error);
    return null;
  }
}

// Sync user preferences
async function syncUserPreferences(preferences) {
  try {
    const response = await fetch('/api/preferences/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (response.ok) {
      console.log('Service Worker: User preferences synced');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync user preferences', error);
  }
}

// Clear stored optimization data
async function clearStoredOptimizationData() {
  try {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('lightdom-optimizations', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['optimizations'], 'readwrite');
        const store = transaction.objectStore('optimizations');
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Service Worker: Failed to clear optimization data', error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync', event.tag);

  if (event.tag === 'optimization-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker: Unhandled rejection', event.reason);
});

console.log('Service Worker: Loaded');

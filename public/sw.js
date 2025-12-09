const CACHE_NAME = 'erythix-campus-v1'
const OFFLINE_URL = '/offline'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return
  }

  // Skip auth requests
  if (event.request.url.includes('/auth/')) {
    return
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request)

        // If successful, cache the response
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(event.request, networkResponse.clone())
        }

        return networkResponse
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request)

        if (cachedResponse) {
          return cachedResponse
        }

        // If it's a navigation request, show offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL)
          if (offlineResponse) {
            return offlineResponse
          }
        }

        // Return a basic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      }
    })()
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress())
  }
})

async function syncProgress() {
  // Get pending progress updates from IndexedDB
  // and sync them with the server
  console.log('[SW] Syncing progress...')
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

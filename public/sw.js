// FASE 6: PWA com Cache Otimizado
const CACHE_NAME = 'sige-v2.5.0-optimized';
const API_CACHE_NAME = 'sige-api-cache-v1';
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const urlsToCache = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
];

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Fetch event - estratégia otimizada por tipo de recurso
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // HTML - Network first
  if (event.request.destination === 'document' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
  // API Supabase - Cache com TTL
  else if (url.hostname.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        
        if (cached) {
          const cachedTime = new Date(cached.headers.get('sw-cached-time') || 0).getTime();
          const now = Date.now();
          
          // Se cache ainda válido, retornar
          if (now - cachedTime < API_CACHE_TTL) {
            return cached;
          }
        }
        
        // Buscar da rede
        try {
          const response = await fetch(event.request);
          const clonedResponse = response.clone();
          
          // Adicionar timestamp ao header antes de cachear
          const headers = new Headers(clonedResponse.headers);
          headers.append('sw-cached-time', new Date().toISOString());
          
          const cachedResponse = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: headers
          });
          
          cache.put(event.request, cachedResponse);
          return response;
        } catch (error) {
          // Fallback para cache em caso de erro
          return cached || new Response('Offline', { status: 503 });
        }
      })
    );
  }
  // Assets estáticos - Cache first
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Activate event - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Manter apenas os caches atuais
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Push notification event - receber notificações
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'SIGE',
    body: 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'sige-notification',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        data: payload.data || {},
        actions: payload.actions || []
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      requireInteraction: false
    })
  );
});

// Notification click event - abrir app ao clicar
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUnmanaged: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (let client of clientList) {
          if (client.url.includes('/app') && 'focus' in client) {
            return client.focus().then(() => {
              client.postMessage({
                type: 'NOTIFICATION_CLICKED',
                data: event.notification.data
              });
            });
          }
        }
        // Se não houver janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event - log quando notificação é fechada
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
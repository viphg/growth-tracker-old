const CACHE_NAME = "growth-tracker-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/vite.svg",
];

// 安装 Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener("fetch", (event) => {
  // 跳过非 GET 请求和 API 请求
  if (event.request.method !== "GET" || event.request.url.includes("supabase")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 缓存优先，网络回退
      if (response) {
        // 后台更新缓存
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// 处理推送通知
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "成长追踪器";
  const options = {
    body: data.body || "有新的提醒",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "default",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 处理通知点击
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});

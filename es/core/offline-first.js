/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class OfflineManager {
  constructor(config = {}) {
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "serviceWorkerRegistration", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "syncQueue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "isOnline", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: navigator.onLine
    });
    Object.defineProperty(this, "syncTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "cacheStorage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "eventListeners", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "MAX_SYNC_QUEUE_SIZE", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100
    });
    Object.defineProperty(this, "swBlobUrl", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.config = {
      enabled: true,
      serviceWorkerPath: "/sw.js",
      cacheStrategy: "cache-first",
      cacheName: "i18n-offline-v1",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 7天
      maxEntries: 100,
      enableBackgroundSync: true,
      syncInterval: 3e4,
      // 30秒
      enableIndexedDB: true,
      ...config
    };
    if (this.config?.enabled) {
      this.initialize();
    }
  }
  /**
   * 初始化
   */
  async initialize() {
    await this.registerServiceWorker();
    if (this.config?.enableIndexedDB) {
      await this.initializeIndexedDB();
    }
    await this.initializeCache();
    this.setupNetworkListeners();
    if (this.config?.enableBackgroundSync) {
      this.startBackgroundSync();
    }
  }
  /**
   * 注册Service Worker
   */
  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.warn("[OfflineManager] Service Worker not supported");
      return;
    }
    try {
      const swCode = this.generateServiceWorkerCode();
      const blob = new Blob([swCode], {
        type: "application/javascript"
      });
      if (this.swBlobUrl) {
        URL.revokeObjectURL(this.swBlobUrl);
      }
      this.swBlobUrl = URL.createObjectURL(blob);
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(this.swBlobUrl, {
        scope: "/"
      });
      this.serviceWorkerRegistration.addEventListener("updatefound", () => {
      });
      await navigator.serviceWorker.ready;
      this.setupMessageChannel();
    } catch (error) {
      console.error("[OfflineManager] Service Worker registration failed:", error);
    }
  }
  /**
   * 生成Service Worker代码
   */
  generateServiceWorkerCode() {
    const config = this.config;
    return `
      const CACHE_NAME = '${config.cacheName}';
      const MAX_AGE = ${config.maxAge};
      const MAX_ENTRIES = ${config.maxEntries};
      
      // \u9884\u7F13\u5B58\u8D44\u6E90
      const PRECACHE_URLS = ${JSON.stringify(config.precache || [])};
      
      // \u5B89\u88C5\u4E8B\u4EF6
      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
        );
      });
      
      // \u6FC0\u6D3B\u4E8B\u4EF6
      self.addEventListener('activate', event => {
        event.waitUntil(
          caches.keys()
            .then(cacheNames => {
              return Promise.all(
                cacheNames
                  .filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
              );
            })
            .then(() => self.clients.claim())
        );
      });
      
      // \u83B7\u53D6\u4E8B\u4EF6
      self.addEventListener('fetch', event => {
        const { request } = event;
        
        // \u53EA\u5904\u7406i18n\u76F8\u5173\u8BF7\u6C42
        if (!request.url.includes('i18n') && !request.url.includes('locale')) {
          return;
        }
        
        // \u6839\u636E\u7B56\u7565\u5904\u7406
        const strategy = '${config.cacheStrategy}';
        
        switch (strategy) {
          case 'cache-first':
            event.respondWith(cacheFirst(request));
            break;
          case 'network-first':
            event.respondWith(networkFirst(request));
            break;
          case 'stale-while-revalidate':
            event.respondWith(staleWhileRevalidate(request));
            break;
        }
      });
      
      // \u7F13\u5B58\u4F18\u5148\u7B56\u7565
      async function cacheFirst(request) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached && !isExpired(cached)) {
          return cached;
        }
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          if (cached) {
            return cached;
          }
          throw error;
        }
      }
      
      // \u7F51\u7EDC\u4F18\u5148\u7B56\u7565
      async function networkFirst(request) {
        const cache = await caches.open(CACHE_NAME);
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          throw error;
        }
      }
      
      // \u8FC7\u671F\u91CD\u9A8C\u8BC1\u7B56\u7565
      async function staleWhileRevalidate(request) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        
        return cached || fetchPromise;
      }
      
      // \u68C0\u67E5\u662F\u5426\u8FC7\u671F
      function isExpired(response) {
        const date = response.headers.get('date');
        if (!date) return false;
        
        const age = Date.now() - new Date(date).getTime();
        return age > MAX_AGE;
      }
      
      // \u540E\u53F0\u540C\u6B65
      self.addEventListener('sync', event => {
        if (event.tag === 'i18n-sync') {
          event.waitUntil(syncData());
        }
      });
      
      // \u540C\u6B65\u6570\u636E
      async function syncData() {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        
        for (const request of requests) {
          try {
            const response = await fetch(request);
            if (response.ok) {
              await cache.put(request, response);
            }
          } catch (error) {
            console.error('Sync failed for', request.url);
          }
        }
      }
      
      // \u6D88\u606F\u5904\u7406
      self.addEventListener('message', event => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'SKIP_WAITING':
            self.skipWaiting();
            break;
          case 'CLEAR_CACHE':
            caches.delete(CACHE_NAME);
            break;
          case 'CACHE_URLS':
            cacheUrls(data.urls);
            break;
        }
      });
      
      // \u7F13\u5B58URLs
      async function cacheUrls(urls) {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urls);
      }
    `;
  }
  /**
   * 初始化IndexedDB
   */
  async initializeIndexedDB() {
    if (!("indexedDB" in window)) {
      console.warn("[OfflineManager] IndexedDB not supported");
      return;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("i18n-offline", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("translations")) {
          const store = db.createObjectStore("translations", {
            keyPath: "id"
          });
          store.createIndex("locale", "locale", {
            unique: false
          });
          store.createIndex("namespace", "namespace", {
            unique: false
          });
          store.createIndex("timestamp", "timestamp", {
            unique: false
          });
        }
        if (!db.objectStoreNames.contains("syncQueue")) {
          const store = db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true
          });
          store.createIndex("timestamp", "timestamp", {
            unique: false
          });
        }
      };
    });
  }
  /**
   * 初始化缓存
   */
  async initializeCache() {
    if ("caches" in window) {
      this.cacheStorage = await caches.open(this.config?.cacheName);
    }
  }
  /**
   * 设置网络监听器
   */
  setupNetworkListeners() {
    const onlineHandler = () => {
      this.isOnline = true;
      this.syncPendingData();
    };
    const offlineHandler = () => {
      this.isOnline = false;
    };
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    this.eventListeners.push({
      target: window,
      event: "online",
      handler: onlineHandler
    }, {
      target: window,
      event: "offline",
      handler: offlineHandler
    });
  }
  /**
   * 设置消息通道
   */
  setupMessageChannel() {
    const messageHandler = (event) => {
      const {
        type,
        data
      } = event.data;
    };
    navigator.serviceWorker.addEventListener("message", messageHandler);
    this.eventListeners.push({
      target: navigator.serviceWorker,
      event: "message",
      handler: messageHandler
    });
  }
  /**
   * 保存到离线存储
   */
  async saveOffline(locale, namespace, messages) {
    const id = `${locale}:${namespace}`;
    const data = {
      id,
      locale,
      namespace,
      messages,
      timestamp: Date.now()
    };
    if (this.db) {
      const transaction = this.db.transaction(["translations"], "readwrite");
      const store = transaction.objectStore("translations");
      await this.promisifyRequest(store.put(data));
    }
    if (this.cacheStorage) {
      const response = new Response(JSON.stringify(messages), {
        headers: {
          "Content-Type": "application/json",
          "Date": (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      await this.cacheStorage.put(new Request(`/i18n/${locale}/${namespace}.json`), response);
    }
    try {
      localStorage.setItem(`i18n:${id}`, JSON.stringify(data));
    } catch (e) {
      console.warn("[OfflineManager] localStorage save failed:", e);
    }
  }
  /**
   * 从离线存储加载
   */
  async loadOffline(locale, namespace) {
    const id = `${locale}:${namespace}`;
    if (this.db) {
      try {
        const transaction = this.db.transaction(["translations"], "readonly");
        const store = transaction.objectStore("translations");
        const data = await this.promisifyRequest(store.get(id));
        if (data && !this.isExpired(data.timestamp)) {
          return data.messages;
        }
      } catch (e) {
        console.warn("[OfflineManager] IndexedDB load failed:", e);
      }
    }
    if (this.cacheStorage) {
      try {
        const response = await this.cacheStorage.match(`/i18n/${locale}/${namespace}.json`);
        if (response) {
          return await response.json();
        }
      } catch (e) {
        console.warn("[OfflineManager] Cache API load failed:", e);
      }
    }
    try {
      const stored = localStorage.getItem(`i18n:${id}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (!this.isExpired(data.timestamp)) {
          return data.messages;
        }
      }
    } catch (e) {
      console.warn("[OfflineManager] localStorage load failed:", e);
    }
    return null;
  }
  /**
   * 添加到同步队列
   */
  addToSyncQueue(item) {
    if (this.syncQueue.length >= this.MAX_SYNC_QUEUE_SIZE) {
      this.syncQueue.shift();
    }
    const syncItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0
    };
    this.syncQueue.push(syncItem);
    if (this.db) {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      store.add(syncItem);
    }
    if (this.isOnline) {
      this.syncPendingData();
    }
  }
  /**
   * 启动后台同步
   */
  startBackgroundSync() {
    if (this.serviceWorkerRegistration && "sync" in this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.sync.register("i18n-sync").catch((err) => {
        console.warn("[OfflineManager] Background sync registration failed:", err);
      });
    }
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, this.config?.syncInterval);
  }
  /**
   * 同步待处理数据
   */
  async syncPendingData() {
    if (this.syncQueue.length === 0) return;
    const completed = [];
    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item);
        completed.push(item.id);
      } catch (error) {
        item.retries++;
        if (item.retries > 3) {
          console.error("[OfflineManager] Sync failed after 3 retries:", item);
          completed.push(item.id);
        }
      }
    }
    this.syncQueue = this.syncQueue.filter((item) => !completed.includes(item.id));
    if (this.db && completed.length > 0) {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      for (const id of completed) {
        store.delete(id);
      }
    }
  }
  /**
   * 处理同步项
   */
  async processSyncItem(item) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  /**
   * 清理过期缓存
   */
  async clearExpiredCache() {
    if (this.db) {
      const transaction = this.db.transaction(["translations"], "readwrite");
      const store = transaction.objectStore("translations");
      const index = store.index("timestamp");
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          if (this.isExpired(value.timestamp)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("i18n:")) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored);
            if (this.isExpired(data.timestamp)) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          if (key) keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  /**
   * 检查是否过期
   */
  isExpired(timestamp) {
    return Date.now() - timestamp > this.config?.maxAge;
  }
  /**
   * Promise化IndexedDB请求
   */
  promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  /**
   * 获取离线统计
   */
  getOfflineStats() {
    return {
      isOnline: this.isOnline,
      cacheSize: 0,
      // 需要实现计算逻辑
      syncQueueLength: this.syncQueue.length,
      lastSync: null
      // 需要记录
    };
  }
  /**
   * 销毁
   */
  async destroy() {
    this.eventListeners.forEach(({
      target,
      event,
      handler
    }) => {
      target.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.unregister();
      this.serviceWorkerRegistration = void 0;
    }
    if (this.swBlobUrl) {
      URL.revokeObjectURL(this.swBlobUrl);
      this.swBlobUrl = void 0;
    }
    if (this.db) {
      this.db.close();
      this.db = void 0;
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = void 0;
    }
    if ("caches" in window && this.config?.cacheName) {
      await caches.delete(this.config.cacheName);
    }
    this.syncQueue = [];
  }
}
function createOfflineManager(config) {
  return new OfflineManager(config);
}

export { OfflineManager, createOfflineManager };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=offline-first.js.map

/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var node_events = require('node:events');

class RealtimeSync extends node_events.EventEmitter {
  constructor(config = {}) {
    super();
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "ws", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "state", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "reconnectAttempts", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "reconnectTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "heartbeatTimer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "offlineQueue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "versionMap", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "conflictQueue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "transformQueue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "localUserId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "localUserName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "maxQueueSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1e3
    });
    Object.defineProperty(this, "maxTransformQueueSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 100
    });
    this.config = {
      url: config.url || "ws://localhost:8080/sync",
      autoReconnect: config.autoReconnect !== false,
      reconnectDelay: config.reconnectDelay || 1e3,
      heartbeatInterval: config.heartbeatInterval || 3e4,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      conflictResolution: config.conflictResolution || "merge"
    };
    this.state = {
      connected: false,
      syncing: false,
      lastSync: 0,
      pendingUpdates: 0,
      conflicts: 0,
      peers: /* @__PURE__ */ new Map()
    };
    this.localUserId = this.generateUserId();
    this.localUserName = "User";
  }
  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.state.connected) {
        resolve();
        return;
      }
      try {
        this.ws = new WebSocket(this.config?.url);
        this.ws.onopen = () => {
          this.handleConnect();
          resolve();
        };
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };
        this.ws.onclose = () => {
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  disconnect() {
    if (this.config) {
      this.config.autoReconnect = false;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state.connected = false;
    this.emit("disconnect");
  }
  handleConnect() {
    this.state.connected = true;
    this.reconnectAttempts = 0;
    this.send("identify", {
      userId: this.localUserId,
      userName: this.localUserName,
      timestamp: Date.now()
    });
    this.startHeartbeat();
    if (this.config?.enableOfflineQueue && this.offlineQueue.length > 0) {
      this.flushOfflineQueue();
    }
    this.emit("connect");
  }
  handleDisconnect() {
    this.state.connected = false;
    this.state.peers.clear();
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.config?.autoReconnect && this.reconnectAttempts < this.config?.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
    this.emit("disconnect");
  }
  handleError(error) {
    console.error("WebSocket error:", error);
    this.emit("error", error);
  }
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case "update":
          this.handleRemoteUpdate(message.data);
          break;
        case "peer-join":
          this.handlePeerJoin(message.data);
          break;
        case "peer-leave":
          this.handlePeerLeave(message.data);
          break;
        case "peer-cursor":
          this.handlePeerCursor(message.data);
          break;
        case "sync-request":
          this.handleSyncRequest(message.data);
          break;
        case "sync-response":
          this.handleSyncResponse(message.data);
          break;
        case "conflict":
          this.handleConflict(message.data);
          break;
        case "transform":
          this.handleTransform(message.data);
          break;
        case "heartbeat":
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
  handleRemoteUpdate(update) {
    const localVersion = this.versionMap.get(`${update.locale}:${update.key}`) || 0;
    if (update.version <= localVersion) {
      this.detectAndResolveConflict(update);
      return;
    }
    this.applyUpdate(update);
    this.versionMap.set(`${update.locale}:${update.key}`, update.version);
    this.emit("translation:update", update);
    this.state.lastSync = Date.now();
  }
  handlePeerJoin(peer) {
    if (this.state.peers.size >= 100) {
      const oldestPeer = Array.from(this.state.peers.entries()).sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
      if (oldestPeer) {
        this.state.peers.delete(oldestPeer[0]);
      }
    }
    this.state.peers.set(peer.id, peer);
    this.emit("peer:join", peer);
  }
  handlePeerLeave(peerId) {
    const peer = this.state.peers.get(peerId);
    if (peer) {
      this.state.peers.delete(peerId);
      this.emit("peer:leave", peer);
    }
  }
  handlePeerCursor(data) {
    const peer = this.state.peers.get(data.userId);
    if (peer) {
      peer.cursor = data.cursor;
      peer.lastSeen = Date.now();
      this.emit("peer:cursor", {
        peer,
        cursor: data.cursor
      });
    }
  }
  handleSyncRequest(data) {
    const response = this.gatherLocalTranslations(data.keys, data.locale, data.since);
    this.send("sync-response", response);
  }
  handleSyncResponse(data) {
    for (const update of data.translations) {
      this.handleRemoteUpdate(update);
    }
  }
  handleConflict(conflict) {
    this.conflictQueue.push(conflict);
    this.state.conflicts = this.conflictQueue.length;
    if (this.config?.conflictResolution !== "manual") {
      this.autoResolveConflict(conflict);
    } else {
      this.emit("conflict", conflict);
    }
  }
  handleTransform(transform) {
    const key = `${transform.version}`;
    let queue = this.transformQueue.get(key) || [];
    if (queue.length >= this.maxTransformQueueSize) {
      queue = queue.slice(-this.maxTransformQueueSize + 1);
    }
    queue.push(transform);
    this.transformQueue.set(key, queue);
    if (this.transformQueue.size > 50) {
      const sortedKeys = Array.from(this.transformQueue.keys()).sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
      const keysToDelete = sortedKeys.slice(0, sortedKeys.length - 50);
      keysToDelete.forEach((k) => this.transformQueue.delete(k));
    }
    this.applyTransform(transform);
  }
  updateTranslation(locale, key, value, oldValue) {
    const update = {
      id: this.generateUpdateId(),
      locale,
      key,
      value,
      oldValue,
      timestamp: Date.now(),
      userId: this.localUserId,
      userName: this.localUserName,
      version: this.getNextVersion(locale, key),
      checksum: this.calculateChecksum(value)
    };
    if (this.state.connected) {
      this.send("update", update);
      this.versionMap.set(`${locale}:${key}`, update.version);
      if (this.versionMap.size > 1e4) {
        const entriesToDelete = Array.from(this.versionMap.keys()).slice(0, 1e3);
        entriesToDelete.forEach((k) => this.versionMap.delete(k));
      }
    } else if (this.config?.enableOfflineQueue) {
      if (this.offlineQueue.length >= this.maxQueueSize) {
        this.offlineQueue.shift();
      }
      this.offlineQueue.push(update);
      this.state.pendingUpdates = this.offlineQueue.length;
    }
    this.emit("translation:local", update);
  }
  broadcastCursor(key, position, selection) {
    if (!this.state.connected) return;
    const cursor = {
      key,
      position,
      selection
    };
    this.send("cursor", {
      userId: this.localUserId,
      cursor
    });
  }
  requestSync(keys, locale, since) {
    if (!this.state.connected) return;
    this.send("sync-request", {
      keys: keys || [],
      locale: locale || "*",
      since: since || 0
    });
  }
  detectAndResolveConflict(remoteUpdate) {
    const localValue = this.getLocalTranslation(remoteUpdate.locale, remoteUpdate.key);
    if (localValue && localValue !== remoteUpdate.oldValue) {
      const conflict = {
        key: remoteUpdate.key,
        locale: remoteUpdate.locale,
        local: {
          ...remoteUpdate,
          value: localValue,
          userId: this.localUserId,
          userName: this.localUserName
        },
        remote: remoteUpdate
      };
      this.handleConflict(conflict);
    } else {
      this.applyUpdate(remoteUpdate);
    }
  }
  autoResolveConflict(conflict) {
    let resolution = "remote";
    let mergedValue;
    switch (this.config?.conflictResolution) {
      case "latest":
        resolution = conflict.local.timestamp > conflict.remote.timestamp ? "local" : "remote";
        break;
      case "merge":
        mergedValue = this.mergeTranslations(conflict.local.value, conflict.remote.value, conflict.local.oldValue);
        if (mergedValue) {
          resolution = "merged";
        } else {
          resolution = conflict.local.timestamp > conflict.remote.timestamp ? "local" : "remote";
        }
        break;
    }
    conflict.resolution = resolution;
    conflict.mergedValue = mergedValue;
    this.applyConflictResolution(conflict);
    this.conflictQueue = this.conflictQueue.filter((c) => c !== conflict);
    if (this.conflictQueue.length > 100) {
      this.conflictQueue = this.conflictQueue.slice(-100);
    }
    this.state.conflicts = this.conflictQueue.length;
    this.emit("conflict:resolved", conflict);
  }
  mergeTranslations(local, remote, base) {
    if (!base) return void 0;
    if (local === base) return remote;
    if (remote === base) return local;
    return void 0;
  }
  applyConflictResolution(conflict) {
    let valueToApply;
    switch (conflict.resolution) {
      case "local":
        valueToApply = conflict.local.value;
        break;
      case "remote":
        valueToApply = conflict.remote.value;
        break;
      case "merged":
        valueToApply = conflict.mergedValue || conflict.remote.value;
        break;
      default:
        valueToApply = conflict.remote.value;
    }
    const update = {
      ...conflict.remote,
      value: valueToApply,
      version: this.getNextVersion(conflict.locale, conflict.key)
    };
    this.applyUpdate(update);
    if (this.state.connected) {
      this.send("conflict-resolution", {
        conflict,
        resolution: update
      });
    }
  }
  applyUpdate(update) {
    this.emit("apply:update", update);
  }
  applyTransform(transform) {
    this.emit("apply:transform", transform);
  }
  gatherLocalTranslations(keys, locale, since) {
    return {
      translations: [],
      timestamp: Date.now()
    };
  }
  getLocalTranslation(locale, key) {
    return void 0;
  }
  flushOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.state.pendingUpdates = 0;
    for (const update of queue) {
      this.send("update", update);
    }
  }
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(this.config?.reconnectDelay * 2 ** (this.reconnectAttempts - 1), 3e4);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
    this.emit("reconnecting", {
      attempt: this.reconnectAttempts,
      delay
    });
  }
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.connected) {
        this.send("heartbeat", {
          timestamp: Date.now()
        });
      }
    }, this.config?.heartbeatInterval);
  }
  send(type, data) {
    if (!this.ws || !this.state.connected) {
      if (this.config?.enableOfflineQueue && type === "update") {
        this.offlineQueue.push(data);
        this.state.pendingUpdates = this.offlineQueue.length;
      }
      return;
    }
    try {
      this.ws.send(JSON.stringify({
        type,
        data
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      this.handleError(error);
    }
  }
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateUpdateId() {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  getNextVersion(locale, key) {
    const currentVersion = this.versionMap.get(`${locale}:${key}`) || 0;
    return currentVersion + 1;
  }
  calculateChecksum(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  // Public API
  getState() {
    return {
      ...this.state
    };
  }
  getPeers() {
    return Array.from(this.state.peers.values());
  }
  getConflicts() {
    return [...this.conflictQueue];
  }
  resolveConflict(conflict, resolution, mergedValue) {
    conflict.resolution = resolution;
    conflict.mergedValue = mergedValue;
    this.applyConflictResolution(conflict);
  }
  setUserInfo(userId, userName) {
    this.localUserId = userId;
    this.localUserName = userName;
    if (this.state.connected) {
      this.send("identify", {
        userId,
        userName,
        timestamp: Date.now()
      });
    }
  }
  // Collaboration features
  lockTranslation(locale, key) {
    if (!this.state.connected) return;
    this.send("lock", {
      locale,
      key,
      userId: this.localUserId,
      timestamp: Date.now()
    });
  }
  unlockTranslation(locale, key) {
    if (!this.state.connected) return;
    this.send("unlock", {
      locale,
      key,
      userId: this.localUserId,
      timestamp: Date.now()
    });
  }
  sendComment(locale, key, comment) {
    if (!this.state.connected) return;
    this.send("comment", {
      locale,
      key,
      comment,
      userId: this.localUserId,
      userName: this.localUserName,
      timestamp: Date.now()
    });
  }
  // Cleanup
  destroy() {
    this.disconnect();
    this.removeAllListeners();
    this.offlineQueue.length = 0;
    this.offlineQueue = [];
    this.conflictQueue.length = 0;
    this.conflictQueue = [];
    this.transformQueue.clear();
    this.versionMap.clear();
    this.state.peers.clear();
    this.ws = null;
  }
}
const realtimeSync = new RealtimeSync();

exports.RealtimeSync = RealtimeSync;
exports.realtimeSync = realtimeSync;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=realtime-sync.cjs.map

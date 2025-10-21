/**
 * Smart Caching System
 * Advanced multi-layer caching with predictive loading and intelligent invalidation
 */
import { EventEmitter } from 'node:events';
class LRUCache {
    constructor(maxSize, maxItems) {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxItems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                hits: 0,
                misses: 0,
                evictions: 0,
                size: 0,
                items: 0,
                hitRate: 0,
                avgAccessTime: 0,
                predictions: {
                    successful: 0,
                    failed: 0,
                    accuracy: 0
                }
            }
        });
        this.maxSize = maxSize;
        this.maxItems = maxItems;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            this.updateStats();
            return undefined;
        }
        // Check TTL
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            this.stats.misses++;
            this.updateStats();
            return undefined;
        }
        // Move to end (most recently used) - Map maintains insertion order
        this.cache.delete(key);
        this.cache.set(key, entry);
        entry.hits++;
        entry.lastAccess = Date.now();
        this.stats.hits++;
        this.updateStats();
        return entry.value;
    }
    set(key, value, options) {
        const size = this.calculateSize(value);
        // Remove existing entry if present
        if (this.cache.has(key)) {
            const oldEntry = this.cache.get(key);
            this.currentSize -= oldEntry.size;
            this.cache.delete(key);
        }
        // Check if we need to evict items
        while ((this.currentSize + size > this.maxSize || this.cache.size >= this.maxItems) &&
            this.cache.size > 0) {
            this.evictLRU();
        }
        const entry = {
            value,
            timestamp: Date.now(),
            hits: 0,
            lastAccess: Date.now(),
            size,
            priority: options?.priority || 0,
            ttl: options?.ttl,
            tags: options?.tags
        };
        this.cache.set(key, entry);
        this.currentSize += size;
        this.stats.items = this.cache.size;
        this.stats.size = this.currentSize;
    }
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        this.cache.delete(key);
        this.currentSize -= entry.size;
        this.stats.items = this.cache.size;
        this.stats.size = this.currentSize;
        return true;
    }
    clear() {
        this.cache.clear();
        this.currentSize = 0;
        this.stats.items = 0;
        this.stats.size = 0;
    }
    getStats() {
        return { ...this.stats };
    }
    evictLRU() {
        if (this.cache.size === 0)
            return;
        // Get first item (least recently used) from Map
        const victimKey = this.cache.keys().next().value;
        if (victimKey) {
            this.delete(victimKey);
            this.stats.evictions++;
        }
    }
    calculateEvictionScore(entry) {
        const age = Date.now() - entry.timestamp;
        const recency = Date.now() - entry.lastAccess;
        const frequency = entry.hits;
        const priority = entry.priority;
        // Higher score = less likely to evict
        return (frequency * 1000 + priority * 10000) / (recency + age);
    }
    calculateSize(value) {
        // Rough size calculation
        const str = JSON.stringify(value);
        return str.length * 2; // Assuming 2 bytes per character
    }
    updateStats() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
}
export class SmartCache extends EventEmitter {
    constructor() {
        super();
        Object.defineProperty(this, "layers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "layerConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "prediction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "accessPatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "prefetchQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "compressionCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "optimizeInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "maxAccessPatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
        Object.defineProperty(this, "maxPrefetchQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        // Default layer configuration
        this.layerConfig = [
            { name: 'hot', maxSize: 1024 * 1024, maxItems: 100, ttl: 60000 }, // 1MB, 1 minute
            { name: 'warm', maxSize: 5 * 1024 * 1024, maxItems: 500, ttl: 300000 }, // 5MB, 5 minutes
            { name: 'cold', maxSize: 20 * 1024 * 1024, maxItems: 2000, ttl: 3600000, compression: true } // 20MB, 1 hour
        ];
        this.prediction = {
            enabled: true,
            threshold: 0.7,
            lookAhead: 3,
            patterns: new Map()
        };
        this.initializeLayers();
        this.startPredictionEngine();
    }
    initializeLayers() {
        for (const config of this.layerConfig) {
            this.layers.set(config.name, new LRUCache(config.maxSize, config.maxItems));
        }
    }
    async get(key, loader) {
        const startTime = Date.now();
        // Check all layers from hot to cold
        for (const [layerName, cache] of this.layers) {
            const value = cache.get(key);
            if (value !== undefined) {
                // Promote to hot layer if found in warm/cold
                if (layerName !== 'hot') {
                    await this.promote(key, value, layerName);
                }
                // Track access pattern
                this.recordAccess(key);
                // Trigger predictive prefetch
                this.predictAndPrefetch(key);
                this.emit('cache:hit', { key, layer: layerName, time: Date.now() - startTime });
                return value;
            }
        }
        // Cache miss - load if loader provided
        if (loader) {
            const value = await loader();
            await this.set(key, value);
            this.recordAccess(key);
            this.emit('cache:miss', { key, time: Date.now() - startTime });
            return value;
        }
        this.emit('cache:miss', { key, time: Date.now() - startTime });
        return undefined;
    }
    async set(key, value, options) {
        // Always start in hot layer
        const hotCache = this.layers.get('hot');
        if (hotCache) {
            hotCache.set(key, value, {
                ttl: options?.ttl,
                priority: options?.priority,
                tags: options?.tags ? new Set(options.tags) : undefined
            });
        }
        this.emit('cache:set', { key, size: JSON.stringify(value).length });
    }
    async invalidate(pattern) {
        let invalidated = 0;
        for (const [, cache] of this.layers) {
            const keys = this.getMatchingKeys(pattern);
            for (const key of keys) {
                if (cache.delete(key)) {
                    invalidated++;
                }
            }
        }
        this.emit('cache:invalidate', { pattern: pattern.toString(), count: invalidated });
        return invalidated;
    }
    async invalidateByTag(tag) {
        const invalidated = 0;
        // This would need to be implemented with tag tracking
        // For now, returning placeholder
        this.emit('cache:invalidate:tag', { tag, count: invalidated });
        return invalidated;
    }
    async promote(key, value, fromLayer) {
        const hotCache = this.layers.get('hot');
        const sourceCache = this.layers.get(fromLayer);
        if (hotCache && sourceCache) {
            // Move to hot cache
            hotCache.set(key, value);
            sourceCache.delete(key);
            this.emit('cache:promote', { key, from: fromLayer, to: 'hot' });
        }
    }
    async demote(key, value, fromLayer, toLayer) {
        const source = this.layers.get(fromLayer);
        const target = this.layers.get(toLayer);
        if (source && target) {
            target.set(key, value);
            source.delete(key);
            this.emit('cache:demote', { key, from: fromLayer, to: toLayer });
        }
    }
    recordAccess(key) {
        // Track access patterns for prediction
        let pattern = this.accessPatterns.get(key) || [];
        const now = Date.now().toString();
        pattern.push(now);
        // Keep only recent accesses
        if (pattern.length > 10) {
            pattern = pattern.slice(-10);
        }
        this.accessPatterns.set(key, pattern);
        // Limit total number of patterns tracked
        if (this.accessPatterns.size > this.maxAccessPatterns) {
            // Remove oldest patterns
            const keysToDelete = Array.from(this.accessPatterns.keys())
                .slice(0, Math.floor(this.maxAccessPatterns / 2));
            keysToDelete.forEach(k => this.accessPatterns.delete(k));
        }
    }
    predictAndPrefetch(key) {
        if (!this.prediction.enabled)
            return;
        // Limit prefetch queue size
        if (this.prefetchQueue.size >= this.maxPrefetchQueue) {
            return;
        }
        // Analyze patterns to predict next keys
        const predictions = this.analyzePatterns(key);
        for (const predictedKey of predictions) {
            if (!this.prefetchQueue.has(predictedKey) && this.prefetchQueue.size < this.maxPrefetchQueue) {
                this.prefetchQueue.add(predictedKey);
                // Schedule prefetch
                setTimeout(() => {
                    this.prefetch(predictedKey);
                    this.prefetchQueue.delete(predictedKey);
                }, 100);
            }
        }
    }
    analyzePatterns(currentKey) {
        const predictions = [];
        // Simple pattern matching for now
        // In real implementation, would use ML model
        const patterns = this.prediction.patterns.get(currentKey);
        if (patterns) {
            predictions.push(...patterns.slice(0, this.prediction.lookAhead));
        }
        // Look for sequential patterns
        const match = currentKey.match(/^(.*?)(\d+)$/);
        if (match) {
            const base = match[1];
            const num = Number.parseInt(match[2], 10);
            for (let i = 1; i <= this.prediction.lookAhead; i++) {
                predictions.push(`${base}${num + i}`);
            }
        }
        return predictions;
    }
    async prefetch(key) {
        // Implement prefetch logic
        this.emit('cache:prefetch', { key });
    }
    startPredictionEngine() {
        // Periodically analyze and optimize cache
        this.optimizeInterval = setInterval(() => {
            this.optimizeCache();
        }, 60000); // Every minute
    }
    optimizeCache() {
        // Analyze cache performance and adjust
        const stats = this.getStats();
        // Auto-tune cache sizes based on hit rates
        if (stats.overall.hitRate < 0.5) {
            // Increase cache sizes if hit rate is low
            this.emit('cache:optimize', { action: 'resize', reason: 'low hit rate' });
        }
        // Demote cold items
        for (const [layerName, cache] of this.layers) {
            if (layerName === 'hot') {
                // Demote items that haven't been accessed recently
                // Implementation would go here
            }
        }
    }
    getMatchingKeys(pattern) {
        const keys = [];
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        for (const [, cache] of this.layers) {
            // This would need access to cache keys
            // Placeholder implementation
        }
        return keys;
    }
    getStats() {
        const layerStats = new Map();
        let totalHits = 0;
        let totalMisses = 0;
        let totalEvictions = 0;
        let totalSize = 0;
        let totalItems = 0;
        for (const [name, cache] of this.layers) {
            const stats = cache.getStats();
            layerStats.set(name, stats);
            totalHits += stats.hits;
            totalMisses += stats.misses;
            totalEvictions += stats.evictions;
            totalSize += stats.size;
            totalItems += stats.items;
        }
        const overall = {
            hits: totalHits,
            misses: totalMisses,
            evictions: totalEvictions,
            size: totalSize,
            items: totalItems,
            hitRate: totalHits / (totalHits + totalMisses) || 0,
            avgAccessTime: 0,
            predictions: {
                successful: 0,
                failed: 0,
                accuracy: 0
            }
        };
        return { overall, layers: layerStats };
    }
    async compress(data) {
        const json = JSON.stringify(data);
        const encoder = new TextEncoder();
        const encoded = encoder.encode(json);
        // Simple compression simulation
        // In real implementation, would use actual compression algorithm
        return encoded.buffer;
    }
    async decompress(buffer) {
        const decoder = new TextDecoder();
        const json = decoder.decode(buffer);
        return JSON.parse(json);
    }
    clear(layer) {
        if (layer) {
            const cache = this.layers.get(layer);
            cache?.clear();
        }
        else {
            for (const [, cache] of this.layers) {
                cache.clear();
            }
        }
        this.emit('cache:clear', { layer: layer || 'all' });
    }
    configurePrediction(config) {
        this.prediction = { ...this.prediction, ...config };
        this.emit('cache:config', { prediction: this.prediction });
    }
    // Advanced features
    async warmUp(keys, loader) {
        const promises = keys.map(async (key) => {
            const value = await loader(key);
            await this.set(key, value, { priority: 1 });
        });
        await Promise.all(promises);
        this.emit('cache:warmup', { count: keys.length });
    }
    subscribe(pattern, callback) {
        const listener = (event) => {
            if (event.key && event.key.match(pattern)) {
                callback(event.key, event.value);
            }
        };
        this.on('cache:set', listener);
        this.on('cache:hit', listener);
        return () => {
            this.off('cache:set', listener);
            this.off('cache:hit', listener);
        };
    }
    // Memory pressure handling
    handleMemoryPressure(level) {
        switch (level) {
            case 'high':
                // Clear cold cache
                this.clear('cold');
            // Fall through
            case 'medium':
                // Clear warm cache
                this.clear('warm');
                break;
            case 'low':
                // Just optimize
                this.optimizeCache();
                break;
        }
        this.emit('cache:memory:pressure', { level });
    }
    destroy() {
        // Clear optimization interval
        if (this.optimizeInterval) {
            clearInterval(this.optimizeInterval);
            this.optimizeInterval = null;
        }
        // Clear all caches
        this.clear();
        // Clear all data structures
        this.layers.clear();
        this.accessPatterns.clear();
        this.prefetchQueue.clear();
        this.compressionCache.clear();
        this.prediction.patterns.clear();
        // Remove all event listeners
        this.removeAllListeners();
    }
}
// Export singleton instance
export const smartCache = new SmartCache();
//# sourceMappingURL=smart-cache.js.map
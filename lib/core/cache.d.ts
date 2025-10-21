/**
 * @ldesign/i18n - Cache System
 * High-performance caching for translations and resources
 */
import type { Cache } from '../types';
export declare class LRUCache<K = string, V = any> implements Cache<K, V> {
    private readonly maxSize;
    private readonly cache;
    private head;
    private tail;
    private defaultTTL?;
    private cleanupTimer?;
    private hits;
    private misses;
    constructor(maxSize?: number, defaultTTL?: number);
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    get size(): number;
    private moveToHead;
    private addToHead;
    private removeNode;
    private cleanupExpired;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        missRate: number;
    };
    /**
     * Clean up resources
     */
    destroy(): void;
}
/**
 * WeakRef polyfill for environments that don't support it
 */
declare global {
    interface WeakRef<T extends object> {
        deref: () => T | undefined;
    }
    interface WeakRefConstructor {
        new <T extends object>(target: T): WeakRef<T>;
    }
}
/**
 * Memory-efficient cache with weak references
 * Fixed memory leak from timers and added resource limits
 */
export declare class WeakCache<K extends object, V = any> {
    private readonly cache;
    private readonly timerRefs;
    private readonly maxTimers;
    private timerCount;
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    /**
     * Clean up all timers
     */
    destroy(): void;
}
/**
 * Storage-based cache (localStorage/sessionStorage)
 */
export declare class StorageCache implements Cache<string, any> {
    private storage;
    private prefix;
    private maxSize;
    constructor(storage?: Storage, prefix?: string, maxSize?: number);
    get(key: string): any;
    set(key: string, value: any, ttl?: number): void;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    get size(): number;
    private evictOldest;
}
/**
 * Multi-tier cache system
 */
export declare class MultiTierCache<K = string, V = any> implements Cache<K, V> {
    private tiers;
    constructor(...tiers: Cache<K, V>[]);
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    get size(): number;
}
/**
 * Create appropriate cache based on environment
 */
export declare function createCache<K = string, V = any>(options?: {
    type?: 'memory' | 'storage' | 'multi';
    maxSize?: number;
    ttl?: number;
    storage?: 'local' | 'session';
}): Cache<K, V>;
//# sourceMappingURL=cache.d.ts.map
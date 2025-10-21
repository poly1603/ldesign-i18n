/**
 * @ldesign/i18n - Optimized Cache System
 * 高性能优化的缓存实现，解决内存泄漏和性能问题
 */
import type { Cache } from '../types';
/**
 * 优化的 LRU Cache 实现
 * 使用双向链表实现 O(1) 的访问顺序更新
 */
export declare class OptimizedLRUCache<K = string, V = any> implements Cache<K, V> {
    private readonly maxSize;
    private readonly cache;
    private head;
    private tail;
    private readonly defaultTTL?;
    private readonly nodePool;
    private cleanupTimer?;
    private readonly CLEANUP_INTERVAL;
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
     * 清理所有资源
     */
    destroy(): void;
}
/**
 * 优化的 WeakCache 实现
 * 修复了定时器泄漏问题，使用 WeakRef 进一步优化
 */
export declare class OptimizedWeakCache<K extends object, V = any> {
    private readonly cache;
    private readonly maxTimers;
    private timerCount;
    get(key: K): V | undefined;
    set(key: K, value: V, ttl?: number): void;
    has(key: K): boolean;
    delete(key: K): boolean;
    /**
     * 清理所有定时器，防止内存泄漏
     */
    destroy(): void;
}
/**
 * 优化的 StorageCache 实现
 * 使用防抖减少 localStorage 操作，并使用 LRU 策略
 */
export declare class OptimizedStorageCache implements Cache<string, any> {
    private readonly storage;
    private readonly prefix;
    private readonly maxSize;
    private writeTimer;
    private readonly pendingWrites;
    private readonly memoryCache;
    private readonly writeDelay;
    constructor(storage?: Storage | null, prefix?: string, maxSize?: number);
    private loadExistingCache;
    get(key: string): any;
    set(key: string, value: any, ttl?: number): void;
    private scheduleWrite;
    private flushWrites;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    get size(): number;
    private evictOldest;
    /**
     * 清理所有资源
     */
    destroy(): void;
}
/**
 * 创建优化的缓存
 */
export declare function createOptimizedCache<K = string, V = any>(options?: {
    type?: 'memory' | 'storage' | 'multi';
    maxSize?: number;
    ttl?: number;
    storage?: 'local' | 'session';
}): Cache<K, V> & {
    destroy?: () => void;
};
//# sourceMappingURL=optimized-cache.d.ts.map
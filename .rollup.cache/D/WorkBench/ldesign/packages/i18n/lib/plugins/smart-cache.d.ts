/**
 * Smart Caching System
 * Advanced multi-layer caching with predictive loading and intelligent invalidation
 */
import { EventEmitter } from 'node:events';
interface CacheEntry<T> {
    value: T;
    timestamp: number;
    hits: number;
    lastAccess: number;
    size: number;
    priority: number;
    ttl?: number;
    tags?: Set<string>;
}
interface CacheLayer {
    name: string;
    maxSize: number;
    maxItems: number;
    ttl?: number;
    compression?: boolean;
}
interface PredictionConfig {
    enabled: boolean;
    threshold: number;
    lookAhead: number;
    patterns: Map<string, string[]>;
}
interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    items: number;
    hitRate: number;
    avgAccessTime: number;
    predictions: {
        successful: number;
        failed: number;
        accuracy: number;
    };
}
export declare class SmartCache extends EventEmitter {
    private layers;
    private layerConfig;
    private prediction;
    private accessPatterns;
    private prefetchQueue;
    private compressionCache;
    private optimizeInterval;
    private maxAccessPatterns;
    private maxPrefetchQueue;
    constructor();
    private initializeLayers;
    get<T>(key: string, loader?: () => Promise<T>): Promise<T | undefined>;
    set<T>(key: string, value: T, options?: {
        ttl?: number;
        priority?: number;
        tags?: string[];
    }): Promise<void>;
    invalidate(pattern: string | RegExp): Promise<number>;
    invalidateByTag(tag: string): Promise<number>;
    private promote;
    private demote;
    private recordAccess;
    private predictAndPrefetch;
    private analyzePatterns;
    private prefetch;
    private startPredictionEngine;
    private optimizeCache;
    private getMatchingKeys;
    getStats(): {
        overall: CacheStats;
        layers: Map<string, CacheStats>;
    };
    compress(data: any): Promise<ArrayBuffer>;
    decompress(buffer: ArrayBuffer): Promise<any>;
    clear(layer?: string): void;
    configurePrediction(config: Partial<PredictionConfig>): void;
    warmUp(keys: string[], loader: (key: string) => Promise<any>): Promise<void>;
    subscribe(pattern: string, callback: (key: string, value: any) => void): () => void;
    handleMemoryPressure(level: 'low' | 'medium' | 'high'): void;
    destroy(): void;
}
export declare const smartCache: SmartCache;
export type { CacheEntry, CacheLayer, CacheStats, PredictionConfig };

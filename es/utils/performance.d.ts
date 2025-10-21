/**
 * @ldesign/i18n - Performance Utilities
 * Lightweight performance monitoring and optimization tools
 */
/**
 * Simple performance mark wrapper
 */
export declare class PerformanceMark {
    private marks;
    private measures;
    private enabled;
    constructor(enabled?: boolean);
    /**
     * Mark a performance point
     */
    mark(name: string): void;
    /**
     * Measure time between marks
     */
    measure(name: string, startMark: string, endMark?: string): number | undefined;
    /**
     * Get average duration for a measure
     */
    getAverage(name: string): number | undefined;
    /**
     * Get all measures for a name
     */
    getMeasures(name: string): number[];
    /**
     * Clear all marks and measures
     */
    clear(): void;
    /**
     * Get summary
     */
    getSummary(): Record<string, {
        count: number;
        avg: number;
        min: number;
        max: number;
    }>;
}
/**
 * Debounce function - Optimized with leading/trailing options
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
}): T & {
    cancel: () => void;
    flush: () => void;
};
/**
 * Throttle function - Optimized implementation
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): T & {
    cancel: () => void;
    flush: () => void;
};
/**
 * Memoize function results with LRU cache
 */
export declare function memoize<T extends (...args: any[]) => any>(func: T, options?: {
    maxSize?: number;
    resolver?: (...args: any[]) => string;
    ttl?: number;
}): T & {
    cache: Map<string, {
        value: any;
        expires?: number;
    }>;
    clear: () => void;
};
/**
 * RAF-based scheduler for batching updates
 */
export declare class RAFScheduler {
    private rafId;
    private callbacks;
    /**
     * Schedule a callback
     */
    schedule(callback: () => void): void;
    /**
     * Flush all pending callbacks
     */
    flush(): void;
    /**
     * Cancel all pending callbacks
     */
    cancel(): void;
}
//# sourceMappingURL=performance.d.ts.map
/**
 * @ldesign/i18n - Lazy Loading System
 * 智能懒加载系统，支持按需加载和代码分割
 */
import type { Locale, Messages } from '../types';
/**
 * 懒加载配置
 */
export interface LazyLoadConfig {
    baseUrl?: string;
    loader?: (locale: Locale, namespace?: string) => Promise<Messages>;
    preloadStrategy?: 'none' | 'idle' | 'prefetch' | 'viewport';
    preloadDelay?: number;
    cacheStrategy?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
    cacheExpiry?: number;
    chunkStrategy?: 'namespace' | 'route' | 'component' | 'feature';
    chunkSize?: number;
    concurrent?: number;
    timeout?: number;
    retry?: number;
    compression?: boolean;
    compressionAlgorithm?: 'gzip' | 'brotli' | 'lz-string';
}
/**
 * 加载状态
 */
interface LoadState {
    locale: Locale;
    namespace?: string;
    status: 'idle' | 'loading' | 'loaded' | 'error';
    promise?: Promise<Messages>;
    error?: Error;
    timestamp?: number;
    size?: number;
}
/**
 * 懒加载管理器
 */
export declare class LazyLoader {
    private readonly config;
    private readonly loadStates;
    private readonly cache;
    private readonly preloadQueue;
    private readonly loadingPool;
    private observer?;
    private idleCallback?;
    private eventListeners;
    private readonly MAX_CACHE_SIZE;
    private readonly MAX_LOAD_STATES;
    constructor(config?: LazyLoadConfig);
    /**
     * 加载语言包
     */
    load(locale: Locale, namespace?: string): Promise<Messages>;
    /**
     * 预加载语言包
     */
    preload(locales: Locale[], namespaces?: string[]): Promise<void>;
    /**
     * 智能预加载
     */
    smartPreload(patterns: string[]): void;
    /**
     * 加载路由级语言包
     */
    loadForRoute(route: string, locale: Locale): Promise<Messages>;
    /**
     * 加载组件级语言包
     */
    loadForComponent(component: string, locale: Locale): Promise<Messages>;
    /**
     * 清理缓存
     */
    clearCache(locale?: Locale, namespace?: string): void;
    /**
     * 获取加载统计
     */
    getStats(): {
        loaded: number;
        cached: number;
        totalSize: number;
        states: Map<string, LoadState>;
    };
    /**
     * 执行实际加载
     */
    private performLoad;
    /**
     * 从URL加载
     */
    private loadFromUrl;
    /**
     * 构建URL
     */
    private buildUrl;
    /**
     * 带重试的执行
     */
    private withRetry;
    /**
     * 并发控制执行
     */
    private executeWithConcurrency;
    /**
     * 空闲时预加载
     */
    private preloadOnIdle;
    /**
     * 使用Prefetch预加载
     */
    private preloadWithPrefetch;
    /**
     * 视口内预加载
     */
    private preloadOnViewport;
    /**
     * 处理预加载队列
     */
    private processPreloadQueue;
    /**
     * 解压缩
     */
    private decompress;
    /**
     * LZ-string解压缩
     */
    private lzDecompress;
    /**
     * 更新加载状态
     */
    private updateLoadState;
    /**
     * 估算大小
     */
    private estimateSize;
    /**
     * 格式化大小
     */
    private formatSize;
    /**
     * 获取路由对应的命名空间
     */
    private getNamespaceForRoute;
    /**
     * 获取缓存键
     */
    private getCacheKey;
    /**
     * 延迟
     */
    private delay;
    /**
     * 初始化预加载策略
     */
    private initializePreloadStrategy;
    /**
     * 获取当前语言
     */
    private getCurrentLocale;
    /**
     * 清理资源
     */
    destroy(): void;
}
/**
 * 创建懒加载器
 */
export declare function createLazyLoader(config?: LazyLoadConfig): LazyLoader;
export {};
//# sourceMappingURL=lazy-loader.d.ts.map
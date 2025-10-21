/**
 * @ldesign/i18n - Offline First Support
 * 离线优先支持：Service Worker、缓存策略、后台同步
 */
import type { Locale, Messages } from '../types';
/**
 * 离线配置
 */
export interface OfflineConfig {
    enabled?: boolean;
    serviceWorkerPath?: string;
    cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    cacheName?: string;
    maxAge?: number;
    maxEntries?: number;
    enableBackgroundSync?: boolean;
    syncInterval?: number;
    offlineFallback?: Messages;
    precache?: string[];
    runtimeCache?: RuntimeCacheConfig[];
    enableIndexedDB?: boolean;
    enableWebSQL?: boolean;
}
/**
 * 运行时缓存配置
 */
interface RuntimeCacheConfig {
    urlPattern: RegExp | string;
    handler: 'cacheFirst' | 'networkFirst' | 'networkOnly' | 'cacheOnly' | 'staleWhileRevalidate';
    options?: {
        cacheName?: string;
        expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
        };
    };
}
/**
 * 同步队列项
 */
interface SyncQueueItem {
    id: string;
    action: 'fetch' | 'update' | 'delete';
    data: any;
    timestamp: number;
    retries: number;
}
/**
 * 离线管理器
 */
export declare class OfflineManager {
    private readonly config;
    private serviceWorkerRegistration?;
    private syncQueue;
    private db?;
    private isOnline;
    private syncTimer?;
    private cacheStorage?;
    private eventListeners;
    private readonly MAX_SYNC_QUEUE_SIZE;
    private swBlobUrl?;
    constructor(config?: OfflineConfig);
    /**
     * 初始化
     */
    private initialize;
    /**
     * 注册Service Worker
     */
    private registerServiceWorker;
    /**
     * 生成Service Worker代码
     */
    private generateServiceWorkerCode;
    /**
     * 初始化IndexedDB
     */
    private initializeIndexedDB;
    /**
     * 初始化缓存
     */
    private initializeCache;
    /**
     * 设置网络监听器
     */
    private setupNetworkListeners;
    /**
     * 设置消息通道
     */
    private setupMessageChannel;
    /**
     * 保存到离线存储
     */
    saveOffline(locale: Locale, namespace: string, messages: Messages): Promise<void>;
    /**
     * 从离线存储加载
     */
    loadOffline(locale: Locale, namespace: string): Promise<Messages | null>;
    /**
     * 添加到同步队列
     */
    addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): void;
    /**
     * 启动后台同步
     */
    private startBackgroundSync;
    /**
     * 同步待处理数据
     */
    private syncPendingData;
    /**
     * 处理同步项
     */
    private processSyncItem;
    /**
     * 清理过期缓存
     */
    clearExpiredCache(): Promise<void>;
    /**
     * 检查是否过期
     */
    private isExpired;
    /**
     * Promise化IndexedDB请求
     */
    private promisifyRequest;
    /**
     * 获取离线统计
     */
    getOfflineStats(): {
        isOnline: boolean;
        cacheSize: number;
        syncQueueLength: number;
        lastSync: Date | null;
    };
    /**
     * 销毁
     */
    destroy(): Promise<void>;
}
/**
 * 创建离线管理器
 */
export declare function createOfflineManager(config?: OfflineConfig): OfflineManager;
export {};
//# sourceMappingURL=offline-first.d.ts.map
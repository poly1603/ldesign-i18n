/**
 * @ldesign/i18n - Performance Monitor
 * 性能监控系统，实时跟踪和优化翻译性能
 */
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    translationCount: number;
    averageTranslationTime: number;
    slowestTranslation: {
        key: string;
        time: number;
    };
    fastestTranslation: {
        key: string;
        time: number;
    };
    cacheHitRate: number;
    cacheSize: number;
    cacheMisses: number;
    cacheHits: number;
    loadedLocales: number;
    loadTime: Map<string, number>;
    averageLoadTime: number;
    totalLoadSize: number;
    memoryUsage: number;
    peakMemoryUsage: number;
    gcCount: number;
    memoryLeaks: number;
    fps: number;
    jank: number;
    renderTime: number;
    scriptTime: number;
}
/**
 * 性能事件
 */
export interface PerformanceEvent {
    type: 'translation' | 'load' | 'cache' | 'memory' | 'render';
    timestamp: number;
    duration: number;
    details: any;
}
/**
 * 性能报告
 */
export interface PerformanceReport {
    metrics: PerformanceMetrics;
    events: PerformanceEvent[];
    recommendations: string[];
    timestamp: Date;
}
/**
 * 监控配置
 */
export interface MonitorConfig {
    enabled?: boolean;
    sampleRate?: number;
    reportInterval?: number;
    slowThreshold?: number;
    enableProfiling?: boolean;
    enableMemoryTracking?: boolean;
    enableNetworkTracking?: boolean;
    maxEvents?: number;
    alertThresholds?: {
        translationTime?: number;
        cacheHitRate?: number;
        memoryUsage?: number;
        fps?: number;
    };
}
/**
 * 性能监控器
 */
export declare class PerformanceMonitor {
    private readonly config;
    private metrics;
    private events;
    private readonly observers;
    private readonly timers;
    private reportTimer?;
    private memoryCheckTimer?;
    private rafId?;
    private lastFrameTime;
    private frameCount;
    private jankCount;
    private isDestroyed;
    constructor(config?: MonitorConfig);
    /**
     * 开始监控
     */
    start(): void;
    /**
     * 停止监控
     */
    stop(): void;
    /**
     * 记录翻译性能
     */
    recordTranslation(key: string, startTime: number): void;
    /**
     * 记录缓存命中
     */
    recordCacheHit(): void;
    /**
     * 记录缓存未命中
     */
    recordCacheMiss(): void;
    /**
     * 记录加载性能
     */
    recordLoad(locale: string, size: number, duration: number): void;
    /**
     * 记录内存使用
     */
    recordMemoryUsage(usage: number): void;
    /**
     * 开始计时
     */
    startTimer(label: string): void;
    /**
     * 结束计时
     */
    endTimer(label: string): number;
    /**
     * 获取性能指标
     */
    getMetrics(): PerformanceMetrics;
    /**
     * 获取性能报告
     */
    getReport(): PerformanceReport;
    /**
     * 生成优化建议
     */
    generateRecommendations(): string[];
    /**
     * 导出性能数据
     */
    exportData(): string;
    /**
     * 重置指标
     */
    reset(): void;
    /**
     * 初始化指标
     */
    private initMetrics;
    /**
     * 初始化观察器
     */
    private initializeObservers;
    /**
     * 开始内存监控
     */
    private startMemoryMonitoring;
    /**
     * 开始帧率监控
     */
    private startFrameMonitoring;
    /**
     * 开始定期报告
     */
    private startReporting;
    /**
     * 更新缓存命中率
     */
    private updateCacheHitRate;
    /**
     * 添加事件
     */
    private addEvent;
    /**
     * 检查告警
     */
    private checkAlerts;
    /**
     * 是否应该采样
     */
    private shouldSample;
}
/**
 * 创建性能监控器
 */
export declare function createPerformanceMonitor(config?: MonitorConfig): PerformanceMonitor;
/**
 * 性能装饰器
 */
export declare function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;

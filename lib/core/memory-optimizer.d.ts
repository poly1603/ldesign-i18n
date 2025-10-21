/**
 * @ldesign/i18n - Memory Optimizer
 * 自动内存优化和管理系统
 */
import type { I18nInstance } from '../types';
/**
 * 内存使用信息
 */
export interface MemoryInfo {
    used: number;
    limit: number;
    available: number;
    pressure: 'low' | 'medium' | 'high' | 'critical';
    collections: number;
}
/**
 * 优化策略
 */
export interface OptimizationStrategy {
    name: string;
    priority: number;
    condition: (info: MemoryInfo) => boolean;
    action: (optimizer: MemoryOptimizer) => Promise<void>;
}
/**
 * 内存优化配置
 */
export interface MemoryOptimizerConfig {
    enabled?: boolean;
    threshold?: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    checkInterval?: number;
    strategies?: OptimizationStrategy[];
    autoCompression?: boolean;
    aggressiveMode?: boolean;
}
/**
 * 内存优化器
 */
export declare class MemoryOptimizer {
    private config;
    private checkTimer?;
    private i18n?;
    private lastCheck;
    private gcCount;
    private readonly strategies;
    private isOptimizing;
    private readonly compressionCache;
    constructor(config?: MemoryOptimizerConfig);
    /**
     * 附加到i18n实例
     */
    attach(i18n: I18nInstance): void;
    /**
     * 获取内存信息
     */
    getMemoryInfo(): MemoryInfo;
    /**
     * 计算内存压力级别
     */
    private calculatePressure;
    /**
     * 初始化优化策略
     */
    private initializeStrategies;
    /**
     * 开始监控
     */
    private startMonitoring;
    /**
     * 检查并优化
     */
    checkAndOptimize(): Promise<void>;
    /**
     * 压缩对象（简单实现）
     */
    private compressObject;
    /**
     * 简单压缩算法
     */
    private simpleCompress;
    /**
     * 手动触发优化
     */
    optimize(): Promise<void>;
    /**
     * 获取优化统计
     */
    getStats(): {
        lastCheck: number;
        gcCount: number;
        memoryInfo: MemoryInfo;
        activeStrategies: string[];
    };
    /**
     * 停止优化器
     */
    stop(): void;
    /**
     * 销毁优化器
     */
    destroy(): void;
}
/**
 * 创建内存优化器
 */
export declare function createMemoryOptimizer(config?: MemoryOptimizerConfig): MemoryOptimizer;
/**
 * 内存分析工具
 */
export declare class MemoryAnalyzer {
    /**
     * 估算对象大小
     */
    static estimateSize(obj: any): number;
    /**
     * 分析内存使用分布
     */
    static analyzeDistribution(i18n: I18nInstance): {
        messages: number;
        cache: number;
        other: number;
        total: number;
    };
}
//# sourceMappingURL=memory-optimizer.d.ts.map
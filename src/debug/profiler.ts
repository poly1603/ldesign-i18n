/**
 * @ldesign/i18n - 性能分析器
 *
 * 提供详细的性能监控和分析功能
 * 帮助识别性能瓶颈和优化机会
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  name: string
  /** 开始时间戳 */
  startTime: number
  /** 结束时间戳 */
  endTime?: number
  /** 持续时间(毫秒) */
  duration?: number
  /** 操作类型 */
  type: 'translation' | 'load' | 'cache' | 'interpolation' | 'other'
  /** 额外的元数据 */
  metadata?: Record<string, any>
}

/**
 * 性能报告接口
 */
export interface ProfilingReport {
  /** 总操作数 */
  totalOperations: number
  /** 总耗时(毫秒) */
  totalDuration: number
  /** 平均耗时(毫秒) */
  averageDuration: number
  /** 最慢的操作 */
  slowest: PerformanceMetrics[]
  /** 最快的操作 */
  fastest: PerformanceMetrics[]
  /** 按类型统计 */
  byType: Record<string, {
    count: number
    totalDuration: number
    averageDuration: number
  }>
  /** 缓存命中率 */
  cacheHitRate?: number
  /** 建议 */
  recommendations: string[]
}

/**
 * 性能分析器
 *
 * 监控和分析 I18n 操作的性能
 *
 * ## 使用场景
 * - 性能调优
 * - 瓶颈识别
 * - 性能回归检测
 * - 生产环境监控
 *
 * @example
 * ```typescript
 * const profiler = new I18nProfiler();
 *
 * // 开始性能分析
 * profiler.startProfiling();
 *
 * // 执行翻译操作
 * i18n.t('app.title');
 * i18n.t('app.description');
 *
 * // 停止并获取报告
 * const report = profiler.stopProfiling();
 * console.log('平均耗时:', report.averageDuration);
 * console.log('建议:', report.recommendations);
 * ```
 */
export class I18nProfiler {
  /** 是否正在分析 */
  private isProfiling = false
  /** 性能指标列表 */
  private metrics: PerformanceMetrics[] = []
  /** 活跃的操作栈 */
  private activeOperations: Map<string, PerformanceMetrics> = new Map()
  /** 缓存命中数 */
  private cacheHits = 0
  /** 缓存未命中数 */
  private cacheMisses = 0
  /** 开始时间 */
  private startTime?: number
  /** 结束时间 */
  private endTime?: number

  /**
   * 开始性能分析
   *
   * 清空之前的数据并开始记录
   */
  startProfiling(): void {
    this.isProfiling = true
    this.metrics = []
    this.activeOperations.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    this.startTime = performance.now()
    this.endTime = undefined
  }

  /**
   * 停止性能分析
   *
   * 生成性能报告
   *
   * @returns 性能分析报告
   */
  stopProfiling(): ProfilingReport {
    this.isProfiling = false
    this.endTime = performance.now()

    return this.generateReport()
  }

  /**
   * 标记操作开始
   *
   * @param name - 操作名称(唯一标识)
   * @param type - 操作类型
   * @param metadata - 元数据(可选)
   * @returns 操作 ID
   */
  markStart(
    name: string,
    type: PerformanceMetrics['type'] = 'other',
    metadata?: Record<string, any>,
  ): string {
    if (!this.isProfiling)
      return name

    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      type,
      metadata,
    }

    this.activeOperations.set(name, metric)
    return name
  }

  /**
   * 标记操作结束
   *
   * @param name - 操作名称(与 markStart 的名称对应)
   */
  markEnd(name: string): void {
    if (!this.isProfiling)
      return

    const metric = this.activeOperations.get(name)
    if (!metric) {
      console.warn(`[Profiler] No active operation found for: ${name}`)
      return
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    this.metrics.push(metric)
    this.activeOperations.delete(name)
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    if (this.isProfiling) {
      this.cacheHits++
    }
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    if (this.isProfiling) {
      this.cacheMisses++
    }
  }

  /**
   * 生成性能报告
   *
   * @returns 详细的性能分析报告
   * @private
   */
  private generateReport(): ProfilingReport {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined)

    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        totalDuration: 0,
        averageDuration: 0,
        slowest: [],
        fastest: [],
        byType: {},
        recommendations: ['没有收集到性能数据'],
      }
    }

    // 总耗时
    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)

    // 平均耗时
    const averageDuration = totalDuration / completedMetrics.length

    // 最慢的操作(前10个)
    const slowest = [...completedMetrics]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10)

    // 最快的操作(前10个)
    const fastest = [...completedMetrics]
      .sort((a, b) => (a.duration || 0) - (b.duration || 0))
      .slice(0, 10)

    // 按类型统计
    const byType: Record<string, any> = {}
    for (const metric of completedMetrics) {
      if (!byType[metric.type]) {
        byType[metric.type] = {
          count: 0,
          totalDuration: 0,
          averageDuration: 0,
        }
      }

      byType[metric.type].count++
      byType[metric.type].totalDuration += metric.duration || 0
    }

    // 计算每种类型的平均耗时
    for (const type in byType) {
      byType[type].averageDuration = byType[type].totalDuration / byType[type].count
    }

    // 缓存命中率
    const totalCacheAccess = this.cacheHits + this.cacheMisses
    const cacheHitRate = totalCacheAccess > 0
      ? this.cacheHits / totalCacheAccess
      : undefined

    // 生成建议
    const recommendations = this.generateRecommendations(
      averageDuration,
      slowest,
      byType,
      cacheHitRate,
    )

    return {
      totalOperations: completedMetrics.length,
      totalDuration,
      averageDuration,
      slowest,
      fastest,
      byType,
      cacheHitRate,
      recommendations,
    }
  }

  /**
   * 生成优化建议
   *
   * 基于性能数据提供智能建议
   *
   * @param averageDuration - 平均耗时
   * @param slowest - 最慢的操作
   * @param byType - 按类型统计
   * @param cacheHitRate - 缓存命中率
   * @returns 建议列表
   * @private
   */
  private generateRecommendations(
    averageDuration: number,
    slowest: PerformanceMetrics[],
    byType: Record<string, any>,
    cacheHitRate?: number,
  ): string[] {
    const recommendations: string[] = []

    // 平均耗时建议
    if (averageDuration > 10) {
      recommendations.push(`平均翻译耗时较高 (${averageDuration.toFixed(2)}ms), 考虑增加缓存或优化消息结构`)
    }

    // 缓存命中率建议
    if (cacheHitRate !== undefined && cacheHitRate < 0.8) {
      recommendations.push(`缓存命中率较低 (${(cacheHitRate * 100).toFixed(1)}%), 考虑增大缓存容量或预加载常用翻译`)
    }

    // 加载性能建议
    if (byType.load && byType.load.averageDuration > 100) {
      recommendations.push(`语言包加载耗时较长 (${byType.load.averageDuration.toFixed(2)}ms), 考虑使用预加载或拆分语言包`)
    }

    // 慢操作建议
    if (slowest.length > 0 && slowest[0].duration! > 50) {
      recommendations.push(
        `发现耗时操作: "${slowest[0].name}" (${slowest[0].duration!.toFixed(2)}ms), 检查是否有复杂的插值或嵌套翻译`,
      )
    }

    // 插值性能建议
    if (byType.interpolation && byType.interpolation.averageDuration > 5) {
      recommendations.push(`参数插值耗时较高, 考虑简化占位符或使用模板预编译`)
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好,无明显优化建议')
    }

    return recommendations
  }

  /**
   * 获取慢操作
   *
   * @param threshold - 耗时阈值(毫秒),默认 10ms
   * @returns 慢操作列表
   */
  getSlowOperations(threshold = 10): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.duration && m.duration > threshold)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
  }

  /**
   * 导出性能数据
   *
   * @returns JSON 字符串
   */
  exportData(): string {
    return JSON.stringify({
      isProfiling: this.isProfiling,
      startTime: this.startTime,
      endTime: this.endTime,
      metrics: this.metrics,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
    }, null, 2)
  }

  /**
   * 重置分析器
   *
   * 清空所有数据
   */
  reset(): void {
    this.isProfiling = false
    this.metrics = []
    this.activeOperations.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    this.startTime = undefined
    this.endTime = undefined
  }
}

/**
 * 全局性能分析器实例
 */
export const globalProfiler = new I18nProfiler()

/**
 * 性能装饰器
 *
 * 用于自动追踪方法性能
 *
 * @param type - 操作类型
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @performanceTracker('translation')
 *   translate(key: string): string {
 *     // ... 翻译逻辑
 *   }
 * }
 * ```
 */
export function performanceTracker(type: PerformanceMetrics['type'] = 'other') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (this: any, ...args: any[]) {
      const operationName = `${target.constructor.name}.${propertyKey}`
      globalProfiler.markStart(operationName, type, { args })

      try {
        const result = originalMethod.apply(this, args)

        // 处理异步方法
        if (result instanceof Promise) {
          return result.finally(() => {
            globalProfiler.markEnd(operationName)
          })
        }

        globalProfiler.markEnd(operationName)
        return result
      }
      catch (error) {
        globalProfiler.markEnd(operationName)
        throw error
      }
    }

    return descriptor
  }
}

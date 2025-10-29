/**
 * @ldesign/i18n - 翻译可视化调试工具
 *
 * 提供翻译使用情况分析、可视化和调试功能
 */

/**
 * 翻译使用情况接口
 */
export interface TranslationUsage {
  /** 翻译键 */
  key: string
  /** 使用次数 */
  count: number
  /** 最后使用时间 */
  lastUsed: number
  /** 使用的语言 */
  locales: Set<string>
  /** 是否存在 */
  exists: boolean
}

/**
 * 使用报告接口
 */
export interface UsageReport {
  /** 总翻译调用次数 */
  totalCalls: number
  /** 唯一键数量 */
  uniqueKeys: number
  /** 缺失的键 */
  missingKeys: string[]
  /** 最常用的键(前20个) */
  mostUsed: Array<{ key: string, count: number }>
  /** 从未使用的键 */
  unusedKeys: string[]
  /** 按语言统计 */
  byLocale: Record<string, {
    calls: number
    uniqueKeys: number
  }>
  /** 覆盖率 */
  coverage: {
    available: number
    used: number
    percentage: number
  }
}

/**
 * 翻译检查器
 *
 * 追踪、分析和可视化翻译使用情况
 *
 * ## 功能
 * - 追踪翻译调用
 * - 检测缺失的键
 * - 统计使用频率
 * - 识别未使用的翻译
 * - 生成覆盖率报告
 *
 * @example
 * ```typescript
 * const inspector = new TranslationInspector();
 *
 * // 开始追踪
 * inspector.startTracking();
 *
 * // 记录翻译调用
 * inspector.recordTranslation('app.title', 'zh-CN', true);
 * inspector.recordTranslation('app.description', 'zh-CN', false); // 缺失
 *
 * // 生成报告
 * const report = inspector.generateReport();
 * console.log('缺失的键:', report.missingKeys);
 * console.log('覆盖率:', report.coverage.percentage);
 * ```
 */
export class TranslationInspector {
  /** 是否正在追踪 */
  private isTracking = false
  /** 翻译使用情况映射表 */
  private usageMap: Map<string, TranslationUsage> = new Map()
  /** 可用的翻译键集合 */
  private availableKeys: Set<string> = new Set()
  /** 语言调用统计 */
  private localeStats: Map<string, number> = new Map()

  /**
   * 设置可用的翻译键
   *
   * @param keys - 翻译键数组或集合
   */
  setAvailableKeys(keys: string[] | Set<string>): void {
    this.availableKeys = keys instanceof Set ? keys : new Set(keys)
  }

  /**
   * 开始追踪翻译调用
   */
  startTracking(): void {
    this.isTracking = true
    this.usageMap.clear()
    this.localeStats.clear()
  }

  /**
   * 停止追踪
   */
  stopTracking(): void {
    this.isTracking = false
  }

  /**
   * 记录翻译调用
   *
   * @param key - 翻译键
   * @param locale - 语言代码
   * @param exists - 翻译是否存在
   */
  recordTranslation(key: string, locale: string, exists: boolean): void {
    if (!this.isTracking)
      return

    // 更新使用情况
    let usage = this.usageMap.get(key)
    if (!usage) {
      usage = {
        key,
        count: 0,
        lastUsed: Date.now(),
        locales: new Set(),
        exists,
      }
      this.usageMap.set(key, usage)
    }

    usage.count++
    usage.lastUsed = Date.now()
    usage.locales.add(locale)

    // 更新语言统计
    this.localeStats.set(locale, (this.localeStats.get(locale) || 0) + 1)
  }

  /**
   * 生成使用报告
   *
   * @returns 详细的使用情况报告
   */
  generateReport(): UsageReport {
    const usages = Array.from(this.usageMap.values())

    // 总调用次数
    const totalCalls = usages.reduce((sum, u) => sum + u.count, 0)

    // 唯一键数量
    const uniqueKeys = usages.length

    // 缺失的键
    const missingKeys = usages
      .filter(u => !u.exists)
      .map(u => u.key)

    // 最常用的键
    const mostUsed = usages
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(u => ({ key: u.key, count: u.count }))

    // 从未使用的键
    const usedKeys = new Set(usages.map(u => u.key))
    const unusedKeys = Array.from(this.availableKeys)
      .filter(key => !usedKeys.has(key))

    // 按语言统计
    const byLocale: Record<string, any> = {}
    for (const [locale, calls] of this.localeStats) {
      const localeUsages = usages.filter(u => u.locales.has(locale))
      byLocale[locale] = {
        calls,
        uniqueKeys: localeUsages.length,
      }
    }

    // 覆盖率
    const coverage = {
      available: this.availableKeys.size,
      used: usedKeys.size,
      percentage: this.availableKeys.size > 0
        ? (usedKeys.size / this.availableKeys.size) * 100
        : 0,
    }

    return {
      totalCalls,
      uniqueKeys,
      missingKeys,
      mostUsed,
      unusedKeys,
      byLocale,
      coverage,
    }
  }

  /**
   * 高亮显示缺失的翻译键(浏览器环境)
   *
   * 在页面上为缺失的翻译添加视觉标记
   */
  highlightMissingKeys(): void {
    if (typeof document === 'undefined') {
      console.warn('[Inspector] highlightMissingKeys 仅在浏览器环境可用')
      return
    }

    const missingKeys = Array.from(this.usageMap.values())
      .filter(u => !u.exists)
      .map(u => u.key)

    console.log(`[Inspector] 发现 ${missingKeys.length} 个缺失的翻译键:`, missingKeys)

    // 在页面上查找并高亮显示包含这些键的元素
    // 实际实现需要根据具体的 DOM 结构调整
  }

  /**
   * 显示翻译边界(浏览器环境)
   *
   * 在页面上可视化显示翻译文本的边界
   */
  showTranslationBoundaries(): void {
    if (typeof document === 'undefined') {
      console.warn('[Inspector] showTranslationBoundaries 仅在浏览器环境可用')
      return
    }

    console.log('[Inspector] 翻译边界可视化功能需要配合特定的 DOM 属性使用')
    // 实际实现: 为翻译文本添加边框或背景色
  }

  /**
   * 导出使用报告
   *
   * @param format - 导出格式,默认 'json'
   * @returns 报告字符串
   */
  exportReport(format: 'json' | 'csv' = 'json'): string {
    const report = this.generateReport()

    if (format === 'csv') {
      return this.convertToCSV(report)
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 转换报告为 CSV 格式
   * 
   * @param _report - 使用报告(未使用,预留)
   * @returns CSV 字符串
   * @private
   */
  private convertToCSV(_report: UsageReport): string {
    const lines: string[] = [
      '键名,使用次数,是否存在',
      ...Array.from(this.usageMap.values()).map(u =>
        `"${u.key}",${u.count},${u.exists ? '是' : '否'}`,
      ),
    ]

    return lines.join('\n')
  }

  /**
   * 清空追踪数据
   */
  clear(): void {
    this.usageMap.clear()
    this.localeStats.clear()
  }

  /**
   * 获取实时统计
   *
   * @returns 实时统计数据
   */
  getRealTimeStats(): {
    trackedKeys: number
    totalCalls: number
    missingCount: number
    locales: number
  } {
    const usages = Array.from(this.usageMap.values())

    return {
      trackedKeys: usages.length,
      totalCalls: usages.reduce((sum, u) => sum + u.count, 0),
      missingCount: usages.filter(u => !u.exists).length,
      locales: this.localeStats.size,
    }
  }
}

/**
 * 全局翻译检查器实例
 */
export const globalInspector = new TranslationInspector()

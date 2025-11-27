/**
 * 智能预加载器
 * 
 * 基于用户行为和路由预测，智能预加载翻译资源
 */

import type { I18nInstance, Locale, Messages } from '../types'

/**
 * 预加载策略
 */
export type PreloadStrategy = 'eager' | 'lazy' | 'predictive' | 'route-based'

/**
 * 预加载选项
 */
export interface PreloadOptions {
  /** 预加载策略 */
  strategy?: PreloadStrategy
  /** 优先级语言列表 */
  priority?: Locale[]
  /** 最大并发加载数 */
  concurrency?: number
  /** 预加载延迟（毫秒） */
  delay?: number
  /** 是否启用用户行为预测 */
  enablePrediction?: boolean
  /** 预测阈值（0-1） */
  predictionThreshold?: number
}

/**
 * 路由配置
 */
export interface RouteConfig {
  path: string
  locales: Locale[]
  namespaces?: string[]
  priority?: number
}

/**
 * 用户行为记录
 */
interface UserBehavior {
  locale: Locale
  timestamp: number
  duration: number
  route?: string
}

/**
 * 智能预加载器
 */
export class SmartPreloader {
  private i18n: I18nInstance
  private options: Required<PreloadOptions>
  private loadingQueue = new Set<string>()
  private loaded = new Set<string>()
  private behaviors: UserBehavior[] = []
  private routeConfigs = new Map<string, RouteConfig>()
  private predictionModel = new Map<Locale, number>()

  constructor(i18n: I18nInstance, options: PreloadOptions = {}) {
    this.i18n = i18n
    this.options = {
      strategy: options.strategy || 'lazy',
      priority: options.priority || [],
      concurrency: options.concurrency || 3,
      delay: options.delay || 0,
      enablePrediction: options.enablePrediction ?? true,
      predictionThreshold: options.predictionThreshold || 0.6,
    }

    // 初始化预测模型
    this.initPredictionModel()
  }

  /**
   * 初始化预测模型
   */
  private initPredictionModel(): void {
    if (!this.options.enablePrediction) return

    // 从历史行为中学习
    this.options.priority.forEach((locale, index) => {
      const score = 1 - (index / this.options.priority.length) * 0.5
      this.predictionModel.set(locale, score)
    })
  }

  /**
   * 注册路由配置
   */
  registerRoute(config: RouteConfig): void {
    this.routeConfigs.set(config.path, config)
  }

  /**
   * 批量注册路由
   */
  registerRoutes(configs: RouteConfig[]): void {
    configs.forEach(config => this.registerRoute(config))
  }

  /**
   * 预加载指定语言
   */
  async preload(locale: Locale, namespace?: string): Promise<void> {
    const key = this.getLoadKey(locale, namespace)

    // 避免重复加载
    if (this.loaded.has(key) || this.loadingQueue.has(key)) {
      return
    }

    this.loadingQueue.add(key)

    try {
      // 延迟加载
      if (this.options.delay > 0) {
        await this.delay(this.options.delay)
      }

      // 检查是否已有该语言的消息
      if (!this.i18n.hasLocale(locale)) {
        await this.i18n.setLocale(locale)
      }

      // 如果指定了命名空间，加载命名空间
      if (namespace && !this.i18n.hasNamespace(namespace, locale)) {
        await this.i18n.loadNamespace(namespace, locale)
      }

      this.loaded.add(key)
      this.loadingQueue.delete(key)
    } catch (error) {
      this.loadingQueue.delete(key)
      console.error(`[SmartPreloader] Failed to preload ${key}:`, error)
      throw error
    }
  }

  /**
   * 批量预加载
   */
  async preloadBatch(locales: Locale[], namespace?: string): Promise<void> {
    const tasks: Promise<void>[] = []
    let activeCount = 0

    for (const locale of locales) {
      // 控制并发数
      while (activeCount >= this.options.concurrency) {
        await Promise.race(tasks)
      }

      activeCount++
      const task = this.preload(locale, namespace)
        .finally(() => activeCount--)

      tasks.push(task)
    }

    await Promise.allSettled(tasks)
  }

  /**
   * 基于路由预加载
   */
  async preloadForRoute(route: string): Promise<void> {
    const config = this.routeConfigs.get(route)

    if (!config) {
      console.warn(`[SmartPreloader] No config found for route: ${route}`)
      return
    }

    // 按优先级排序
    const sortedLocales = [...config.locales].sort((a, b) => {
      const priorityA = this.options.priority.indexOf(a)
      const priorityB = this.options.priority.indexOf(b)
      
      if (priorityA === -1 && priorityB === -1) return 0
      if (priorityA === -1) return 1
      if (priorityB === -1) return -1
      
      return priorityA - priorityB
    })

    // 加载语言和命名空间
    for (const locale of sortedLocales) {
      if (config.namespaces && config.namespaces.length > 0) {
        for (const ns of config.namespaces) {
          await this.preload(locale, ns)
        }
      } else {
        await this.preload(locale)
      }
    }
  }

  /**
   * 智能预测并预加载
   */
  async predictivePreload(): Promise<void> {
    if (!this.options.enablePrediction) return

    // 更新预测模型
    this.updatePredictionModel()

    // 获取预测的语言列表
    const predicted = Array.from(this.predictionModel.entries())
      .filter(([_, score]) => score >= this.options.predictionThreshold)
      .sort((a, b) => b[1] - a[1])
      .map(([locale]) => locale)

    if (predicted.length > 0) {
      await this.preloadBatch(predicted)
    }
  }

  /**
   * 记录用户行为
   */
  trackBehavior(locale: Locale, route?: string, duration = 0): void {
    this.behaviors.push({
      locale,
      timestamp: Date.now(),
      duration,
      route,
    })

    // 限制历史记录数量
    if (this.behaviors.length > 100) {
      this.behaviors.shift()
    }

    // 更新预测模型
    if (this.options.enablePrediction) {
      this.updatePredictionModel()
    }
  }

  /**
   * 更新预测模型
   */
  private updatePredictionModel(): void {
    const now = Date.now()
    const recentWindow = 3600000 // 1小时

    // 统计最近使用的语言
    const recentUsage = new Map<Locale, number>()

    this.behaviors.forEach(behavior => {
      if (now - behavior.timestamp < recentWindow) {
        const current = recentUsage.get(behavior.locale) || 0
        recentUsage.set(behavior.locale, current + 1)
      }
    })

    // 计算得分
    const total = Array.from(recentUsage.values()).reduce((sum, count) => sum + count, 0)

    if (total > 0) {
      recentUsage.forEach((count, locale) => {
        const score = count / total
        const currentScore = this.predictionModel.get(locale) || 0
        // 平滑更新（加权平均）
        const newScore = currentScore * 0.7 + score * 0.3
        this.predictionModel.set(locale, newScore)
      })
    }
  }

  /**
   * 获取加载键
   */
  private getLoadKey(locale: Locale, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取预加载状态
   */
  getStatus(): {
    loaded: string[]
    loading: string[]
    predictions: Array<{ locale: Locale; score: number }>
  } {
    return {
      loaded: Array.from(this.loaded),
      loading: Array.from(this.loadingQueue),
      predictions: Array.from(this.predictionModel.entries())
        .map(([locale, score]) => ({ locale, score }))
        .sort((a, b) => b.score - a.score),
    }
  }

  /**
   * 清除缓存和历史
   */
  clear(): void {
    this.loaded.clear()
    this.loadingQueue.clear()
    this.behaviors = []
    this.predictionModel.clear()
    this.initPredictionModel()
  }

  /**
   * 导出统计数据
   */
  exportStats(): {
    totalLoaded: number
    totalPredictions: number
    behaviorCount: number
    topLocales: Array<{ locale: Locale; score: number }>
  } {
    const topLocales = Array.from(this.predictionModel.entries())
      .map(([locale, score]) => ({ locale, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return {
      totalLoaded: this.loaded.size,
      totalPredictions: this.predictionModel.size,
      behaviorCount: this.behaviors.length,
      topLocales,
    }
  }
}

/**
 * 创建智能预加载器
 */
export function createSmartPreloader(
  i18n: I18nInstance,
  options?: PreloadOptions
): SmartPreloader {
  return new SmartPreloader(i18n, options)
}
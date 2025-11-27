/**
 * 智能缓存预测器
 * 
 * 基于使用模式预测和预加载可能需要的翻译
 */

import type { Locale, MessageKey, Messages } from '../types'

/**
 * 使用模式
 */
export interface UsagePattern {
  /** 键 */
  key: MessageKey
  /** 使用频率 */
  frequency: number
  /** 最后使用时间 */
  lastUsed: number
  /** 相关键（经常一起使用的键） */
  relatedKeys: Set<string>
  /** 权重分数 */
  score: number
}

/**
 * 预测结果
 */
export interface PredictionResult {
  /** 预测的键 */
  keys: MessageKey[]
  /** 置信度 (0-1) */
  confidence: number
  /** 预测原因 */
  reason: string
}

/**
 * 预测器选项
 */
export interface PredictorOptions {
  /** 最大跟踪键数量 */
  maxTrackedKeys?: number
  /** 预测窗口大小 */
  predictionWindow?: number
  /** 最小置信度阈值 */
  minConfidence?: number
  /** 相关性阈值 */
  relatedThreshold?: number
  /** 是否启用时间衰减 */
  enableTimeDecay?: boolean
  /** 时间衰减因子 */
  decayFactor?: number
}

/**
 * 智能缓存预测器
 */
export class CachePredictor {
  private patterns = new Map<MessageKey, UsagePattern>()
  private accessSequence: Array<{ key: MessageKey; timestamp: number }> = []
  private readonly options: Required<PredictorOptions>

  constructor(options: PredictorOptions = {}) {
    this.options = {
      maxTrackedKeys: options.maxTrackedKeys ?? 500,
      predictionWindow: options.predictionWindow ?? 10,
      minConfidence: options.minConfidence ?? 0.3,
      relatedThreshold: options.relatedThreshold ?? 0.2,
      enableTimeDecay: options.enableTimeDecay ?? true,
      decayFactor: options.decayFactor ?? 0.95,
    }
  }

  /**
   * 记录键访问
   */
  recordAccess(key: MessageKey): void {
    const now = Date.now()

    // 更新访问序列
    this.accessSequence.push({ key, timestamp: now })
    if (this.accessSequence.length > this.options.predictionWindow * 2) {
      this.accessSequence.shift()
    }

    // 更新或创建模式
    let pattern = this.patterns.get(key)
    if (!pattern) {
      pattern = {
        key,
        frequency: 0,
        lastUsed: now,
        relatedKeys: new Set(),
        score: 0,
      }
      this.patterns.set(key, pattern)
    }

    pattern.frequency++
    pattern.lastUsed = now

    // 分析相关键
    this.updateRelatedKeys(key)

    // 更新分数
    this.updateScore(pattern)

    // 限制跟踪的键数量
    this.prunePatterns()
  }

  /**
   * 更新相关键
   */
  private updateRelatedKeys(currentKey: MessageKey): void {
    const recentKeys = this.accessSequence
      .slice(-this.options.predictionWindow)
      .map(item => item.key)
      .filter(key => key !== currentKey)

    const pattern = this.patterns.get(currentKey)
    if (!pattern) return

    // 记录经常一起出现的键
    recentKeys.forEach(key => {
      if (key !== currentKey) {
        pattern.relatedKeys.add(key)
      }
    })

    // 限制相关键数量
    if (pattern.relatedKeys.size > 20) {
      const related = Array.from(pattern.relatedKeys)
      const recentSet = new Set(recentKeys)
      
      // 保留最近使用的
      pattern.relatedKeys = new Set(
        related.filter(k => recentSet.has(k)).slice(0, 20)
      )
    }
  }

  /**
   * 更新模式分数
   */
  private updateScore(pattern: UsagePattern): void {
    const now = Date.now()
    const timeSinceLastUse = now - pattern.lastUsed

    // 基础分数：频率
    let score = pattern.frequency

    // 时间衰减
    if (this.options.enableTimeDecay) {
      const hoursSinceLastUse = timeSinceLastUse / (1000 * 60 * 60)
      const decayMultiplier = Math.pow(this.options.decayFactor, hoursSinceLastUse)
      score *= decayMultiplier
    }

    // 相关性加成
    score += pattern.relatedKeys.size * 0.5

    pattern.score = score
  }

  /**
   * 预测下一个可能使用的键
   */
  predict(currentKey?: MessageKey, limit = 5): PredictionResult {
    const predictions: Array<{ key: MessageKey; score: number; reason: string }> = []

    if (currentKey) {
      const pattern = this.patterns.get(currentKey)
      
      if (pattern && pattern.relatedKeys.size > 0) {
        // 基于相关性预测
        pattern.relatedKeys.forEach(relatedKey => {
          const relatedPattern = this.patterns.get(relatedKey)
          if (relatedPattern) {
            predictions.push({
              key: relatedKey,
              score: relatedPattern.score,
              reason: 'frequently-used-together',
            })
          }
        })
      }
    }

    // 基于频率和时间的预测
    this.patterns.forEach((pattern, key) => {
      if (key !== currentKey) {
        predictions.push({
          key,
          score: pattern.score,
          reason: 'high-frequency',
        })
      }
    })

    // 排序并取前N个
    predictions.sort((a, b) => b.score - a.score)
    const topPredictions = predictions.slice(0, limit)

    // 计算置信度
    const totalScore = topPredictions.reduce((sum, p) => sum + p.score, 0)
    const maxScore = topPredictions[0]?.score || 0
    const confidence = maxScore > 0 ? maxScore / (totalScore || 1) : 0

    return {
      keys: topPredictions.map(p => p.key),
      confidence: Math.min(confidence, 1),
      reason: topPredictions[0]?.reason || 'no-prediction',
    }
  }

  /**
   * 预测一组相关的键
   */
  predictBatch(keys: MessageKey[], limit = 10): MessageKey[] {
    const relatedKeys = new Set<MessageKey>()
    const scores = new Map<MessageKey, number>()

    // 收集所有相关键
    keys.forEach(key => {
      const pattern = this.patterns.get(key)
      if (pattern) {
        pattern.relatedKeys.forEach(relatedKey => {
          relatedKeys.add(relatedKey)
          const currentScore = scores.get(relatedKey) || 0
          const relatedPattern = this.patterns.get(relatedKey)
          scores.set(relatedKey, currentScore + (relatedPattern?.score || 0))
        })
      }
    })

    // 排序并返回
    return Array.from(relatedKeys)
      .sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0))
      .slice(0, limit)
  }

  /**
   * 获取热门键
   */
  getHotKeys(limit = 20): MessageKey[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(p => p.key)
  }

  /**
   * 获取冷门键（可能需要清理）
   */
  getColdKeys(limit = 20): MessageKey[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map(p => p.key)
  }

  /**
   * 获取模式统计
   */
  getStats(): {
    totalKeys: number
    avgFrequency: number
    avgRelatedKeys: number
    topKeys: Array<{ key: MessageKey; frequency: number; score: number }>
  } {
    const patterns = Array.from(this.patterns.values())
    const totalKeys = patterns.length

    const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / (totalKeys || 1)
    const avgRelatedKeys = patterns.reduce((sum, p) => sum + p.relatedKeys.size, 0) / (totalKeys || 1)

    const topKeys = patterns
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(p => ({
        key: p.key,
        frequency: p.frequency,
        score: Math.round(p.score * 100) / 100,
      }))

    return {
      totalKeys,
      avgFrequency: Math.round(avgFrequency * 100) / 100,
      avgRelatedKeys: Math.round(avgRelatedKeys * 100) / 100,
      topKeys,
    }
  }

  /**
   * 修剪模式（移除低分的）
   */
  private prunePatterns(): void {
    if (this.patterns.size <= this.options.maxTrackedKeys) {
      return
    }

    // 获取所有模式并按分数排序
    const patterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1].score - a[1].score)

    // 保留高分的，移除低分的
    const toKeep = patterns.slice(0, this.options.maxTrackedKeys)
    this.patterns = new Map(toKeep)
  }

  /**
   * 应用时间衰减到所有模式
   */
  applyDecay(): void {
    if (!this.options.enableTimeDecay) {
      return
    }

    this.patterns.forEach(pattern => {
      this.updateScore(pattern)
    })
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.patterns.clear()
    this.accessSequence = []
  }

  /**
   * 导出模式数据
   */
  export(): string {
    const data = {
      patterns: Array.from(this.patterns.entries()).map(([key, pattern]) => ({
        key,
        frequency: pattern.frequency,
        lastUsed: pattern.lastUsed,
        relatedKeys: Array.from(pattern.relatedKeys),
        score: pattern.score,
      })),
      accessSequence: this.accessSequence,
      stats: this.getStats(),
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入模式数据
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.patterns && Array.isArray(parsed.patterns)) {
        this.patterns.clear()
        
        parsed.patterns.forEach((p: any) => {
          this.patterns.set(p.key, {
            key: p.key,
            frequency: p.frequency,
            lastUsed: p.lastUsed,
            relatedKeys: new Set(p.relatedKeys),
            score: p.score,
          })
        })
      }

      if (parsed.accessSequence && Array.isArray(parsed.accessSequence)) {
        this.accessSequence = parsed.accessSequence
      }
    } catch (error) {
      console.error('Failed to import predictor data:', error)
    }
  }
}

/**
 * 创建智能缓存预测器
 */
export function createCachePredictor(options?: PredictorOptions): CachePredictor {
  return new CachePredictor(options)
}
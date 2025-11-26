/**
 * @ldesign/i18n - Translation Processor
 * 统一的翻译处理逻辑，处理复数化和插值
 */

import type { InterpolationParams, Locale, MessageKey, TranslateOptions } from '../types'
import type { InterpolationEngine } from './interpolation'
import type { PluralizationEngine } from './pluralization'

/**
 * 翻译处理器配置
 */
export interface TranslationProcessorConfig {
  /** 插值引擎 */
  interpolation: InterpolationEngine
  /** 复数化引擎 */
  pluralization: PluralizationEngine
}

/**
 * 翻译处理结果
 */
export interface ProcessResult {
  /** 处理后的消息 */
  message: string
  /** 是否应用了复数化 */
  pluralized: boolean
  /** 是否应用了插值 */
  interpolated: boolean
}

/**
 * 翻译处理器
 * 
 * 统一处理翻译消息的复数化和插值逻辑
 * 避免在 translate 和 translateBatch 中重复代码
 * 
 * ## 处理流程
 * 1. 检查并应用复数化（如果有 count 参数）
 * 2. 检查并应用插值（如果有 params 参数）
 * 3. 返回最终处理结果
 * 
 * @example
 * ```typescript
 * const processor = new TranslationProcessor(config);
 * const result = processor.process(
 *   'You have {count} items',
 *   'zh-CN',
 *   { count: 5, params: { count: 5 } },
 *   (k) => translateFn(k)
 * );
 * console.log(result.message); // '你有 5 个项目'
 * ```
 */
export class TranslationProcessor {
  private config: TranslationProcessorConfig

  constructor(config: TranslationProcessorConfig) {
    this.config = config
  }

  /**
   * 处理翻译消息
   * 
   * @param message - 原始消息
   * @param locale - 目标语言
   * @param options - 翻译选项
   * @param translateFn - 嵌套翻译函数（用于 $t）
   * @returns 处理结果
   */
  process(
    message: string,
    locale: Locale,
    options: TranslateOptions,
    translateFn: (key: MessageKey, params?: any) => string,
  ): ProcessResult {
    let processedMessage = message
    let pluralized = false
    let interpolated = false

    // 1. 处理复数化
    if (options.count !== undefined && this.config.pluralization.hasPluralForms(processedMessage)) {
      processedMessage = this.config.pluralization.format(
        processedMessage,
        options.count,
        locale,
        options.params,
      )
      pluralized = true
    }

    // 2. 处理插值
    if (options.params) {
      processedMessage = this.applyInterpolation(
        processedMessage,
        locale,
        options,
        translateFn,
      )
      interpolated = true
    }

    return {
      message: processedMessage,
      pluralized,
      interpolated,
    }
  }

  /**
   * 批量处理翻译消息
   * 
   * @param messages - 消息数组
   * @param locale - 目标语言
   * @param options - 翻译选项
   * @param translateFn - 嵌套翻译函数
   * @returns 处理结果数组
   */
  processBatch(
    messages: string[],
    locale: Locale,
    options: TranslateOptions,
    translateFn: (key: MessageKey, params?: any) => string,
  ): ProcessResult[] {
    return messages.map(message => this.process(message, locale, options, translateFn))
  }

  /**
   * 应用插值
   * 
   * @param message - 消息
   * @param locale - 语言
   * @param options - 选项
   * @param translateFn - 翻译函数
   * @returns 插值后的消息
   * @private
   */
  private applyInterpolation(
    message: string,
    locale: Locale,
    options: TranslateOptions,
    translateFn: (key: MessageKey, params?: any) => string,
  ): string {
    // 创建插值参数副本，避免修改原对象
    const interpolationParams: InterpolationParams = { ...options.params }

    // 添加嵌套翻译函数
    interpolationParams.$t = (k: string, p?: any) => 
      translateFn(k, { ...options, params: p })

    // 执行插值
    return this.config.interpolation.interpolate(
      message,
      interpolationParams,
      locale,
    )
  }

  /**
   * 检查消息是否需要处理
   * 
   * @param options - 翻译选项
   * @returns 是否需要处理
   */
  needsProcessing(options: TranslateOptions): boolean {
    return options.count !== undefined || options.params !== undefined
  }

  /**
   * 仅处理复数化
   * 
   * @param message - 消息
   * @param count - 数量
   * @param locale - 语言
   * @param params - 可选参数
   * @returns 处理后的消息
   */
  processPluralization(
    message: string,
    count: number,
    locale: Locale,
    params?: InterpolationParams,
  ): string {
    if (!this.config.pluralization.hasPluralForms(message)) {
      return message
    }

    return this.config.pluralization.format(message, count, locale, params)
  }

  /**
   * 仅处理插值
   * 
   * @param message - 消息
   * @param params - 参数
   * @param locale - 语言
   * @param translateFn - 翻译函数
   * @returns 处理后的消息
   */
  processInterpolation(
    message: string,
    params: InterpolationParams,
    locale: Locale,
    translateFn: (key: MessageKey, params?: any) => string,
  ): string {
    const interpolationParams: InterpolationParams = { ...params }
    interpolationParams.$t = (k: string, p?: any) => translateFn(k, p)

    return this.config.interpolation.interpolate(
      message,
      interpolationParams,
      locale,
    )
  }
}
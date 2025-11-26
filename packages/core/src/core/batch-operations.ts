/**
 * @ldesign/i18n - Batch Operations
 * 批量操作工具类，提供高效的批量管理功能
 */

import type { I18nInstance, Locale, Messages } from '../types'

/**
 * 批量加载选项
 */
export interface BatchLoadOptions {
  /** 并发数量限制 */
  concurrency?: number
  /** 是否在遇到错误时继续 */
  continueOnError?: boolean
  /** 加载超时时间（毫秒） */
  timeout?: number
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  /** 成功的项目 */
  succeeded: string[]
  /** 失败的项目 */
  failed: Array<{ item: string; error: Error }>
  /** 总数 */
  total: number
  /** 成功率 */
  successRate: number
}

/**
 * 批量更新消息项
 */
export interface BatchMessageUpdate {
  /** 语言代码 */
  locale: Locale
  /** 消息内容 */
  messages: Messages
  /** 命名空间（可选） */
  namespace?: string
}

/**
 * 批量操作工具类
 * 
 * 提供高效的批量管理功能：
 * - 批量删除语言
 * - 批量加载命名空间（支持并发控制）
 * - 批量设置消息
 * 
 * ## 性能优化
 * - 并发控制：避免过多并发导致性能下降
 * - 错误隔离：单个失败不影响其他操作
 * - 进度跟踪：实时反馈操作进度
 * 
 * @example
 * ```typescript
 * const batchOps = new I18nBatchOperations(i18n);
 * 
 * // 批量删除语言
 * const result = batchOps.removeLocales(['en', 'fr', 'de']);
 * console.log(`成功删除 ${result.succeeded.length} 个语言`);
 * 
 * // 批量加载命名空间
 * await batchOps.loadNamespaces(['common', 'auth', 'errors'], {
 *   concurrency: 3,
 *   continueOnError: true
 * });
 * ```
 */
export class I18nBatchOperations {
  private i18n: I18nInstance

  constructor(i18n: I18nInstance) {
    this.i18n = i18n
  }

  /**
   * 批量删除语言
   * 
   * @param locales - 要删除的语言数组
   * @returns 操作结果
   * 
   * @example
   * ```typescript
   * const result = batchOps.removeLocales(['en', 'fr', 'de']);
   * console.log(`成功: ${result.succeeded.length}, 失败: ${result.failed.length}`);
   * ```
   */
  removeLocales(locales: Locale[]): BatchOperationResult {
    const succeeded: string[] = []
    const failed: Array<{ item: string; error: Error }> = []

    for (const locale of locales) {
      try {
        this.i18n.removeLocale(locale)
        succeeded.push(locale)
      } catch (error) {
        failed.push({
          item: locale,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    return {
      succeeded,
      failed,
      total: locales.length,
      successRate: succeeded.length / locales.length,
    }
  }

  /**
   * 批量加载命名空间
   * 
   * 支持并发控制，避免同时发起过多请求
   * 
   * @param namespaces - 要加载的命名空间数组
   * @param options - 加载选项
   * @returns 操作结果
   * 
   * @example
   * ```typescript
   * // 并发加载 3 个命名空间
   * const result = await batchOps.loadNamespaces(
   *   ['common', 'auth', 'errors', 'dashboard'],
   *   { concurrency: 3, timeout: 5000 }
   * );
   * ```
   */
  async loadNamespaces(
    namespaces: string[],
    options: BatchLoadOptions = {},
  ): Promise<BatchOperationResult> {
    const {
      concurrency = 5,
      continueOnError = true,
      timeout = 10000,
    } = options

    const succeeded: string[] = []
    const failed: Array<{ item: string; error: Error }> = []

    // 使用并发控制
    const chunks = this.chunkArray(namespaces, concurrency)

    for (const chunk of chunks) {
      const promises = chunk.map(async (namespace) => {
        try {
          // 添加超时控制
          await this.withTimeout(
            this.i18n.loadNamespace(namespace),
            timeout,
            `加载命名空间 ${namespace} 超时`,
          )
          succeeded.push(namespace)
          return { success: true, namespace }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error))
          failed.push({ item: namespace, error: err })
          
          if (!continueOnError) {
            throw err
          }
          
          return { success: false, namespace, error: err }
        }
      })

      // 等待当前批次完成
      await Promise.all(promises)
    }

    return {
      succeeded,
      failed,
      total: namespaces.length,
      successRate: succeeded.length / namespaces.length,
    }
  }

  /**
   * 批量设置消息
   * 
   * 高效地更新多个语言的消息
   * 
   * @param updates - 更新项数组
   * @returns 操作结果
   * 
   * @example
   * ```typescript
   * const updates = [
   *   { locale: 'zh-CN', messages: { hello: '你好' } },
   *   { locale: 'en', messages: { hello: 'Hello' }, namespace: 'common' }
   * ];
   * const result = batchOps.setMessages(updates);
   * ```
   */
  setMessages(updates: BatchMessageUpdate[]): BatchOperationResult {
    const succeeded: string[] = []
    const failed: Array<{ item: string; error: Error }> = []

    for (const update of updates) {
      const identifier = update.namespace 
        ? `${update.locale}:${update.namespace}`
        : update.locale

      try {
        this.i18n.setMessages(update.locale, update.messages, update.namespace)
        succeeded.push(identifier)
      } catch (error) {
        failed.push({
          item: identifier,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    return {
      succeeded,
      failed,
      total: updates.length,
      successRate: succeeded.length / updates.length,
    }
  }

  /**
   * 批量合并消息
   * 
   * 将新消息合并到已有消息中（不会覆盖已有键）
   * 
   * @param updates - 更新项数组
   * @returns 操作结果
   */
  mergeMessages(updates: BatchMessageUpdate[]): BatchOperationResult {
    const succeeded: string[] = []
    const failed: Array<{ item: string; error: Error }> = []

    for (const update of updates) {
      const identifier = update.namespace 
        ? `${update.locale}:${update.namespace}`
        : update.locale

      try {
        this.i18n.mergeMessages(update.locale, update.messages, update.namespace)
        succeeded.push(identifier)
      } catch (error) {
        failed.push({
          item: identifier,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    return {
      succeeded,
      failed,
      total: updates.length,
      successRate: succeeded.length / updates.length,
    }
  }

  /**
   * 批量预加载语言
   * 
   * 并发加载多个语言包
   * 
   * @param locales - 要加载的语言数组
   * @param options - 加载选项
   * @returns 操作结果
   */
  async preloadLocales(
    locales: Locale[],
    options: BatchLoadOptions = {},
  ): Promise<BatchOperationResult> {
    const {
      concurrency = 3,
      continueOnError = true,
      timeout = 10000,
    } = options

    const succeeded: string[] = []
    const failed: Array<{ item: string; error: Error }> = []

    const chunks = this.chunkArray(locales, concurrency)

    for (const chunk of chunks) {
      const promises = chunk.map(async (locale) => {
        try {
          // 检查是否已加载
          if (this.i18n.hasLocale(locale)) {
            succeeded.push(locale)
            return { success: true, locale }
          }

          // 加载语言包
          await this.withTimeout(
            this.i18n.setLocale(locale),
            timeout,
            `加载语言 ${locale} 超时`,
          )
          
          succeeded.push(locale)
          return { success: true, locale }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error))
          failed.push({ item: locale, error: err })
          
          if (!continueOnError) {
            throw err
          }
          
          return { success: false, locale, error: err }
        }
      })

      await Promise.all(promises)
    }

    return {
      succeeded,
      failed,
      total: locales.length,
      successRate: succeeded.length / locales.length,
    }
  }

  /**
   * 将数组分块
   * 
   * @param array - 原数组
   * @param size - 每块大小
   * @returns 分块后的数组
   * @private
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 为 Promise 添加超时控制
   * 
   * @param promise - 原 Promise
   * @param ms - 超时时间（毫秒）
   * @param message - 超时错误消息
   * @returns 带超时的 Promise
   * @private
   */
  private withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    message: string,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms)
      }),
    ])
  }
}
/**
 * @ldesign/i18n - Retry Handler
 * 重试机制，支持指数退避策略
 */

import { LoadError, TimeoutError } from './index'

/**
 * 重试选项
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxRetries?: number
  /** 初始延迟（毫秒） */
  initialDelay?: number
  /** 最大延迟（毫秒） */
  maxDelay?: number
  /** 退避因子 */
  backoffFactor?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否应该重试的判断函数 */
  shouldRetry?: (error: Error, attempt: number) => boolean
  /** 重试前的回调 */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * 重试结果
 */
export interface RetryResult<T> {
  /** 是否成功 */
  success: boolean
  /** 结果数据 */
  data?: T
  /** 错误信息 */
  error?: Error
  /** 尝试次数 */
  attempts: number
  /** 总耗时（毫秒） */
  duration: number
}

/**
 * 重试处理器
 * 
 * 提供灵活的重试机制，支持：
 * - 指数退避策略
 * - 自定义重试条件
 * - 超时控制
 * - 重试回调
 * 
 * @example
 * ```typescript
 * const retryHandler = new RetryHandler({
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffFactor: 2
 * });
 * 
 * const result = await retryHandler.execute(
 *   async () => await loader.load('zh-CN'),
 *   'load-zh-CN'
 * );
 * 
 * if (result.success) {
 *   console.log('加载成功:', result.data);
 * }
 * ```
 */
export class RetryHandler {
  private options: Required<RetryOptions>

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      backoffFactor: options.backoffFactor ?? 2,
      timeout: options.timeout ?? 10000,
      shouldRetry: options.shouldRetry ?? this.defaultShouldRetry.bind(this),
      onRetry: options.onRetry ?? (() => {}),
    }
  }

  /**
   * 执行带重试的操作
   * 
   * @param fn - 要执行的异步函数
   * @param operationName - 操作名称（用于错误消息）
   * @returns 重试结果
   */
  async execute<T>(
    fn: () => Promise<T>,
    operationName: string = 'operation',
  ): Promise<RetryResult<T>> {
    const startTime = Date.now()
    let lastError: Error | undefined
    let attempt = 0

    while (attempt <= this.options.maxRetries) {
      attempt++

      try {
        // 添加超时控制
        const data = await this.withTimeout(
          fn(),
          this.options.timeout,
          operationName,
        )

        return {
          success: true,
          data,
          attempts: attempt,
          duration: Date.now() - startTime,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // 检查是否应该重试
        if (attempt > this.options.maxRetries || !this.options.shouldRetry(lastError, attempt)) {
          break
        }

        // 计算延迟时间（指数退避）
        const delay = this.calculateDelay(attempt)

        // 触发重试回调
        this.options.onRetry(lastError, attempt, delay)

        // 等待后重试
        await this.sleep(delay)
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: attempt,
      duration: Date.now() - startTime,
    }
  }

  /**
   * 默认的重试判断逻辑
   * 
   * @param error - 错误对象
   * @param attempt - 当前尝试次数
   * @returns 是否应该重试
   */
  private defaultShouldRetry(error: Error, _attempt: number): boolean {
    // 超时错误总是重试
    if (error instanceof TimeoutError) {
      return true
    }

    // 网络错误重试
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return true
    }

    // LoadError 根据状态码判断
    if (error instanceof LoadError) {
      // 5xx 错误重试
      const statusMatch = error.message.match(/status (\d+)/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1])
        return status >= 500 && status < 600
      }
      return true
    }

    // 其他错误不重试
    return false
  }

  /**
   * 计算延迟时间（指数退避）
   * 
   * @param attempt - 当前尝试次数
   * @returns 延迟时间（毫秒）
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = 
      this.options.initialDelay * Math.pow(this.options.backoffFactor, attempt - 1)
    
    // 添加随机抖动（防止多个请求同时重试）
    const jitter = Math.random() * 0.3 * exponentialDelay
    
    const delay = exponentialDelay + jitter
    
    // 限制最大延迟
    return Math.min(delay, this.options.maxDelay)
  }

  /**
   * 睡眠指定时间
   * 
   * @param ms - 毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 为 Promise 添加超时控制
   * 
   * @param promise - 原 Promise
   * @param ms - 超时时间（毫秒）
   * @param operationName - 操作名称
   * @returns 带超时的 Promise
   */
  private withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    operationName: string,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError(
            `操作 ${operationName} 超时`,
            operationName,
            ms,
          ))
        }, ms)
      }),
    ])
  }
}

/**
 * 创建默认的重试处理器
 */
export function createDefaultRetryHandler(): RetryHandler {
  return new RetryHandler({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    timeout: 10000,
  })
}
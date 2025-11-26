/**
 * @ldesign/i18n - Error Handling Tests
 * 错误处理系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  I18nError,
  LoadError,
  TranslationError,
  ConfigError,
  ValidationError,
  TimeoutError,
} from '../errors/index'
import { RetryHandler, createDefaultRetryHandler } from '../errors/retry-handler'
import { ErrorRecovery, ErrorLogger, RecoveryStrategy } from '../errors/error-recovery'
import type { Locale } from '../types'

describe('Error Classes', () => {
  describe('I18nError', () => {
    it('应该创建基础错误', () => {
      const error = new I18nError('测试错误', 'TEST_CODE', { extra: 'info' })

      expect(error.name).toBe('I18nError')
      expect(error.message).toBe('测试错误')
      expect(error.code).toBe('TEST_CODE')
      expect(error.details).toEqual({ extra: 'info' })
      expect(error.timestamp).toBeGreaterThan(0)
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(I18nError)
    })

    it('应该使用默认错误代码', () => {
      const error = new I18nError('测试错误')
      expect(error.code).toBe('I18N_ERROR')
    })

    it('应该正确转换为 JSON', () => {
      const error = new I18nError('测试错误', 'TEST_CODE', { key: 'value' })
      const json = error.toJSON()

      expect(json).toHaveProperty('name', 'I18nError')
      expect(json).toHaveProperty('message', '测试错误')
      expect(json).toHaveProperty('code', 'TEST_CODE')
      expect(json).toHaveProperty('details', { key: 'value' })
      expect(json).toHaveProperty('timestamp')
      expect(json).toHaveProperty('stack')
    })
  })

  describe('LoadError', () => {
    it('应该创建加载错误', () => {
      const cause = new Error('网络错误')
      const error = new LoadError('加载失败', 'zh-CN', cause, { url: '/api/zh-CN.json' })

      expect(error.name).toBe('LoadError')
      expect(error.message).toBe('加载失败')
      expect(error.code).toBe('LOAD_ERROR')
      expect(error.resource).toBe('zh-CN')
      expect(error.cause).toBe(cause)
      expect(error).toBeInstanceOf(LoadError)
      expect(error).toBeInstanceOf(I18nError)
    })

    it('应该正确转换为 JSON', () => {
      const cause = new Error('网络错误')
      const error = new LoadError('加载失败', 'zh-CN', cause)
      const json = error.toJSON()

      expect(json).toHaveProperty('resource', 'zh-CN')
      expect(json).toHaveProperty('cause', '网络错误')
    })
  })

  describe('TranslationError', () => {
    it('应该创建翻译错误', () => {
      const error = new TranslationError(
        '翻译失败',
        'app.title',
        'zh-CN',
        'common',
        { reason: 'key not found' }
      )

      expect(error.name).toBe('TranslationError')
      expect(error.code).toBe('TRANSLATION_ERROR')
      expect(error.key).toBe('app.title')
      expect(error.locale).toBe('zh-CN')
      expect(error.namespace).toBe('common')
      expect(error).toBeInstanceOf(TranslationError)
    })

    it('应该支持无命名空间', () => {
      const error = new TranslationError('翻译失败', 'app.title', 'zh-CN')
      expect(error.namespace).toBeUndefined()
    })

    it('应该正确转换为 JSON', () => {
      const error = new TranslationError('翻译失败', 'app.title', 'zh-CN', 'common')
      const json = error.toJSON()

      expect(json).toHaveProperty('key', 'app.title')
      expect(json).toHaveProperty('locale', 'zh-CN')
      expect(json).toHaveProperty('namespace', 'common')
    })
  })

  describe('ConfigError', () => {
    it('应该创建配置错误', () => {
      const error = new ConfigError('配置无效', 'fallbackLocale', { expected: 'string' })

      expect(error.name).toBe('ConfigError')
      expect(error.code).toBe('CONFIG_ERROR')
      expect(error.configKey).toBe('fallbackLocale')
      expect(error).toBeInstanceOf(ConfigError)
    })
  })

  describe('ValidationError', () => {
    it('应该创建验证错误', () => {
      const error = new ValidationError('验证失败', 'locale', 'format', { value: 'invalid' })

      expect(error.name).toBe('ValidationError')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.field).toBe('locale')
      expect(error.rule).toBe('format')
      expect(error).toBeInstanceOf(ValidationError)
    })
  })

  describe('TimeoutError', () => {
    it('应该创建超时错误', () => {
      const error = new TimeoutError('操作超时', 'load', 5000, { resource: 'zh-CN' })

      expect(error.name).toBe('TimeoutError')
      expect(error.code).toBe('TIMEOUT_ERROR')
      expect(error.operation).toBe('load')
      expect(error.timeout).toBe(5000)
      expect(error).toBeInstanceOf(TimeoutError)
    })
  })
})

describe('RetryHandler', () => {
  let retryHandler: RetryHandler

  beforeEach(() => {
    retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelay: 100,
      backoffFactor: 2,
      timeout: 1000,
    })
  })

  describe('execute', () => {
    it('应该在第一次尝试成功时返回结果', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const result = await retryHandler.execute(fn, 'test-operation')

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在失败后重试', async () => {
      let callCount = 0
      const fn = vi.fn().mockImplementation(async () => {
        callCount++
        if (callCount < 3) {
          throw new LoadError('加载失败', 'test', undefined, { status: 500 })
        }
        return 'success'
      })

      const result = await retryHandler.execute(fn, 'test-operation')

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(3)
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后返回失败', async () => {
      const fn = vi.fn().mockRejectedValue(new LoadError('加载失败', 'test', undefined, { status: 500 }))

      const result = await retryHandler.execute(fn, 'test-operation')

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(LoadError)
      expect(result.attempts).toBe(4) // 初始尝试 + 3 次重试
      expect(fn).toHaveBeenCalledTimes(4)
    })

    it('应该处理超时', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return 'success'
      })

      const result = await retryHandler.execute(fn, 'slow-operation')

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(TimeoutError)
      expect((result.error as TimeoutError).operation).toBe('slow-operation')
    })

    it('应该使用指数退避延迟', async () => {
      const delays: number[] = []
      const startTimes: number[] = []
      let callCount = 0

      const fn = vi.fn().mockImplementation(async () => {
        const now = Date.now()
        if (callCount > 0) {
          delays.push(now - startTimes[callCount - 1])
        }
        startTimes.push(now)
        callCount++

        if (callCount < 4) {
          throw new LoadError('失败', 'test', undefined, { status: 500 })
        }
        return 'success'
      })

      await retryHandler.execute(fn, 'test')

      // 验证延迟递增：100ms, 200ms, 400ms（带抖动）
      expect(delays[0]).toBeGreaterThanOrEqual(80)
      expect(delays[1]).toBeGreaterThanOrEqual(160)
      expect(delays[2]).toBeGreaterThanOrEqual(320)
    })

    it('应该调用 onRetry 回调', async () => {
      const onRetry = vi.fn()
      const handler = new RetryHandler({
        maxRetries: 2,
        initialDelay: 50,
        onRetry,
      })

      let callCount = 0
      const fn = vi.fn().mockImplementation(async () => {
        callCount++
        if (callCount < 3) {
          throw new Error('失败')
        }
        return 'success'
      })

      await handler.execute(fn, 'test')

      expect(onRetry).toHaveBeenCalledTimes(2)
    })

    it('应该使用自定义 shouldRetry 函数', async () => {
      const shouldRetry = vi.fn().mockReturnValue(false)
      const handler = new RetryHandler({
        maxRetries: 3,
        shouldRetry,
      })

      const fn = vi.fn().mockRejectedValue(new Error('失败'))

      const result = await handler.execute(fn, 'test')

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(1)
      expect(shouldRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('createDefaultRetryHandler', () => {
    it('应该创建默认配置的重试处理器', () => {
      const handler = createDefaultRetryHandler()
      expect(handler).toBeInstanceOf(RetryHandler)
    })
  })
})

describe('ErrorRecovery', () => {
  let recovery: ErrorRecovery

  beforeEach(() => {
    recovery = new ErrorRecovery({
      fallbackLocales: ['en', 'zh-CN'],
      useCache: true,
      defaultMessages: {
        hello: 'Hello',
        app: {
          title: 'App',
        },
      },
    })
  })

  describe('recover', () => {
    it('应该从缓存恢复', async () => {
      recovery.setCache('fr' as Locale, 'hello', 'Bonjour')

      const fn = vi.fn().mockRejectedValue(new LoadError('加载失败', 'fr'))
      const error = new LoadError('加载失败', 'fr')

      const result = await recovery.recover(fn, error, {
        locale: 'fr' as Locale,
        key: 'hello',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('Bonjour')
      expect(result.strategy).toBe(RecoveryStrategy.USE_CACHE)
      expect(fn).not.toHaveBeenCalled()
    })

    it('应该从降级语言恢复', async () => {
      const fn = vi.fn().mockResolvedValue({ hello: 'Hello' })
      const error = new LoadError('加载失败', 'fr')

      const result = await recovery.recover(fn, error, {
        locale: 'fr' as Locale,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ hello: 'Hello' })
      expect(result.strategy).toBe(RecoveryStrategy.FALLBACK_LOCALE)
    })

    it('应该从默认值恢复', async () => {
      const fn = vi.fn()
      const error = new TranslationError('翻译失败', 'hello', 'fr')

      const result = await recovery.recover(fn, error, {
        locale: 'fr' as Locale,
        key: 'hello',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('Hello')
      expect(result.strategy).toBe(RecoveryStrategy.USE_DEFAULT)
    })

    it('应该支持嵌套的默认值', async () => {
      const fn = vi.fn()
      const error = new TranslationError('翻译失败', 'app.title', 'fr')

      const result = await recovery.recover(fn, error, {
        locale: 'fr' as Locale,
        key: 'app.title',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('App')
      expect(result.strategy).toBe(RecoveryStrategy.USE_DEFAULT)
    })

    it('应该在所有策略失败时返回错误', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('失败'))
      const error = new Error('失败')

      const result = await recovery.recover(fn, error, {
        locale: 'unknown' as Locale,
        key: 'unknown.key',
      })

      expect(result.success).toBe(false)
      expect(result.strategy).toBe(RecoveryStrategy.THROW)
      expect(result.error).toBe(error)
    })

    it('应该调用 onError 回调', async () => {
      const onError = vi.fn()
      const recoveryWithCallback = new ErrorRecovery({
        onError,
        fallbackLocales: [],
        useCache: false,
      })

      const fn = vi.fn().mockRejectedValue(new Error('失败'))
      const error = new Error('失败')

      await recoveryWithCallback.recover(fn, error)

      expect(onError).toHaveBeenCalledWith(error, RecoveryStrategy.THROW)
    })
  })

  describe('cache management', () => {
    it('应该设置和使用缓存', async () => {
      recovery.setCache('zh-CN' as Locale, 'hello', '你好')

      const fn = vi.fn()
      const error = new Error('test')

      const result = await recovery.recover(fn, error, {
        locale: 'zh-CN' as Locale,
        key: 'hello',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('你好')
      expect(fn).not.toHaveBeenCalled()
    })

    it('应该清除特定缓存', async () => {
      recovery.setCache('zh-CN' as Locale, 'hello', '你好')
      recovery.clearCache('zh-CN' as Locale, 'hello')

      const fn = vi.fn().mockResolvedValue('fallback')
      const error = new LoadError('加载失败', 'zh-CN')

      const result = await recovery.recover(fn, error, {
        locale: 'zh-CN' as Locale,
        key: 'hello',
      })

      expect(result.strategy).not.toBe(RecoveryStrategy.USE_CACHE)
    })

    it('应该清除所有缓存', async () => {
      recovery.setCache('zh-CN' as Locale, 'hello', '你好')
      recovery.setCache('en' as Locale, 'hello', 'Hello')
      recovery.clearCache()

      const fn = vi.fn().mockResolvedValue('fallback')
      const error = new LoadError('加载失败', 'zh-CN')

      await recovery.recover(fn, error, {
        locale: 'zh-CN' as Locale,
        key: 'hello',
      })

      expect(fn).toHaveBeenCalled()
    })
  })
})

describe('ErrorLogger', () => {
  let logger: ErrorLogger

  beforeEach(() => {
    logger = new ErrorLogger({
      maxLogs: 10,
      enabled: true,
    })
  })

  describe('log', () => {
    it('应该记录错误', () => {
      const error = new Error('测试错误')
      logger.log(error, { locale: 'zh-CN' })

      const logs = logger.getAllLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].error).toBe(error)
      expect(logs[0].context).toEqual({ locale: 'zh-CN' })
      expect(logs[0].type).toBe('Error')
    })

    it('应该记录恢复策略', () => {
      const error = new LoadError('加载失败', 'zh-CN')
      logger.log(error, { locale: 'zh-CN' }, RecoveryStrategy.FALLBACK_LOCALE)

      const logs = logger.getAllLogs()
      expect(logs[0].recoveryStrategy).toBe(RecoveryStrategy.FALLBACK_LOCALE)
    })

    it('应该限制日志数量', () => {
      for (let i = 0; i < 15; i++) {
        logger.log(new Error(`错误 ${i}`))
      }

      const logs = logger.getAllLogs()
      expect(logs).toHaveLength(10)
    })

    it('应该在禁用时不记录', () => {
      const disabledLogger = new ErrorLogger({ enabled: false })
      disabledLogger.log(new Error('测试'))

      expect(disabledLogger.getAllLogs()).toHaveLength(0)
    })

    it('应该调用 onLog 回调', () => {
      const onLog = vi.fn()
      const loggerWithCallback = new ErrorLogger({ onLog })

      const error = new Error('测试')
      loggerWithCallback.log(error)

      expect(onLog).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          type: 'Error',
        })
      )
    })
  })

  describe('getRecentLogs', () => {
    it('应该获取最近的日志', () => {
      for (let i = 0; i < 5; i++) {
        logger.log(new Error(`错误 ${i}`))
      }

      const recent = logger.getRecentLogs(3)
      expect(recent).toHaveLength(3)
      expect(recent[2].error.message).toBe('错误 4')
    })

    it('应该处理日志数量少于请求数量的情况', () => {
      logger.log(new Error('错误 1'))
      const recent = logger.getRecentLogs(10)
      expect(recent).toHaveLength(1)
    })
  })

  describe('getLogsByType', () => {
    it('应该按类型过滤日志', () => {
      logger.log(new Error('普通错误'))
      logger.log(new LoadError('加载错误', 'zh-CN'))
      logger.log(new TranslationError('翻译错误', 'key', 'zh-CN'))
      logger.log(new LoadError('另一个加载错误', 'en'))

      const loadErrors = logger.getLogsByType('LoadError')
      expect(loadErrors).toHaveLength(2)
      expect(loadErrors.every(log => log.type === 'LoadError')).toBe(true)
    })
  })

  describe('getStats', () => {
    it('应该返回统计信息', () => {
      logger.log(new Error('错误1'))
      logger.log(new LoadError('错误2', 'zh-CN'))
      logger.log(new LoadError('错误3', 'en'))
      logger.log(new TranslationError('错误4', 'key', 'zh-CN'))

      const stats = logger.getStats()
      expect(stats.total).toBe(4)
      expect(stats.byType['Error']).toBe(1)
      expect(stats.byType['LoadError']).toBe(2)
      expect(stats.byType['TranslationError']).toBe(1)
      expect(stats.recentErrors).toBe(4)
    })
  })

  describe('clear', () => {
    it('应该清除所有日志', () => {
      logger.log(new Error('错误1'))
      logger.log(new Error('错误2'))

      logger.clear()

      expect(logger.getAllLogs()).toHaveLength(0)
    })
  })

  describe('exportToJSON', () => {
    it('应该导出为 JSON 格式', () => {
      const error = new LoadError('加载失败', 'zh-CN')
      logger.log(error, { locale: 'zh-CN' }, RecoveryStrategy.FALLBACK_LOCALE)

      const json = logger.exportToJSON()
      const parsed = JSON.parse(json)

      expect(parsed).toHaveLength(1)
      expect(parsed[0]).toHaveProperty('error')
      expect(parsed[0].error).toHaveProperty('name', 'LoadError')
      expect(parsed[0]).toHaveProperty('timestamp')
      expect(parsed[0]).toHaveProperty('context', { locale: 'zh-CN' })
      expect(parsed[0]).toHaveProperty('recoveryStrategy', RecoveryStrategy.FALLBACK_LOCALE)
    })
  })
})
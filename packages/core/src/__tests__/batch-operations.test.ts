/**
 * @ldesign/i18n - Batch Operations Tests
 * 批量操作工具类单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { I18nBatchOperations } from '../core/batch-operations'
import type { I18nInstance, Locale, Messages } from '../types'

// Mock I18n Instance
const createMockI18n = (): I18nInstance => ({
  setLocale: vi.fn().mockResolvedValue(undefined),
  getLocale: vi.fn().mockReturnValue('zh-CN'),
  hasLocale: vi.fn().mockReturnValue(false),
  removeLocale: vi.fn(),
  setMessages: vi.fn(),
  mergeMessages: vi.fn(),
  loadNamespace: vi.fn().mockResolvedValue(undefined),
  t: vi.fn(),
  translate: vi.fn(),
  // 其他必要的方法可以根据需要添加
} as unknown as I18nInstance)

describe('I18nBatchOperations', () => {
  let batchOps: I18nBatchOperations
  let mockI18n: I18nInstance

  beforeEach(() => {
    mockI18n = createMockI18n()
    batchOps = new I18nBatchOperations(mockI18n)
  })

  describe('removeLocales', () => {
    it('应该成功删除所有语言', () => {
      const locales: Locale[] = ['en', 'fr', 'de']
      
      const result = batchOps.removeLocales(locales)

      expect(result.succeeded).toEqual(locales)
      expect(result.failed).toHaveLength(0)
      expect(result.total).toBe(3)
      expect(result.successRate).toBe(1)
      expect(mockI18n.removeLocale).toHaveBeenCalledTimes(3)
    })

    it('应该处理部分失败的情况', () => {
      const locales: Locale[] = ['en', 'fr', 'de']
      
      // Mock: 'fr' 删除失败
      vi.mocked(mockI18n.removeLocale).mockImplementation((locale: Locale) => {
        if (locale === 'fr') {
          throw new Error('删除失败')
        }
      })

      const result = batchOps.removeLocales(locales)

      expect(result.succeeded).toEqual(['en', 'de'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toBe('fr')
      expect(result.failed[0].error.message).toBe('删除失败')
      expect(result.total).toBe(3)
      expect(result.successRate).toBeCloseTo(0.667, 2)
    })

    it('应该处理空数组', () => {
      const result = batchOps.removeLocales([])

      expect(result.succeeded).toHaveLength(0)
      expect(result.failed).toHaveLength(0)
      expect(result.total).toBe(0)
      expect(result.successRate).toBeNaN() // 0/0 = NaN
    })

    it('应该处理所有失败的情况', () => {
      const locales: Locale[] = ['en', 'fr']
      
      vi.mocked(mockI18n.removeLocale).mockImplementation(() => {
        throw new Error('删除失败')
      })

      const result = batchOps.removeLocales(locales)

      expect(result.succeeded).toHaveLength(0)
      expect(result.failed).toHaveLength(2)
      expect(result.successRate).toBe(0)
    })
  })

  describe('loadNamespaces', () => {
    it('应该成功加载所有命名空间', async () => {
      const namespaces = ['common', 'auth', 'errors']

      const result = await batchOps.loadNamespaces(namespaces)

      expect(result.succeeded).toEqual(namespaces)
      expect(result.failed).toHaveLength(0)
      expect(result.total).toBe(3)
      expect(result.successRate).toBe(1)
      expect(mockI18n.loadNamespace).toHaveBeenCalledTimes(3)
    })

    it('应该遵守并发限制', async () => {
      const namespaces = ['ns1', 'ns2', 'ns3', 'ns4', 'ns5']
      const loadCalls: number[] = []

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async () => {
        loadCalls.push(Date.now())
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      await batchOps.loadNamespaces(namespaces, { concurrency: 2 })

      // 验证并发数不超过 2
      expect(mockI18n.loadNamespace).toHaveBeenCalledTimes(5)
    })

    it('应该处理加载失败的情况', async () => {
      const namespaces = ['common', 'auth', 'errors']

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async (ns: string) => {
        if (ns === 'auth') {
          throw new Error('加载失败')
        }
      })

      const result = await batchOps.loadNamespaces(namespaces, {
        continueOnError: true,
      })

      expect(result.succeeded).toEqual(['common', 'errors'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toBe('auth')
      expect(result.successRate).toBeCloseTo(0.667, 2)
    })

    it('应该在 continueOnError=false 时停止', async () => {
      const namespaces = ['common', 'auth', 'errors']

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async (ns: string) => {
        if (ns === 'auth') {
          throw new Error('加载失败')
        }
      })

      await expect(
        batchOps.loadNamespaces(namespaces, { continueOnError: false })
      ).rejects.toThrow('加载失败')
    })

    it('应该处理超时', async () => {
      const namespaces = ['slow-ns']

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      const result = await batchOps.loadNamespaces(namespaces, {
        timeout: 50,
        continueOnError: true,
      })

      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].error.message).toContain('超时')
    })

    it('应该使用默认选项', async () => {
      const namespaces = ['common']

      await batchOps.loadNamespaces(namespaces)

      expect(mockI18n.loadNamespace).toHaveBeenCalledWith('common')
    })
  })

  describe('setMessages', () => {
    it('应该成功设置所有消息', () => {
      const updates = [
        { locale: 'zh-CN' as Locale, messages: { hello: '你好' } },
        { locale: 'en' as Locale, messages: { hello: 'Hello' } },
      ]

      const result = batchOps.setMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN', 'en'])
      expect(result.failed).toHaveLength(0)
      expect(result.successRate).toBe(1)
      expect(mockI18n.setMessages).toHaveBeenCalledTimes(2)
    })

    it('应该支持命名空间', () => {
      const updates = [
        {
          locale: 'zh-CN' as Locale,
          messages: { hello: '你好' },
          namespace: 'common',
        },
      ]

      const result = batchOps.setMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN:common'])
      expect(mockI18n.setMessages).toHaveBeenCalledWith(
        'zh-CN',
        { hello: '你好' },
        'common'
      )
    })

    it('应该处理设置失败的情况', () => {
      const updates = [
        { locale: 'zh-CN' as Locale, messages: { hello: '你好' } },
        { locale: 'en' as Locale, messages: { hello: 'Hello' } },
      ]

      vi.mocked(mockI18n.setMessages).mockImplementation((locale: Locale) => {
        if (locale === 'en') {
          throw new Error('设置失败')
        }
      })

      const result = batchOps.setMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toBe('en')
    })

    it('应该处理空数组', () => {
      const result = batchOps.setMessages([])

      expect(result.total).toBe(0)
      expect(result.succeeded).toHaveLength(0)
    })
  })

  describe('mergeMessages', () => {
    it('应该成功合并所有消息', () => {
      const updates = [
        { locale: 'zh-CN' as Locale, messages: { hello: '你好' } },
        { locale: 'en' as Locale, messages: { hello: 'Hello' } },
      ]

      const result = batchOps.mergeMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN', 'en'])
      expect(result.failed).toHaveLength(0)
      expect(mockI18n.mergeMessages).toHaveBeenCalledTimes(2)
    })

    it('应该支持命名空间', () => {
      const updates = [
        {
          locale: 'zh-CN' as Locale,
          messages: { welcome: '欢迎' },
          namespace: 'common',
        },
      ]

      const result = batchOps.mergeMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN:common'])
      expect(mockI18n.mergeMessages).toHaveBeenCalledWith(
        'zh-CN',
        { welcome: '欢迎' },
        'common'
      )
    })

    it('应该处理合并失败的情况', () => {
      const updates = [
        { locale: 'zh-CN' as Locale, messages: { hello: '你好' } },
        { locale: 'en' as Locale, messages: { hello: 'Hello' } },
      ]

      vi.mocked(mockI18n.mergeMessages).mockImplementation((locale: Locale) => {
        if (locale === 'en') {
          throw new Error('合并失败')
        }
      })

      const result = batchOps.mergeMessages(updates)

      expect(result.succeeded).toEqual(['zh-CN'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toBe('en')
      expect(result.successRate).toBe(0.5)
    })
  })

  describe('preloadLocales', () => {
    it('应该成功预加载所有语言', async () => {
      const locales: Locale[] = ['zh-CN', 'en', 'fr']

      const result = await batchOps.preloadLocales(locales)

      expect(result.succeeded).toEqual(locales)
      expect(result.failed).toHaveLength(0)
      expect(result.successRate).toBe(1)
    })

    it('应该跳过已加载的语言', async () => {
      const locales: Locale[] = ['zh-CN', 'en']

      vi.mocked(mockI18n.hasLocale).mockImplementation((locale: Locale) => {
        return locale === 'zh-CN'
      })

      const result = await batchOps.preloadLocales(locales)

      expect(result.succeeded).toEqual(locales)
      expect(mockI18n.setLocale).toHaveBeenCalledTimes(1)
      expect(mockI18n.setLocale).toHaveBeenCalledWith('en')
    })

    it('应该遵守并发限制', async () => {
      const locales: Locale[] = ['zh-CN', 'en', 'fr', 'de', 'ja']

      await batchOps.preloadLocales(locales, { concurrency: 2 })

      expect(mockI18n.setLocale).toHaveBeenCalledTimes(5)
    })

    it('应该处理加载失败', async () => {
      const locales: Locale[] = ['zh-CN', 'en', 'fr']

      vi.mocked(mockI18n.setLocale).mockImplementation(async (locale: Locale) => {
        if (locale === 'en') {
          throw new Error('加载失败')
        }
      })

      const result = await batchOps.preloadLocales(locales, {
        continueOnError: true,
      })

      expect(result.succeeded).toEqual(['zh-CN', 'fr'])
      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].item).toBe('en')
    })

    it('应该处理超时', async () => {
      const locales: Locale[] = ['slow-locale' as Locale]

      vi.mocked(mockI18n.setLocale).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      const result = await batchOps.preloadLocales(locales, {
        timeout: 50,
        continueOnError: true,
      })

      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].error.message).toContain('超时')
    })

    it('应该在 continueOnError=false 时停止', async () => {
      const locales: Locale[] = ['zh-CN', 'en']

      vi.mocked(mockI18n.setLocale).mockImplementation(async (locale: Locale) => {
        if (locale === 'en') {
          throw new Error('加载失败')
        }
      })

      await expect(
        batchOps.preloadLocales(locales, { continueOnError: false })
      ).rejects.toThrow('加载失败')
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理非 Error 类型的异常', () => {
      const locales: Locale[] = ['en']

      vi.mocked(mockI18n.removeLocale).mockImplementation(() => {
        throw 'String error'
      })

      const result = batchOps.removeLocales(locales)

      expect(result.failed).toHaveLength(1)
      expect(result.failed[0].error).toBeInstanceOf(Error)
      expect(result.failed[0].error.message).toBe('String error')
    })

    it('应该处理大量操作', async () => {
      const namespaces = Array.from({ length: 100 }, (_, i) => `ns${i}`)

      const result = await batchOps.loadNamespaces(namespaces, {
        concurrency: 10,
      })

      expect(result.total).toBe(100)
      expect(result.succeeded).toHaveLength(100)
    })

    it('应该正确计算 successRate', () => {
      const locales: Locale[] = ['en', 'fr', 'de', 'ja']

      vi.mocked(mockI18n.removeLocale).mockImplementation((locale: Locale) => {
        if (locale === 'fr' || locale === 'ja') {
          throw new Error('失败')
        }
      })

      const result = batchOps.removeLocales(locales)

      expect(result.successRate).toBe(0.5) // 2/4
    })
  })

  describe('性能测试', () => {
    it('并发控制应该减少总时间', async () => {
      const namespaces = ['ns1', 'ns2', 'ns3', 'ns4']
      const delay = 100

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, delay))
      })

      const startTime = Date.now()
      await batchOps.loadNamespaces(namespaces, { concurrency: 2 })
      const duration = Date.now() - startTime

      // 并发为 2，4个任务应该在约 200ms 内完成（2批 * 100ms）
      // 给予一些缓冲时间
      expect(duration).toBeLessThan(300)
    })

    it('串行执行应该花费更长时间', async () => {
      const namespaces = ['ns1', 'ns2', 'ns3', 'ns4']
      const delay = 50

      vi.mocked(mockI18n.loadNamespace).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, delay))
      })

      const startTime = Date.now()
      await batchOps.loadNamespaces(namespaces, { concurrency: 1 })
      const duration = Date.now() - startTime

      // 串行执行，4个任务应该在约 200ms（4 * 50ms）
      expect(duration).toBeGreaterThan(150)
    })
  })
})
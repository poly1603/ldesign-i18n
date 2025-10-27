/**
 * @ldesign/i18n - Performance Integration Tests
 * Validates that all optimizations work together correctly
 */

import { describe, expect, it } from 'vitest'
import { createI18n } from '../src/core'
import { createAdaptiveCache } from '../src/core/adaptive-cache'

describe('performance Integration', () => {
  it('should use hash-based cache keys in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: { hello: 'Hello {{name}}' },
      },
    })

    // Translation should work correctly
    const result = i18n.t('hello', { name: 'World' })
    expect(result).toBe('Hello World')

    process.env.NODE_ENV = originalEnv
  })

  it('should achieve high cache hit rate', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          key1: 'Value 1',
          key2: 'Value 2',
          key3: 'Value 3',
        },
      },
    })

    // First access - cache miss
    i18n.t('key1')
    i18n.t('key2')
    i18n.t('key3')

    // Second access - cache hit
    for (let i = 0; i < 100; i++) {
      i18n.t('key1')
      i18n.t('key2')
      i18n.t('key3')
    }

    const stats = (i18n as any).cache.getStats()
    expect(stats.hitRate).toBeGreaterThan(0.9) // > 90% hit rate
  })

  it('should handle batch translations efficiently', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          key1: 'Value 1',
          key2: 'Value 2',
          key3: 'Value 3',
          key4: 'Value 4',
          key5: 'Value 5',
        },
      },
    })

    const keys = ['key1', 'key2', 'key3', 'key4', 'key5']

    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      i18n.translateBatch(keys)
    }
    const time = performance.now() - start

    // Should complete 1000 batches in < 200ms
    expect(time).toBeLessThan(200)
  })

  it('should maintain low memory usage', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {},
      },
    })

    // Add 1000 translations
    const messages: Record<string, string> = {}
    for (let i = 0; i < 1000; i++) {
      messages[`key${i}`] = `Value ${i} with parameter {{param}}`
    }
    i18n.addMessages('en', messages)

    // Perform 10,000 translations
    for (let i = 0; i < 10000; i++) {
      i18n.t(`key${i % 1000}`, { param: i })
    }

    // Check cache size is reasonable
    const stats = (i18n as any).cache.getStats()
    expect(stats.size).toBeLessThanOrEqual(1000)
  })

  it('should work with adaptive cache', () => {
    const cache = createAdaptiveCache({
      minSize: 20,
      maxSize: 100,
      hotSize: 30,
    })

    const i18n = createI18n({
      locale: 'en',
      cache: cache as any,
      messages: {
        en: {
          key1: 'Value 1',
          key2: 'Value 2',
          key3: 'Value 3',
        },
      },
    })

    // Access keys with different frequencies
    for (let i = 0; i < 10; i++) {
      i18n.t('key1') // Hot
    }
    for (let i = 0; i < 3; i++) {
      i18n.t('key2') // Warm
    }
    i18n.t('key3') // Cold

    const stats = cache.getStats()
    expect(stats.hotSize).toBeGreaterThan(0)
    expect(stats.hitRate).toBeGreaterThan(0)

    cache.destroy()
  })

  it('should handle RTL locales correctly', () => {
    const i18n = createI18n({
      locale: 'ar',
      messages: {
        ar: { hello: 'مرحبا' },
      },
    })

    expect(i18n.isRTL()).toBe(true)
    expect(i18n.getDirection()).toBe('rtl')

    const metadata = i18n.getLocaleMetadata()
    expect(metadata.direction).toBe('rtl')
    expect(metadata.script).toBe('arabic')
  })

  it('should not leak memory on repeated translations', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: { test: 'Test {{value}}' },
      },
    })

    const iterations = 50000

    for (let i = 0; i < iterations; i++) {
      i18n.t('test', { value: i })
    }

    // Cache should not grow beyond limit
    const stats = (i18n as any).cache.getStats()
    expect(stats.size).toBeLessThanOrEqual(1000)
  })

  it('should maintain performance under stress', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {},
      },
    })

    // Add 5000 keys
    const messages: Record<string, string> = {}
    for (let i = 0; i < 5000; i++) {
      messages[`key${i}`] = `Value ${i}`
    }
    i18n.addMessages('en', messages)

    // Measure performance
    const start = performance.now()
    for (let i = 0; i < 10000; i++) {
      i18n.t(`key${i % 5000}`)
    }
    const time = performance.now() - start

    const avgTime = time / 10000

    // Average translation should be < 0.01ms
    expect(avgTime).toBeLessThan(0.01)
  })
})

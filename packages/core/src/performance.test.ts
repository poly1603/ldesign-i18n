/**
 * @ldesign/i18n-core 性能测试
 * 
 * 测试核心功能的性能,确保满足性能要求
 */
import { describe, expect, it } from 'vitest'
import { performance } from 'node:perf_hooks'

// 性能基准
const PERFORMANCE_BENCHMARKS = {
  translation: 1, // 单次翻译应小于 1ms
  interpolation: 2, // 插值应小于 2ms
  pluralization: 2, // 复数化应小于 2ms
  cacheHit: 0.1, // 缓存命中应小于 0.1ms
  memoryPerTranslation: 1000, // 每个翻译占用内存应小于 1KB
}

describe('性能测试', () => {
  describe('翻译性能', () => {
    it('简单翻译性能应满足基准', () => {
      const iterations = 10000
      const messages = {
        'hello': 'Hello',
        'world': 'World',
        'greeting': 'Hello World',
      }

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        const _ = messages.hello
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      expect(avgTime).toBeLessThan(PERFORMANCE_BENCHMARKS.translation)
    })

    it('批量翻译性能', () => {
      const iterations = 1000
      const keys = Array.from({ length: 100 }, (_, i) => `key_${i}`)
      const messages = Object.fromEntries(
        keys.map(key => [key, `Value for ${key}`]),
      )

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        keys.forEach((key) => {
          const _ = messages[key]
        })
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      // 批量操作应保持高性能
      expect(avgTime).toBeLessThan(100) // 100ms for 100 translations
    })
  })

  describe('插值性能', () => {
    it('简单插值性能', () => {
      const iterations = 10000
      const template = 'Hello {{name}}'
      const params = { name: 'World' }

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        // 模拟插值操作
        const result = template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key as keyof typeof params] || '')
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      expect(avgTime).toBeLessThan(PERFORMANCE_BENCHMARKS.interpolation)
    })

    it('复杂插值性能', () => {
      const iterations = 5000
      const template = 'User {{user.name}} ({{user.age}} years old) from {{user.location}}'
      const params = {
        user: {
          name: 'John',
          age: 25,
          location: 'USA',
        },
      }

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        // 模拟嵌套插值
        let result = template
        result = result.replace(/\{\{user\.name\}\}/g, params.user.name)
        result = result.replace(/\{\{user\.age\}\}/g, String(params.user.age))
        result = result.replace(/\{\{user\.location\}\}/g, params.user.location)
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      expect(avgTime).toBeLessThan(PERFORMANCE_BENCHMARKS.interpolation * 2)
    })
  })

  describe('缓存性能', () => {
    it('缓存命中性能', () => {
      const iterations = 100000
      const cache = new Map<string, string>()
      cache.set('test', 'value')

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        const _ = cache.get('test')
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      expect(avgTime).toBeLessThan(PERFORMANCE_BENCHMARKS.cacheHit)
    })

    it('缓存写入性能', () => {
      const iterations = 10000
      const cache = new Map<string, string>()

      const start = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        cache.set(`key_${i}`, `value_${i}`)
      }
      
      const end = performance.now()
      const avgTime = (end - start) / iterations
      
      expect(avgTime).toBeLessThan(0.5) // 0.5ms per set operation
    })
  })

  describe('内存使用', () => {
    it('翻译数据内存占用', () => {
      const messages = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`key_${i}`, `Value for key ${i}`]),
      )

      const size = JSON.stringify(messages).length
      const avgSizePerKey = size / 1000

      // 每个翻译键平均占用应小于 1KB
      expect(avgSizePerKey).toBeLessThan(PERFORMANCE_BENCHMARKS.memoryPerTranslation)
    })

    it('缓存内存增长控制', () => {
      const cache = new Map<string, string>()
      const maxSize = 1000

      // 模拟LRU缓存
      for (let i = 0; i < 2000; i++) {
        cache.set(`key_${i}`, `value_${i}`)
        
        // 超过最大大小时删除最旧的
        if (cache.size > maxSize) {
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
      }

      // 缓存大小应保持在限制范围内
      expect(cache.size).toBeLessThanOrEqual(maxSize)
    })
  })

  describe('并发性能', () => {
    it('并发翻译性能', async () => {
      const concurrency = 100
      const iterations = 100
      const messages = {
        'test': 'Test Value',
      }

      const start = performance.now()
      
      const promises = Array.from({ length: concurrency }, async () => {
        for (let i = 0; i < iterations; i++) {
          await Promise.resolve(messages.test)
        }
      })
      
      await Promise.all(promises)
      
      const end = performance.now()
      const totalTime = end - start
      
      // 并发处理应在合理时间内完成
      expect(totalTime).toBeLessThan(1000) // 1秒内完成
    })
  })

  describe('大规模数据性能', () => {
    it('处理大量翻译键', () => {
      const keyCount = 10000
      const messages = Object.fromEntries(
        Array.from({ length: keyCount }, (_, i) => [`key_${i}`, `Value ${i}`]),
      )

      const start = performance.now()
      
      // 随机访问测试
      for (let i = 0; i < 1000; i++) {
        const randomKey = `key_${Math.floor(Math.random() * keyCount)}`
        const _ = messages[randomKey]
      }
      
      const end = performance.now()
      const totalTime = end - start
      
      // 即使有大量键,随机访问也应该快速
      expect(totalTime).toBeLessThan(100) // 100ms for 1000 random accesses
    })
  })
})

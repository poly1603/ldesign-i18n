/**
 * LRU 缓存测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LRUCache } from '../src/core/cache/lru'

describe('LRUCache', () => {
  let cache: LRUCache<string, any>

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3, defaultTTL: 1000 })
  })

  describe('基础操作', () => {
    it('应该能够设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在键不存在时返回 undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该能够删除键', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.delete('key1')).toBe(false)
    })

    it('应该能够清空缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('LRU 驱逐', () => {
    it('应该在达到最大容量时驱逐最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 应该驱逐 key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    it('应该更新访问顺序', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问 key1，使其变为最近使用
      cache.get('key1')

      // 添加 key4，应该驱逐 key2
      cache.set('key4', 'value4')

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeUndefined()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })
  })

  describe('TTL 过期', () => {
    it('应该在 TTL 过期后删除项', async () => {
      cache.set('key1', 'value1', 100) // 100ms TTL

      expect(cache.get('key1')).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该使用默认 TTL', async () => {
      cache.set('key1', 'value1')

      await new Promise(resolve => setTimeout(resolve, 1100))

      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('统计信息', () => {
    it('应该跟踪命中和未命中', () => {
      cache.set('key1', 'value1')

      cache.get('key1') // 命中
      cache.get('key2') // 未命中

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    it('应该跟踪驱逐次数', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 驱逐

      const stats = cache.getStats()
      expect(stats.evictions).toBe(1)
    })

    it('应该报告正确的大小', () => {
      expect(cache.size).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)
    })
  })

  describe('淘汰策略', () => {
    it('LRU 策略应该驱逐最少最近使用的项', () => {
      const lruCache = new LRUCache({ maxSize: 2, strategy: 'lru' })

      lruCache.set('a', 1)
      lruCache.set('b', 2)
      lruCache.get('a') // 访问 a
      lruCache.set('c', 3) // 应该驱逐 b

      expect(lruCache.get('a')).toBe(1)
      expect(lruCache.get('b')).toBeUndefined()
      expect(lruCache.get('c')).toBe(3)
    })

    it('LFU 策略应该驱逐最少访问的项', () => {
      const lfuCache = new LRUCache({ maxSize: 2, strategy: 'lfu' })

      lfuCache.set('a', 1)
      lfuCache.set('b', 2)
      lfuCache.get('a') // 访问 a 两次
      lfuCache.get('a')
      lfuCache.set('c', 3) // 应该驱逐 b

      expect(lfuCache.get('a')).toBe(1)
      expect(lfuCache.get('b')).toBeUndefined()
      expect(lfuCache.get('c')).toBe(3)
    })

    it('FIFO 策略应该驱逐最先添加的项', () => {
      const fifoCache = new LRUCache({ maxSize: 2, strategy: 'fifo' })

      fifoCache.set('a', 1)
      fifoCache.set('b', 2)
      fifoCache.get('a') // 访问 a（FIFO 不关心访问）
      fifoCache.set('c', 3) // 应该驱逐 a

      expect(fifoCache.get('a')).toBeUndefined()
      expect(fifoCache.get('b')).toBe(2)
      expect(fifoCache.get('c')).toBe(3)
    })
  })

  describe('内存管理', () => {
    it('应该估算内存占用', () => {
      cache.set('key', 'value')
      const stats = cache.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('应该在达到内存限制时驱逐项', () => {
      const memCache = new LRUCache({ maxSize: 100, maxMemory: 100 })

      // 添加大对象
      memCache.set('large', 'x'.repeat(50))
      expect(memCache.size).toBe(1)

      // 添加另一个大对象，应该驱逐第一个
      memCache.set('large2', 'y'.repeat(60))
      expect(memCache.get('large')).toBeUndefined()
    })
  })

  describe('销毁', () => {
    it('应该清理所有资源', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.destroy()

      expect(cache.size).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('keys 方法', () => {
    it('应该返回所有键', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      const keys = cache.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })
  })
})


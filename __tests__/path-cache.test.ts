/**
 * 路径缓存测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  PathCache,
  getPathCache,
  resetPathCache,
  getNestedValueCached,
} from '../src/core/path-cache'

describe('PathCache', () => {
  let cache: PathCache

  beforeEach(() => {
    cache = new PathCache(10)
  })

  describe('基础功能', () => {
    it('应该能够解析路径', () => {
      const result = cache.get('user.profile.name')

      expect(result.segments).toEqual(['user', 'profile', 'name'])
      expect(result.original).toBe('user.profile.name')
    })

    it('应该缓存解析结果', () => {
      const result1 = cache.get('user.profile.name')
      const result2 = cache.get('user.profile.name')

      // 应该是同一个对象（从缓存获取）
      expect(result1).toBe(result2)
    })

    it('应该支持自定义分隔符', () => {
      const slashCache = new PathCache(10, '/')
      const result = slashCache.get('user/profile/name')

      expect(result.segments).toEqual(['user', 'profile', 'name'])
    })

    it('应该返回正确的缓存大小', () => {
      expect(cache.size).toBe(0)

      cache.get('path1')
      expect(cache.size).toBe(1)

      cache.get('path2')
      expect(cache.size).toBe(2)
    })

    it('应该能够清除缓存', () => {
      cache.get('path1')
      cache.get('path2')

      cache.clear()

      expect(cache.size).toBe(0)
    })
  })

  describe('LRU 驱逐', () => {
    it('应该在达到最大容量时驱逐最旧的项', () => {
      const smallCache = new PathCache(3)

      smallCache.get('path1')
      smallCache.get('path2')
      smallCache.get('path3')
      smallCache.get('path4') // 应该驱逐 path1

      expect(smallCache.size).toBe(3)
    })
  })

  describe('统计', () => {
    it('应该返回正确的统计信息', () => {
      cache.get('path1')
      cache.get('path2')

      const stats = cache.getStats()

      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(10)
      expect(stats.fillRate).toBe(0.2)
    })
  })
})

describe('全局路径缓存', () => {
  afterEach(() => {
    resetPathCache()
  })

  it('应该返回单例实例', () => {
    const cache1 = getPathCache()
    const cache2 = getPathCache()

    expect(cache1).toBe(cache2)
  })

  it('应该能够重置全局缓存', () => {
    const cache1 = getPathCache()
    cache1.get('path1')

    resetPathCache()

    const cache2 = getPathCache()
    expect(cache2.size).toBe(0)
    expect(cache2).not.toBe(cache1)
  })
})

describe('getNestedValueCached', () => {
  afterEach(() => {
    resetPathCache()
  })

  it('应该从嵌套对象获取值', () => {
    const obj = {
      user: {
        profile: {
          name: 'John',
          age: 30,
        },
      },
    }

    const name = getNestedValueCached(obj, 'user.profile.name')
    expect(name).toBe('John')

    const age = getNestedValueCached(obj, 'user.profile.age')
    expect(age).toBe(30)
  })

  it('应该在路径不存在时返回 undefined', () => {
    const obj = { user: { name: 'John' } }

    const result = getNestedValueCached(obj, 'user.profile.name')
    expect(result).toBeUndefined()
  })

  it('应该在对象为 null 时返回 undefined', () => {
    const result = getNestedValueCached(null, 'path')
    expect(result).toBeUndefined()
  })

  it('应该在路径为空时返回 undefined', () => {
    const result = getNestedValueCached({ key: 'value' }, '')
    expect(result).toBeUndefined()
  })

  it('应该使用缓存提高性能', () => {
    const obj = {
      deep: {
        nested: {
          value: 'test',
        },
      },
    }

    // 第一次调用会解析路径
    const result1 = getNestedValueCached(obj, 'deep.nested.value')

    // 第二次调用应该使用缓存
    const result2 = getNestedValueCached(obj, 'deep.nested.value')

    expect(result1).toBe('test')
    expect(result2).toBe('test')

    // 验证路径已缓存
    const cache = getPathCache()
    expect(cache.size).toBeGreaterThan(0)
  })

  it('应该支持自定义分隔符', () => {
    const obj = { 'user/profile/name': 'value' }

    const result = getNestedValueCached(obj, 'user/profile/name', '/')
    expect(result).toBeUndefined() // 因为对象键是完整字符串
  })

  it('应该处理数组索引', () => {
    const obj = {
      users: [
        { name: 'Alice' },
        { name: 'Bob' },
      ],
    }

    const name = getNestedValueCached(obj, 'users.0.name')
    expect(name).toBe('Alice')
  })
})


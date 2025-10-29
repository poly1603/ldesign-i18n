import { describe, expect, it } from 'vitest'
import { LRUCache, WeakCache, createCache } from '../core/cache'

describe('Cache System', () => {
  describe('LRUCache', () => {
    it('should create LRU cache with max size', () => {
      const cache = new LRUCache({ maxSize: 3 })

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

  it('should work with maxSize constraint', () => {
    const cache = new LRUCache({ maxSize: 2 })

    cache.set('a', 1)
    cache.set('b', 2)
    
    // Both should be accessible
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
    expect(cache.size).toBe(2)
  })

  it('should get and set values correctly', () => {
    const cache = new LRUCache({ maxSize: 10 })

    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)

    // All values should be accessible
    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
    expect(cache.size).toBe(3)
  })

    it('should check if key exists', () => {
      const cache = new LRUCache({ maxSize: 10 })

      cache.set('a', 1)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('should delete keys', () => {
      const cache = new LRUCache({ maxSize: 10 })

      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.has('a')).toBe(true)
      cache.delete('a')
      expect(cache.has('a')).toBe(false)
      expect(cache.get('a')).toBeUndefined()
    })

    it('should clear all entries', () => {
      const cache = new LRUCache({ maxSize: 10 })

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.clear()

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBeUndefined()
    })

    it('should return correct size', () => {
      const cache = new LRUCache({ maxSize: 10 })

      expect(cache.size).toBe(0)

      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.size).toBe(2)

      cache.delete('a')

      expect(cache.size).toBe(1)
    })
  })

  describe('WeakCache', () => {
    it('should store and retrieve values', () => {
      const cache = new WeakCache()
      const key = {}

      cache.set(key, 'value')

      expect(cache.get(key)).toBe('value')
    })

    it('should return undefined for non-existent keys', () => {
      const cache = new WeakCache()
      const key = {}

      expect(cache.get(key)).toBeUndefined()
    })

    it('should check if key exists', () => {
      const cache = new WeakCache()
      const key = {}

      cache.set(key, 'value')

      expect(cache.has(key)).toBe(true)
      expect(cache.has({})).toBe(false)
    })

    it('should delete keys', () => {
      const cache = new WeakCache()
      const key = {}

      cache.set(key, 'value')
      expect(cache.has(key)).toBe(true)

      cache.delete(key)
      expect(cache.has(key)).toBe(false)
    })
  })

  describe('createCache', () => {
    it('should create LRU cache by default', () => {
      const cache = createCache({ maxSize: 10 })

      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('should create cache with specified type', () => {
      const cache = createCache({ type: 'lru', maxSize: 10 })

      expect(cache).toBeInstanceOf(LRUCache)
    })
  })
})

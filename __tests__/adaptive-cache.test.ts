/**
 * @ldesign/i18n - Adaptive Cache Tests
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AdaptiveCache, createAdaptiveCache } from '../src/core/adaptive-cache';

describe('AdaptiveCache', () => {
  let cache: AdaptiveCache<string, string>;

  beforeEach(() => {
    cache = new AdaptiveCache({
      minSize: 10,
      maxSize: 100,
      hotSize: 20,
      tuneInterval: 0 // Disable auto-tuning for tests
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should promote frequently accessed items to hot cache', () => {
    cache.set('key1', 'value1');

    // Access multiple times to trigger promotion
    for (let i = 0; i < 5; i++) {
      cache.get('key1');
    }

    const stats = cache.getStats();
    expect(stats.hotSize).toBeGreaterThan(0);
  });

  it('should track hit rate', () => {
    cache.set('key1', 'value1');

    // Hits
    cache.get('key1');
    cache.get('key1');

    // Misses
    cache.get('missing1');
    cache.get('missing2');

    const stats = cache.getStats();
    expect(stats.hitRate).toBe(0.5); // 2 hits, 2 misses
  });

  it('should evict when cache is full', () => {
    const maxSize = 100;

    // Fill cache beyond capacity
    for (let i = 0; i < maxSize + 10; i++) {
      cache.set(`key${i}`, `value${i}`);
    }

    const stats = cache.getStats();
    expect(stats.size).toBeLessThanOrEqual(maxSize);
  });

  it('should delete items', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);

    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all items', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should track promotions and demotions', () => {
    // Add items
    for (let i = 0; i < 30; i++) {
      cache.set(`key${i}`, `value${i}`);
    }

    // Access some items frequently
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        cache.get(`key${i}`);
      }
    }

    const stats = cache.getStats();
    expect(stats.promotions).toBeGreaterThan(0);
  });
});

describe('createAdaptiveCache', () => {
  it('should create cache with default options', () => {
    const cache = createAdaptiveCache();

    expect(cache).toBeInstanceOf(AdaptiveCache);
    cache.destroy();
  });

  it('should create cache with custom options', () => {
    const cache = createAdaptiveCache({
      minSize: 5,
      maxSize: 50,
      hotSize: 10
    });

    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    cache.destroy();
  });
});


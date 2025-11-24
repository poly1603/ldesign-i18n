/**
 * 三层缓存系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThreeTierCache } from '../cache/three-tier-cache';

describe('ThreeTierCache', () => {
  let cache: ThreeTierCache<string, string>;

  beforeEach(() => {
    cache = new ThreeTierCache({
      l1Size: 5,
      l2Size: 10,
      enableStats: true,
      l1PromotionThreshold: 3
    });
  });

  describe('基本功能', () => {
    it('应该能设置和获取值', async () => {
      cache.set('key1', 'value1');

      const value = await cache.get('key1');

      expect(value).toBe('value1');
    });

    it('应该能同步获取值', () => {
      cache.set('key1', 'value1');

      const value = cache.getSync('key1');

      expect(value).toBe('value1');
    });

    it('不存在的键应该返回undefined', async () => {
      const value = await cache.get('nonexistent');

      expect(value).toBeUndefined();
    });

    it('应该能删除值', async () => {
      cache.set('key1', 'value1');

      const deleted = cache.delete('key1');
      const value = await cache.get('key1');

      expect(deleted).toBe(true);
      expect(value).toBeUndefined();
    });

    it('应该能清空缓存', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      const size = cache.getSize();
      expect(size.total).toBe(0);
    });
  });

  describe('L1 缓存', () => {
    it('直接设置到L1应该在L1中', async () => {
      cache.set('key1', 'value1', true);

      const stats = cache.getStats();
      await cache.get('key1');

      const newStats = cache.getStats();
      expect(newStats.l1Hits).toBe(stats.l1Hits + 1);
    });

    it('L1满时应该淘汰访问次数最少的', async () => {
      // 填满L1（大小为5）
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, `value${i}`, true);
      }

      // 多次访问key0，增加访问次数
      for (let i = 0; i < 5; i++) {
        await cache.get('key0');
      }

      // 添加新的项到L1
      cache.set('key5', 'value5', true);

      // key0应该还在L1（因为访问次数多），其他某个应该被淘汰
      const value0 = cache.getSync('key0');
      expect(value0).toBe('value0');
    });
  });

  describe('L2 缓存（LRU）', () => {
    it('应该使用LRU策略淘汰', async () => {
      // 填满L2（大小为10）
      for (let i = 0; i < 11; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // key0应该被淘汰到L3
      const size = cache.getSize();
      expect(size.l2).toBe(10);
    });

    it('访问应该更新LRU顺序', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // 访问key1
      await cache.get('key1');

      // key1应该被移到前面
      const stats = cache.getStats();
      expect(stats.l2Hits).toBeGreaterThan(0);
    });
  });

  describe('L3 懒加载', () => {
    it('应该使用loader加载不存在的值', async () => {
      const loader = vi.fn(async (key: string) => `loaded-${key}`);
      const cache = new ThreeTierCache({
        l3Loader: loader
      });

      const value = await cache.get('key1');

      expect(loader).toHaveBeenCalledWith('key1');
      expect(value).toBe('loaded-key1');
    });

    it('loader失败应该返回undefined', async () => {
      const loader = vi.fn(async () => {
        throw new Error('Load failed');
      });
      const cache = new ThreeTierCache({
        l3Loader: loader
      });

      const value = await cache.get('key1');

      expect(value).toBeUndefined();
    });
  });

  describe('缓存晋升', () => {
    it('频繁访问的项应该晋升到L1', async () => {
      cache.set('key1', 'value1'); // 在L2

      // 访问超过阈值次数（3次）
      for (let i = 0; i < 5; i++) {
        await cache.get('key1');
      }

      cache.resetStats();
      await cache.get('key1');

      const stats = cache.getStats();
      // 下次访问应该直接命中L1
      expect(stats.l1Hits).toBe(1);
    });

    it('access-count策略应该基于访问次数', async () => {
      const cache = new ThreeTierCache({
        l1PromotionThreshold: 3,
        promotionStrategy: 'access-count'
      });

      cache.set('key1', 'value1');

      // 访问3次
      for (let i = 0; i < 3; i++) {
        await cache.get('key1');
      }

      // 应该已晋升到L1
      cache.resetStats();
      cache.getSync('key1');

      const stats = cache.getStats();
      expect(stats.l1Hits).toBe(1);
    });
  });

  describe('缓存统计', () => {
    it('应该记录L1命中', async () => {
      cache.set('key1', 'value1', true);

      await cache.get('key1');

      const stats = cache.getStats();
      expect(stats.l1Hits).toBe(1);
      expect(stats.total).toBe(1);
    });

    it('应该记录L2命中', async () => {
      cache.set('key1', 'value1');

      await cache.get('key1');

      const stats = cache.getStats();
      expect(stats.l2Hits).toBe(1);
    });

    it('应该记录未命中', async () => {
      await cache.get('nonexistent');

      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
    });

    it('应该计算命中率', async () => {
      cache.set('key1', 'value1', true);

      await cache.get('key1'); // 命中
      await cache.get('key2'); // 未命中

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0.5);
    });

    it('应该能重置统计', async () => {
      cache.set('key1', 'value1');
      await cache.get('key1');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('缓存预热', () => {
    it('应该能预热L1缓存', async () => {
      cache.warmup([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ]);

      cache.resetStats();

      // 所有预热的项应该在L1
      await cache.get('key1');
      await cache.get('key2');
      await cache.get('key3');

      const stats = cache.getStats();
      expect(stats.l1Hits).toBe(3);
    });
  });

  describe('缓存大小', () => {
    it('应该能获取各层缓存大小', () => {
      cache.set('key1', 'value1', true); // L1
      cache.set('key2', 'value2'); // L2

      const size = cache.getSize();

      expect(size.l1).toBe(1);
      expect(size.l2).toBe(1);
      expect(size.total).toBe(2);
    });

    it('总大小应该等于各层之和', () => {
      for (let i = 0; i < 20; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const size = cache.getSize();
      expect(size.total).toBe(size.l1 + size.l2 + size.l3);
    });
  });

  describe('性能测试', () => {
    it('L1访问应该最快', async () => {
      cache.set('l1-key', 'value', true); // L1
      cache.set('l2-key', 'value'); // L2

      const iterations = 10000;

      // 测试L1性能
      const start1 = performance.now();
      for (let i = 0; i < iterations; i++) {
        cache.getSync('l1-key');
      }
      const l1Time = performance.now() - start1;

      // 测试L2性能
      const start2 = performance.now();
      for (let i = 0; i < iterations; i++) {
        cache.getSync('l2-key');
      }
      const l2Time = performance.now() - start2;

      console.log(`L1 访问: ${l1Time.toFixed(2)}ms`);
      console.log(`L2 访问: ${l2Time.toFixed(2)}ms`);
      console.log(`L1 比 L2 快: ${((l2Time - l1Time) / l2Time * 100).toFixed(2)}%`);

      // L1应该更快
      expect(l1Time).toBeLessThan(l2Time);
    });

    it('应该处理大量数据', async () => {
      const count = 1000;

      const start = performance.now();
      for (let i = 0; i < count; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      const setTime = performance.now() - start;

      const start2 = performance.now();
      for (let i = 0; i < count; i++) {
        await cache.get(`key${i}`);
      }
      const getTime = performance.now() - start2;

      console.log(`设置 ${count} 项: ${setTime.toFixed(2)}ms`);
      console.log(`获取 ${count} 项: ${getTime.toFixed(2)}ms`);

      const stats = cache.getStats();
      console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`);

      expect(stats.hitRate).toBeGreaterThan(0.5);
    });
  });

  describe('边界情况', () => {
    it('应该处理undefined值', async () => {
      cache.set('key1', undefined as any);

      const value = await cache.get('key1');

      expect(value).toBeUndefined();
    });

    it('应该处理复杂对象', async () => {
      const obj = { a: 1, b: { c: 2 } };
      cache.set('key1', JSON.stringify(obj));

      const value = await cache.get('key1');

      expect(JSON.parse(value!)).toEqual(obj);
    });

    it('空缓存的统计应该为0', () => {
      const stats = cache.getStats();

      expect(stats.total).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });
});
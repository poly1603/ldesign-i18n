/**
 * I18n 三层缓存架构
 * L1: 热路径缓存（静态数组，最快，10-20项）
 * L2: 主缓存（LRU Map，快速，100-500项）
 * L3: 懒加载缓存（按需加载，无限制）
 */

/**
 * LRU 缓存节点
 */
interface CacheNode<K, V> {
  key: K;
  value: V;
  prev: CacheNode<K, V> | null;
  next: CacheNode<K, V> | null;
  accessCount: number;
  lastAccess: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  l1Hits: number;
  l2Hits: number;
  l3Hits: number;
  misses: number;
  total: number;
  hitRate: number;
  l1HitRate: number;
  l2HitRate: number;
  l3HitRate: number;
}

/**
 * 三层缓存选项
 */
export interface ThreeTierCacheOptions<K, V> {
  /** L1 缓存大小（热路径） */
  l1Size?: number;
  /** L2 缓存大小（LRU） */
  l2Size?: number;
  /** L3 加载函数 */
  l3Loader?: (key: K) => V | Promise<V>;
  /** 是否启用统计 */
  enableStats?: boolean;
  /** L1 晋升阈值（访问次数） */
  l1PromotionThreshold?: number;
  /** L2 到 L1 晋升策略 */
  promotionStrategy?: 'access-count' | 'recent' | 'hybrid';
}

/**
 * 三层缓存实现
 */
export class ThreeTierCache<K = string, V = any> {
  // L1: 热路径缓存（静态数组，最快）
  private l1Cache: Array<{ key: K; value: V; accessCount: number }> = [];
  private l1Size: number;

  // L2: LRU 缓存（Map + 双向链表）
  private l2Cache = new Map<K, CacheNode<K, V>>();
  private l2Head: CacheNode<K, V> | null = null;
  private l2Tail: CacheNode<K, V> | null = null;
  private l2Size: number;

  // L3: 懒加载缓存
  private l3Cache = new Map<K, V>();
  private l3Loader?: (key: K) => V | Promise<V>;

  // 统计信息
  private stats = {
    l1Hits: 0,
    l2Hits: 0,
    l3Hits: 0,
    misses: 0
  };
  private enableStats: boolean;

  // 晋升策略
  private l1PromotionThreshold: number;
  private promotionStrategy: 'access-count' | 'recent' | 'hybrid';

  constructor(options: ThreeTierCacheOptions<K, V> = {}) {
    this.l1Size = options.l1Size || 20;
    this.l2Size = options.l2Size || 200;
    this.l3Loader = options.l3Loader;
    this.enableStats = options.enableStats ?? true;
    this.l1PromotionThreshold = options.l1PromotionThreshold || 5;
    this.promotionStrategy = options.promotionStrategy || 'hybrid';
  }

  /**
   * 获取值
   */
  async get(key: K): Promise<V | undefined> {
    // L1 查找（最快）
    const l1Index = this.l1Cache.findIndex(item => item.key === key);
    if (l1Index !== -1) {
      this.l1Cache[l1Index].accessCount++;
      if (this.enableStats) this.stats.l1Hits++;
      return this.l1Cache[l1Index].value;
    }

    // L2 查找
    const l2Node = this.l2Cache.get(key);
    if (l2Node) {
      l2Node.accessCount++;
      l2Node.lastAccess = Date.now();
      this.moveToHead(l2Node);
      if (this.enableStats) this.stats.l2Hits++;

      // 检查是否应该晋升到 L1
      if (this.shouldPromoteToL1(l2Node)) {
        this.promoteToL1(key, l2Node.value, l2Node.accessCount);
      }

      return l2Node.value;
    }

    // L3 查找
    let l3Value = this.l3Cache.get(key);
    if (l3Value !== undefined) {
      if (this.enableStats) this.stats.l3Hits++;
      this.setInL2(key, l3Value);
      return l3Value;
    }

    // L3 加载
    if (this.l3Loader) {
      try {
        l3Value = await this.l3Loader(key);
        if (l3Value !== undefined) {
          this.l3Cache.set(key, l3Value);
          this.setInL2(key, l3Value);
          if (this.enableStats) this.stats.l3Hits++;
          return l3Value;
        }
      } catch (error) {
        console.error(`L3 loader failed for key ${String(key)}:`, error);
      }
    }

    // 未找到
    if (this.enableStats) this.stats.misses++;
    return undefined;
  }

  /**
   * 同步获取值（仅查找 L1、L2、L3，不触发加载）
   */
  getSync(key: K): V | undefined {
    // L1 查找
    const l1Index = this.l1Cache.findIndex(item => item.key === key);
    if (l1Index !== -1) {
      this.l1Cache[l1Index].accessCount++;
      if (this.enableStats) this.stats.l1Hits++;
      return this.l1Cache[l1Index].value;
    }

    // L2 查找
    const l2Node = this.l2Cache.get(key);
    if (l2Node) {
      l2Node.accessCount++;
      l2Node.lastAccess = Date.now();
      this.moveToHead(l2Node);
      if (this.enableStats) this.stats.l2Hits++;

      if (this.shouldPromoteToL1(l2Node)) {
        this.promoteToL1(key, l2Node.value, l2Node.accessCount);
      }

      return l2Node.value;
    }

    // L3 查找
    const l3Value = this.l3Cache.get(key);
    if (l3Value !== undefined) {
      if (this.enableStats) this.stats.l3Hits++;
      this.setInL2(key, l3Value);
      return l3Value;
    }

    if (this.enableStats) this.stats.misses++;
    return undefined;
  }

  /**
   * 设置值
   */
  set(key: K, value: V, directToL1 = false): void {
    if (directToL1) {
      this.setInL1(key, value);
    } else {
      this.setInL2(key, value);
    }
  }

  /**
   * 删除值
   */
  delete(key: K): boolean {
    let deleted = false;

    // 从 L1 删除
    const l1Index = this.l1Cache.findIndex(item => item.key === key);
    if (l1Index !== -1) {
      this.l1Cache.splice(l1Index, 1);
      deleted = true;
    }

    // 从 L2 删除
    const l2Node = this.l2Cache.get(key);
    if (l2Node) {
      this.removeNode(l2Node);
      this.l2Cache.delete(key);
      deleted = true;
    }

    // 从 L3 删除
    if (this.l3Cache.delete(key)) {
      deleted = true;
    }

    return deleted;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.l1Cache = [];
    this.l2Cache.clear();
    this.l2Head = null;
    this.l2Tail = null;
    this.l3Cache.clear();
    this.resetStats();
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    const total = this.stats.l1Hits + this.stats.l2Hits +
      this.stats.l3Hits + this.stats.misses;

    return {
      l1Hits: this.stats.l1Hits,
      l2Hits: this.stats.l2Hits,
      l3Hits: this.stats.l3Hits,
      misses: this.stats.misses,
      total,
      hitRate: total > 0 ? (total - this.stats.misses) / total : 0,
      l1HitRate: total > 0 ? this.stats.l1Hits / total : 0,
      l2HitRate: total > 0 ? this.stats.l2Hits / total : 0,
      l3HitRate: total > 0 ? this.stats.l3Hits / total : 0
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      l1Hits: 0,
      l2Hits: 0,
      l3Hits: 0,
      misses: 0
    };
  }

  /**
   * 获取缓存大小信息
   */
  getSize(): {
    l1: number;
    l2: number;
    l3: number;
    total: number;
  } {
    return {
      l1: this.l1Cache.length,
      l2: this.l2Cache.size,
      l3: this.l3Cache.size,
      total: this.l1Cache.length + this.l2Cache.size + this.l3Cache.size
    };
  }

  /**
   * 预热缓存（将常用键值对直接加载到 L1）
   */
  warmup(entries: Array<[K, V]>): void {
    for (const [key, value] of entries) {
      this.setInL1(key, value);
    }
  }

  /**
   * 设置到 L1 缓存
   */
  private setInL1(key: K, value: V, accessCount = 0): void {
    // 检查是否已存在
    const existingIndex = this.l1Cache.findIndex(item => item.key === key);
    if (existingIndex !== -1) {
      this.l1Cache[existingIndex].value = value;
      this.l1Cache[existingIndex].accessCount = accessCount;
      return;
    }

    // L1 满了，移除最少访问的
    if (this.l1Cache.length >= this.l1Size) {
      const minIndex = this.l1Cache.reduce((minIdx, item, idx, arr) =>
        item.accessCount < arr[minIdx].accessCount ? idx : minIdx, 0);

      // 降级到 L2
      const evicted = this.l1Cache[minIndex];
      this.setInL2(evicted.key, evicted.value);
      this.l1Cache.splice(minIndex, 1);
    }

    this.l1Cache.push({ key, value, accessCount });
  }

  /**
   * 设置到 L2 缓存
   */
  private setInL2(key: K, value: V): void {
    const existingNode = this.l2Cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      existingNode.lastAccess = Date.now();
      this.moveToHead(existingNode);
      return;
    }

    const newNode: CacheNode<K, V> = {
      key,
      value,
      prev: null,
      next: null,
      accessCount: 0,
      lastAccess: Date.now()
    };

    this.addToHead(newNode);
    this.l2Cache.set(key, newNode);

    // L2 满了，移除最久未使用的
    if (this.l2Cache.size > this.l2Size) {
      if (this.l2Tail) {
        const evictedKey = this.l2Tail.key;
        const evictedValue = this.l2Tail.value;
        this.removeNode(this.l2Tail);
        this.l2Cache.delete(evictedKey);

        // 降级到 L3
        this.l3Cache.set(evictedKey, evictedValue);
      }
    }
  }

  /**
   * 判断是否应该晋升到 L1
   */
  private shouldPromoteToL1(node: CacheNode<K, V>): boolean {
    switch (this.promotionStrategy) {
      case 'access-count':
        return node.accessCount >= this.l1PromotionThreshold;

      case 'recent':
        return Date.now() - node.lastAccess < 1000; // 1秒内

      case 'hybrid':
        return node.accessCount >= this.l1PromotionThreshold &&
          Date.now() - node.lastAccess < 5000; // 5秒内且访问次数足够

      default:
        return false;
    }
  }

  /**
   * 晋升到 L1
   */
  private promoteToL1(key: K, value: V, accessCount: number): void {
    this.setInL1(key, value, accessCount);
    this.l2Cache.delete(key);
  }

  /**
   * 添加节点到链表头部
   */
  private addToHead(node: CacheNode<K, V>): void {
    node.prev = null;
    node.next = this.l2Head;

    if (this.l2Head) {
      this.l2Head.prev = node;
    }

    this.l2Head = node;

    if (!this.l2Tail) {
      this.l2Tail = node;
    }
  }

  /**
   * 移动节点到链表头部
   */
  private moveToHead(node: CacheNode<K, V>): void {
    if (node === this.l2Head) return;

    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * 从链表中移除节点
   */
  private removeNode(node: CacheNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.l2Head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.l2Tail = node.prev;
    }
  }
}

/**
 * 创建三层缓存实例
 */
export function createThreeTierCache<K = string, V = any>(
  options?: ThreeTierCacheOptions<K, V>
): ThreeTierCache<K, V> {
  return new ThreeTierCache(options);
}
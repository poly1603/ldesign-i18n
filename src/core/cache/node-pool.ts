/**
 * 节点对象池
 * 
 * 减少 GC 压力，提高性能
 * 
 * @packageDocumentation
 */

import type { LRUNode } from './lru'

/**
 * 节点对象池
 * 
 * 复用节点对象，减少内存分配和 GC 压力
 * 
 * @template K - 键类型
 * @template V - 值类型
 */
export class NodePool<K, V> {
  private pool: Array<LRUNode<K, V>> = []
  private readonly maxSize = 100

  /**
   * 获取节点（从池中或创建新节点）
   */
  get(key: K, value: V, size: number, expires?: number): LRUNode<K, V> {
    const node = this.pool.pop()
    if (node) {
      node.reset(key, value, size, expires)
      return node
    }

    // 动态导入避免循环依赖
    const { LRUNode } = require('./lru')
    return new LRUNode(key, value, size, expires)
  }

  /**
   * 释放节点到池中
   */
  release(node: LRUNode<K, V>): void {
    if (this.pool.length < this.maxSize) {
      node.prev = null
      node.next = null
      this.pool.push(node)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }
}



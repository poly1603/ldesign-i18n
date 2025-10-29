/**
 * 缓存工具函数
 * 
 * @packageDocumentation
 */

/**
 * 估算数据大小（字节）
 * 
 * @param value - 要估算的值
 * @returns 估算的字节数
 */
export function estimateSize(value: any): number {
  if (value === null || value === undefined) {
    return 0
  }

  const type = typeof value

  switch (type) {
    case 'boolean':
      return 4
    case 'number':
      return 8
    case 'string':
      return value.length * 2 // UTF-16 编码
    case 'object':
      if (Array.isArray(value)) {
        return value.reduce((sum, item) => sum + estimateSize(item), 40)
      }
      // 对象：估算键和值的大小
      return Object.entries(value).reduce(
        (sum, [k, v]) => sum + k.length * 2 + estimateSize(v),
        40, // 对象本身的开销
      )
    default:
      return 40 // 默认估算
  }
}



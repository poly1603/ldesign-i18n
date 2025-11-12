/**
 * 浏览器兼容的加密工具
 * 用于替代 Node.js 的 crypto 模块
 */

/**
 * 生成随机 UUID
 * @returns UUID 字符串
 */
export function randomUUID(): string {
  // 优先使用浏览器原生 crypto API
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // 降级方案：使用 Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成随机字节
 * @param size - 字节数
 * @returns Uint8Array
 */
export function randomBytes(size: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(size)
    crypto.getRandomValues(bytes)
    return bytes
  }

  // 降级方案
  const bytes = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}

/**
 * 创建 SHA-256 哈希
 * @param data - 要哈希的数据
 * @returns 哈希值（十六进制字符串）
 */
export async function createHash(data: string): Promise<string> {
  // 优先使用浏览器原生 SubtleCrypto API
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // 降级方案：简单哈希算法（不安全，仅用于开发）
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * 同步版本的简单哈希（用于兼容性）
 * @param data - 要哈希的数据
 * @returns 哈希值（十六进制字符串）
 */
export function createHashSync(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * 生成随机十六进制字符串
 * @param length - 字符串长度
 * @returns 十六进制字符串
 */
export function randomHex(length: number): string {
  const bytes = randomBytes(Math.ceil(length / 2))
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length)
}

// 默认导出对象，兼容 Node.js crypto 模块的部分 API
export default {
  randomUUID,
  randomBytes,
  createHash,
  createHashSync,
  randomHex,
}


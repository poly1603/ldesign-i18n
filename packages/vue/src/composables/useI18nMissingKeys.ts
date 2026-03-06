/**
 * useI18nMissingKeys - 缺失翻译键收集 composable
 *
 * 监听 missingKey 事件，在开发环境中收集和展示缺失的翻译键，
 * 帮助开发者发现遗漏的翻译。
 *
 * @example
 * ```typescript
 * const { missingKeys, hasMissing, missingCount, clearMissing } = useI18nMissingKeys()
 *
 * // missingKeys.value → [{ key: 'some.key', locale: 'en-US', timestamp: 1234567890 }]
 * // hasMissing.value → true
 * // missingCount.value → 1
 * ```
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from './useI18n'

/**
 * 缺失键记录
 */
export interface MissingKeyRecord {
  /** 翻译键 */
  key: string
  /** 所在语言 */
  locale: string
  /** 首次触发时间戳 */
  timestamp: number
  /** 触发次数 */
  count: number
}

export interface UseI18nMissingKeysOptions {
  /** 最大记录数 */
  maxRecords?: number
  /** 是否自动在控制台输出 */
  logToConsole?: boolean
}

export interface UseI18nMissingKeysReturn {
  /** 缺失键列表（去重后） */
  missingKeys: Ref<MissingKeyRecord[]>
  /** 是否有缺失键 */
  hasMissing: ComputedRef<boolean>
  /** 缺失键数量 */
  missingCount: ComputedRef<number>
  /** 清除所有记录 */
  clearMissing: () => void
  /** 导出缺失键列表（JSON 字符串） */
  exportMissing: () => string
}

export function useI18nMissingKeys(
  options: UseI18nMissingKeysOptions = {},
): UseI18nMissingKeysReturn {
  const { i18n } = useI18n()
  const { maxRecords = 200, logToConsole = false } = options

  const missingKeys = ref<MissingKeyRecord[]>([])

  // 用 Map 快速查找已存在的 key+locale 组合
  const keyMap = new Map<string, number>()

  const unsub = i18n.on('missingKey', (event) => {
    const key = event.key || ''
    const locale = event.locale || i18n.locale
    const mapKey = `${locale}::${key}`

    const existingIndex = keyMap.get(mapKey)
    if (existingIndex !== undefined) {
      // 已存在，增加计数
      missingKeys.value[existingIndex].count++
      return
    }

    // 新记录
    const record: MissingKeyRecord = {
      key,
      locale,
      timestamp: Date.now(),
      count: 1,
    }

    if (missingKeys.value.length >= maxRecords) {
      // 移除最早的记录
      const removed = missingKeys.value.shift()!
      keyMap.delete(`${removed.locale}::${removed.key}`)
    }

    keyMap.set(mapKey, missingKeys.value.length)
    missingKeys.value.push(record)

    if (logToConsole) {
      console.warn(`[i18n] Missing key: "${key}" (locale: ${locale})`)
    }
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  const hasMissing = computed(() => missingKeys.value.length > 0)
  const missingCount = computed(() => missingKeys.value.length)

  const clearMissing = () => {
    missingKeys.value = []
    keyMap.clear()
  }

  const exportMissing = (): string => {
    return JSON.stringify(missingKeys.value, null, 2)
  }

  return {
    missingKeys,
    hasMissing,
    missingCount,
    clearMissing,
    exportMissing,
  }
}

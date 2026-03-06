/**
 * useI18nScope - 组件级别的作用域翻译
 *
 * 为组件提供命名空间化的翻译，简化嵌套键的使用
 *
 * @example
 * ```typescript
 * // 在组件中使用
 * const { t, te } = useI18nScope('pages.home')
 * // t('title') 等价于 useI18n().t('pages.home.title')
 * ```
 */

import type { ComputedRef, Ref } from 'vue'
import type { InterpolationParams, MessageKey, Locale } from '@ldesign/i18n-core'
import { computed } from 'vue'
import { useI18n } from './useI18n'

export interface UseI18nScopeOptions {
  /** 是否同时保留对全局翻译的访问 */
  includeGlobal?: boolean
}

export interface UseI18nScopeReturn {
  /** 作用域翻译 */
  t: (key: MessageKey, params?: InterpolationParams) => string
  /** 检查翻译是否存在（作用域内） */
  te: (key: MessageKey, locale?: Locale) => boolean
  /** 复数化翻译（作用域内） */
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string
  /** 获取原始消息对象（作用域内） */
  tm: (key: MessageKey) => any
  /** 全局翻译函数（绕过作用域） */
  gt: (key: MessageKey, params?: InterpolationParams) => string
  /** 当前语言 */
  locale: Ref<Locale>
  /** 可用语言列表 */
  availableLocales: ComputedRef<Locale[]>
  /** 设置语言 */
  setLocale: (locale: Locale) => Promise<void>
  /** 作用域前缀 */
  scope: string
}

/**
 * 组件级别的作用域翻译
 *
 * @param scope - 翻译键前缀（命名空间）
 * @param options - 选项
 * @returns 作用域化的翻译工具
 */
export function useI18nScope(
  scope: string,
  options: UseI18nScopeOptions = {},
): UseI18nScopeReturn {
  const i18nResult = useI18n()
  const { t: globalT, te: globalTe, tc: globalTc, tm: globalTm, locale, availableLocales, setLocale } = i18nResult

  const prefix = scope ? `${scope}.` : ''

  const t = (key: MessageKey, params?: InterpolationParams): string => {
    return globalT(`${prefix}${key}`, params)
  }

  const te = (key: MessageKey, checkLocale?: Locale): boolean => {
    return globalTe(`${prefix}${key}`, checkLocale)
  }

  const tc = (key: MessageKey, count: number, params?: InterpolationParams): string => {
    return globalTc(`${prefix}${key}`, count, params)
  }

  const tm = (key: MessageKey): any => {
    return globalTm(`${prefix}${key}`)
  }

  const gt = (key: MessageKey, params?: InterpolationParams): string => {
    return globalT(key, params)
  }

  return {
    t,
    te,
    tc,
    tm,
    gt,
    locale,
    availableLocales,
    setLocale,
    scope,
  }
}

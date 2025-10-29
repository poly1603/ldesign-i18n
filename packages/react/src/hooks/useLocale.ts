/**
 * useLocale Hook
 * 语言管理 Hook
 */

import type { Locale } from '@ldesign/i18n-core'
import { useI18n } from './useI18n'

export interface UseLocaleReturn {
  /**
   * 当前语言
   */
  locale: Locale

  /**
   * 切换语言
   */
  setLocale: (locale: Locale) => Promise<void>

  /**
   * 可用的语言列表
   */
  availableLocales: Locale[]
}

/**
 * useLocale Hook
 * 语言管理 Hook
 * 
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, setLocale, availableLocales } = useLocale()
 *   
 *   return (
 *     <select value={locale} onChange={e => setLocale(e.target.value)}>
 *       {availableLocales.map(loc => (
 *         <option key={loc} value={loc}>{loc}</option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 */
export function useLocale(): UseLocaleReturn {
  const { locale, setLocale, availableLocales } = useI18n()

  return {
    locale,
    setLocale,
    availableLocales,
  }
}


/**
 * useTranslation Hook
 * 简化版翻译 Hook，只提供翻译功能
 */

import type { InterpolationParams, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { useI18n, type UseI18nOptions } from './useI18n'

export interface UseTranslationReturn {
  /**
   * 翻译函数
   */
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string

  /**
   * 检查翻译键是否存在
   */
  te: (key: MessageKey) => boolean
}

/**
 * useTranslation Hook
 * 简化版翻译 Hook
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t } = useTranslation()
 *   
 *   return <h1>{t('hello')}</h1>
 * }
 * ```
 */
export function useTranslation(options?: UseI18nOptions): UseTranslationReturn {
  const { t, te } = useI18n(options)

  return {
    t,
    te,
  }
}


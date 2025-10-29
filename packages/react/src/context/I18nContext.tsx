/**
 * React Context for i18n
 */

import type { I18nInstance } from '@ldesign/i18n-core'
import { createContext } from 'react'

/**
 * I18n Context 类型
 */
export interface I18nContextValue {
  /**
   * I18n 实例
   */
  i18n: I18nInstance | null
}

/**
 * I18n React Context
 */
export const I18nContext = createContext<I18nContextValue>({
  i18n: null,
})

/**
 * Context 显示名称（用于 React DevTools）
 */
I18nContext.displayName = 'I18nContext'


/**
 * I18n Context for Solid
 */

import type { I18nInstance } from '@ldesign/i18n-core'
import { createContext } from 'solid-js'

export interface I18nContextValue {
  i18n: I18nInstance
}

/**
 * I18n Context
 */
export const I18nContext = createContext<I18nContextValue>()


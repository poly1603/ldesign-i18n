/**
 * @ldesign/i18n-preact - I18nProvider
 */

import type { ComponentChildren } from 'preact'
import { I18nContext } from '../context'
import type { I18nInstance } from '@ldesign/i18n-core'

export interface I18nProviderProps {
  i18n: I18nInstance
  children?: ComponentChildren
}

export function I18nProvider({ i18n, children }: I18nProviderProps) {
  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>
}

import { createContext, useContext } from 'solid-js'
import type { I18nInstance } from '@ldesign/i18n-core'

export const I18nContext = createContext<I18nInstance>()

export function useI18nContext() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider')
  }
  return context
}

import type { ReactNode } from 'react'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18nContext } from '../context'

export interface I18nProviderProps {
  i18n: I18nInstance
  children: ReactNode
}

export function I18nProvider({ i18n, children }: I18nProviderProps) {
  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  )
}

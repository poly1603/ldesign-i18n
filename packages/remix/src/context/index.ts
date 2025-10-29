import { createContext } from 'react'
import type { I18nInstance } from '@ldesign/i18n-core'

export const I18nContext = createContext<I18nInstance | null>(null)

export const I18nProvider = I18nContext.Provider

/**
 * @ldesign/i18n-remix
 * Remix integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

// Re-export from core
export { createI18n, type I18nInstance, type I18nConfig } from '@ldesign/i18n-core'

// Re-export from React
export * from '@ldesign/i18n-react'

// Loaders
export { createI18nLoader, getI18nFromLoader } from './loaders/i18nLoader'
export type { I18nLoaderConfig } from './loaders/i18nLoader'

// Hooks (Remix-specific)
export { useI18n, useTranslation, useLocale } from './hooks/useI18n'

// Components
export { I18nProvider } from './components/I18nProvider'
export type { I18nProviderProps } from './components/I18nProvider'

// Utils
export * from './utils/localeUtils'

// Context
export { I18nContext } from './context'

// Version info
export const VERSION = '1.0.0'

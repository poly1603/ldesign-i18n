/**
 * @ldesign/i18n-react
 * React integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== Context ====================

export { I18nContext } from './context/I18nContext'
export type { I18nContextValue } from './context/I18nContext'

// ==================== Components ====================

export { I18nProvider } from './components/I18nProvider'
export type { I18nProviderProps } from './components/I18nProvider'

export { Trans } from './components/Trans'
export type { TransProps } from './components/Trans'

export { LocaleSwitcher } from './components/LocaleSwitcher'
export type { LocaleSwitcherProps } from './components/LocaleSwitcher'

// ==================== Hooks ====================

export { useI18n } from './hooks/useI18n'
export type { UseI18nOptions, UseI18nReturn } from './hooks/useI18n'

export { useTranslation } from './hooks/useTranslation'
export type { UseTranslationReturn } from './hooks/useTranslation'

export { useLocale } from './hooks/useLocale'
export type { UseLocaleReturn } from './hooks/useLocale'

// ==================== HOC ====================

export { withI18n } from './hoc/withI18n'
export type { WithI18nProps } from './hoc/withI18n'

// ==================== Types ====================

export * from './types'

// ==================== 重新导出核心功能 ====================

export { createI18n, I18n, OptimizedI18n } from '@ldesign/i18n-core'
export type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'


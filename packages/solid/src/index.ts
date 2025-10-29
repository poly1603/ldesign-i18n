/**
 * @ldesign/i18n-solid
 * Solid.js integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== Context ====================

export { I18nContext, type I18nContextValue } from './context/I18nContext'

// ==================== Primitives ====================

export { createI18n, type ReactiveI18nInstance } from './primitives/createI18n'
export { useI18n, type UseI18nOptions, type UseI18nReturn } from './primitives/useI18n'
export { useLocale, type UseLocaleReturn } from './primitives/useLocale'
export { useTranslation, type UseTranslationOptions, type UseTranslationReturn } from './primitives/useTranslation'

// ==================== Components ====================

export { I18nProvider, type I18nProviderProps } from './components/I18nProvider'
export { Trans, type TransProps } from './components/Trans'
export { LocaleSwitcher, type LocaleSwitcherProps } from './components/LocaleSwitcher'

// ==================== Directives ====================

export { t, type TDirectiveParams } from './directives/t'
export { tHtml, type THtmlDirectiveParams } from './directives/tHtml'
export { tPlural, type TPluralDirectiveParams } from './directives/tPlural'

// ==================== Types ====================

export * from './types'

// ==================== Re-export core ====================

export { OptimizedI18n, I18n } from '@ldesign/i18n-core'
export type {
  I18nConfig,
  I18nInstance,
  Locale,
  MessageKey,
  Messages,
  InterpolationParams,
  TranslateOptions,
} from '@ldesign/i18n-core'


/**
 * @ldesign/i18n-svelte
 * Svelte integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== Stores ====================

export { createI18n, type I18nStore } from './stores/createI18n'
export * from './stores'

// ==================== Components ====================

export { default as I18nProvider } from './components/I18nProvider.svelte'
export { default as Trans } from './components/Trans.svelte'
export { default as LocaleSwitcher } from './components/LocaleSwitcher.svelte'

// ==================== Actions ====================

export { t, tHtml, tPlural } from './actions'

// ==================== Utils ====================

export { getI18nContext, setI18nContext } from './utils/context'
export { parseBindingValue, isEmpty } from './utils/helpers'

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


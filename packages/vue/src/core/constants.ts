/**
 * Constants for Vue i18n adapter
 */

import type { InjectionKey } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'

// Injection keys
export const I18N_SYMBOL = Symbol('i18n') as InjectionKey<I18nInstance>
export const I18N_INJECTION_KEY = I18N_SYMBOL // Main injection key
export const i18nSymbol = I18N_SYMBOL // Alias for compatibility
export const I18N_CONFIG_SYMBOL = Symbol('i18n-config') // Plugin config injection key

// Default options
export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_FALLBACK_LOCALE = 'en'

// Component names
export const COMPONENT_PREFIX = 'I18n'

// Directive names
export const DIRECTIVE_PREFIX = 'v-t'

/**
 * Global i18n instance holder.
 * Used as a fallback by directives when Symbol-based injection fails (e.g. after HMR).
 */
let _globalI18nInstance: I18nInstance | undefined

export function setGlobalI18nInstance(instance: I18nInstance) {
  _globalI18nInstance = instance
}

export function getGlobalI18nInstance(): I18nInstance | undefined {
  return _globalI18nInstance
}

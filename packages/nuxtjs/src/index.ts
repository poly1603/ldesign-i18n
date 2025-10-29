/**
 * @ldesign/i18n-nuxtjs
 * Nuxt.js integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

// Re-export from core
export { createI18n, type I18nInstance, type I18nConfig } from '@ldesign/i18n-core'

// Re-export from Vue
export * from '@ldesign/i18n-vue'

// Nuxt module
export { default } from './module'
export type { ModuleOptions } from './module'

// Composables
export { useI18n, useLocale, useTranslation } from './composables/useI18n'

// Export framework-specific integrations
export * from './components'
export * from './plugins'
export * from './server'

// Version info
export const VERSION = '1.0.0'

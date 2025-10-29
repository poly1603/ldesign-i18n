/**
 * @ldesign/i18n-sveltekit
 * SvelteKit integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

export { createI18n, type I18nInstance } from '@ldesign/i18n-core'

// Export framework-specific integrations
export * from './stores'
export * from './components'
export * from './server'

// Version info
export const VERSION = '1.0.0'

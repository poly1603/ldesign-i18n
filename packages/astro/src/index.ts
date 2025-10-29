/**
 * @ldesign/i18n-astro
 * Astro integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

export { createI18n, type I18nInstance } from '@ldesign/i18n-core'

// Export framework-specific integrations
export * from './components'
export * from './utils'
export * from './middleware'

// Version info
export const VERSION = '1.0.0'

/**
 * @ldesign/i18n-lit
 * Lit integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

export { createI18n, type I18nInstance } from '@ldesign/i18n-core'

// Export framework-specific integrations
export * from './directives'
export * from './controllers'
export * from './decorators'

// Version info
export const VERSION = '1.0.0'

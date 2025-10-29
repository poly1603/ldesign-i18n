/**
 * @ldesign/i18n-nextjs
 * Next.js integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

// Re-export from React
export * from '@ldesign/i18n-react'

// Server-side utilities
export { getServerI18n, getServerSideI18n } from './server/getServerI18n'
export type { ServerI18nConfig } from './server/getServerI18n'

// Middleware
export { createI18nMiddleware, redirectToLocale } from './middleware/i18nMiddleware'
export type { I18nMiddlewareConfig } from './middleware/i18nMiddleware'

// Export framework-specific integrations
export * from './hooks'
export * from './components'
export * from './utils'

// Version info
export const VERSION = '1.0.0'

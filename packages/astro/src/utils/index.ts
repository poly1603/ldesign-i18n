/**
 * @ldesign/i18n-astro - Utils
 * Utility functions for Astro i18n
 */

import type { APIContext } from 'astro'
import type { I18nInstance } from '@ldesign/i18n-core'

/**
 * Get i18n instance from Astro context
 */
export function getI18n(context: APIContext): I18nInstance {
  if (!context.locals.i18n) {
    throw new Error('i18n not initialized. Did you add the i18n middleware?')
  }
  return context.locals.i18n as I18nInstance
}

/**
 * Get current locale from Astro context
 */
export function getLocale(context: APIContext): string {
  if (!context.locals.locale) {
    throw new Error('Locale not initialized. Did you add the i18n middleware?')
  }
  return context.locals.locale as string
}

/**
 * Create translation function
 */
export function createT(context: APIContext) {
  const i18n = getI18n(context)
  return (key: string, params?: Record<string, any>) => i18n.t(key, params)
}

export type { I18nInstance }

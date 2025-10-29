/**
 * @ldesign/i18n-alpinejs - Plugins
 * Alpine.js plugins for i18n
 */

import type { Alpine } from 'alpinejs'
import { createI18n, type I18nConfig, type I18nInstance } from '@ldesign/i18n-core'

/**
 * Create Alpine.js i18n plugin
 */
export function createI18nPlugin(config: I18nConfig) {
  return (Alpine: Alpine) => {
    const i18n = createI18n(config)

    // Add $t magic helper
    Alpine.magic('t', () => {
      return (key: string, params?: Record<string, any>) => {
        return i18n.t(key, params)
      }
    })

    // Add $i18n magic helper to access full instance
    Alpine.magic('i18n', () => i18n)

    // Add $locale magic helper
    Alpine.magic('locale', () => ({
      get: () => i18n.locale,
      set: async (locale: string) => {
        await i18n.setLocale(locale)
      },
    }))

    // Add x-translate directive
    Alpine.directive('translate', (el, { expression }, { evaluate }) => {
      const key = evaluate(expression)
      el.textContent = i18n.t(key as string)
    })

    // Add x-t directive (shorthand)
    Alpine.directive('t', (el, { expression }, { evaluate }) => {
      const key = evaluate(expression)
      el.textContent = i18n.t(key as string)
    })

    // Store i18n instance globally
    ;(Alpine as any).__i18n = i18n
  }
}

export type { I18nInstance, I18nConfig }

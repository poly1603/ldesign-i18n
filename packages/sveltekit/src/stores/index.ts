/**
 * @ldesign/i18n-sveltekit - Stores
 * Svelte stores for i18n integration
 */

import { writable, derived, get, type Readable } from 'svelte/store'
import { createI18n, type I18nConfig, type I18nInstance } from '@ldesign/i18n-core'

export interface I18nStore extends Readable<I18nInstance> {
  t: (key: string, params?: Record<string, any>) => string
  setLocale: (locale: string) => Promise<void>
  getLocale: () => string
  getSupportedLocales: () => string[]
}

/**
 * Create i18n store for SvelteKit
 */
export function createI18nStore(config: I18nConfig): I18nStore {
  const i18nInstance = createI18n(config)
  const { subscribe, set } = writable<I18nInstance>(i18nInstance)

  return {
    subscribe,
    t: (key: string, params?: Record<string, any>) => {
      const instance = get({ subscribe })
      return instance.t(key, params)
    },
    setLocale: async (locale: string) => {
      await i18nInstance.setLocale(locale)
      set(i18nInstance)
      
      // Update cookie in browser
      if (typeof document !== 'undefined') {
        document.cookie = `locale=${locale}; path=/; max-age=31536000`
      }
    },
    getLocale: () => i18nInstance.locale,
    getSupportedLocales: () => config.supportedLocales,
  }
}

/**
 * Create locale store
 */
export function createLocaleStore(initialLocale: string) {
  return writable<string>(initialLocale)
}

/**
 * Create derived translation function store
 */
export function createTranslateStore(i18nStore: I18nStore) {
  return derived(i18nStore, $i18n => (key: string, params?: Record<string, any>) => {
    return $i18n.t(key, params)
  })
}

export type { I18nInstance, I18nConfig }

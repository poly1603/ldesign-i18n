/**
 * Svelte context utilities for i18n
 */

import { getContext, setContext } from 'svelte'
import type { I18nStore } from '../stores/createI18n'

const I18N_CONTEXT_KEY = Symbol('ldesign-i18n')

/**
 * Set i18n store in context
 */
export function setI18nContext(i18n: I18nStore): void {
  setContext(I18N_CONTEXT_KEY, i18n)
}

/**
 * Get i18n store from context
 */
export function getI18nContext(): I18nStore {
  const i18n = getContext<I18nStore>(I18N_CONTEXT_KEY)

  if (!i18n) {
    throw new Error(
      '[getI18nContext] No i18n store found in context. Make sure to wrap your component with <I18nProvider>.'
    )
  }

  return i18n
}


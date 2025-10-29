/**
 * use:tPlural action for pluralization
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { Action } from 'svelte/action'
import type { I18nStore } from '../stores/createI18n'

interface TPluralActionParams {
  key: string
  count: number
  params?: InterpolationParams
  i18n: I18nStore
}

/**
 * Pluralization action
 * 
 * @example
 * ```svelte
 * <div use:tPlural={{ key: 'items', count: 5, i18n }}>
 * ```
 */
export const tPlural: Action<HTMLElement, TPluralActionParams> = (node, params) => {
  if (!params || !params.i18n) {
    console.warn('[use:tPlural] i18n store is required')
    return {}
  }

  const { i18n } = params

  function updateContent() {
    if (!params) return

    const { key, count, params: interpolationParams } = params

    if (!key) {
      console.warn('[use:tPlural] translation key is required')
      return
    }

    if (count === undefined) {
      console.warn('[use:tPlural] count is required')
      return
    }

    const translated = i18n.tc(key, count, interpolationParams)
    node.textContent = translated
  }

  // Initial update
  updateContent()

  // Subscribe to locale changes
  const unsubscribe = i18n.locale.subscribe(() => {
    updateContent()
  })

  return {
    update(newParams: TPluralActionParams) {
      params = newParams
      updateContent()
    },
    destroy() {
      unsubscribe()
    }
  }
}


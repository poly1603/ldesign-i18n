/**
 * use:t action for basic translation
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { Action } from 'svelte/action'
import type { I18nStore } from '../stores/createI18n'
import { parseBindingValue } from '../utils/helpers'

interface TActionParams {
  key?: string
  params?: InterpolationParams
  locale?: string
  i18n: I18nStore
}

/**
 * Translation action
 * 
 * @example
 * ```svelte
 * <div use:t={{ key: 'hello', i18n }}>
 * ```
 */
export const t: Action<HTMLElement, TActionParams> = (node, params) => {
  if (!params || !params.i18n) {
    console.warn('[use:t] i18n store is required')
    return {}
  }

  const { i18n } = params

  function updateContent() {
    if (!params) return

    const { key, params: interpolationParams, locale } = parseBindingValue(
      params.key
        ? { key: params.key, params: params.params, locale: params.locale }
        : ''
    )

    if (!key) {
      console.warn('[use:t] translation key is required')
      return
    }

    const translated = i18n.t(key, { params: interpolationParams, locale })
    node.textContent = translated
  }

  // Initial update
  updateContent()

  // Subscribe to locale changes
  const unsubscribe = i18n.locale.subscribe(() => {
    updateContent()
  })

  return {
    update(newParams: TActionParams) {
      params = newParams
      updateContent()
    },
    destroy() {
      unsubscribe()
    }
  }
}


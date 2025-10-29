/**
 * use:tHtml action for HTML translation
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { Action } from 'svelte/action'
import type { I18nStore } from '../stores/createI18n'
import { parseBindingValue } from '../utils/helpers'

interface THtmlActionParams {
  key?: string
  params?: InterpolationParams
  locale?: string
  i18n: I18nStore
}

/**
 * HTML translation action
 * 
 * @example
 * ```svelte
 * <div use:tHtml={{ key: 'richContent', i18n }}>
 * ```
 */
export const tHtml: Action<HTMLElement, THtmlActionParams> = (node, params) => {
  if (!params || !params.i18n) {
    console.warn('[use:tHtml] i18n store is required')
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
      console.warn('[use:tHtml] translation key is required')
      return
    }

    const translated = i18n.t(key, { params: interpolationParams, locale })
    node.innerHTML = translated
  }

  // Initial update
  updateContent()

  // Subscribe to locale changes
  const unsubscribe = i18n.locale.subscribe(() => {
    updateContent()
  })

  return {
    update(newParams: THtmlActionParams) {
      params = newParams
      updateContent()
    },
    destroy() {
      unsubscribe()
    }
  }
}


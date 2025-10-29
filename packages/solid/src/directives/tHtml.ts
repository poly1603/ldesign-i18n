/**
 * tHtml directive for Solid
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { I18nInstance } from '@ldesign/i18n-core'

export interface THtmlDirectiveParams {
  key: string
  params?: InterpolationParams
  locale?: string
  i18n: I18nInstance
}

/**
 * HTML translation directive
 * 
 * @example
 * ```tsx
 * <div use:tHtml={{ key: 'richContent', i18n }}>
 * ```
 */
export function tHtml(el: HTMLElement, accessor: () => THtmlDirectiveParams) {
  const params = accessor()

  if (!params || !params.i18n) {
    console.warn('[use:tHtml] i18n instance is required')
    return
  }

  const { i18n, key, params: interpolationParams, locale } = params

  if (!key) {
    console.warn('[use:tHtml] translation key is required')
    return
  }

  const translated = i18n.t(key, { params: interpolationParams, locale })
  el.innerHTML = translated

  // Listen to locale changes
  const unsubscribe = i18n.on('localeChanged', () => {
    const newTranslated = i18n.t(key, { params: interpolationParams, locale })
    el.innerHTML = newTranslated
  })

  // Cleanup
  if (unsubscribe && typeof unsubscribe === 'function') {
    ; (el as any).__i18n_html_unsubscribe = unsubscribe
  }
}

// Cleanup function
if (typeof window !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement && (node as any).__i18n_html_unsubscribe) {
          ; (node as any).__i18n_html_unsubscribe()
          delete (node as any).__i18n_html_unsubscribe
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}


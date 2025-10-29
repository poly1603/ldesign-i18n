/**
 * t directive for Solid
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { I18nInstance } from '@ldesign/i18n-core'

export interface TDirectiveParams {
  key: string
  params?: InterpolationParams
  locale?: string
  i18n: I18nInstance
}

/**
 * Translation directive
 * 
 * @example
 * ```tsx
 * <div use:t={{ key: 'hello', i18n }}>
 * ```
 */
export function t(el: HTMLElement, accessor: () => TDirectiveParams) {
  const params = accessor()

  if (!params || !params.i18n) {
    console.warn('[use:t] i18n instance is required')
    return
  }

  const { i18n, key, params: interpolationParams, locale } = params

  if (!key) {
    console.warn('[use:t] translation key is required')
    return
  }

  const translated = i18n.t(key, { params: interpolationParams, locale })
  el.textContent = translated

  // Listen to locale changes
  const unsubscribe = i18n.on('localeChanged', () => {
    const newTranslated = i18n.t(key, { params: interpolationParams, locale })
    el.textContent = newTranslated
  })

  // Cleanup
  if (unsubscribe && typeof unsubscribe === 'function') {
    ; (el as any).__i18n_unsubscribe = unsubscribe
  }
}

// Cleanup function
if (typeof window !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement && (node as any).__i18n_unsubscribe) {
          ; (node as any).__i18n_unsubscribe()
          delete (node as any).__i18n_unsubscribe
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}


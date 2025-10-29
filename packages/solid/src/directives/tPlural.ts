/**
 * tPlural directive for Solid
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { I18nInstance } from '@ldesign/i18n-core'

export interface TPluralDirectiveParams {
  key: string
  count: number
  params?: InterpolationParams
  i18n: I18nInstance
}

/**
 * Pluralization directive
 * 
 * @example
 * ```tsx
 * <div use:tPlural={{ key: 'items', count: 5, i18n }}>
 * ```
 */
export function tPlural(el: HTMLElement, accessor: () => TPluralDirectiveParams) {
  const params = accessor()

  if (!params || !params.i18n) {
    console.warn('[use:tPlural] i18n instance is required')
    return
  }

  const { i18n, key, count, params: interpolationParams } = params

  if (!key) {
    console.warn('[use:tPlural] translation key is required')
    return
  }

  if (count === undefined) {
    console.warn('[use:tPlural] count is required')
    return
  }

  const translated = i18n.plural(key, count, { params: interpolationParams })
  el.textContent = translated

  // Listen to locale changes
  const unsubscribe = i18n.on('localeChanged', () => {
    const newTranslated = i18n.plural(key, count, { params: interpolationParams })
    el.textContent = newTranslated
  })

  // Cleanup
  if (unsubscribe && typeof unsubscribe === 'function') {
    ; (el as any).__i18n_plural_unsubscribe = unsubscribe
  }
}

// Cleanup function
if (typeof window !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement && (node as any).__i18n_plural_unsubscribe) {
          ; (node as any).__i18n_plural_unsubscribe()
          delete (node as any).__i18n_plural_unsubscribe
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}


/**
 * v-t directive for Vue
 * Basic translation directive
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL, getGlobalI18nInstance } from '../core/constants'

interface VTBinding {
  key?: string
  params?: Record<string, any>
  locale?: string
  tag?: string
}

/**
 * Resolve i18n instance from binding's component instance.
 * Element VNodes don't carry appContext, so we use binding.instance.$.
 */
function resolveI18n(binding: DirectiveBinding): I18nInstance | undefined {
  // 1. Try component instance's appContext
  const instance = binding.instance
  const ctx = instance?.$ ? instance.$.appContext : undefined
  if (ctx) {
    const gp = ctx.app?.config?.globalProperties?.$i18n as I18nInstance | undefined
    if (gp) return gp
    const provided = (ctx as any).provides?.[I18N_SYMBOL as any] as I18nInstance | undefined
    if (provided) return provided
  }
  // 2. Global singleton fallback
  return getGlobalI18nInstance()
}

export const vT: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      console.warn('[v-t] i18n instance not found')
      return
    }

    updateContent(el, binding, i18n)

    // Subscribe to locale changes for reactive updates
    const unsub = i18n.on('localeChanged', () => {
      updateContent(el, binding, i18n)
    })
    ;(el as any)._vt_unsub = unsub
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      return
    }

    updateContent(el, binding, i18n)
  },

  unmounted(el: HTMLElement) {
    if (typeof (el as any)._vt_unsub === 'function') {
      (el as any)._vt_unsub()
      delete (el as any)._vt_unsub
    }
  },
}

function updateContent(
  el: HTMLElement,
  binding: DirectiveBinding<string | VTBinding>,
  i18n: I18nInstance,
) {
  let key: string
  let params: Record<string, any> | undefined
  let locale: string | undefined

  if (typeof binding.value === 'string') {
    key = binding.value
  }
  else if (binding.value && typeof binding.value === 'object') {
    key = binding.value.key || ''
    params = binding.value.params
    locale = binding.value.locale
  }
  else {
    key = ''
  }

  if (!key) {
    console.warn('[v-t] translation key is required')
    return
  }

  const translated = i18n.t(key, { params, locale })
  el.textContent = translated
}

export default vT

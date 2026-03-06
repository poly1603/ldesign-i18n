/**
 * v-t-html directive for Vue
 * HTML content translation directive
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL, getGlobalI18nInstance } from '../core/constants'

interface VTHtmlBinding {
  key?: string
  params?: Record<string, any>
  locale?: string
}

function resolveI18n(binding: DirectiveBinding): I18nInstance | undefined {
  const instance = binding.instance
  const ctx = instance?.$ ? instance.$.appContext : undefined
  if (ctx) {
    const gp = ctx.app?.config?.globalProperties?.$i18n as I18nInstance | undefined
    if (gp) return gp
    const provided = (ctx as any).provides?.[I18N_SYMBOL as any] as I18nInstance | undefined
    if (provided) return provided
  }
  return getGlobalI18nInstance()
}

export const vTHtml: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | VTHtmlBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      console.warn('[v-t-html] i18n instance not found')
      return
    }

    updateHTML(el, binding, i18n)

    const unsub = i18n.on('localeChanged', () => {
      updateHTML(el, binding, i18n)
    })
    ;(el as any)._vt_unsub = unsub
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | VTHtmlBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      return
    }

    updateHTML(el, binding, i18n)
  },

  unmounted(el: HTMLElement) {
    if (typeof (el as any)._vt_unsub === 'function') {
      (el as any)._vt_unsub()
      delete (el as any)._vt_unsub
    }
  },
}

function updateHTML(
  el: HTMLElement,
  binding: DirectiveBinding<string | VTHtmlBinding>,
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
    console.warn('[v-t-html] translation key is required')
    return
  }

  const translated = i18n.t(key, { params, locale })
  el.innerHTML = translated
}

export default vTHtml

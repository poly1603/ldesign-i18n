/**
 * v-t-plural directive for Vue
 * Pluralization directive
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL, getGlobalI18nInstance } from '../core/constants'

interface VTPluralBinding {
  key: string
  count: number
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

export const vTPlural: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<VTPluralBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      return
    }

    updatePlural(el, binding, i18n)

    const unsub = i18n.on('localeChanged', () => {
      updatePlural(el, binding, i18n)
    })
    ;(el as any)._vt_unsub = unsub
  },

  updated(el: HTMLElement, binding: DirectiveBinding<VTPluralBinding>) {
    const i18n = resolveI18n(binding)

    if (!i18n) {
      return
    }

    updatePlural(el, binding, i18n)
  },

  unmounted(el: HTMLElement) {
    if (typeof (el as any)._vt_unsub === 'function') {
      (el as any)._vt_unsub()
      delete (el as any)._vt_unsub
    }
  },
}

function updatePlural(
  el: HTMLElement,
  binding: DirectiveBinding<VTPluralBinding>,
  i18n: I18nInstance,
) {
  if (!binding.value) {
    return
  }

  const { key, count, params, locale } = binding.value

  if (!key) {
    return
  }

  if (count === undefined) {
    return
  }

  const translated = i18n.plural(key, count, { params, locale })
  el.textContent = translated
}

export default vTPlural

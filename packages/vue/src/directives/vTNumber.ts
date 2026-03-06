/**
 * v-t-number directive for Vue
 * Format numbers according to current locale
 *
 * @example
 * ```html
 * <span v-t-number="12345.67" />
 * <span v-t-number="{ value: 99.99, style: 'currency', currency: 'CNY' }" />
 * <span v-t-number="{ value: 0.856, style: 'percent' }" />
 * <span v-t-number="{ value: 1234567, notation: 'compact' }" />
 * ```
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL, getGlobalI18nInstance } from '../core/constants'

interface VTNumberBinding {
  value: number
  style?: 'decimal' | 'currency' | 'percent' | 'unit'
  currency?: string
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
  [key: string]: any
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

function parseBinding(binding: DirectiveBinding): { value: number; options: Intl.NumberFormatOptions } {
  const raw = binding.value
  if (typeof raw === 'number') {
    return { value: raw, options: {} }
  }
  if (raw && typeof raw === 'object') {
    const { value, ...options } = raw as VTNumberBinding
    return { value: value ?? 0, options }
  }
  return { value: 0, options: {} }
}

function updateContent(el: HTMLElement, binding: DirectiveBinding, i18n: I18nInstance): void {
  const { value, options } = parseBinding(binding)
  if (options.style === 'currency' && options.currency) {
    el.textContent = i18n.currency(value, options.currency, options)
  } else {
    el.textContent = i18n.number(value, options)
  }
}

export const vTNumber: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const i18n = resolveI18n(binding)
    if (!i18n) {
      console.warn('[v-t-number] i18n instance not found')
      return
    }
    updateContent(el, binding, i18n)
    const unsub = i18n.on('localeChanged', () => {
      updateContent(el, binding, i18n)
    })
    ;(el as any)._vt_number_unsub = unsub
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const i18n = resolveI18n(binding)
    if (!i18n) return
    updateContent(el, binding, i18n)
  },

  unmounted(el: HTMLElement) {
    if (typeof (el as any)._vt_number_unsub === 'function') {
      (el as any)._vt_number_unsub()
      delete (el as any)._vt_number_unsub
    }
  },
}

export default vTNumber

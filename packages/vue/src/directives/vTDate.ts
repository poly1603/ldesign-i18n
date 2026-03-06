/**
 * v-t-date directive for Vue
 * Format dates according to current locale
 *
 * @example
 * ```html
 * <span v-t-date="new Date()" />
 * <span v-t-date="{ value: myDate, dateStyle: 'full' }" />
 * <span v-t-date="{ value: myDate, timeStyle: 'medium' }" />
 * <span v-t-date="{ value: myDate, dateStyle: 'medium', timeStyle: 'short' }" />
 * ```
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL, getGlobalI18nInstance } from '../core/constants'

interface VTDateBinding {
  value: Date | string | number
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
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

function parseBinding(binding: DirectiveBinding): { value: Date | string | number; options: Intl.DateTimeFormatOptions } {
  const raw = binding.value
  if (raw instanceof Date || typeof raw === 'number' || typeof raw === 'string') {
    return { value: raw, options: { dateStyle: 'medium' } }
  }
  if (raw && typeof raw === 'object') {
    const { value, ...options } = raw as VTDateBinding
    return { value: value ?? new Date(), options: Object.keys(options).length > 0 ? options : { dateStyle: 'medium' } }
  }
  return { value: new Date(), options: { dateStyle: 'medium' } }
}

function updateContent(el: HTMLElement, binding: DirectiveBinding, i18n: I18nInstance): void {
  const { value, options } = parseBinding(binding)
  el.textContent = i18n.date(value, options as Intl.DateTimeFormatOptions)
}

export const vTDate: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const i18n = resolveI18n(binding)
    if (!i18n) {
      console.warn('[v-t-date] i18n instance not found')
      return
    }
    updateContent(el, binding, i18n)
    const unsub = i18n.on('localeChanged', () => {
      updateContent(el, binding, i18n)
    })
    ;(el as any)._vt_date_unsub = unsub
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const i18n = resolveI18n(binding)
    if (!i18n) return
    updateContent(el, binding, i18n)
  },

  unmounted(el: HTMLElement) {
    if (typeof (el as any)._vt_date_unsub === 'function') {
      (el as any)._vt_date_unsub()
      delete (el as any)._vt_date_unsub
    }
  },
}

export default vTDate

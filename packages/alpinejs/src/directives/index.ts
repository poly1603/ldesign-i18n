/**
 * @ldesign/i18n-alpinejs - Directives
 * Alpine.js directive utilities for i18n
 */

import type { Alpine, DirectiveCallback } from 'alpinejs'
import type { I18nInstance } from '@ldesign/i18n-core'

/**
 * Register translate directive
 */
export function registerTranslateDirective(Alpine: Alpine, i18n: I18nInstance) {
  Alpine.directive('translate', ((el, { expression }, { evaluate }) => {
    const key = evaluate(expression)
    el.textContent = i18n.t(key as string)
  }) as DirectiveCallback)
}

/**
 * Register t directive (shorthand)
 */
export function registerTDirective(Alpine: Alpine, i18n: I18nInstance) {
  Alpine.directive('t', ((el, { expression }, { evaluate }) => {
    const key = evaluate(expression)
    el.textContent = i18n.t(key as string)
  }) as DirectiveCallback)
}

/**
 * Register all i18n directives
 */
export function registerI18nDirectives(Alpine: Alpine, i18n: I18nInstance) {
  registerTranslateDirective(Alpine, i18n)
  registerTDirective(Alpine, i18n)
}

export type { I18nInstance }

/**
 * @ldesign/i18n-lit - Directives
 * Lit directives for i18n
 */

import { directive, Directive, type PartInfo } from 'lit/directive.js'
import type { I18nInstance } from '@ldesign/i18n-core'

/**
 * Translate directive class
 */
class TranslateDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo)
  }

  render(i18n: I18nInstance, key: string, params?: Record<string, any>) {
    return i18n.t(key, params)
  }
}

/**
 * Translate directive
 * @example html`<div>${t(i18n, 'hello', { name: 'World' })}</div>`
 */
export const t = directive(TranslateDirective)

/**
 * Translate with HTML directive class
 */
class TranslateHtmlDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo)
  }

  render(i18n: I18nInstance, key: string, params?: Record<string, any>) {
    const translated = i18n.t(key, params)
    // For HTML content, return as-is (Lit will handle escaping)
    return translated
  }
}

/**
 * Translate with HTML directive
 * @example html`<div>${tHtml(i18n, 'richText')}</div>`
 */
export const tHtml = directive(TranslateHtmlDirective)

export type { I18nInstance }

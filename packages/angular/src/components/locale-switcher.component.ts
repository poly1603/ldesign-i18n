/**
 * LocaleSwitcherComponent - Angular component for locale switching
 */

import { Component, Input } from '@angular/core'
import type { Locale } from '@ldesign/i18n-core'
import { I18nService } from '../services/i18n.service'

/**
 * Locale switcher component
 * 
 * @example
 * ```html
 * <ldesign-locale-switcher></ldesign-locale-switcher>
 * <ldesign-locale-switcher [locales]="['zh-CN', 'en']"></ldesign-locale-switcher>
 * ```
 */
@Component({
  selector: 'ldesign-locale-switcher',
  template: `
    <select [value]="i18nService.locale" (change)="onChange($event)">
      <option *ngFor="let loc of displayLocales" [value]="loc">
        {{ getLabel(loc) }}
      </option>
    </select>
  `,
  standalone: true
})
export class LocaleSwitcherComponent {
  @Input() locales?: Locale[]
  @Input() labels?: Record<Locale, string>

  constructor(public i18nService: I18nService) { }

  get displayLocales(): Locale[] {
    return this.locales || this.i18nService.availableLocales
  }

  getLabel(locale: Locale): string {
    if (this.labels && this.labels[locale]) {
      return this.labels[locale]
    }
    return locale
  }

  async onChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement
    const newLocale = target.value as Locale
    await this.i18nService.setLocale(newLocale)
  }
}


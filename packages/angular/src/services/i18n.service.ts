/**
 * I18nService - Angular service for i18n
 */

import { Injectable, OnDestroy } from '@angular/core'
import type { I18nConfig, I18nInstance, InterpolationParams, Locale, MessageKey, TranslateOptions } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

/**
 * I18n Service for Angular
 * 
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-root',
 *   template: `<h1>{{ i18n.t('hello') }}</h1>`
 * })
 * export class AppComponent {
 *   constructor(public i18n: I18nService) {}
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class I18nService implements OnDestroy {
  private instance: I18nInstance
  private localeSubject: BehaviorSubject<Locale>
  private messagesSubject: BehaviorSubject<Record<string, any>>

  /**
   * Observable of current locale
   */
  public locale$: Observable<Locale>

  /**
   * Observable of current messages
   */
  public messages$: Observable<Record<string, any>>

  /**
   * Observable of available locales
   */
  public availableLocales$: Observable<Locale[]>

  constructor() {
    // Create core instance with default config
    this.instance = new OptimizedI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {}
    })

    // Initialize subjects
    this.localeSubject = new BehaviorSubject<Locale>(this.instance.locale || 'en')
    this.messagesSubject = new BehaviorSubject<Record<string, any>>(
      this.instance.getMessages(this.instance.locale) || {}
    )

    // Create observables
    this.locale$ = this.localeSubject.asObservable().pipe(distinctUntilChanged())
    this.messages$ = this.messagesSubject.asObservable()
    this.availableLocales$ = new BehaviorSubject(this.instance.getAvailableLocales()).asObservable()

    // Listen to locale changes
    this.instance.on('localeChanged', ({ locale: newLocale }) => {
      if (newLocale) {
        this.localeSubject.next(newLocale)
        this.messagesSubject.next(this.instance.getMessages(newLocale) || {})
      }
    })
  }

  /**
   * Initialize i18n with config
   */
  async init(config: I18nConfig): Promise<void> {
    // Merge config
    Object.assign(this.instance, new OptimizedI18n(config))

    // Update subjects
    this.localeSubject.next(this.instance.locale || 'en')
    this.messagesSubject.next(this.instance.getMessages(this.instance.locale) || {})

    // Initialize instance
    if (!this.instance.initialized) {
      await this.instance.init()
    }
  }

  /**
   * Get current locale
   */
  get locale(): Locale {
    return this.localeSubject.value
  }

  /**
   * Get fallback locale
   */
  get fallbackLocale(): Locale | Locale[] {
    return this.instance.fallbackLocale || 'en'
  }

  /**
   * Get current messages
   */
  get messages(): Record<string, any> {
    return this.messagesSubject.value
  }

  /**
   * Get available locales
   */
  get availableLocales(): Locale[] {
    return this.instance.getAvailableLocales()
  }

  /**
   * Translation function
   */
  t(key: MessageKey, params?: InterpolationParams | TranslateOptions): string {
    return this.instance.t(key, params)
  }

  /**
   * Check if translation exists
   */
  te(key: MessageKey, locale?: Locale): boolean {
    return this.instance.exists(key, { locale })
  }

  /**
   * Get raw message
   */
  tm(key: MessageKey): any {
    const msgs = this.instance.getMessages(this.locale)
    if (!msgs) return undefined

    const keys = key.split('.')
    let result: any = msgs

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return undefined
      }
    }

    return result
  }

  /**
   * Interpolate raw translation
   */
  rt(message: string, params?: InterpolationParams): string {
    if ('interpolation' in this.instance && this.instance.interpolation) {
      return (this.instance as any).interpolation.interpolate(message, params || {}, this.locale)
    }
    return message
  }

  /**
   * Pluralization
   */
  tc(key: MessageKey, count: number, params?: InterpolationParams): string {
    return this.instance.plural(key, count, { params })
  }

  /**
   * Alias for tc
   */
  tp(key: MessageKey, count: number, params?: InterpolationParams): string {
    return this.tc(key, count, params)
  }

  /**
   * Date formatting
   */
  d(value: Date | number | string, format?: string): string {
    return this.instance.date(value, format ? { dateStyle: format as any } : undefined)
  }

  /**
   * Number formatting
   */
  n(value: number, format?: string): string {
    if (format === 'currency') {
      return this.instance.currency(value, 'USD')
    } else if (format === 'percent') {
      return this.instance.number(value, { style: 'percent' })
    }
    return this.instance.number(value)
  }

  /**
   * Set locale
   */
  async setLocale(locale: Locale): Promise<void> {
    await this.instance.setLocale(locale)
    this.localeSubject.next(locale)
    this.messagesSubject.next(this.instance.getMessages(locale) || {})
  }

  /**
   * Get locale
   */
  getLocale(): Locale {
    return this.locale
  }

  /**
   * Set fallback locale
   */
  setFallbackLocale(locale: Locale | Locale[]): void {
    this.instance.fallbackLocale = locale
  }

  /**
   * Get fallback locale
   */
  getFallbackLocale(): Locale | Locale[] {
    return this.fallbackLocale
  }

  /**
   * Merge locale message
   */
  mergeLocaleMessage(locale: Locale, messages: Record<string, any>): void {
    this.instance.mergeMessages(locale, messages)
    if (locale === this.locale) {
      this.messagesSubject.next(this.instance.getMessages(locale) || {})
    }
  }

  /**
   * Get locale message
   */
  getLocaleMessage(locale: Locale): Record<string, any> {
    return this.instance.getMessages(locale) || {}
  }

  /**
   * Set locale message
   */
  setLocaleMessage(locale: Locale, messages: Record<string, any>): void {
    this.instance.setMessages(locale, messages)
    if (locale === this.locale) {
      this.messagesSubject.next(messages)
    }
  }

  /**
   * Get locale as Observable
   */
  getLocale$(): Observable<Locale> {
    return this.locale$
  }

  /**
   * Get messages as Observable
   */
  getMessages$(): Observable<Record<string, any>> {
    return this.messages$
  }

  /**
   * Get translation as Observable
   */
  t$(key: MessageKey, params?: InterpolationParams | TranslateOptions): Observable<string> {
    return this.locale$.pipe(
      map(() => this.t(key, params))
    )
  }

  /**
   * Cleanup
   */
  ngOnDestroy(): void {
    if (this.instance.destroy) {
      this.instance.destroy()
    }
    this.localeSubject.complete()
    this.messagesSubject.complete()
  }
}


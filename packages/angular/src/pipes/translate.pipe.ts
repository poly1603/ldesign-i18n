/**
 * TranslatePipe - Angular pipe for translation
 */

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core'
import type { InterpolationParams } from '@ldesign/i18n-core'
import { Subscription } from 'rxjs'
import { I18nService } from '../services/i18n.service'

/**
 * Translate pipe
 * 
 * @example
 * ```html
 * <h1>{{ 'hello' | translate }}</h1>
 * <p>{{ 'welcome' | translate: { name: 'User' } }}</p>
 * ```
 */
@Pipe({
  name: 'translate',
  pure: false // Make it impure to react to locale changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription
  private lastKey?: string
  private lastParams?: InterpolationParams
  private lastValue?: string

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to locale changes
    this.subscription = this.i18nService.locale$.subscribe(() => {
      // Mark for check when locale changes
      if (this.lastKey) {
        this.lastValue = this.i18nService.t(this.lastKey, this.lastParams)
        this.cdr.markForCheck()
      }
    })
  }

  transform(key: string, params?: InterpolationParams): string {
    if (!key) return ''

    // Cache the key and params for locale changes
    this.lastKey = key
    this.lastParams = params

    // Translate
    this.lastValue = this.i18nService.t(key, params)
    return this.lastValue
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}


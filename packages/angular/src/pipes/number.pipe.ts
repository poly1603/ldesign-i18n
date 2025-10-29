/**
 * I18nNumberPipe - Angular pipe for number formatting
 */

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core'
import { Subscription } from 'rxjs'
import { I18nService } from '../services/i18n.service'

/**
 * I18n Number pipe
 * 
 * @example
 * ```html
 * <p>{{ 1234.56 | i18nNumber }}</p>
 * <p>{{ 99.99 | i18nNumber: 'currency' }}</p>
 * <p>{{ 0.85 | i18nNumber: 'percent' }}</p>
 * ```
 */
@Pipe({
  name: 'i18nNumber',
  pure: false
})
export class I18nNumberPipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.i18nService.locale$.subscribe(() => {
      this.cdr.markForCheck()
    })
  }

  transform(value: number, format?: string): string {
    if (value === null || value === undefined) return ''
    return this.i18nService.n(value, format)
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}


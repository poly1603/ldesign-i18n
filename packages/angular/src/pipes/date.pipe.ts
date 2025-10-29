/**
 * I18nDatePipe - Angular pipe for date formatting
 */

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core'
import { Subscription } from 'rxjs'
import { I18nService } from '../services/i18n.service'

/**
 * I18n Date pipe
 * 
 * @example
 * ```html
 * <p>{{ today | i18nDate }}</p>
 * <p>{{ today | i18nDate: 'long' }}</p>
 * ```
 */
@Pipe({
  name: 'i18nDate',
  pure: false
})
export class I18nDatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.i18nService.locale$.subscribe(() => {
      this.cdr.markForCheck()
    })
  }

  transform(value: Date | number | string, format?: string): string {
    if (!value) return ''
    return this.i18nService.d(value, format)
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}


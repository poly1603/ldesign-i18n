/**
 * PluralPipe - Angular pipe for pluralization
 */

import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core'
import type { InterpolationParams } from '@ldesign/i18n-core'
import { Subscription } from 'rxjs'
import { I18nService } from '../services/i18n.service'

/**
 * Plural pipe
 * 
 * @example
 * ```html
 * <p>{{ 'items' | plural: 5 }}</p>
 * <p>{{ 'books' | plural: count: { author: 'John' } }}</p>
 * ```
 */
@Pipe({
  name: 'plural',
  pure: false
})
export class PluralPipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription

  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.i18nService.locale$.subscribe(() => {
      this.cdr.markForCheck()
    })
  }

  transform(key: string, count: number, params?: InterpolationParams): string {
    if (!key || count === null || count === undefined) return ''
    return this.i18nService.tc(key, count, params)
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}


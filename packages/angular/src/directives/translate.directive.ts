/**
 * TranslateDirective - Angular directive for translation
 */

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core'
import type { InterpolationParams } from '@ldesign/i18n-core'
import { Subscription } from 'rxjs'
import { I18nService } from '../services/i18n.service'

/**
 * Translate directive
 * 
 * @example
 * ```html
 * <div i18nTranslate="hello"></div>
 * <div [i18nTranslate]="'welcome'" [i18nTranslateParams]="{ name: 'User' }"></div>
 * ```
 */
@Directive({
  selector: '[i18nTranslate]'
})
export class TranslateDirective implements OnInit, OnDestroy {
  @Input() i18nTranslate?: string
  @Input() i18nTranslateParams?: InterpolationParams

  private subscription?: Subscription

  constructor(
    private el: ElementRef,
    private i18nService: I18nService
  ) { }

  ngOnInit(): void {
    // Subscribe to locale changes
    this.subscription = this.i18nService.locale$.subscribe(() => {
      this.updateContent()
    })

    // Initial update
    this.updateContent()
  }

  ngOnChanges(): void {
    this.updateContent()
  }

  private updateContent(): void {
    if (!this.i18nTranslate) {
      console.warn('[i18nTranslate] Translation key is required')
      return
    }

    const translated = this.i18nService.t(this.i18nTranslate, this.i18nTranslateParams)
    this.el.nativeElement.textContent = translated
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}


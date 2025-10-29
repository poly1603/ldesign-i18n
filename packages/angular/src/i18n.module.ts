/**
 * I18nModule - Angular module for i18n
 */

import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import type { I18nConfig } from '@ldesign/i18n-core'
import { LocaleSwitcherComponent } from './components/locale-switcher.component'
import { I18nDatePipe } from './pipes/date.pipe'
import { I18nNumberPipe } from './pipes/number.pipe'
import { PluralPipe } from './pipes/plural.pipe'
import { TranslatePipe } from './pipes/translate.pipe'
import { TranslateDirective } from './directives/translate.directive'
import { I18nService } from './services/i18n.service'

/**
 * I18n Module
 * 
 * @example
 * ```typescript
 * // app.module.ts
 * import { I18nModule } from '@ldesign/i18n-angular'
 * 
 * @NgModule({
 *   imports: [
 *     I18nModule.forRoot({
 *       locale: 'zh-CN',
 *       messages: { ... }
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  imports: [CommonModule],
  declarations: [
    TranslatePipe,
    I18nDatePipe,
    I18nNumberPipe,
    PluralPipe,
    TranslateDirective,
    LocaleSwitcherComponent
  ],
  exports: [
    TranslatePipe,
    I18nDatePipe,
    I18nNumberPipe,
    PluralPipe,
    TranslateDirective,
    LocaleSwitcherComponent
  ]
})
export class I18nModule {
  constructor(private i18nService: I18nService) { }

  /**
   * Configure i18n module with root config
   */
  static forRoot(config?: I18nConfig): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        I18nService,
        {
          provide: 'I18N_CONFIG',
          useValue: config
        }
      ]
    }
  }

  /**
   * Configure i18n module for child modules
   */
  static forChild(): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: []
    }
  }

  /**
   * Initialize i18n on module load
   */
  ngDoBootstrap(): void {
    const config = (I18nModule as any).config
    if (config) {
      this.i18nService.init(config).catch((error) => {
        console.error('[I18nModule] Failed to initialize i18n:', error)
      })
    }
  }
}


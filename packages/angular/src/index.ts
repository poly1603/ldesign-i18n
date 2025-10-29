/**
 * @ldesign/i18n-angular
 * Angular integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== Module ====================

export { I18nModule } from './i18n.module'

// ==================== Services ====================

export { I18nService } from './services/i18n.service'

// ==================== Pipes ====================

export { TranslatePipe } from './pipes/translate.pipe'
export { I18nDatePipe } from './pipes/date.pipe'
export { I18nNumberPipe } from './pipes/number.pipe'
export { PluralPipe } from './pipes/plural.pipe'

// ==================== Directives ====================

export { TranslateDirective } from './directives/translate.directive'

// ==================== Components ====================

export { LocaleSwitcherComponent } from './components/locale-switcher.component'

// ==================== Types ====================

export * from './types'

// ==================== Re-export core ====================

export { OptimizedI18n, I18n } from '@ldesign/i18n-core'
export type {
  I18nConfig,
  I18nInstance,
  Locale,
  MessageKey,
  Messages,
  InterpolationParams,
  TranslateOptions,
} from '@ldesign/i18n-core'


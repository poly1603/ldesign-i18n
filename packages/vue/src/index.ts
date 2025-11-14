/**
 * @ldesign/i18n-vue
 * Vue 3 integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== 插件 ====================

// Vue Plugin - 用于标准 Vue 应用
export { createI18nPlugin, LDesignI18nPlugin } from './plugin'
export type { I18nPluginOptions } from './plugin'

// Engine Plugin - 用于 LDesign Engine
export {
  createI18nEnginePlugin,
  createDefaultI18nEnginePlugin,
  i18nPlugin,
} from './plugins'

export type {
  I18nEnginePluginOptions,
} from './plugins'

// ==================== 组件 (TSX) ====================

export { default as I18nProvider } from './i18n-provider'
export { default as I18nText } from './i18n-text'
export { default as I18nTranslate } from './i18n-translate'
export { default as LanguageSwitcher } from './language-switcher'

// ==================== 组合式 API ====================

export { useI18n } from './composables/useI18n'
export { useI18nAsync } from './composables/useI18nAsync'
export { useLocale } from './composables/useLocale'
export { useTranslation } from './composables/useTranslation'
export type { UseI18nOptions, UseI18nReturn } from './composables/useI18n'

// ==================== 指令 ====================

export { vT } from './directives/vT'
export { vTHtml } from './directives/vTHtml'
export { vTPlural } from './directives/vTPlural'

// ==================== 工具函数 ====================

export { createI18n } from './utils/createI18n'
export { defineI18nConfig } from './utils/defineI18nConfig'
export { loadLocaleMessages } from './utils/loadLocaleMessages'

// ==================== 类型 ====================

export * from './types'

// ==================== 常量 ====================

export { I18N_SYMBOL } from './constants'

// ==================== 快速安装 ====================

import type { App } from 'vue'
import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18N_SYMBOL } from './constants'
import { createI18nPlugin } from './plugin'

/**
 * 快速设置函数，用于 Vue 应用
 */
export function setupI18n(app: App, config?: I18nConfig): I18nInstance {
  const i18n = new OptimizedI18n(config)

  // 安装为插件
  app.use(createI18nPlugin(i18n))

  // 全局提供
  app.provide(I18N_SYMBOL, i18n)

  return i18n
}

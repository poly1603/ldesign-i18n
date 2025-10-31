/**
 * @ldesign/i18n-vue
 * Vue 3 integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== 插件 ====================

export { createI18nPlugin, LDesignI18nPlugin } from './plugin'
export type { I18nPluginOptions } from './plugin'

// ==================== 组件 ====================

export { default as I18nProvider } from './components/I18nProvider.vue'
export { default as I18nText } from './components/I18nText.vue'
export { default as I18nTranslate } from './components/I18nTranslate.vue'
// LocaleSwitcher requires @ldesign/shared dependencies, export it separately if needed
// export { default as LocaleSwitcher } from './components/LocaleSwitcher.vue'
export * from './components'

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

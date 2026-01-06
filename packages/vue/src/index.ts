/**
 * @ldesign/i18n-vue
 * Vue 3 integration for @ldesign/i18n
 * 
 * @version 4.0.0
 * @author LDesign Team
 * @license MIT
 */

// ==================== 核心模块 ====================

export * from './core'

// ==================== 插件 ====================

export * from './plugins'

// ==================== 组件 ====================

export * from './components'

// ==================== 组合式 API ====================

export * from './composables'

// ==================== 指令 ====================

export * from './directives'

// ==================== 工具函数 ====================

export * from './utils'

// ==================== DevTools ====================

export * from './devtools'

// ==================== 快速安装 ====================

import type { App } from 'vue'
import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18N_SYMBOL } from './core'
import { createI18nPlugin } from './plugins'

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

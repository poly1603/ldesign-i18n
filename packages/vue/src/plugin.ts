/**
 * Vue 3 I18n Plugin
 */

import type { App, Plugin } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import * as components from './components'
import { I18N_SYMBOL } from './constants'
import { vT, vTHtml, vTPlural } from './directives'

export interface I18nPluginOptions {
  globalProperties?: boolean
  directives?: boolean
  components?: boolean
  defaultLocale?: string
}

export function createI18nPlugin(
  i18n: I18nInstance,
  options: I18nPluginOptions = {},
): Plugin {
  const {
    globalProperties = true,
    directives = true,
    components: registerComponents = true,
  } = options

  return {
    install(app: App) {
      console.log('[createI18nPlugin] install() called')
      console.log('[createI18nPlugin] I18N_SYMBOL:', I18N_SYMBOL)
      console.log('[createI18nPlugin] Symbol description:', I18N_SYMBOL.description)
      console.log('[createI18nPlugin] Symbol toString:', I18N_SYMBOL.toString())
      console.log('[createI18nPlugin] i18n instance:', i18n)

      // ========== 样式注入 ==========
      // 动态注入组件样式，确保在所有环境下（有/无 alias、dev/build）样式都能正常加载
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        const styleId = 'ldesign-i18n-vue-styles'
        // 检查是否已经注入，避免重复
        if (!document.getElementById(styleId)) {
          try {
            const link = document.createElement('link')
            link.id = styleId
            link.rel = 'stylesheet'
            // 使用 import.meta.url 计算 CSS 文件的绝对路径
            // 注意：i18n 的样式文件是 plugin.css 而不是 index.css
            const cssUrl = new URL('./plugin.css', import.meta.url).href
            link.href = cssUrl
            document.head.appendChild(link)
            console.log('[createI18nPlugin] Styles injected:', cssUrl)
          }
          catch (error) {
            console.warn('[createI18nPlugin] Failed to inject styles:', error)
          }
        }
        else {
          console.log('[createI18nPlugin] Styles already injected, skipping')
        }
      }

      // Provide i18n instance
      app.provide(I18N_SYMBOL, i18n)
      console.log('[createI18nPlugin] app.provide() completed with symbol:', I18N_SYMBOL)

      // Add global properties
      if (globalProperties) {
        app.config.globalProperties.$i18n = i18n
        app.config.globalProperties.$t = i18n.t.bind(i18n)
        app.config.globalProperties.$locale = {
          get: () => i18n.locale,
          set: (locale: string) => { i18n.locale = locale },
        }
        console.log('[createI18nPlugin] Global properties added')
      }

      // Register directives
      if (directives) {
        app.directive('t', vT)
        app.directive('t-html', vTHtml)
        app.directive('t-plural', vTPlural)
      }

      // Register components
      if (registerComponents) {
        Object.entries(components).forEach(([name, component]) => {
          if (name !== 'default' && component) {
            app.component(name, component)
          }
        })
      }

      // Initialize i18n
      if (!i18n.initialized) {
        i18n.init().catch(console.error)
      }
    },
  }
}

export class LDesignI18nPlugin {
  private i18n: I18nInstance
  private options: I18nPluginOptions

  constructor(i18n: I18nInstance, options: I18nPluginOptions = {}) {
    this.i18n = i18n
    this.options = options
  }

  install(app: App) {
    createI18nPlugin(this.i18n, this.options).install(app)
  }
}

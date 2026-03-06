/**
 * Engine 模式入口
 *
 * 使用 @ldesign/engine-vue3 的 VueEngine + createI18nEnginePlugin
 */
import { createVueEngine } from '@ldesign/engine-vue3'
import { createI18nEnginePlugin } from '@ldesign/i18n-vue'
import App from './App.vue'
import { messages } from './locales'

// 创建 i18n 插件
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages,
  persistence: {
    enabled: true,
    key: 'i18n-playground-locale',
    storage: 'localStorage',
  },
  debug: true,
  onLocaleChange(locale, oldLocale) {
    console.log(`[Playground] Locale changed: ${oldLocale} -> ${locale}`)
  },
  onReady(ctx) {
    console.log('[Playground] I18n ready!', {
      locale: ctx.getLocale(),
      availableLocales: ctx.getAvailableLocales(),
    })
  },
})

// 创建引擎并挂载
const engine = createVueEngine({
  name: 'I18n Playground',
  debug: true,
  app: {
    rootComponent: App,
  },
  plugins: [i18nPlugin as any],
})

engine.mount('#app')

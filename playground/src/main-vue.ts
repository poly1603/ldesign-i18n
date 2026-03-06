/**
 * 原生 Vue 模式入口
 *
 * 直接使用 createI18nPlugin + createI18n，无需 Engine
 */
import { createApp } from 'vue'
import { createI18n } from '@ldesign/i18n-core'
import { createI18nPlugin } from '@ldesign/i18n-vue'
import App from './App.vue'
import { messages } from './locales'

// 1. 创建 i18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages,
})

// 2. 创建 Vue 应用
const app = createApp(App)

// 3. 安装 i18n 插件
app.use(createI18nPlugin(i18n))

// 4. 挂载
app.mount('#app')

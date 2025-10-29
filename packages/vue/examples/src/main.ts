import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n-vue'
import App from './App.vue'

const app = createApp(App)

// 安装 i18n 插件
app.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！',
      items: '个项目 | 个项目',
      about: '关于',
      features: {
        title: '功能特性',
        composables: '组合式 API',
        components: '组件系统',
        directives: '指令支持'
      }
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      items: 'item | items',
      about: 'About',
      features: {
        title: 'Features',
        composables: 'Composables API',
        components: 'Component System',
        directives: 'Directive Support'
      }
    },
    'ja': {
      hello: 'こんにちは',
      welcome: 'ようこそ {name}！',
      items: 'アイテム | アイテム',
      about: '私たちについて',
      features: {
        title: '機能',
        composables: 'コンポーザブル API',
        components: 'コンポーネントシステム',
        directives: 'ディレクティブサポート'
      }
    }
  }
}))

app.mount('#app')


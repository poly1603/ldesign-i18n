import React from 'react'
import ReactDOM from 'react-dom/client'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18nProvider } from '@ldesign/i18n-react'
import App from './App'
import './index.css'

const i18n = new OptimizedI18n({
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
        hooks: 'React Hooks',
        components: '组件系统',
        hoc: '高阶组件'
      }
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      items: 'item | items',
      about: 'About',
      features: {
        title: 'Features',
        hooks: 'React Hooks',
        components: 'Component System',
        hoc: 'Higher Order Component'
      }
    },
    'ja': {
      hello: 'こんにちは',
      welcome: 'ようこそ {name}！',
      items: 'アイテム | アイテム',
      about: '私たちについて',
      features: {
        title: '機能',
        hooks: 'React フック',
        components: 'コンポーネントシステム',
        hoc: '高階コンポーネント'
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>
)


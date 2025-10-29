import { Component, createSignal } from 'solid-js'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18nProvider, useI18n, Trans } from '@ldesign/i18n-solid'
import { t, tPlural } from '@ldesign/i18n-solid'

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
        signals: 'Solid Signals',
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
        signals: 'Solid Signals',
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
        signals: 'Solid シグナル',
        components: 'コンポーネントシステム',
        directives: 'ディレクティブサポート'
      }
    }
  }
})

const AppContent: Component = () => {
  const { t: translate, tc, d, n, locale, setLocale } = useI18n()
  const [userName, setUserName] = createSignal('Solid')
  const [itemCount, setItemCount] = createSignal(5)

  return (
    <div class="app">
      <header class="header">
        <h1>@ldesign/i18n-solid 功能演示</h1>
        <div class="locale-switcher">
          <button onClick={() => setLocale('zh-CN')}>中文</button>
          <button onClick={() => setLocale('en')}>English</button>
          <button onClick={() => setLocale('ja')}>日本語</button>
          <span class="current-locale">当前: {locale()}</span>
        </div>
      </header>

      <main class="content">
        <section class="demo-section">
          <h2>1. 基础翻译 (useI18n)</h2>
          <div class="demo-item">
            <p><strong>t('hello'):</strong> {translate('hello')}</p>
            <p><strong>t('about'):</strong> {translate('about')}</p>
          </div>
        </section>

        <section class="demo-section">
          <h2>2. 参数插值</h2>
          <div class="demo-item">
            <input
              value={userName()}
              onInput={(e) => setUserName(e.currentTarget.value)}
              placeholder="输入名字"
            />
            <p>{translate('welcome', { name: userName() })}</p>
          </div>
        </section>

        <section class="demo-section">
          <h2>3. Trans 组件</h2>
          <div class="demo-item">
            <Trans keypath="welcome" params={{ name: userName() }} />
          </div>
        </section>

        <section class="demo-section">
          <h2>4. 复数化</h2>
          <div class="demo-item">
            <div class="controls">
              <button onClick={() => setItemCount(Math.max(0, itemCount() - 1))}>-</button>
              <span class="count">{itemCount()}</span>
              <button onClick={() => setItemCount(itemCount() + 1)}>+</button>
            </div>
            <p>{itemCount()} {tc('items', itemCount())}</p>
          </div>
        </section>

        <section class="demo-section">
          <h2>5. Directives</h2>
          <div class="demo-item">
            <div use:t={{ key: 'hello', i18n }}></div>
            <div use:tPlural={{ key: 'items', count: itemCount(), i18n }}></div>
          </div>
        </section>

        <section class="demo-section">
          <h2>6. 格式化</h2>
          <div class="demo-item">
            <p>日期: {d(new Date(), 'long')}</p>
            <p>数字: {n(1234567.89)}</p>
            <p>货币: {n(99.99, 'currency')}</p>
          </div>
        </section>

        <section class="demo-section">
          <h2>7. 功能特性</h2>
          <div class="demo-item">
            <ul>
              <li>{translate('features.signals')}</li>
              <li>{translate('features.components')}</li>
              <li>{translate('features.directives')}</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

const App: Component = () => {
  return (
    <I18nProvider i18n={i18n}>
      <AppContent />
    </I18nProvider>
  )
}

export default App


<script lang="ts">
  import { createI18n, I18nProvider, Trans } from '@ldesign/i18n-svelte'
  import { t, tPlural } from '@ldesign/i18n-svelte'

  const i18n = createI18n({
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
          stores: 'Svelte Stores',
          components: '组件系统',
          actions: 'Actions 支持'
        }
      },
      'en': {
        hello: 'Hello',
        welcome: 'Welcome {name}!',
        items: 'item | items',
        about: 'About',
        features: {
          title: 'Features',
          stores: 'Svelte Stores',
          components: 'Component System',
          actions: 'Actions Support'
        }
      },
      'ja': {
        hello: 'こんにちは',
        welcome: 'ようこそ {name}！',
        items: 'アイテム | アイテム',
        about: '私たちについて',
        features: {
          title: '機能',
          stores: 'Svelte ストア',
          components: 'コンポーネントシステム',
          actions: 'Actions サポート'
        }
      }
    }
  })

  let userName = 'Svelte'
  let itemCount = 5

  $: currentLocale = $i18n.locale
</script>

<I18nProvider {i18n}>
  <div class="app">
    <header class="header">
      <h1>@ldesign/i18n-svelte 功能演示</h1>
      <div class="locale-switcher">
        <button on:click={() => i18n.setLocale('zh-CN')}>中文</button>
        <button on:click={() => i18n.setLocale('en')}>English</button>
        <button on:click={() => i18n.setLocale('ja')}>日本語</button>
        <span class="current-locale">当前: {currentLocale}</span>
      </div>
    </header>

    <main class="content">
      <section class="demo-section">
        <h2>1. 基础翻译 (Store)</h2>
        <div class="demo-item">
          <p><strong>i18n.t('hello'):</strong> {i18n.t('hello')}</p>
          <p><strong>i18n.t('about'):</strong> {i18n.t('about')}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>2. 参数插值</h2>
        <div class="demo-item">
          <input bind:value={userName} placeholder="输入名字" />
          <p>{i18n.t('welcome', { name: userName })}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>3. Trans 组件</h2>
        <div class="demo-item">
          <Trans keypath="welcome" params={{ name: userName }} />
        </div>
      </section>

      <section class="demo-section">
        <h2>4. 复数化</h2>
        <div class="demo-item">
          <div class="controls">
            <button on:click={() => itemCount = Math.max(0, itemCount - 1)}>-</button>
            <span class="count">{itemCount}</span>
            <button on:click={() => itemCount++}>+</button>
          </div>
          <p>{itemCount} {i18n.tc('items', itemCount)}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>5. Actions</h2>
        <div class="demo-item">
          <div use:t={{ key: 'hello', i18n }}></div>
          <div use:tPlural={{ key: 'items', count: itemCount, i18n }}></div>
        </div>
      </section>

      <section class="demo-section">
        <h2>6. 格式化</h2>
        <div class="demo-item">
          <p>日期: {i18n.d(new Date(), 'long')}</p>
          <p>数字: {i18n.n(1234567.89)}</p>
          <p>货币: {i18n.n(99.99, 'currency')}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>7. 功能特性</h2>
        <div class="demo-item">
          <ul>
            <li>{i18n.t('features.stores')}</li>
            <li>{i18n.t('features.components')}</li>
            <li>{i18n.t('features.actions')}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</I18nProvider>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #ff3e00 0%, #ff8a00 100%);
    padding: 2rem;
  }

  .header {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .header h1 {
    margin: 0 0 1rem 0;
    color: #ff3e00;
  }

  .locale-switcher {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .locale-switcher button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .locale-switcher button:hover {
    background: #ff8a00;
  }

  .current-locale {
    margin-left: 1rem;
    font-weight: 600;
    color: #ff3e00;
  }

  .content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .demo-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .demo-section h2 {
    margin: 0 0 1rem 0;
    color: #333;
    border-bottom: 2px solid #ff3e00;
    padding-bottom: 0.5rem;
  }

  .demo-item {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .demo-item p {
    margin: 0.5rem 0;
  }

  input {
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    width: 200px;
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .count {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ff3e00;
    min-width: 3rem;
    text-align: center;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.5rem 0;
  }
</style>


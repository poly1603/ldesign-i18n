import { useState } from 'react'
import { useI18n, Trans } from '@ldesign/i18n-react'

function App() {
  const { t, tc, d, n, locale, setLocale } = useI18n()
  const [userName, setUserName] = useState('React')
  const [itemCount, setItemCount] = useState(5)

  return (
    <div className="app">
      <header className="header">
        <h1>@ldesign/i18n-react 功能演示</h1>
        <div className="locale-switcher">
          <button onClick={() => setLocale('zh-CN')}>中文</button>
          <button onClick={() => setLocale('en')}>English</button>
          <button onClick={() => setLocale('ja')}>日本語</button>
          <span className="current-locale">当前: {locale}</span>
        </div>
      </header>

      <main className="content">
        <section className="demo-section">
          <h2>1. 基础翻译 (useI18n)</h2>
          <div className="demo-item">
            <p><strong>t('hello'):</strong> {t('hello')}</p>
            <p><strong>t('about'):</strong> {t('about')}</p>
          </div>
        </section>

        <section className="demo-section">
          <h2>2. 参数插值</h2>
          <div className="demo-item">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="输入名字"
            />
            <p>{t('welcome', { name: userName })}</p>
          </div>
        </section>

        <section className="demo-section">
          <h2>3. Trans 组件</h2>
          <div className="demo-item">
            <Trans keypath="welcome" params={{ name: userName }} />
          </div>
        </section>

        <section className="demo-section">
          <h2>4. 复数化</h2>
          <div className="demo-item">
            <div className="controls">
              <button onClick={() => setItemCount(Math.max(0, itemCount - 1))}>-</button>
              <span className="count">{itemCount}</span>
              <button onClick={() => setItemCount(itemCount + 1)}>+</button>
            </div>
            <p>{itemCount} {tc('items', itemCount)}</p>
          </div>
        </section>

        <section className="demo-section">
          <h2>5. 格式化</h2>
          <div className="demo-item">
            <p>日期: {d(new Date(), 'long')}</p>
            <p>数字: {n(1234567.89)}</p>
            <p>货币: {n(99.99, 'currency')}</p>
          </div>
        </section>

        <section className="demo-section">
          <h2>6. 功能特性</h2>
          <div className="demo-item">
            <ul>
              <li>{t('features.hooks')}</li>
              <li>{t('features.components')}</li>
              <li>{t('features.hoc')}</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App


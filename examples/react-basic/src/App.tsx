import { useState } from 'react'
import { useI18n, useLocale } from '@ldesign/i18n-react'
import './App.css'

function App() {
  const { t } = useI18n()
  const { locale, setLocale } = useLocale()
  const [count, setCount] = useState(0)

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>{t('welcome')}</h1>
        <p>{t('description')}</p>
      </header>

      <main className="main">
        <section className="features">
          <h2>{t('features.title')}</h2>
          <ul>
            <li>✅ {t('features.performance')}</li>
            <li>✅ {t('features.typescript')}</li>
            <li>✅ {t('features.frameworks')}</li>
            <li>✅ {t('features.cache')}</li>
          </ul>
        </section>

        <section className="counter">
          <h2>{t('counter.title')}</h2>
          <p className="count">{t('counter.count', { count })}</p>
          <div className="buttons">
            <button onClick={() => setCount(count + 1)}>
              {t('counter.increment')}
            </button>
            <button onClick={() => setCount(count - 1)}>
              {t('counter.decrement')}
            </button>
            <button onClick={() => setCount(0)}>
              {t('counter.reset')}
            </button>
          </div>
        </section>

        <section className="language">
          <h2>{t('language.title')}</h2>
          <p>{t('language.current', { lang: locale })}</p>
          <button onClick={toggleLanguage}>
            {t('language.switch')}
          </button>
        </section>
      </main>

      <footer className="footer">
        <p>Powered by @ldesign/i18n v4.0.0</p>
      </footer>
    </div>
  )
}

export default App

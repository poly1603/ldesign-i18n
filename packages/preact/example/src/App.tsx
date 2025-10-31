import { useState } from 'preact/hooks'
import { I18nProvider, useI18n } from '@ldesign/i18n-preact'
import { i18n } from './i18n'

function Demo() {
  const { t, locale, setLocale } = useI18n()
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
          {t('switchLanguage')}
        </button>
        <span style={{ marginLeft: '1rem' }}>
          Current: {locale}
        </span>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>{t('counter')}: {count}</h2>
        <button onClick={() => setCount(count + 1)}>
          {t('increment')}
        </button>
        <button onClick={() => setCount(count - 1)} style={{ marginLeft: '1rem' }}>
          {t('decrement')}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Demo />
    </I18nProvider>
  )
}

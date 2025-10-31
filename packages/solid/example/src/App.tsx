import { createSignal } from 'solid-js'
import { I18nProvider, useI18n } from '@ldesign/i18n-solid'
import { i18n } from './i18n'

function Demo() {
  const { t, locale, setLocale } = useI18n()
  const [count, setCount] = createSignal(0)

  return (
    <div style={{ padding: '2rem', 'font-family': 'system-ui, sans-serif' }}>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
      
      <div style={{ 'margin-top': '2rem' }}>
        <button onClick={() => setLocale(locale() === 'en' ? 'zh' : 'en')}>
          {t('switchLanguage')}
        </button>
        <span style={{ 'margin-left': '1rem' }}>
          Current: {locale()}
        </span>
      </div>

      <div style={{ 'margin-top': '2rem' }}>
        <h2>{t('counter')}: {count()}</h2>
        <button onClick={() => setCount(count() + 1)}>
          {t('increment')}
        </button>
        <button onClick={() => setCount(count() - 1)} style={{ 'margin-left': '1rem' }}>
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

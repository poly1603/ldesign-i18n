import Alpine from 'alpinejs'
import { createI18n } from '@ldesign/i18n-alpinejs'
import en from './locales/en.json'
import zh from './locales/zh.json'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, zh },
})

Alpine.data('app', () => ({
  count: 0,
  locale: i18n.locale,
  t(key: string) {
    return i18n.t(key)
  },
  toggleLanguage() {
    const newLocale = this.locale === 'en' ? 'zh' : 'en'
    i18n.setLocale(newLocale)
    this.locale = newLocale
  }
}))

Alpine.start()
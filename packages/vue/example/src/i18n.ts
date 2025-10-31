import { createI18n } from '@ldesign/i18n-vue'
import en from './locales/en.json'
import zh from './locales/zh.json'

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
})

import { createI18n } from '@ldesign/i18n-nuxtjs'
import en from '../locales/en.json'
import zh from '../locales/zh.json'

export const useI18nSetup = () => {
  return createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en,
      zh,
    },
  })
}

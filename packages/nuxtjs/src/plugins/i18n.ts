import { defineNuxtPlugin } from '#app'
import type { I18nInstance } from '@ldesign/i18n-core'

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public.i18n as any

  // Get i18n instance from nuxt context
  const i18n = nuxtApp.payload.i18n as I18nInstance

  if (!i18n) {
    throw new Error('i18n instance not found. Make sure to configure i18n in nuxt.config.ts')
  }

  // Provide i18n instance
  nuxtApp.provide('i18n', i18n)

  // Auto-import composables
  return {
    provide: {
      i18n,
      t: i18n.t.bind(i18n),
      locale: i18n.locale,
    },
  }
})

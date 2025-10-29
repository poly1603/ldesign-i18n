import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { createI18n } from '@ldesign/i18n-core'
import type { I18nConfig } from '@ldesign/i18n-core'

export interface ModuleOptions extends I18nConfig {
  /**
   * Enable auto-imports
   */
  autoImports?: boolean

  /**
   * Locales directory
   */
  localesDir?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@ldesign/i18n-nuxtjs',
    configKey: 'i18n',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    locale: 'en',
    fallbackLocale: 'en',
    messages: {},
    autoImports: true,
    localesDir: './locales',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Create i18n instance
    const i18n = createI18n(options)

    // Add i18n to nuxt payload
    nuxt.hook('app:created', (app) => {
      app.payload.i18n = i18n
    })

    // Add plugin
    addPlugin(resolver.resolve('./plugins/i18n'))

    // Add auto-imports
    if (options.autoImports) {
      nuxt.hook('imports:dirs', (dirs) => {
        dirs.push(resolver.resolve('./composables'))
      })
    }

    // Add public runtime config
    nuxt.options.runtimeConfig.public.i18n = {
      locale: options.locale,
      fallbackLocale: options.fallbackLocale,
      availableLocales: Object.keys(options.messages || {}),
    }
  },
})

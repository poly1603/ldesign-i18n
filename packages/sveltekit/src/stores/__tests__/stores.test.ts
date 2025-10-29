/**
 * @ldesign/i18n-sveltekit - Stores Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { createI18nStore, createLocaleStore, createTranslateStore } from '../index'
import type { I18nConfig } from '@ldesign/i18n-core'

describe('SvelteKit Stores', () => {
  const config: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh', 'ja'],
    messages: {
      en: { hello: 'Hello', greeting: 'Hello, {{name}}!' },
      zh: { hello: '你好', greeting: '你好，{{name}}！' },
      ja: { hello: 'こんにちは', greeting: 'こんにちは、{{name}}！' },
    },
  }

  describe('createI18nStore', () => {
    it('should create i18n store', () => {
      const store = createI18nStore(config)
      expect(store).toBeDefined()
      expect(typeof store.subscribe).toBe('function')
    })

    it('should translate keys', () => {
      const store = createI18nStore(config)
      expect(store.t('hello')).toBe('Hello')
    })

    it('should translate with params', () => {
      const store = createI18nStore(config)
      expect(store.t('greeting', { name: 'World' })).toBe('Hello, World!')
    })

    it('should get current locale', () => {
      const store = createI18nStore(config)
      expect(store.getLocale()).toBe('en')
    })

    it('should get supported locales', () => {
      const store = createI18nStore(config)
      expect(store.getSupportedLocales()).toEqual(['en', 'zh', 'ja'])
    })

    it('should change locale', async () => {
      const store = createI18nStore(config)
      await store.setLocale('zh')
      expect(store.getLocale()).toBe('zh')
      expect(store.t('hello')).toBe('你好')
    })
  })

  describe('createLocaleStore', () => {
    it('should create locale store', () => {
      const store = createLocaleStore('en')
      expect(get(store)).toBe('en')
    })

    it('should update locale', () => {
      const store = createLocaleStore('en')
      store.set('zh')
      expect(get(store)).toBe('zh')
    })
  })

  describe('createTranslateStore', () => {
    it('should create translate store', () => {
      const i18nStore = createI18nStore(config)
      const tStore = createTranslateStore(i18nStore)
      
      const t = get(tStore)
      expect(t('hello')).toBe('Hello')
    })

    it('should react to locale changes', async () => {
      const i18nStore = createI18nStore(config)
      const tStore = createTranslateStore(i18nStore)
      
      await i18nStore.setLocale('zh')
      const t = get(tStore)
      expect(t('hello')).toBe('你好')
    })
  })
})

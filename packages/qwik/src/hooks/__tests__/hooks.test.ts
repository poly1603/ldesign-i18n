/**
 * @ldesign/i18n-qwik - Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useI18n, useTranslation, useLocale } from '../index'
import { createI18n } from '@ldesign/i18n-core'

// Mock Qwik's useContext
vi.mock('@builder.io/qwik', () => ({
  useContext: vi.fn(),
  createContextId: vi.fn((id: string) => ({ id })),
  component$: (fn: any) => fn,
  Slot: () => null,
  useContextProvider: vi.fn(),
}))

describe('Qwik Hooks', () => {
  const config = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh', 'ja'],
    messages: {
      en: { hello: 'Hello', greeting: 'Hello, {{name}}!' },
      zh: { hello: '你好', greeting: '你好，{{name}}！' },
      ja: { hello: 'こんにちは', greeting: 'こんにちは、{{name}}！' },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useI18n', () => {
    it('should return i18n instance from context', async () => {
      const { useContext } = await import('@builder.io/qwik')
      const i18n = createI18n(config)
      
      vi.mocked(useContext).mockReturnValue(i18n)
      
      const result = useI18n()
      expect(result).toBe(i18n)
    })

    it('should throw error when context is null', async () => {
      const { useContext } = await import('@builder.io/qwik')
      
      vi.mocked(useContext).mockReturnValue(null)
      
      expect(() => useI18n()).toThrow('useI18n must be used within I18nProvider')
    })
  })

  describe('useTranslation', () => {
    it('should return translation utilities', async () => {
      const { useContext } = await import('@builder.io/qwik')
      const i18n = createI18n(config)
      
      vi.mocked(useContext).mockReturnValue(i18n)
      
      const { t, i18n: returnedI18n, locale } = useTranslation()
      
      expect(t('hello')).toBe('Hello')
      expect(t('greeting', { name: 'World' })).toBe('Hello, World!')
      expect(returnedI18n).toBe(i18n)
      expect(locale).toBe('en')
    })
  })

  describe('useLocale', () => {
    it('should return locale and setLocale function', async () => {
      const { useContext } = await import('@builder.io/qwik')
      const i18n = createI18n(config)
      
      vi.mocked(useContext).mockReturnValue(i18n)
      
      const { locale, setLocale } = useLocale()
      
      expect(locale).toBe('en')
      expect(typeof setLocale).toBe('function')
    })

    it('should change locale', async () => {
      const { useContext } = await import('@builder.io/qwik')
      const i18n = createI18n(config)
      
      vi.mocked(useContext).mockReturnValue(i18n)
      
      const { setLocale } = useLocale()
      
      await setLocale('zh')
      
      expect(i18n.locale).toBe('zh')
    })
  })
})

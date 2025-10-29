/**
 * @ldesign/i18n-preact - Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useI18n, useTranslation, useLocale } from '../index'
import { createI18n } from '@ldesign/i18n-core'

// Mock Preact's useContext
vi.mock('preact/hooks', async () => {
  const actual = await vi.importActual('preact/hooks')
  return {
    ...actual,
    useContext: vi.fn(),
  }
})

describe('Preact Hooks', () => {
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
    it('should return i18n instance', async () => {
      const { useContext } = await import('preact/hooks')
      const i18n = createI18n(config)
      
      vi.mocked(useContext).mockReturnValue(i18n)
      
      const result = useI18n()
      expect(result).toBe(i18n)
    })

    it('should throw error when used outside provider', async () => {
      const { useContext } = await import('preact/hooks')
      
      vi.mocked(useContext).mockReturnValue(null)
      
      expect(() => useI18n()).toThrow('useI18n must be used within I18nProvider')
    })
  })

  // Note: useTranslation and useLocale use Preact hooks (useState, useEffect, useMemo)
  // which require a component rendering context. These would need proper rendering
  // tests with @testing-library/preact which requires additional setup.
  // For now, we test the basic useI18n context access.
})

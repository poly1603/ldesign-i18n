/**
 * @ldesign/i18n-alpinejs - Plugins Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { createI18nPlugin } from '../index'
import type { I18nConfig } from '@ldesign/i18n-core'

describe('Alpine.js Plugins', () => {
  const config: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh', 'ja'],
    messages: {
      en: { hello: 'Hello', greeting: 'Hello, {{name}}!' },
      zh: { hello: '你好', greeting: '你好，{{name}}！' },
      ja: { hello: 'こんにちは', greeting: 'こんにちは、{{name}}！' },
    },
  }

  function createMockAlpine() {
    return {
      magic: vi.fn(),
      directive: vi.fn(),
      store: vi.fn(),
    }
  }

  describe('createI18nPlugin', () => {
    it('should create plugin function', () => {
      const plugin = createI18nPlugin(config)
      expect(typeof plugin).toBe('function')
    })

    it('should register magic helpers', () => {
      const Alpine = createMockAlpine()
      const plugin = createI18nPlugin(config)
      
      plugin(Alpine as any)
      
      expect(Alpine.magic).toHaveBeenCalledWith('t', expect.any(Function))
      expect(Alpine.magic).toHaveBeenCalledWith('i18n', expect.any(Function))
      expect(Alpine.magic).toHaveBeenCalledWith('locale', expect.any(Function))
    })

    it('should register directives', () => {
      const Alpine = createMockAlpine()
      const plugin = createI18nPlugin(config)
      
      plugin(Alpine as any)
      
      expect(Alpine.directive).toHaveBeenCalledWith('translate', expect.any(Function))
      expect(Alpine.directive).toHaveBeenCalledWith('t', expect.any(Function))
    })

    it('should store i18n instance', () => {
      const Alpine = createMockAlpine()
      const plugin = createI18nPlugin(config)
      
      plugin(Alpine as any)
      
      expect((Alpine as any).__i18n).toBeDefined()
    })
  })
})

/**
 * @ldesign/i18n-lit - Controllers Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { I18nController } from '../index'
import type { I18nConfig } from '@ldesign/i18n-core'
import type { ReactiveControllerHost } from 'lit'

describe('Lit Controllers', () => {
  const config: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh', 'ja'],
    messages: {
      en: { hello: 'Hello', greeting: 'Hello, {{name}}!' },
      zh: { hello: '你好', greeting: '你好，{{name}}！' },
      ja: { hello: 'こんにちは', greeting: 'こんにちは、{{name}}！' },
    },
  }

  function createMockHost(): ReactiveControllerHost {
    return {
      addController: vi.fn(),
      removeController: vi.fn(),
      requestUpdate: vi.fn(),
      updateComplete: Promise.resolve(true),
    }
  }

  describe('I18nController', () => {
    it('should create controller', () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      expect(controller).toBeDefined()
      expect(host.addController).toHaveBeenCalledWith(controller)
    })

    it('should translate keys', () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      expect(controller.t('hello')).toBe('Hello')
    })

    it('should translate with params', () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      expect(controller.t('greeting', { name: 'World' })).toBe('Hello, World!')
    })

    it('should get current locale', () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      expect(controller.locale).toBe('en')
    })

    it('should change locale', async () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      await controller.setLocale('zh')
      
      expect(controller.locale).toBe('zh')
      expect(controller.t('hello')).toBe('你好')
      expect(host.requestUpdate).toHaveBeenCalled()
    })

    it('should get i18n instance', () => {
      const host = createMockHost()
      const controller = new I18nController(host, config)
      
      expect(controller.instance).toBeDefined()
      expect(controller.instance.locale).toBe('en')
    })
  })
})

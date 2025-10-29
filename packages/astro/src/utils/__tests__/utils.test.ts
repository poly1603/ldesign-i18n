/**
 * @ldesign/i18n-astro - Utils Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getI18n, getLocale, createT } from '../index'
import { createI18n } from '@ldesign/i18n-core'
import type { APIContext } from 'astro'

describe('Astro Utils', () => {
  let mockContext: Partial<APIContext>

  beforeEach(() => {
    mockContext = {
      locals: {},
    } as Partial<APIContext>
  })

  describe('getI18n', () => {
    it('should get i18n from context', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        supportedLocales: ['en'],
        messages: { en: { hello: 'Hello' } },
      })
      
      mockContext.locals!.i18n = i18n
      
      const result = getI18n(mockContext as APIContext)
      expect(result).toBe(i18n)
    })

    it('should throw if i18n not initialized', () => {
      expect(() => getI18n(mockContext as APIContext)).toThrow(
        'i18n not initialized',
      )
    })
  })

  describe('getLocale', () => {
    it('should get locale from context', () => {
      mockContext.locals!.locale = 'zh'
      
      const result = getLocale(mockContext as APIContext)
      expect(result).toBe('zh')
    })

    it('should throw if locale not initialized', () => {
      expect(() => getLocale(mockContext as APIContext)).toThrow(
        'Locale not initialized',
      )
    })
  })

  describe('createT', () => {
    it('should create translation function', () => {
      const i18n = createI18n({
        defaultLocale: 'en',
        supportedLocales: ['en'],
        messages: { en: { hello: 'Hello', greeting: 'Hello, {{name}}!' } },
      })
      
      mockContext.locals!.i18n = i18n
      
      const t = createT(mockContext as APIContext)
      expect(t('hello')).toBe('Hello')
      expect(t('greeting', { name: 'World' })).toBe('Hello, World!')
    })
  })
})

import { describe, expect, it } from 'vitest'
import { createI18n, I18n, VERSION } from '../index'

describe('@ldesign/i18n-core', () => {
  it('should export createI18n function', () => {
    expect(createI18n).toBeDefined()
    expect(typeof createI18n).toBe('function')
  })

  it('should export I18n class', () => {
    expect(I18n).toBeDefined()
  })

  it('should export VERSION', () => {
    expect(VERSION).toBeDefined()
    expect(typeof VERSION).toBe('string')
  })

  it('should create i18n instance', () => {
    const i18n = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          hello: 'Hello',
        },
      },
    })

    expect(i18n).toBeDefined()
    expect(i18n.locale).toBe('en')
  })

  it('should translate messages', () => {
    const i18n = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          hello: 'Hello {{name}}',
        },
      },
    })

    const result = i18n.t('hello', { name: 'World' })
    expect(result).toBe('Hello World')
  })

  it('should handle missing keys with fallback', () => {
    const i18n = createI18n({
      locale: 'zh',
      fallbackLocale: 'en',
      messages: {
        en: {
          hello: 'Hello',
        },
        zh: {},
      },
    })

    const result = i18n.t('hello')
    expect(result).toBe('Hello')
  })

  it('should change locale', () => {
    const i18n = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
        zh: {
          greeting: '你好',
        },
      },
    })

    expect(i18n.t('greeting')).toBe('Hello')

    i18n.locale = 'zh'
    expect(i18n.t('greeting')).toBe('你好')
  })
})

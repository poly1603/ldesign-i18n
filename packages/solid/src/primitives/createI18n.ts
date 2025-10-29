/**
 * createI18n - Create a reactive i18n instance for Solid
 */

import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface ReactiveI18nInstance extends I18nInstance {
  /**
   * Reactive locale accessor
   */
  $locale: Accessor<string>

  /**
   * Reactive messages accessor
   */
  $messages: Accessor<Record<string, any>>
}

/**
 * Create a reactive i18n instance with Solid signals
 * 
 * @example
 * ```tsx
 * import { createI18n } from '@ldesign/i18n-solid'
 * 
 * const i18n = createI18n({
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 * 
 * // In component:
 * <div>{i18n.t('hello')}</div>
 * <div>Current locale: {i18n.$locale()}</div>
 * ```
 */
export function createI18n(config?: I18nConfig): ReactiveI18nInstance {
  // Create core i18n instance
  const instance = new OptimizedI18n(config)

  // Create reactive signals
  const [locale, setLocale] = createSignal(instance.locale || 'en')
  const [messages, setMessages] = createSignal(instance.getMessages(instance.locale) || {})

  // Initialize instance
  if (!instance.initialized) {
    instance.init().catch((error) => {
      console.error('[createI18n] Failed to initialize i18n:', error)
    })
  }

  // Listen to locale changes from instance
  const unsubscribe = instance.on('localeChanged', ({ locale: newLocale }) => {
    if (newLocale) {
      setLocale(newLocale)
      setMessages(instance.getMessages(newLocale) || {})
    }
  })

  // Cleanup on unmount
  onCleanup(() => {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
    }
  })

  // Create reactive instance
  const reactiveInstance = instance as ReactiveI18nInstance
  reactiveInstance.$locale = locale
  reactiveInstance.$messages = messages

  return reactiveInstance
}


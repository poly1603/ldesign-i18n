/**
 * @ldesign/i18n-lit - Decorators
 * Lit decorators for i18n integration
 */

import type { I18nInstance } from '@ldesign/i18n-core'

/**
 * Symbol to store i18n instance
 */
const I18N_SYMBOL = Symbol('i18n')

/**
 * Decorator to inject i18n instance into a property
 */
export function i18n() {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return (this as any)[I18N_SYMBOL]
      },
      set(value: I18nInstance) {
        (this as any)[I18N_SYMBOL] = value
        this.requestUpdate()
      },
      enumerable: true,
      configurable: true,
    })
  }
}

/**
 * Decorator to create a translation method
 */
export function translate() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = function (key: string, params?: Record<string, any>) {
      const i18nInstance = (this as any)[I18N_SYMBOL] as I18nInstance
      if (!i18nInstance) {
        console.warn('i18n instance not found. Did you set the i18n property?')
        return key
      }
      return i18nInstance.t(key, params)
    }

    return descriptor
  }
}

export type { I18nInstance }

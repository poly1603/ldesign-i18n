/**
 * @ldesign/i18n-lit - Controllers
 * Lit reactive controllers for i18n
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { createI18n, type I18nConfig, type I18nInstance } from '@ldesign/i18n-core'

/**
 * I18n reactive controller for Lit components
 */
export class I18nController implements ReactiveController {
  private host: ReactiveControllerHost
  private i18n: I18nInstance

  constructor(host: ReactiveControllerHost, config: I18nConfig) {
    this.host = host
    this.i18n = createI18n(config)
    host.addController(this)
  }

  hostConnected() {
    // Component connected to DOM
  }

  hostDisconnected() {
    // Component disconnected from DOM
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, any>): string {
    return this.i18n.t(key, params)
  }

  /**
   * Get current locale
   */
  get locale(): string {
    return this.i18n.locale
  }

  /**
   * Set current locale
   */
  async setLocale(locale: string): Promise<void> {
    await this.i18n.setLocale(locale)
    this.host.requestUpdate()
  }

  /**
   * Get i18n instance
   */
  get instance(): I18nInstance {
    return this.i18n
  }
}

export type { I18nInstance, I18nConfig }

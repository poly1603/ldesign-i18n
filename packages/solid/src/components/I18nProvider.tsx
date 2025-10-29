/**
 * I18nProvider Component for Solid
 */

import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import type { Component, JSX } from 'solid-js'
import { createEffect, onCleanup } from 'solid-js'
import { I18nContext } from '../context/I18nContext'

export interface I18nProviderProps {
  /**
   * I18n instance (if provided, will use this instance)
   */
  i18n?: I18nInstance

  /**
   * I18n config (if i18n instance not provided, will create new instance)
   */
  config?: I18nConfig

  /**
   * Children components
   */
  children: JSX.Element
}

/**
 * I18nProvider component
 * 
 * @example
 * ```tsx
 * <I18nProvider config={{ locale: 'zh-CN', messages: {...} }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export const I18nProvider: Component<I18nProviderProps> = (props) => {
  // Create or use provided i18n instance
  const i18n = props.i18n || new OptimizedI18n(props.config || {})

  // Initialize instance
  createEffect(() => {
    if (!i18n.initialized) {
      i18n.init().catch((error) => {
        console.error('[I18nProvider] Failed to initialize i18n:', error)
      })
    }
  })

  // Cleanup
  onCleanup(() => {
    if (!props.i18n && i18n.destroy) {
      i18n.destroy()
    }
  })

  return (
    <I18nContext.Provider value={{ i18n }}>
      {props.children}
    </I18nContext.Provider>
  )
}


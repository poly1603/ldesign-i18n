/**
 * I18n Provider Component
 * 提供 i18n 实例给子组件
 */

import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { createI18n } from '@ldesign/i18n-core'
import type { ReactNode } from 'react'
import React, { useEffect, useMemo, useRef } from 'react'
import { I18nContext } from '../context/I18nContext'

export interface I18nProviderProps {
  /**
   * I18n 实例（如果提供，则使用该实例）
   */
  i18n?: I18nInstance

  /**
   * I18n 配置（如果未提供 i18n 实例，则使用此配置创建新实例）
   */
  config?: I18nConfig

  /**
   * 子组件
   */
  children: ReactNode
}

/**
 * I18nProvider 组件
 * 
 * @example
 * ```tsx
 * <I18nProvider config={{ locale: 'zh-CN', messages: {...} }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ i18n: externalI18n, config, children }: I18nProviderProps) {
  // 使用 ref 来存储创建的实例，避免重复创建
  const createdI18nRef = useRef<I18nInstance | null>(null)

  // 使用 useMemo 来确保 i18n 实例稳定
  const i18n = useMemo(() => {
    // 如果提供了外部实例，使用外部实例
    if (externalI18n) {
      return externalI18n
    }

    // 如果已经创建过实例，复用
    if (createdI18nRef.current) {
      return createdI18nRef.current
    }

    // 创建新实例
    const newInstance = createI18n(config || {})
    createdI18nRef.current = newInstance

    return newInstance
  }, [externalI18n, config])

  // 初始化 i18n 实例
  useEffect(() => {
    if (!i18n.initialized) {
      i18n.init().catch((error) => {
        console.error('[I18nProvider] Failed to initialize i18n:', error)
      })
    }
  }, [i18n])

  // 清理
  useEffect(() => {
    return () => {
      // 只清理我们自己创建的实例
      if (createdI18nRef.current && createdI18nRef.current === i18n) {
        i18n.destroy?.()
        createdI18nRef.current = null
      }
    }
  }, [i18n])

  const contextValue = useMemo(() => ({ i18n }), [i18n])

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

I18nProvider.displayName = 'I18nProvider'


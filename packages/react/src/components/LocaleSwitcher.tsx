/**
 * LocaleSwitcher Component
 * 语言切换器组件
 */

import type { Locale } from '@ldesign/i18n-core'
import type { CSSProperties } from 'react'
import React from 'react'
import { useLocale } from '../hooks/useLocale'

export interface LocaleSwitcherProps {
  /**
   * 可用的语言列表
   */
  locales?: Locale[]

  /**
   * 语言标签映射
   */
  labels?: Record<Locale, string>

  /**
   * 自定义样式
   */
  style?: CSSProperties

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 语言切换回调
   */
  onChange?: (locale: Locale) => void

  /**
   * 渲染类型
   */
  type?: 'select' | 'buttons'
}

/**
 * LocaleSwitcher 组件
 * 
 * @example
 * ```tsx
 * // 下拉选择框
 * <LocaleSwitcher
 *   locales={['zh-CN', 'en', 'ja']}
 *   labels={{ 'zh-CN': '中文', 'en': 'English', 'ja': '日本語' }}
 * />
 * 
 * // 按钮组
 * <LocaleSwitcher
 *   type="buttons"
 *   locales={['zh-CN', 'en']}
 * />
 * ```
 */
export function LocaleSwitcher({
  locales: providedLocales,
  labels = {},
  style,
  className = '',
  onChange,
  type = 'select',
}: LocaleSwitcherProps) {
  const { locale, setLocale, availableLocales } = useLocale()

  // 使用提供的语言列表或可用语言列表
  const locales = providedLocales || availableLocales

  const handleChange = async (newLocale: Locale) => {
    await setLocale(newLocale)
    onChange?.(newLocale)
  }

  // 获取语言显示标签
  const getLabel = (loc: Locale): string => {
    return labels[loc] || loc
  }

  if (type === 'buttons') {
    return (
      <div className={`i18n-locale-switcher ${className}`} style={style}>
        {locales.map(loc => (
          <button
            key={loc}
            type="button"
            onClick={() => handleChange(loc)}
            disabled={loc === locale}
            className={loc === locale ? 'active' : ''}
            style={{
              padding: '8px 16px',
              margin: '0 4px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: loc === locale ? '#007bff' : '#fff',
              color: loc === locale ? '#fff' : '#333',
              cursor: loc === locale ? 'default' : 'pointer',
              ...style,
            }}
          >
            {getLabel(loc)}
          </button>
        ))}
      </div>
    )
  }

  return (
    <select
      className={`i18n-locale-switcher ${className}`}
      style={style}
      value={locale}
      onChange={e => handleChange(e.target.value as Locale)}
    >
      {locales.map(loc => (
        <option key={loc} value={loc}>
          {getLabel(loc)}
        </option>
      ))}
    </select>
  )
}

LocaleSwitcher.displayName = 'LocaleSwitcher'


/**
 * Trans Component
 * 翻译组件，支持插值和组件插值
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import { useTranslation } from '../hooks/useTranslation'

export interface TransProps {
  /**
   * 翻译键
   */
  i18nKey: string

  /**
   * 插值参数
   */
  values?: InterpolationParams

  /**
   * 组件映射（用于组件插值）
   */
  components?: Record<string, ReactElement>

  /**
   * 默认值（当翻译不存在时使用）
   */
  defaults?: string

  /**
   * 计数（用于复数化）
   */
  count?: number

  /**
   * 自定义渲染函数
   */
  children?: (translation: string) => ReactNode
}

/**
 * Trans 组件
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <Trans i18nKey="welcome" values={{ name: 'John' }} />
 * 
 * // 组件插值
 * <Trans 
 *   i18nKey="message.with.link"
 *   components={{ link: <a href="/about">About</a> }}
 * />
 * 
 * // 自定义渲染
 * <Trans i18nKey="hello">
 *   {(text) => <strong>{text}</strong>}
 * </Trans>
 * ```
 */
export function Trans({
  i18nKey,
  values = {},
  components,
  defaults,
  count,
  children,
}: TransProps) {
  const { t } = useTranslation()

  // 获取翻译文本
  let translation: string

  if (count !== undefined) {
    // 使用复数化
    translation = t(i18nKey, { ...values, count })
  }
  else {
    translation = t(i18nKey, values)
  }

  // 如果没有翻译，使用默认值
  if (!translation && defaults) {
    translation = defaults
  }

  // 如果有自定义渲染函数，使用它
  if (children && typeof children === 'function') {
    return <>{children(translation)}</>
  }

  // 如果有组件插值，处理组件替换
  if (components && Object.keys(components).length > 0) {
    return <>{interpolateComponents(translation, components)}</>
  }

  // 默认直接返回文本
  return <>{translation}</>
}

Trans.displayName = 'Trans'

/**
 * 组件插值辅助函数
 * 将翻译文本中的占位符替换为 React 组件
 * 
 * @example
 * 翻译文本: "Click <link>here</link> to continue"
 * 组件: { link: <a href="/path">...</a> }
 * 结果: ["Click ", <a>here</a>, " to continue"]
 */
function interpolateComponents(
  text: string,
  components: Record<string, ReactElement>,
): ReactNode[] {
  const result: ReactNode[] = []
  let currentText = text
  let key = 0

  // 简单的标签匹配正则：<componentName>content</componentName>
  const tagRegex = /<(\w+)>(.*?)<\/\1>/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = tagRegex.exec(currentText)) !== null) {
    const [fullMatch, componentName, content] = match

    // 添加标签前的文本
    if (match.index > lastIndex) {
      result.push(currentText.slice(lastIndex, match.index))
    }

    // 添加组件
    if (components[componentName]) {
      const Component = components[componentName]
      result.push(
        React.cloneElement(Component, { key: key++, children: content }),
      )
    }
    else {
      // 如果没有对应的组件，保持原样
      result.push(fullMatch)
    }

    lastIndex = match.index + fullMatch.length
  }

  // 添加剩余文本
  if (lastIndex < currentText.length) {
    result.push(currentText.slice(lastIndex))
  }

  // 如果没有匹配到任何标签，直接返回原文本
  if (result.length === 0) {
    return [text]
  }

  return result
}


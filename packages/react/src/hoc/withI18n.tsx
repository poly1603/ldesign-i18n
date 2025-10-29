/**
 * withI18n HOC
 * 为类组件提供 i18n 功能的高阶组件
 */

import type { ComponentType } from 'react'
import React from 'react'
import { useI18n, type UseI18nOptions, type UseI18nReturn } from '../hooks/useI18n'

export interface WithI18nProps {
  i18n: UseI18nReturn
}

/**
 * withI18n HOC
 * 为类组件添加 i18n 支持
 * 
 * @example
 * ```tsx
 * interface MyComponentProps extends WithI18nProps {
 *   title: string
 * }
 * 
 * class MyComponent extends React.Component<MyComponentProps> {
 *   render() {
 *     const { i18n, title } = this.props
 *     return <h1>{i18n.t(title)}</h1>
 *   }
 * }
 * 
 * export default withI18n(MyComponent)
 * ```
 */
export function withI18n<P extends WithI18nProps>(
  Component: ComponentType<P>,
  options?: UseI18nOptions,
) {
  const WithI18nComponent = (props: Omit<P, 'i18n'>) => {
    const i18n = useI18n(options)

    return <Component {...(props as P)} i18n={i18n} />
  }

  WithI18nComponent.displayName = `withI18n(${Component.displayName || Component.name || 'Component'})`

  return WithI18nComponent
}


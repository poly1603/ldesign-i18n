/**
 * Trans Component for Solid
 */

import type { InterpolationParams } from '@ldesign/i18n-core'
import type { Component } from 'solid-js'
import { useI18n } from '../primitives/useI18n'

export interface TransProps {
  /**
   * Translation key
   */
  keypath: string

  /**
   * Interpolation parameters
   */
  params?: InterpolationParams

  /**
   * Locale override
   */
  locale?: string

  /**
   * Tag name for wrapper element
   */
  tag?: keyof JSX.IntrinsicElements
}

/**
 * Trans component for translation
 * 
 * @example
 * ```tsx
 * <Trans keypath="welcome" params={{ name: 'User' }} />
 * <Trans keypath="title" tag="h1" />
 * ```
 */
export const Trans: Component<TransProps> = (props) => {
  const { t } = useI18n()
  const Tag = props.tag || 'span'

  return (
    <Tag>
      {t(props.keypath, { params: props.params, locale: props.locale })}
    </Tag>
  )
}


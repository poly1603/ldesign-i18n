/**
 * @ldesign/i18n-qwik - Trans
 */

import { component$ } from '@builder.io/qwik'
import { useI18n } from '../hooks'

export interface TransProps {
  i18nKey: string
  params?: Record<string, any>
  fallback?: string
}

export const Trans = component$<TransProps>(({ i18nKey, params, fallback }) => {
  const i18n = useI18n()
  const text = i18n.t(i18nKey, params) || fallback || i18nKey
  
  return <>{text}</>
})

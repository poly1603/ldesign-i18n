/**
 * @ldesign/i18n-preact - Trans
 */

import { useI18n } from '../hooks'

export interface TransProps {
  i18nKey: string
  params?: Record<string, any>
  fallback?: string
}

export function Trans({ i18nKey, params, fallback }: TransProps) {
  const i18n = useI18n()
  const text = i18n.t(i18nKey, params) || fallback || i18nKey
  return <>{text}</>
}

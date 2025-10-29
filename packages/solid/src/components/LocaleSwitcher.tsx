/**
 * LocaleSwitcher Component for Solid
 */

import type { Locale } from '@ldesign/i18n-core'
import type { Component } from 'solid-js'
import { For } from 'solid-js'
import { useLocale } from '../primitives/useLocale'

export interface LocaleSwitcherProps {
  /**
   * Custom locales to display (optional)
   */
  locales?: Locale[]

  /**
   * Custom labels for locales
   */
  labels?: Record<Locale, string>
}

/**
 * LocaleSwitcher component
 * 
 * @example
 * ```tsx
 * <LocaleSwitcher />
 * <LocaleSwitcher 
 *   locales={['zh-CN', 'en']} 
 *   labels={{ 'zh-CN': '中文', 'en': 'English' }}
 * />
 * ```
 */
export const LocaleSwitcher: Component<LocaleSwitcherProps> = (props) => {
  const { locale, availableLocales, setLocale } = useLocale()

  const displayLocales = () => props.locales || availableLocales()

  const getLabel = (loc: Locale): string => {
    if (props.labels && props.labels[loc]) {
      return props.labels[loc]
    }
    return loc
  }

  const handleChange = async (event: Event) => {
    const target = event.target as HTMLSelectElement
    const newLocale = target.value as Locale
    await setLocale(newLocale)
  }

  return (
    <select value={locale()} onChange={handleChange}>
      <For each={displayLocales()}>
        {(loc) => <option value={loc}>{getLabel(loc)}</option>}
      </For>
    </select>
  )
}


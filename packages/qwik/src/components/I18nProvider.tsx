/**
 * @ldesign/i18n-qwik - I18nProvider
 */

import { component$, Slot, useContextProvider } from '@builder.io/qwik'
import { I18nContext } from '../context'
import type { I18nInstance } from '@ldesign/i18n-core'

export interface I18nProviderProps {
  i18n: I18nInstance
}

export const I18nProvider = component$<I18nProviderProps>(({ i18n }) => {
  useContextProvider(I18nContext, i18n)
  
  return <Slot />
})

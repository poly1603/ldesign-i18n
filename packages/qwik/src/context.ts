/**
 * @ldesign/i18n-qwik - Context
 * Qwik context for i18n
 */

import { createContextId } from '@builder.io/qwik'
import type { I18nInstance } from '@ldesign/i18n-core'

export const I18nContext = createContextId<I18nInstance | null>('i18n-context')

export type { I18nInstance }

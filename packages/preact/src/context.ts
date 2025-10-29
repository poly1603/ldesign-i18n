/**
 * @ldesign/i18n-preact - Context
 * Preact context for i18n
 */

import { createContext } from 'preact'
import type { I18nInstance } from '@ldesign/i18n-core'

export const I18nContext = createContext<I18nInstance | null>(null)

export type { I18nInstance }

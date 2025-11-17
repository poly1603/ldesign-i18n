/**
 * Load locale messages utility
 */

import type { Messages } from '@ldesign/i18n-core'

export type LocaleMessages = Messages

export async function loadLocaleMessages(
  _locale: string,
  loader: () => Promise<LocaleMessages> | LocaleMessages,
): Promise<LocaleMessages> {
  const messages = await loader()
  return messages
}

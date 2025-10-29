import { createI18n } from '@ldesign/i18n-core'
import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { cookies, headers } from 'next/headers'

export interface ServerI18nConfig extends I18nConfig {
  /**
   * Cookie name to store locale
   */
  localeCookie?: string

  /**
   * Header name to detect locale
   */
  localeHeader?: string
}

/**
 * Get i18n instance on server side (App Router)
 */
export async function getServerI18n(config: ServerI18nConfig): Promise<I18nInstance> {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Detect locale from cookie or header
  const localeCookie = config.localeCookie || 'locale'
  const localeHeader = config.localeHeader || 'accept-language'

  let detectedLocale = config.locale

  // Try cookie first
  const cookieLocale = cookieStore.get(localeCookie)?.value
  if (cookieLocale) {
    detectedLocale = cookieLocale
  }
  else {
    // Try header
    const headerLocale = headersList.get(localeHeader)
    if (headerLocale) {
      // Parse accept-language header (simplified)
      const primaryLocale = headerLocale.split(',')[0]?.split('-')[0]
      if (primaryLocale) {
        detectedLocale = primaryLocale
      }
    }
  }

  return createI18n({
    ...config,
    locale: detectedLocale,
  })
}

/**
 * Get i18n instance on server side for Pages Router
 */
export function getServerSideI18n(config: ServerI18nConfig, req: any): I18nInstance {
  const localeCookie = config.localeCookie || 'locale'

  // Try to get locale from cookie
  let detectedLocale = config.locale

  if (req.cookies?.[localeCookie]) {
    detectedLocale = req.cookies[localeCookie]
  }
  else if (req.headers?.['accept-language']) {
    const headerLocale = req.headers['accept-language'].split(',')[0]?.split('-')[0]
    if (headerLocale) {
      detectedLocale = headerLocale
    }
  }

  return createI18n({
    ...config,
    locale: detectedLocale,
  })
}

import { json } from '@remix-run/node'
import { createI18n } from '@ldesign/i18n-core'
import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'

export interface I18nLoaderConfig extends I18nConfig {
  /**
   * Cookie name to store locale
   */
  localeCookie?: string

  /**
   * Supported locales
   */
  supportedLocales?: string[]
}

/**
 * Create i18n loader for Remix
 */
export function createI18nLoader(config: I18nLoaderConfig) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    const cookieHeader = request.headers.get('Cookie')
    const acceptLanguage = request.headers.get('Accept-Language')

    const localeCookie = config.localeCookie || 'locale'
    let detectedLocale = config.locale

    // Try to get locale from cookie
    if (cookieHeader) {
      const cookies = parseCookies(cookieHeader)
      if (cookies[localeCookie]) {
        detectedLocale = cookies[localeCookie]
      }
    }

    // Try to get from URL
    const pathLocale = url.pathname.split('/')[1]
    if (config.supportedLocales?.includes(pathLocale)) {
      detectedLocale = pathLocale
    }

    // Fallback to accept-language header
    if (!detectedLocale && acceptLanguage) {
      const primaryLocale = acceptLanguage.split(',')[0]?.split('-')[0]
      if (primaryLocale && config.supportedLocales?.includes(primaryLocale)) {
        detectedLocale = primaryLocale
      }
    }

    const i18n = createI18n({
      ...config,
      locale: detectedLocale,
    })

    return json({
      locale: detectedLocale,
      messages: config.messages?.[detectedLocale] || {},
      availableLocales: config.supportedLocales || Object.keys(config.messages || {}),
    })
  }
}

/**
 * Helper to parse cookies
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, ...values] = cookie.trim().split('=')
      return [key, decodeURIComponent(values.join('='))]
    }),
  )
}

/**
 * Get i18n instance from loader data
 */
export function getI18nFromLoader(loaderData: any, config: I18nConfig): I18nInstance {
  return createI18n({
    ...config,
    locale: loaderData.locale,
    messages: {
      [loaderData.locale]: loaderData.messages,
    },
  })
}

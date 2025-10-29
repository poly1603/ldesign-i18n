/**
 * @ldesign/i18n-astro - Middleware
 * Astro middleware for i18n
 */

import type { APIContext, MiddlewareNext } from 'astro'
import { createI18n, type I18nConfig, type I18nInstance } from '@ldesign/i18n-core'

export interface I18nAstroConfig extends I18nConfig {
  /**
   * Cookie name for locale storage
   * @default 'locale'
   */
  cookieName?: string

  /**
   * Query parameter name for locale detection
   * @default 'lang'
   */
  queryParamName?: string

  /**
   * Locale path pattern
   * @example /[locale]/... for /en/about
   */
  localePathPattern?: RegExp
}

/**
 * Create Astro i18n middleware
 */
export function createI18nMiddleware(config: I18nAstroConfig) {
  const {
    cookieName = 'locale',
    queryParamName = 'lang',
    localePathPattern,
    ...i18nConfig
  } = config

  return async (context: APIContext, next: MiddlewareNext) => {
    // Detect locale
    const locale = detectLocale(context, {
      cookieName,
      queryParamName,
      localePathPattern,
      defaultLocale: i18nConfig.defaultLocale,
      supportedLocales: i18nConfig.supportedLocales,
    })

    // Create i18n instance
    const i18n = createI18n({
      ...i18nConfig,
      locale,
    })

    // Attach to context.locals
    context.locals.i18n = i18n
    context.locals.locale = locale

    // Set cookie if needed
    if (context.url.searchParams.has(queryParamName)) {
      context.cookies.set(cookieName, locale, {
        path: '/',
        maxAge: 31536000,
      })
    }

    return next()
  }
}

function detectLocale(
  context: APIContext,
  options: {
    cookieName: string
    queryParamName: string
    localePathPattern?: RegExp
    defaultLocale: string
    supportedLocales: string[]
  },
): string {
  const { cookieName, queryParamName, localePathPattern, defaultLocale, supportedLocales } = options

  // 1. Check query parameter
  const queryLocale = context.url.searchParams.get(queryParamName)
  if (queryLocale && supportedLocales.includes(queryLocale)) {
    return queryLocale
  }

  // 2. Check path
  if (localePathPattern) {
    const match = context.url.pathname.match(localePathPattern)
    if (match && match[1] && supportedLocales.includes(match[1])) {
      return match[1]
    }
  }

  // 3. Check cookie
  const cookieLocale = context.cookies.get(cookieName)?.value
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale
  }

  // 4. Check Accept-Language
  const acceptLanguage = context.request.headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().split('-')[0])
    
    for (const lang of languages) {
      if (supportedLocales.includes(lang)) {
        return lang
      }
    }
  }

  return defaultLocale
}

export type { I18nInstance }

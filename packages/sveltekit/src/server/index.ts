/**
 * @ldesign/i18n-sveltekit - Server utilities
 * Server-side i18n utilities for SvelteKit
 */

import type { Handle, RequestEvent } from '@sveltejs/kit'
import { createI18n, type I18nConfig, type I18nInstance } from '@ldesign/i18n-core'

/**
 * SvelteKit i18n configuration
 */
export interface I18nKitConfig extends I18nConfig {
  /**
   * Cookie name for locale storage
   * @default 'locale'
   */
  cookieName?: string

  /**
   * Cookie options
   */
  cookieOptions?: {
    path?: string
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }

  /**
   * Query parameter name for locale detection
   * @default 'lang'
   */
  queryParamName?: string

  /**
   * Path segments to extract locale from
   * @example ['[lang]'] for /en/about
   */
  localePathSegments?: string[]
}

/**
 * Create SvelteKit i18n handle
 */
export function createI18nHandle(config: I18nKitConfig): Handle {
  const {
    cookieName = 'locale',
    cookieOptions = {},
    queryParamName = 'lang',
    localePathSegments = [],
    ...i18nConfig
  } = config

  return async ({ event, resolve }) => {
    // Detect locale from various sources
    const locale = detectLocale(event, {
      cookieName,
      queryParamName,
      localePathSegments,
      defaultLocale: i18nConfig.defaultLocale,
      supportedLocales: i18nConfig.supportedLocales,
    })

    // Create i18n instance for this request
    const i18n = createI18n({
      ...i18nConfig,
      locale,
    })

    // Attach i18n to event.locals
    event.locals.i18n = i18n
    event.locals.locale = locale

    // Set locale cookie if changed
    if (event.url.searchParams.has(queryParamName)) {
      event.cookies.set(cookieName, locale, {
        path: cookieOptions.path || '/',
        maxAge: cookieOptions.maxAge || 31536000,
        httpOnly: cookieOptions.httpOnly !== false,
        secure: cookieOptions.secure || false,
        sameSite: cookieOptions.sameSite || 'lax',
      })
    }

    const response = await resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale),
    })

    return response
  }
}

/**
 * Detect locale from request
 */
function detectLocale(
  event: RequestEvent,
  options: {
    cookieName: string
    queryParamName: string
    localePathSegments: string[]
    defaultLocale: string
    supportedLocales: string[]
  },
): string {
  const { cookieName, queryParamName, localePathSegments, defaultLocale, supportedLocales } = options

  // 1. Check query parameter
  const queryLocale = event.url.searchParams.get(queryParamName)
  if (queryLocale && supportedLocales.includes(queryLocale)) {
    return queryLocale
  }

  // 2. Check path segments
  if (localePathSegments.length > 0) {
    const pathParts = event.url.pathname.split('/').filter(Boolean)
    for (const segment of localePathSegments) {
      const index = segment.replace(/[\[\]]/g, '')
      const pathLocale = pathParts[Number.parseInt(index, 10) || 0]
      if (pathLocale && supportedLocales.includes(pathLocale)) {
        return pathLocale
      }
    }
  }

  // 3. Check cookie
  const cookieLocale = event.cookies.get(cookieName)
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale
  }

  // 4. Check Accept-Language header
  const acceptLanguage = event.request.headers.get('accept-language')
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

  // 5. Fallback to default
  return defaultLocale
}

/**
 * Get i18n instance from event
 */
export function getI18n(event: RequestEvent): I18nInstance {
  if (!event.locals.i18n) {
    throw new Error('i18n not initialized. Did you add createI18nHandle to your hooks?')
  }
  return event.locals.i18n
}

/**
 * Get current locale from event
 */
export function getLocale(event: RequestEvent): string {
  if (!event.locals.locale) {
    throw new Error('Locale not initialized. Did you add createI18nHandle to your hooks?')
  }
  return event.locals.locale
}

/**
 * Create page load helper with i18n
 */
export function createI18nPageLoad() {
  return ({ data }: { data: any }) => {
    return {
      i18n: data.i18n,
      locale: data.locale,
    }
  }
}

// Type augmentation for SvelteKit
declare module '@sveltejs/kit' {
  interface Locals {
    i18n: I18nInstance
    locale: string
  }

  interface PageData {
    i18n?: I18nInstance
    locale?: string
  }
}

export type { I18nInstance }

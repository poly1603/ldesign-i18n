import type { NextRequest, NextResponse } from 'next/server'

export interface I18nMiddlewareConfig {
  /**
   * Supported locales
   */
  locales: string[]

  /**
   * Default locale
   */
  defaultLocale: string

  /**
   * Cookie name to store locale
   */
  localeCookie?: string

  /**
   * URL strategy: 'path' | 'domain' | 'cookie'
   */
  strategy?: 'path' | 'domain' | 'cookie'

  /**
   * Path prefixes to exclude from i18n
   */
  excludePatterns?: RegExp[]
}

/**
 * Create i18n middleware for Next.js
 */
export function createI18nMiddleware(config: I18nMiddlewareConfig) {
  const {
    locales,
    defaultLocale,
    localeCookie = 'locale',
    strategy = 'path',
    excludePatterns = [],
  } = config

  return function i18nMiddleware(
    request: NextRequest,
    response: NextResponse,
  ): NextResponse {
    const { pathname } = request.nextUrl

    // Check if pathname should be excluded
    if (excludePatterns.some(pattern => pattern.test(pathname))) {
      return response
    }

    // Detect locale
    let locale = defaultLocale

    if (strategy === 'path') {
      // Extract locale from path
      const pathLocale = pathname.split('/')[1]
      if (locales.includes(pathLocale)) {
        locale = pathLocale
      }
    }
    else if (strategy === 'cookie') {
      // Get locale from cookie
      const cookieLocale = request.cookies.get(localeCookie)?.value
      if (cookieLocale && locales.includes(cookieLocale)) {
        locale = cookieLocale
      }
    }
    else if (strategy === 'domain') {
      // Get locale from domain (subdomain or TLD)
      const hostname = request.nextUrl.hostname
      const domainLocale = hostname.split('.')[0]
      if (locales.includes(domainLocale)) {
        locale = domainLocale
      }
    }

    // Set locale cookie
    response.cookies.set(localeCookie, locale, {
      path: '/',
      maxAge: 31536000, // 1 year
    })

    return response
  }
}

/**
 * Helper to redirect to localized path
 */
export function redirectToLocale(
  request: NextRequest,
  locale: string,
): NextResponse {
  const { pathname, search } = request.nextUrl
  const url = new URL(`/${locale}${pathname}${search}`, request.url)

  return NextResponse.redirect(url)
}

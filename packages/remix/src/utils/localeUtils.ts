/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string, locales: string[]): string | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment
  }

  return null
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname.slice(locale.length + 1) || '/'
  }
  return pathname
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname
  }
  return `/${locale}${pathname}`
}

/**
 * Create locale cookie
 */
export function createLocaleCookie(locale: string, cookieName = 'locale'): string {
  return `${cookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
}

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
 * Remove locale prefix from pathname
 */
export function removeLocaleFromPathname(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname.slice(locale.length + 1) || '/'
  }
  return pathname
}

/**
 * Add locale prefix to pathname
 */
export function addLocaleToPathname(pathname: string, locale: string): string {
  if (pathname.startsWith(`/${locale}`)) {
    return pathname
  }
  return `/${locale}${pathname}`
}

/**
 * Check if pathname has locale prefix
 */
export function hasLocalePrefix(pathname: string, locales: string[]): boolean {
  return getLocaleFromPathname(pathname, locales) !== null
}

/**
 * Helper utilities for Svelte i18n
 */

/**
 * Parse translation binding value
 */
export function parseBindingValue(
  value: string | { key?: string; params?: Record<string, any>; locale?: string }
): { key: string; params?: Record<string, any>; locale?: string } {
  if (typeof value === 'string') {
    return { key: value }
  }

  if (value && typeof value === 'object') {
    return {
      key: value.key || '',
      params: value.params,
      locale: value.locale,
    }
  }

  return { key: '' }
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === ''
}


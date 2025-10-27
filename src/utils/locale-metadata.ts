/**
 * @ldesign/i18n - Locale Metadata and RTL Support
 * Provides locale-specific metadata including text direction, script, and number systems
 */

import type { Locale } from '../types'
import { parseLocale } from './helpers'

/**
 * Text direction
 */
export type TextDirection = 'ltr' | 'rtl'

/**
 * Writing script type
 */
export type ScriptType = 'latin' | 'arabic' | 'hebrew' | 'cyrillic' | 'cjk' | 'devanagari' | 'other'

/**
 * Number system type
 */
export type NumberSystem = 'western' | 'arabic-indic' | 'devanagari' | 'chinese' | 'other'

/**
 * Locale metadata
 */
export interface LocaleMetadata {
  locale: Locale
  direction: TextDirection
  script: ScriptType
  numberSystem: NumberSystem
  nativeName?: string
}

/**
 * RTL (Right-to-Left) languages
 */
const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'ps', // Pashto
  'yi', // Yiddish
  'ji', // Yiddish (alternative code)
  'iw', // Hebrew (old code)
  'dv', // Dhivehi/Maldivian
  'ckb', // Central Kurdish (Sorani)
  'ku', // Kurdish
])

/**
 * Script type mapping by language
 */
const SCRIPT_MAP: Record<string, ScriptType> = {
  // Arabic script
  ar: 'arabic',
  fa: 'arabic',
  ur: 'arabic',
  ps: 'arabic',
  ckb: 'arabic',
  ku: 'arabic',

  // Hebrew script
  he: 'hebrew',
  iw: 'hebrew',
  yi: 'hebrew',
  ji: 'hebrew',

  // Cyrillic script
  ru: 'cyrillic',
  uk: 'cyrillic',
  be: 'cyrillic',
  bg: 'cyrillic',
  mk: 'cyrillic',
  sr: 'cyrillic',

  // CJK (Chinese, Japanese, Korean)
  zh: 'cjk',
  ja: 'cjk',
  ko: 'cjk',

  // Devanagari script
  hi: 'devanagari',
  mr: 'devanagari',
  ne: 'devanagari',
}

/**
 * Number system mapping by language
 */
const NUMBER_SYSTEM_MAP: Record<string, NumberSystem> = {
  ar: 'arabic-indic',
  fa: 'arabic-indic',
  ur: 'arabic-indic',
  ps: 'arabic-indic',
  hi: 'devanagari',
  mr: 'devanagari',
  ne: 'devanagari',
  zh: 'chinese',
  ja: 'chinese',
}

/**
 * Native names for common locales
 */
const NATIVE_NAMES: Record<string, string> = {
  'ar': 'العربية',
  'zh': '中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'pt': 'Português',
  'ru': 'Русский',
  'he': 'עברית',
  'hi': 'हिन्दी',
  'fa': 'فارسی',
  'ur': 'اردو',
}

/**
 * Direction Manager
 * Handles text direction detection and management
 */
export class DirectionManager {
  private static cache = new Map<Locale, TextDirection>()

  /**
   * Get text direction for a locale
   */
  static getDirection(locale: Locale): TextDirection {
    // Check cache first
    if (this.cache.has(locale)) {
      return this.cache.get(locale)!
    }

    const { language } = parseLocale(locale)
    const direction = RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'

    this.cache.set(locale, direction)
    return direction
  }

  /**
   * Check if locale is RTL
   */
  static isRTL(locale: Locale): boolean {
    return this.getDirection(locale) === 'rtl'
  }

  /**
   * Check if locale is LTR
   */
  static isLTR(locale: Locale): boolean {
    return this.getDirection(locale) === 'ltr'
  }

  /**
   * Apply direction to an HTML element
   */
  static applyToElement(element: HTMLElement, locale: Locale): void {
    const direction = this.getDirection(locale)
    element.dir = direction
    element.setAttribute('data-direction', direction)
  }

  /**
   * Apply direction to document
   */
  static applyToDocument(locale: Locale): void {
    if (typeof document !== 'undefined') {
      const direction = this.getDirection(locale)
      document.documentElement.dir = direction
      document.documentElement.setAttribute('lang', locale)
      document.documentElement.setAttribute('data-direction', direction)
    }
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear()
  }
}

/**
 * Locale Metadata Manager
 * Provides comprehensive locale information
 */
export class LocaleMetadataManager {
  private static cache = new Map<Locale, LocaleMetadata>()

  /**
   * Get metadata for a locale
   */
  static getMetadata(locale: Locale): LocaleMetadata {
    // Check cache first
    if (this.cache.has(locale)) {
      return this.cache.get(locale)!
    }

    const { language } = parseLocale(locale)

    const metadata: LocaleMetadata = {
      locale,
      direction: DirectionManager.getDirection(locale),
      script: SCRIPT_MAP[language] || 'latin',
      numberSystem: NUMBER_SYSTEM_MAP[language] || 'western',
      nativeName: NATIVE_NAMES[locale] || NATIVE_NAMES[language],
    }

    this.cache.set(locale, metadata)
    return metadata
  }

  /**
   * Get script type for a locale
   */
  static getScript(locale: Locale): ScriptType {
    return this.getMetadata(locale).script
  }

  /**
   * Get number system for a locale
   */
  static getNumberSystem(locale: Locale): NumberSystem {
    return this.getMetadata(locale).numberSystem
  }

  /**
   * Get native name for a locale
   */
  static getNativeName(locale: Locale): string | undefined {
    return this.getMetadata(locale).nativeName
  }

  /**
   * Register custom locale metadata
   */
  static registerMetadata(locale: Locale, metadata: Partial<LocaleMetadata>): void {
    const existing = this.cache.get(locale) || this.getMetadata(locale)
    this.cache.set(locale, { ...existing, ...metadata })
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear()
  }
}

/**
 * RTL-aware CSS class generator
 */
export class RTLCSSHelper {
  /**
   * Generate direction-specific class name
   */
  static getDirectionClass(locale: Locale, baseClass: string): string {
    const direction = DirectionManager.getDirection(locale)
    return `${baseClass}--${direction}`
  }

  /**
   * Generate margin/padding class
   * Automatically converts start/end to left/right based on direction
   */
  static getSpacingClass(
    locale: Locale,
    property: 'margin' | 'padding',
    side: 'start' | 'end' | 'top' | 'bottom',
    value: string,
  ): string {
    if (side === 'top' || side === 'bottom') {
      return `${property}-${side}-${value}`
    }

    const direction = DirectionManager.getDirection(locale)
    const actualSide = direction === 'rtl'
      ? (side === 'start' ? 'right' : 'left')
      : (side === 'start' ? 'left' : 'right')

    return `${property}-${actualSide}-${value}`
  }

  /**
   * Generate flex direction class
   */
  static getFlexDirectionClass(locale: Locale, direction: 'row' | 'column'): string {
    if (direction === 'column') {
      return 'flex-column'
    }

    const textDirection = DirectionManager.getDirection(locale)
    return textDirection === 'rtl' ? 'flex-row-reverse' : 'flex-row'
  }

  /**
   * Generate text alignment class
   */
  static getTextAlignClass(locale: Locale, align: 'start' | 'end' | 'center'): string {
    if (align === 'center') {
      return 'text-center'
    }

    const direction = DirectionManager.getDirection(locale)
    const actualAlign = direction === 'rtl'
      ? (align === 'start' ? 'right' : 'left')
      : (align === 'start' ? 'left' : 'right')

    return `text-${actualAlign}`
  }
}

/**
 * Export helper functions for convenience
 */
export const isRTL = (locale: Locale) => DirectionManager.isRTL(locale)
export const isLTR = (locale: Locale) => DirectionManager.isLTR(locale)
export const getDirection = (locale: Locale) => DirectionManager.getDirection(locale)
export const getLocaleMetadata = (locale: Locale) => LocaleMetadataManager.getMetadata(locale)

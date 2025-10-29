/**
 * @ldesign/i18n - Smart Fallback Chain
 * Intelligent fallback resolution with regional variants
 */

import type { Locale } from '../types'
import { parseLocale } from './helpers'

/**
 * Regional similarity mapping
 * Maps regions to their most similar alternatives
 */
const REGIONAL_SIMILARITY: Record<string, string[]> = {
  // Chinese variants
  CN: ['TW', 'HK', 'SG'],
  TW: ['HK', 'CN', 'SG'],
  HK: ['TW', 'CN', 'SG'],
  SG: ['CN', 'TW', 'HK'],

  // Spanish variants
  ES: ['MX', 'AR', 'CO'],
  MX: ['ES', 'AR', 'CO'],
  AR: ['ES', 'MX', 'CO'],

  // English variants
  US: ['GB', 'CA', 'AU'],
  GB: ['US', 'CA', 'AU'],
  CA: ['US', 'GB', 'AU'],
  AU: ['GB', 'US', 'CA'],

  // Portuguese variants
  BR: ['PT'],
  PT: ['BR'],

  // French variants
  FR: ['CA', 'BE', 'CH'],
  BE: ['FR', 'CH', 'CA'],
  CH: ['FR', 'BE', 'CA'],
}

/**
 * Language family mapping for broader fallbacks
 */
const LANGUAGE_FAMILIES: Record<string, string[]> = {
  // Romance languages
  es: ['pt', 'it', 'fr'],
  pt: ['es', 'it', 'fr'],
  it: ['es', 'pt', 'fr'],
  fr: ['es', 'it', 'pt'],

  // Germanic languages
  en: ['de', 'nl'],
  de: ['nl', 'en'],
  nl: ['de', 'en'],

  // Slavic languages
  ru: ['uk', 'be', 'pl'],
  uk: ['ru', 'be', 'pl'],
  pl: ['ru', 'uk', 'cs'],
  cs: ['sk', 'pl'],
  sk: ['cs', 'pl'],

  // East Asian languages
  zh: ['ja', 'ko'],
  ja: ['zh', 'ko'],
  ko: ['zh', 'ja'],
}

/**
 * Smart Fallback Chain Generator
 */
export class SmartFallbackChain {
  private readonly cache = new Map<string, Locale[]>()
  private readonly maxChainLength: number
  private readonly includeSimilarLanguages: boolean

  constructor(options: {
    maxChainLength?: number
    includeSimilarLanguages?: boolean
  } = {}) {
    this.maxChainLength = options.maxChainLength || 10
    this.includeSimilarLanguages = options.includeSimilarLanguages !== false
  }

  /**
   * Generate smart fallback chain for a locale
   */
  generate(
    locale: Locale,
    fallbackLocale: Locale | Locale[] = 'en',
  ): Locale[] {
    // Check cache
    const cacheKey = `${locale}:${JSON.stringify(fallbackLocale)}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const chain: Locale[] = []
    const seen = new Set<Locale>()

    // 1. Original locale
    this.addUnique(chain, seen, locale)

    // 2. Regional variants (e.g., zh-CN -> zh-TW -> zh-HK)
    this.addRegionalVariants(chain, seen, locale)

    // 3. Language without region (e.g., zh-CN -> zh)
    const { language, region } = parseLocale(locale)
    if (region) {
      this.addUnique(chain, seen, language)
    }

    // 4. Similar languages (optional)
    if (this.includeSimilarLanguages) {
      this.addSimilarLanguages(chain, seen, language)
    }

    // 5. User-specified fallback locales
    const fallbacks = Array.isArray(fallbackLocale) ? fallbackLocale : [fallbackLocale]
    for (const fb of fallbacks) {
      this.addUnique(chain, seen, fb)
      // Also add regional variants of fallback
      this.addRegionalVariants(chain, seen, fb)
    }

    // 6. Ultimate fallback: en
    if (!seen.has('en')) {
      this.addUnique(chain, seen, 'en')
    }

    // Limit chain length
    const result = chain.slice(0, this.maxChainLength)

    // Cache result
    this.cache.set(cacheKey, result)

    return result
  }

  /**
   * Add regional variants to chain
   */
  private addRegionalVariants(chain: Locale[], seen: Set<Locale>, locale: Locale): void {
    const { language, region } = parseLocale(locale)

    if (!region)
      return

    const similarRegions = REGIONAL_SIMILARITY[region]
    if (similarRegions) {
      for (const similarRegion of similarRegions) {
        const variant = `${language}-${similarRegion}`
        this.addUnique(chain, seen, variant)
      }
    }
  }

  /**
   * Add similar languages to chain
   */
  private addSimilarLanguages(chain: Locale[], seen: Set<Locale>, language: string): void {
    const similarLangs = LANGUAGE_FAMILIES[language]
    if (similarLangs) {
      for (const similar of similarLangs) {
        this.addUnique(chain, seen, similar)
      }
    }
  }

  /**
   * Add locale to chain if not already present
   */
  private addUnique(chain: Locale[], seen: Set<Locale>, locale: Locale): void {
    const normalized = locale.toLowerCase()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      chain.push(locale)
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }
}

/**
 * Create a smart fallback chain generator
 */
export function createSmartFallbackChain(options?: {
  maxChainLength?: number
  includeSimilarLanguages?: boolean
}): SmartFallbackChain {
  return new SmartFallbackChain(options)
}

/**
 * Quick function to generate fallback chain
 */
export function getSmartFallbackChain(
  locale: Locale,
  fallbackLocale?: Locale | Locale[],
): Locale[] {
  const generator = new SmartFallbackChain()
  return generator.generate(locale, fallbackLocale)
}

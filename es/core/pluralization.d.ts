/**
 * @ldesign/i18n - Pluralization Engine
 * Handles plural forms for different languages
 */
type Locale = string;
type PluralRule = (count: number, locale?: string) => string;
/**
 * Plural categories defined by CLDR
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
export declare class PluralizationEngine {
    private readonly rules;
    private readonly defaultRule;
    private readonly separator;
    private readonly categoryCache;
    private readonly CACHE_MAX_SIZE;
    constructor(separator?: string);
    /**
     * Load built-in plural rules
     */
    private loadBuiltInRules;
    /**
     * Add custom plural rule for a locale
     */
    addRule(locale: Locale, rule: PluralRule): void;
    /**
     * Get plural rule for a locale
     */
    getRule(locale: Locale): PluralRule;
    /**
     * Get plural category for a count in a locale
     */
    getCategory(count: number, locale: Locale): PluralCategory;
    /**
     * Select the appropriate plural form from a message object
     */
    selectPlural(messages: Record<string, string> | string, count: number, locale: Locale): string;
    /**
     * Parse a plural message string into forms
     * Format: "one:item|few:items|many:items|other:items"
     * Or: "0:no items|1:one item|other:{{count}} items"
     */
    parsePluralString(message: string, separator?: string): Record<string, string>;
    /**
     * Format a plural message with count
     */
    format(message: string | Record<string, string>, count: number, locale: Locale, params?: Record<string, any>): string;
    /**
     * Check if a message contains plural forms
     */
    hasPluralForms(message: string, separator?: string): boolean;
    /**
     * Extract all plural forms from a message
     */
    extractPluralForms(message: string, separator?: string): string[];
    /**
     * Validate plural forms for a locale
     */
    validatePluralForms(message: string | Record<string, string>, locale: Locale): boolean;
    /**
     * Get supported plural categories for a locale
     */
    getSupportedCategories(locale: Locale): PluralCategory[];
}
export {};
//# sourceMappingURL=pluralization.d.ts.map
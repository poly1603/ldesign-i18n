/**
 * @ldesign/i18n - Interpolation Engine
 * Handles parameter replacement in translation messages
 */
import type { InterpolationOptions, InterpolationParams, Locale } from '../types';
export declare class InterpolationEngine {
    private readonly prefix;
    private readonly suffix;
    private readonly escapeValue;
    private readonly nestingPrefix;
    private readonly nestingSuffix;
    private readonly formatSeparator;
    private readonly formatter?;
    private readonly interpolationRegex;
    private readonly nestingRegex;
    private readonly formatCache;
    private readonly MAX_CACHE_SIZE;
    private readonly numberFormatters;
    private readonly dateFormatters;
    private readonly listFormatters;
    constructor(options?: InterpolationOptions | any);
    /**
     * Interpolate parameters into a message
     */
    interpolate(message: string, params?: InterpolationParams, locale?: Locale): string;
    /**
     * Handle parameter interpolation with optimized caching
     */
    private handleInterpolation;
    /**
     * Handle nested translations
     */
    private handleNesting;
    /**
     * Get value from params object (supports nested paths)
     */
    private getValue;
    /**
     * Optimized default formatting with caching
     */
    private defaultFormatOptimized;
    /**
     * Default formatting for common types
     */
    private defaultFormat;
    /**
     * Escape regex special characters
     */
    private escapeRegex;
    /**
     * Check if a message contains interpolation placeholders
     */
    hasPlaceholders(message: string): boolean;
    /**
     * Extract placeholder keys from a message
     */
    extractPlaceholders(message: string): string[];
    /**
     * Validate that all required placeholders have values
     */
    validateParams(message: string, params?: InterpolationParams): boolean;
}
//# sourceMappingURL=interpolation.d.ts.map
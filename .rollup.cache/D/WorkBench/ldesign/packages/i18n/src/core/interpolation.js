/**
 * @ldesign/i18n - Interpolation Engine
 * Handles parameter replacement in translation messages
 */
import { escapeHtml, getNestedValue, isPlainObject } from '../utils/helpers';
export class InterpolationEngine {
    constructor(options = {}) {
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "suffix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "escapeValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nestingPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nestingSuffix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "formatSeparator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "formatter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Pre-compiled regex for better performance
        Object.defineProperty(this, "interpolationRegex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nestingRegex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Cache for formatted values
        Object.defineProperty(this, "formatCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "MAX_CACHE_SIZE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 500
        });
        // Pre-compiled formatters for common types
        Object.defineProperty(this, "numberFormatters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "dateFormatters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "listFormatters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // Use any for ListFormat due to browser compatibility
        this.prefix = options.prefix || '{{';
        this.suffix = options.suffix || '}}';
        this.escapeValue = options.escapeValue !== false;
        this.nestingPrefix = options.nestingPrefix || '$t(';
        this.nestingSuffix = options.nestingSuffix || ')';
        this.formatSeparator = options.formatSeparator || ',';
        this.formatter = options.formatter;
        // Pre-compile regex with optimized patterns
        const prefixEscaped = this.escapeRegex(this.prefix);
        const suffixEscaped = this.escapeRegex(this.suffix);
        const nestingPrefixEscaped = this.escapeRegex(this.nestingPrefix);
        const nestingSuffixEscaped = this.escapeRegex(this.nestingSuffix);
        // Use non-greedy matching for better performance
        this.interpolationRegex = new RegExp(`${prefixEscaped}(.+?)${suffixEscaped}`, 'g');
        this.nestingRegex = new RegExp(`${nestingPrefixEscaped}(.+?)${nestingSuffixEscaped}`, 'g');
    }
    /**
     * Interpolate parameters into a message
     */
    interpolate(message, params, locale) {
        if (!params || !isPlainObject(params)) {
            return message;
        }
        let result = message;
        // Handle nested translations first
        result = this.handleNesting(result, params, locale);
        // Handle parameter interpolation
        result = this.handleInterpolation(result, params, locale);
        return result;
    }
    /**
     * Handle parameter interpolation with optimized caching
     */
    handleInterpolation(message, params, locale) {
        // Fast path: no placeholders
        if (!message.includes(this.prefix)) {
            return message;
        }
        // Reset regex lastIndex for reuse
        this.interpolationRegex.lastIndex = 0;
        return message.replace(this.interpolationRegex, (match, expression) => {
            const trimmedExpression = expression.trim();
            // Check format cache first
            const cacheKey = `${trimmedExpression}:${JSON.stringify(params[trimmedExpression.split(this.formatSeparator)[0].trim()])}:${locale}`;
            if (this.formatCache.has(cacheKey)) {
                return this.formatCache.get(cacheKey);
            }
            // Parse expression once
            const separatorIndex = trimmedExpression.indexOf(this.formatSeparator);
            const path = separatorIndex > -1 ? trimmedExpression.substring(0, separatorIndex).trim() : trimmedExpression;
            const format = separatorIndex > -1 ? trimmedExpression.substring(separatorIndex + 1).trim() : undefined;
            // Get value from params (optimized path)
            let value = params[path];
            if (value === undefined && path.includes('.')) {
                value = getNestedValue(params, path);
            }
            // Handle undefined values
            if (value === undefined) {
                return match; // Keep original placeholder if value not found
            }
            // Apply formatting
            let result;
            if (format) {
                if (this.formatter) {
                    result = String(this.formatter(value, format, locale));
                }
                else {
                    result = this.defaultFormatOptimized(value, format, locale);
                }
            }
            else {
                result = String(value);
            }
            // Escape HTML if needed
            if (this.escapeValue && typeof result === 'string') {
                result = escapeHtml(result);
            }
            // Cache the result
            if (this.formatCache.size >= this.MAX_CACHE_SIZE) {
                // Simple FIFO eviction
                const firstKey = this.formatCache.keys().next().value;
                if (firstKey !== undefined) {
                    this.formatCache.delete(firstKey);
                }
            }
            this.formatCache.set(cacheKey, result);
            return result;
        });
    }
    /**
     * Handle nested translations
     */
    handleNesting(message, params, _locale) {
        // Reset regex lastIndex for reuse
        this.nestingRegex.lastIndex = 0;
        return message.replace(this.nestingRegex, (match, key) => {
            const trimmedKey = key.trim();
            // Check if we have a translation function in params
            if (params.$t && typeof params.$t === 'function') {
                return params.$t(trimmedKey, params);
            }
            // Otherwise, just return the key or a placeholder
            return `[${trimmedKey}]`;
        });
    }
    /**
     * Get value from params object (supports nested paths)
     */
    getValue(params, path) {
        // First try direct access
        if (params[path] !== undefined) {
            return params[path];
        }
        // Then try nested path
        return getNestedValue(params, path);
    }
    /**
     * Optimized default formatting with caching
     */
    defaultFormatOptimized(value, format, locale) {
        // Number formatting with cached formatters
        if (typeof value === 'number') {
            const formatLower = format.toLowerCase();
            const formatterKey = `${locale}:${formatLower}`;
            switch (formatLower) {
                case 'number': {
                    let formatter = this.numberFormatters.get(formatterKey);
                    if (!formatter) {
                        formatter = new Intl.NumberFormat(locale);
                        this.numberFormatters.set(formatterKey, formatter);
                    }
                    return formatter.format(value);
                }
                case 'percent': {
                    let formatter = this.numberFormatters.get(formatterKey);
                    if (!formatter) {
                        formatter = new Intl.NumberFormat(locale, { style: 'percent' });
                        this.numberFormatters.set(formatterKey, formatter);
                    }
                    return formatter.format(value);
                }
                case 'currency': {
                    let formatter = this.numberFormatters.get(formatterKey);
                    if (!formatter) {
                        formatter = new Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: 'USD'
                        });
                        this.numberFormatters.set(formatterKey, formatter);
                    }
                    return formatter.format(value);
                }
                default: {
                    // Check if it's a decimal precision format (e.g., "0.00")
                    const precision = format.match(/^0\.0+$/);
                    if (precision) {
                        const decimals = precision[0].length - 2;
                        return value.toFixed(decimals);
                    }
                    return String(value);
                }
            }
        }
        return this.defaultFormat(value, format, locale);
    }
    /**
     * Default formatting for common types
     */
    defaultFormat(value, format, locale) {
        if (!format) {
            return String(value);
        }
        // Date formatting
        if (value instanceof Date) {
            switch (format.toLowerCase()) {
                case 'short':
                    return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(value);
                case 'medium':
                    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(value);
                case 'long':
                    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(value);
                case 'full':
                    return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(value);
                case 'time':
                    return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(value);
                case 'datetime':
                    return new Intl.DateTimeFormat(locale, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                    }).format(value);
                default:
                    return new Intl.DateTimeFormat(locale).format(value);
            }
        }
        // Array formatting
        if (Array.isArray(value)) {
            // Check if Intl.ListFormat is available
            if (typeof Intl.ListFormat !== 'undefined') {
                switch (format.toLowerCase()) {
                    case 'list':
                        return new Intl.ListFormat(locale, { type: 'conjunction' }).format(value);
                    case 'or':
                        return new Intl.ListFormat(locale, { type: 'disjunction' }).format(value);
                    case 'unit':
                        return new Intl.ListFormat(locale, { type: 'unit' }).format(value);
                    default:
                        return value.join(', ');
                }
            }
            else {
                // Fallback for browsers without ListFormat support
                return value.join(', ');
            }
        }
        // String formatting
        if (typeof value === 'string') {
            switch (format.toLowerCase()) {
                case 'upper':
                case 'uppercase':
                    return value.toUpperCase();
                case 'lower':
                case 'lowercase':
                    return value.toLowerCase();
                case 'capitalize':
                    return value.charAt(0).toUpperCase() + value.slice(1);
                case 'title':
                    return value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                default:
                    return value;
            }
        }
        return String(value);
    }
    /**
     * Escape regex special characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Check if a message contains interpolation placeholders
     */
    hasPlaceholders(message) {
        const regex = new RegExp(`${this.escapeRegex(this.prefix)}[^${this.escapeRegex(this.suffix)}]+${this.escapeRegex(this.suffix)}`);
        return regex.test(message);
    }
    /**
     * Extract placeholder keys from a message
     */
    extractPlaceholders(message) {
        const regex = new RegExp(`${this.escapeRegex(this.prefix)}([^${this.escapeRegex(this.suffix)}]+)${this.escapeRegex(this.suffix)}`, 'g');
        const placeholders = [];
        for (let m = regex.exec(message); m !== null; m = regex.exec(message)) {
            const expression = m[1].trim();
            const [path] = expression.split(this.formatSeparator).map(s => s.trim());
            placeholders.push(path);
        }
        return Array.from(new Set(placeholders));
    }
    /**
     * Validate that all required placeholders have values
     */
    validateParams(message, params) {
        if (!params)
            return !this.hasPlaceholders(message);
        const placeholders = this.extractPlaceholders(message);
        for (const placeholder of placeholders) {
            if (this.getValue(params, placeholder) === undefined) {
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=interpolation.js.map
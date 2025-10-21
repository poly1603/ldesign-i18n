/**
 * @ldesign/i18n - Utility Helpers
 * Common utility functions for the i18n system
 */
/**
 * Check if a value is a plain object
 */
export function isPlainObject(obj) {
    return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}
/**
 * Check if a value is a string
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * Check if a value is a function
 */
export function isFunction(value) {
    return typeof value === 'function';
}
/**
 * Check if a value is a promise
 */
export function isPromise(value) {
    return value instanceof Promise || (value !== null &&
        typeof value === 'object' &&
        isFunction(value.then) &&
        isFunction(value.catch));
}
/**
 * Deep clone an object - Optimized version with depth limit
 */
export function deepClone(obj, maxDepth = 10, currentDepth = 0) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (currentDepth >= maxDepth)
        return obj; // Prevent stack overflow
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof RegExp)
        return new RegExp(obj.source, obj.flags);
    if (Array.isArray(obj)) {
        const arr = Array.from({ length: obj.length });
        for (let i = 0; i < obj.length; i++) {
            arr[i] = deepClone(obj[i], maxDepth, currentDepth + 1);
        }
        return arr;
    }
    if (obj instanceof Set) {
        const set = new Set();
        for (const item of obj) {
            set.add(deepClone(item, maxDepth, currentDepth + 1));
        }
        return set;
    }
    if (obj instanceof Map) {
        const map = new Map();
        for (const [k, v] of obj) {
            map.set(k, deepClone(v, maxDepth, currentDepth + 1));
        }
        return map;
    }
    // Use Object.create(null) for faster object creation
    const cloned = Object.create(Object.getPrototypeOf(obj));
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        cloned[key] = deepClone(obj[key], maxDepth, currentDepth + 1);
    }
    return cloned;
}
/**
 * Deep merge objects - Optimized iterative version
 */
export function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    for (const source of sources) {
        if (!source)
            continue;
        if (isPlainObject(target) && isPlainObject(source)) {
            // Use Object.keys for better performance
            const keys = Object.keys(source);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const sourceValue = source[key];
                if (isPlainObject(sourceValue)) {
                    if (!target[key]) {
                        target[key] = {};
                    }
                    deepMerge(target[key], sourceValue);
                }
                else {
                    target[key] = sourceValue;
                }
            }
        }
    }
    return target;
}
/**
 * Get nested value from object using dot notation - Optimized with cache
 */
const pathCache = new Map();
const PATH_CACHE_MAX = 500;
export function getNestedValue(obj, path, separator = '.') {
    if (!path)
        return obj;
    // Cache path splits
    let keys = pathCache.get(path);
    if (!keys) {
        keys = path.split(separator);
        if (pathCache.size < PATH_CACHE_MAX) {
            pathCache.set(path, keys);
        }
    }
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
        if (current == null)
            return undefined;
        current = current[keys[i]];
    }
    return current;
}
/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj, path, value, separator = '.') {
    if (!path)
        return;
    const keys = path.split(separator);
    const lastKey = keys.pop();
    if (!lastKey)
        return;
    let current = obj;
    for (const key of keys) {
        if (!isPlainObject(current[key])) {
            current[key] = {};
        }
        current = current[key];
    }
    current[lastKey] = value;
}
/**
 * Flatten nested object to dot notation
 */
export function flattenObject(obj, prefix = '', separator = '.') {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = prefix ? `${prefix}${separator}${key}` : key;
            if (isPlainObject(obj[key]) && Object.keys(obj[key]).length > 0) {
                Object.assign(result, flattenObject(obj[key], newKey, separator));
            }
            else {
                result[newKey] = obj[key];
            }
        }
    }
    return result;
}
/**
 * Unflatten dot notation object to nested
 */
export function unflattenObject(obj, separator = '.') {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            setNestedValue(result, key, obj[key], separator);
        }
    }
    return result;
}
/**
 * Escape HTML special characters - Optimized with static map
 */
const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
};
const HTML_ESCAPE_REGEX = /[&<>"'/]/g;
export function escapeHtml(str) {
    return str.replace(HTML_ESCAPE_REGEX, char => HTML_ESCAPE_MAP[char]);
}
/**
 * Generate cache key
 */
export function generateCacheKey(locale, key, namespace) {
    return namespace ? `${locale}:${namespace}:${key}` : `${locale}:${key}`;
}
/**
 * Parse locale string (e.g., "en-US" -> { language: "en", region: "US" })
 */
export function parseLocale(locale) {
    const parts = locale.split(/[-_]/);
    return {
        language: parts[0].toLowerCase(),
        region: parts[1]?.toUpperCase()
    };
}
/**
 * Format locale string consistently
 */
export function formatLocale(language, region) {
    return region ? `${language}-${region}` : language;
}
/**
 * Get browser language
 */
export function getBrowserLanguage() {
    if (typeof window === 'undefined')
        return null;
    const nav = window.navigator;
    const language = nav.language || nav.userLanguage || nav.browserLanguage;
    return language || null;
}
/**
 * Debounce function
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}
/**
 * Throttle function
 */
export function throttle(fn, limit) {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Create a simple event emitter with memory leak protection
 */
export class EventEmitter {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "maxListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        }); // Prevent memory leaks
        Object.defineProperty(this, "listenerCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    on(event, listener) {
        let listeners = this.events.get(event);
        if (!listeners) {
            listeners = new Set();
            this.events.set(event, listeners);
        }
        // Prevent memory leaks
        if (this.listenerCount >= this.maxListeners) {
            console.warn(`[@ldesign/i18n] Max listeners (${this.maxListeners}) exceeded`);
            return () => { };
        }
        listeners.add(listener);
        this.listenerCount++;
        // Return unsubscribe function
        return () => {
            if (listeners.delete(listener)) {
                this.listenerCount--;
            }
        };
    }
    off(event, listener) {
        const listeners = this.events.get(event);
        if (listeners?.delete(listener)) {
            this.listenerCount--;
            if (listeners.size === 0) {
                this.events.delete(event);
            }
        }
    }
    once(event, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (!listeners || listeners.size === 0)
            return;
        // Use for...of for better performance
        for (const listener of listeners) {
            try {
                listener(...args);
            }
            catch (error) {
                console.error(`[@ldesign/i18n] Error in event listener for "${event}":`, error);
            }
        }
    }
    removeAllListeners(event) {
        if (event) {
            const listeners = this.events.get(event);
            if (listeners) {
                this.listenerCount -= listeners.size;
                this.events.delete(event);
            }
        }
        else {
            this.events.clear();
            this.listenerCount = 0;
        }
    }
}
/**
 * Warn helper for development
 */
export function warn(message, ...args) {
    if (typeof window !== 'undefined' && window.__DEV__ === true) {
        console.warn(`[@ldesign/i18n] ${message}`, ...args);
    }
}
/**
 * Error helper for development
 */
export function error(message, ...args) {
    if (typeof window !== 'undefined' && window.__DEV__ === true) {
        console.error(`[@ldesign/i18n] ${message}`, ...args);
    }
}
//# sourceMappingURL=helpers.js.map
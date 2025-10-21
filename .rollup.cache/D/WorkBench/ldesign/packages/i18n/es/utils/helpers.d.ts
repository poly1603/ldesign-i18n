/**
 * @ldesign/i18n - Utility Helpers
 * Common utility functions for the i18n system
 */
import type { Locale } from '../types';
/**
 * Check if a value is a plain object
 */
export declare function isPlainObject(obj: any): obj is Record<string, any>;
/**
 * Check if a value is a string
 */
export declare function isString(value: any): value is string;
/**
 * Check if a value is a function
 */
export declare function isFunction(value: any): value is Function;
/**
 * Check if a value is a promise
 */
export declare function isPromise<T = any>(value: any): value is Promise<T>;
/**
 * Deep clone an object - Optimized version with depth limit
 */
export declare function deepClone<T>(obj: T, maxDepth?: number, currentDepth?: number): T;
/**
 * Deep merge objects - Optimized iterative version
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
export declare function getNestedValue(obj: any, path: string, separator?: string): any;
/**
 * Set nested value in object using dot notation
 */
export declare function setNestedValue(obj: any, path: string, value: any, separator?: string): void;
/**
 * Flatten nested object to dot notation
 */
export declare function flattenObject(obj: any, prefix?: string, separator?: string): Record<string, any>;
/**
 * Unflatten dot notation object to nested
 */
export declare function unflattenObject(obj: Record<string, any>, separator?: string): any;
export declare function escapeHtml(str: string): string;
/**
 * Generate cache key
 */
export declare function generateCacheKey(locale: Locale, key: string, namespace?: string): string;
/**
 * Parse locale string (e.g., "en-US" -> { language: "en", region: "US" })
 */
export declare function parseLocale(locale: Locale): {
    language: string;
    region?: string;
};
/**
 * Format locale string consistently
 */
export declare function formatLocale(language: string, region?: string): Locale;
/**
 * Get browser language
 */
export declare function getBrowserLanguage(): Locale | null;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Create a simple event emitter with memory leak protection
 */
export declare class EventEmitter {
    private readonly events;
    private readonly maxListeners;
    private listenerCount;
    on(event: string, listener: (...args: any[]) => void): () => void;
    off(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    removeAllListeners(event?: string): void;
}
/**
 * Warn helper for development
 */
export declare function warn(message: string, ...args: any[]): void;
/**
 * Error helper for development
 */
export declare function error(message: string, ...args: any[]): void;

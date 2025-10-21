/**
 * Core module exports
 */
import type { I18nConfig, I18nInstance } from '../types';
export * from './advanced-formatter';
export * from './cache';
export * from './i18n-optimized';
export * from './interpolation';
export * from './lazy-loader';
export * from './pluralization';
/**
 * Create a new optimized i18n instance
 * @param config - Configuration options
 * @returns Configured i18n instance
 */
export declare function createI18n(config?: I18nConfig): I18nInstance;
//# sourceMappingURL=index.d.ts.map
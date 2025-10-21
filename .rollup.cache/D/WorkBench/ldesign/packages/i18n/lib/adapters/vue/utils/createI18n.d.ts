/**
 * Utility functions for Vue i18n
 */
import type { I18nConfig, I18nInstance } from '../../../types';
/**
 * Create i18n instance for Vue
 */
export declare function createI18n(config?: I18nConfig): I18nInstance;
/**
 * Define i18n config with type checking
 */
export declare function defineI18nConfig<T extends I18nConfig>(config: T): T;
/**
 * Load locale messages dynamically
 */
export declare function loadLocaleMessages(locale: string, loader: () => Promise<any>): Promise<Record<string, any>>;

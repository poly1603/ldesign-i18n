/**
 * @ldesign/i18n - Framework-agnostic i18n solution
 * A powerful, extensible internationalization library for any JavaScript framework
 *
 * @version 2.0.0
 * @author LDesign Team
 * @license MIT
 */
import type { I18nConfig, I18nInstance } from './types';
import { useI18n as vueUseI18n } from './adapters/vue';
import { createI18n, OptimizedI18n } from './core';
export { createVueI18n, I18nT, useCurrency, useDate, type UseI18nComposable, useNumber, usePlural, useRelativeTime, useTranslation, vI18n } from './adapters/vue';
export { createCache, LRUCache, MultiTierCache, StorageCache, WeakCache } from './core/cache';
export { OptimizedI18n as I18n, OptimizedI18n } from './core/i18n-optimized';
export { FastCacheKeyBuilder, ObjectPool } from './core/i18n-optimized';
export { InterpolationEngine } from './core/interpolation';
export { PluralizationEngine } from './core/pluralization';
export type { PluralCategory } from './core/pluralization';
export { createDefaultI18nEnginePlugin, createI18nEnginePlugin, type I18nEnginePluginOptions, i18nPlugin } from './engine';
export declare const LazyFeatures: {
    loadOfflineFirst(): Promise<typeof import("./core/offline-first")>;
    loadPerformanceMonitor(): Promise<typeof import("./core/performance-monitor")>;
    loadContextAware(): Promise<typeof import("./core/context-aware")>;
    loadAdvancedFormatter(): Promise<typeof import("./core/advanced-formatter")>;
};
export declare const PluginLoader: {
    load(pluginName: string): Promise<any>;
};
export { createI18n };
/**
 * Get or create global i18n instance
 */
export declare function useI18n(config?: I18nConfig): I18nInstance;
/**
 * Set global i18n instance
 */
export declare function setGlobalI18n(instance: I18nInstance): void;
/**
 * Get global i18n instance (throws if not set)
 */
export declare function getGlobalI18n(): I18nInstance;
/**
 * Clear global i18n instance
 */
export declare function clearGlobalI18n(): void;
/**
 * Quick translation function using global instance
 */
export declare function t(key: string, params?: Record<string, any>): string;
/**
 * Version and build info
 */
export declare const VERSION = "2.0.0";
export declare const BUILD_DATE: string;
export declare const Adapters: {
    vue(): Promise<typeof import("./adapters/vue")>;
    react(): Promise<never>;
    angular(): Promise<never>;
    svelte(): Promise<never>;
};
export { createI18nPlugin, type I18nPluginOptions, useI18n as useI18nPlugin } from './plugin';
export type { Cache, CacheConfig, DeepPartial, DetectionConfig, ErrorHandler, Formatter, FrameworkAdapter, I18nConfig, I18nContext, I18nEventData, I18nEventListener, I18nEventType, I18nInstance, I18nPlugin, InterpolationConfig, InterpolationOptions, InterpolationParams, LanguageDetector, LanguagePackage, Locale, MessageKey, MessageLoader, Messages, MessageStorage, MessageValue, MissingKeyHandler, PluralRule, PromiseOr, TranslateOptions, TranslationFunction, ValueOf } from './types';
export * from './utils/bundle-optimization';
export { vueUseI18n as useVueI18n };
export * from './utils/helpers';
export default OptimizedI18n;

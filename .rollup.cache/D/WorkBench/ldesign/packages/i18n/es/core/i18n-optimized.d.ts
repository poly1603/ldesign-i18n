/**
 * @ldesign/i18n - Optimized Core I18n Class
 * Performance-optimized internationalization engine
 */
import type { I18nConfig, I18nContext, I18nEventData, I18nEventListener, I18nEventType, I18nInstance, I18nPlugin, Locale, MessageKey, Messages, TranslateOptions, TranslationFunction } from '../types';
export declare class ObjectPool<T> {
    private readonly pool;
    private readonly factory;
    private readonly reset;
    private readonly maxSize;
    constructor(factory: () => T, reset: (obj: T) => void, maxSize?: number);
    get(): T;
    release(obj: T): void;
    clear(): void;
}
export declare class FastCacheKeyBuilder {
    private static readonly separator;
    private static readonly instance;
    private readonly buffer;
    static get(): FastCacheKeyBuilder;
    add(value: string | number | undefined): this;
    build(): string;
    reset(): void;
}
export declare class OptimizedI18n implements I18nInstance {
    readonly version = "2.0.0";
    readonly config: Readonly<I18nConfig>;
    private _locale;
    private _fallbackLocale;
    private messages;
    private loader?;
    private storage?;
    private detector?;
    private cache;
    private eventEmitter;
    private interpolation;
    private pluralization;
    private plugins;
    private initialized;
    private namespaces;
    private defaultNamespace;
    private keySeparator;
    private namespaceSeparator;
    private cacheKeyBuilder;
    private optionsPool;
    private readonly pooledMarker;
    private hotPathCache?;
    private readonly HOT_PATH_CACHE_SIZE;
    private accessCount?;
    private readonly isDev;
    constructor(config?: I18nConfig);
    init(): Promise<void>;
    get locale(): Locale;
    set locale(value: Locale);
    get fallbackLocale(): Locale | Locale[];
    set fallbackLocale(value: Locale | Locale[]);
    private createOptimizedTranslate;
    t: TranslationFunction;
    /**
     * Batch translate multiple keys with optimized performance
     */
    translateBatch(keys: MessageKey[] | Record<string, MessageKey>, options?: TranslateOptions): string[] | Record<string, string>;
    translate(key: MessageKey, options?: TranslateOptions): string;
    exists(key: MessageKey, options?: TranslateOptions): boolean;
    plural(key: MessageKey, count: number, options?: TranslateOptions): string;
    private getCacheKeyOptimized;
    private normalizeOptionsOptimized;
    private resolveMessageOptimized;
    private resolveFallbackOptimized;
    private updateHotPathCache;
    private updateAccessCount;
    private findLeastAccessedKey;
    private clearPerformanceCaches;
    setLocale(locale: Locale): Promise<void>;
    getLocale(): Locale;
    addLocale(locale: Locale, messages: Messages): void;
    removeLocale(locale: Locale): void;
    hasLocale(locale: Locale): boolean;
    getAvailableLocales(): Locale[];
    addMessages(locale: Locale, messages: Messages, namespace?: string): void;
    setMessages(locale: Locale, messages: Messages, namespace?: string): void;
    getMessages(locale?: Locale, namespace?: string): Messages | null;
    mergeMessages(locale: Locale, messages: Messages, namespace?: string): void;
    on(event: I18nEventType, listener: I18nEventListener): () => void;
    off(event: I18nEventType, listener: I18nEventListener): void;
    once(event: I18nEventType, listener: I18nEventListener): void;
    emit(event: I18nEventType, data?: Omit<I18nEventData, 'type'>): void;
    loadNamespace(namespace: string, locale?: Locale): Promise<void>;
    hasNamespace(namespace: string, locale?: Locale): boolean;
    format(value: any, format: string, locale?: Locale, options?: any): string;
    number(value: number, options?: Intl.NumberFormatOptions): string;
    currency(value: number, currency: string, options?: Intl.NumberFormatOptions): string;
    date(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string;
    relativeTime(value: Date | string | number, options?: Intl.RelativeTimeFormatOptions): string;
    use(plugin: I18nPlugin): Promise<void>;
    unuse(plugin: I18nPlugin | string): Promise<void>;
    ready(): Promise<void>;
    clone(config?: Partial<I18nConfig>): I18nInstance;
    createContext(namespace: string): I18nContext;
    private handleMissing;
    private detectLocale;
    destroy(): void;
}
export { OptimizedI18n as I18n };

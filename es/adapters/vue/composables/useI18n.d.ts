/**
 * useI18n - Main composable for Vue i18n
 */
import type { I18nInstance, InterpolationParams, Locale, MessageKey, TranslateOptions } from '../../../types';
import { type ComputedRef, type Ref } from 'vue';
export interface UseI18nOptions {
    useScope?: 'global' | 'local';
    messages?: Record<string, any>;
    locale?: string;
    fallbackLocale?: string | string[];
    inheritLocale?: boolean;
    namespace?: string;
}
export interface UseI18nReturn {
    locale: Ref<Locale>;
    fallbackLocale: Ref<Locale | Locale[]>;
    messages: ComputedRef<Record<string, any>>;
    availableLocales: ComputedRef<Locale[]>;
    t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string;
    te: (key: MessageKey, locale?: Locale) => boolean;
    tm: (key: MessageKey) => any;
    rt: (message: string, params?: InterpolationParams) => string;
    tc: (key: MessageKey, count: number, params?: InterpolationParams) => string;
    tp: (key: MessageKey, count: number, params?: InterpolationParams) => string;
    d: (value: Date | number | string, format?: string) => string;
    n: (value: number, format?: string) => string;
    setLocale: (locale: Locale) => Promise<void>;
    getLocale: () => Locale;
    setFallbackLocale: (locale: Locale | Locale[]) => void;
    getFallbackLocale: () => Locale | Locale[];
    mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => void;
    getLocaleMessage: (locale: Locale) => Record<string, any>;
    setLocaleMessage: (locale: Locale, messages: Record<string, any>) => void;
    i18n: I18nInstance;
}
export declare function useI18n(options?: UseI18nOptions): UseI18nReturn;
//# sourceMappingURL=useI18n.d.ts.map
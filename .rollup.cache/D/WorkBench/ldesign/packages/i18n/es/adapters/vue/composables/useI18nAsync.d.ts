/**
 * useI18nAsync - Async loading hook
 */
import type { Locale } from '../../../types';
import { type Ref } from 'vue';
export interface UseI18nAsyncOptions {
    loadLocale?: boolean;
    locale?: Locale;
    loader?: (locale: Locale) => Promise<Record<string, any>>;
}
export interface UseI18nAsyncReturn {
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    ready: Ref<boolean>;
    loadMessages: (locale: Locale) => Promise<void>;
}
export declare function useI18nAsync(options?: UseI18nAsyncOptions): UseI18nAsyncReturn;

/**
 * @ldesign/i18n - Vue 3 Adapter
 * Vue 3 integration for the i18n library
 */
import type { ComputedRef, InjectionKey, Plugin, Ref } from 'vue';
import type { I18nConfig, I18nInstance, Locale } from '../types';
export declare const I18N_INJECTION_KEY: InjectionKey<I18nInstance>;
/**
 * Vue composable return type
 */
export interface UseI18nComposable {
    i18n: I18nInstance;
    t: I18nInstance['t'];
    locale: Ref<Locale>;
    setLocale: (locale: Locale) => Promise<void>;
    availableLocales: ComputedRef<Locale[]>;
    currentLocale: ComputedRef<Locale>;
    fallbackLocale: ComputedRef<Locale | Locale[]>;
    isReady: Ref<boolean>;
}
/**
 * Create Vue plugin for i18n
 */
export declare function createVueI18n(config?: I18nConfig): Plugin & {
    i18n: I18nInstance;
};
/**
 * Vue composable for using i18n
 */
export declare function useI18n(config?: I18nConfig): UseI18nComposable;
/**
 * Create Vue directive for translations
 */
export declare const vI18n: {
    mounted(el: HTMLElement, binding: any): void;
    updated(el: HTMLElement, binding: any): void;
};
/**
 * Translation component for Vue
 */
export declare const I18nT: {
    name: string;
    props: {
        keypath: {
            type: StringConstructor;
            required: boolean;
        };
        tag: {
            type: StringConstructor;
            default: string;
        };
        params: {
            type: ObjectConstructor;
            default: () => {};
        };
    };
    setup(props: any): () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
};
export declare function useTranslation(key: string, params?: Ref<Record<string, any>>): ComputedRef<string>;
export declare function usePlural(key: string, count: Ref<number>, params?: Ref<Record<string, any>>): ComputedRef<string>;
export declare function useNumber(value: Ref<number>, options?: Intl.NumberFormatOptions): ComputedRef<string>;
export declare function useDate(value: Ref<Date | string | number>, options?: Intl.DateTimeFormatOptions): ComputedRef<string>;
export declare function useCurrency(value: Ref<number>, currency: string, options?: Intl.NumberFormatOptions): ComputedRef<string>;
export declare function useRelativeTime(value: Ref<Date | string | number>, options?: Intl.RelativeTimeFormatOptions): ComputedRef<string>;

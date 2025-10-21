/**
 * Constants for Vue i18n adapter
 */
import type { InjectionKey } from 'vue';
import type { I18nInstance } from '../../types';
export declare const I18N_SYMBOL: InjectionKey<I18nInstance>;
export declare const I18N_INJECTION_KEY: InjectionKey<I18nInstance>;
export declare const i18nSymbol: InjectionKey<I18nInstance>;
export declare const DEFAULT_LOCALE = "en-US";
export declare const DEFAULT_FALLBACK_LOCALE = "en";
export declare const COMPONENT_PREFIX = "I18n";
export declare const DIRECTIVE_PREFIX = "v-t";

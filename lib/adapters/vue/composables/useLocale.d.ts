/**
 * useLocale - Locale management hook
 */
import type { Locale } from '../../../types';
import { type ComputedRef, type Ref } from 'vue';
export interface UseLocaleReturn {
    locale: Ref<Locale>;
    availableLocales: ComputedRef<Locale[]>;
    setLocale: (locale: Locale) => Promise<void>;
    isCurrentLocale: (locale: Locale) => boolean;
}
export declare function useLocale(): UseLocaleReturn;
//# sourceMappingURL=useLocale.d.ts.map
/**
 * useLocale - Locale management hook
 */
import { ref } from 'vue';
import { useI18n } from './useI18n';
export function useLocale() {
    const { locale, availableLocales, setLocale } = useI18n();
    const isCurrentLocale = (checkLocale) => {
        return locale?.value === checkLocale;
    };
    return {
        locale: locale || ref('en_us'),
        availableLocales,
        setLocale,
        isCurrentLocale
    };
}
//# sourceMappingURL=useLocale.js.map
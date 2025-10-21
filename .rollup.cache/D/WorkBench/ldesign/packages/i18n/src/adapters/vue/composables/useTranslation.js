/**
 * useTranslation - Simplified translation hook
 */
import { computed } from 'vue';
import { useI18n } from './useI18n';
export function useTranslation(namespace) {
    const { t, tc, te, locale } = useI18n({ namespace });
    const ready = computed(() => locale.value !== undefined);
    return {
        t,
        tc,
        te,
        locale: locale.value,
        ready: ready.value
    };
}
//# sourceMappingURL=useTranslation.js.map
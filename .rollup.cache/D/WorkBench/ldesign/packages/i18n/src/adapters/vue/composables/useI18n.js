/**
 * useI18n - Main composable for Vue i18n
 */
import { computed, inject, onUnmounted, ref, watchEffect } from 'vue';
import { I18N_SYMBOL } from '../constants';
export function useI18n(options = {}) {
    const { useScope = 'global', messages: localMessages, locale: localLocale, fallbackLocale: localFallback, inheritLocale = true, namespace } = options;
    // Get global i18n instance
    const globalI18n = inject(I18N_SYMBOL);
    if (!globalI18n) {
        throw new Error('[useI18n] No i18n instance found. Make sure to install the i18n plugin.');
    }
    // Create local scope if needed
    let i18n;
    if (useScope === 'local' && localMessages) {
        // Create a local i18n instance
        i18n = globalI18n.clone({
            locale: localLocale || (inheritLocale ? globalI18n.locale : undefined),
            fallbackLocale: localFallback || (inheritLocale ? globalI18n.fallbackLocale : undefined),
            messages: localMessages
        });
    }
    else {
        i18n = globalI18n;
    }
    // Create reactive refs
    const locale = ref(i18n.locale || 'en_us');
    const fallbackLocale = ref(i18n.fallbackLocale || 'en_us');
    // Sync locale changes with cleanup
    const stopWatchLocale = watchEffect(() => {
        i18n.locale = locale.value;
    });
    const stopWatchFallback = watchEffect(() => {
        i18n.fallbackLocale = fallbackLocale.value;
    });
    // Listen to locale changes
    const unsubscribe = i18n.on('localeChanged', ({ locale: newLocale }) => {
        locale.value = newLocale;
    });
    // Cleanup on unmount
    onUnmounted(() => {
        stopWatchLocale();
        stopWatchFallback();
        if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
        }
        // Clean up local instance if created
        if (useScope === 'local' && i18n !== globalI18n && 'destroy' in i18n) {
            i18n.destroy();
        }
    });
    // Computed properties
    const messages = computed(() => i18n.getMessages(locale.value) || {});
    const availableLocales = computed(() => i18n.getAvailableLocales());
    // Translation function with namespace support
    const t = (key, params) => {
        const actualKey = namespace ? `${namespace}.${key}` : key;
        return i18n.t(actualKey, params);
    };
    // Check if translation exists
    const te = (key, checkLocale) => {
        const actualKey = namespace ? `${namespace}.${key}` : key;
        return i18n.exists(actualKey, { locale: checkLocale });
    };
    // Get raw message
    const tm = (key) => {
        const actualKey = namespace ? `${namespace}.${key}` : key;
        const messages = i18n.getMessages(locale.value);
        if (!messages)
            return undefined;
        const keys = actualKey.split('.');
        let result = messages;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            }
            else {
                return undefined;
            }
        }
        return result;
    };
    // Interpolate raw translation
    const rt = (message, params) => {
        return i18n.interpolation.interpolate(message, params || {}, locale.value);
    };
    // Translation with count (pluralization)
    const tc = (key, count, params) => {
        const actualKey = namespace ? `${namespace}.${key}` : key;
        return i18n.plural(actualKey, count, { params });
    };
    // Date formatting
    const d = (value, format) => {
        return i18n.date(value, format ? { dateStyle: format } : undefined);
    };
    // Number formatting
    const n = (value, format) => {
        if (format === 'currency') {
            return i18n.currency(value, 'USD'); // Default currency
        }
        else if (format === 'percent') {
            return i18n.number(value, { style: 'percent' });
        }
        return i18n.number(value);
    };
    // Locale management
    const setLocale = async (newLocale) => {
        await i18n.setLocale(newLocale);
        locale.value = newLocale;
    };
    const getLocale = () => locale.value || 'en_us';
    const setFallbackLocale = (newFallback) => {
        i18n.fallbackLocale = newFallback;
        fallbackLocale.value = newFallback;
    };
    const getFallbackLocale = () => fallbackLocale.value;
    // Message management
    const mergeLocaleMessage = (locale, messages) => {
        i18n.mergeMessages(locale, messages, namespace);
    };
    const getLocaleMessage = (locale) => {
        return i18n.getMessages(locale, namespace) || {};
    };
    const setLocaleMessage = (locale, messages) => {
        i18n.setMessages(locale, messages, namespace);
    };
    return {
        // Properties
        locale: locale,
        fallbackLocale: fallbackLocale,
        messages,
        availableLocales,
        // Methods
        t,
        te,
        tm,
        rt,
        tc,
        tp: tc, // Alias for tc
        d,
        n,
        // Locale management
        setLocale,
        getLocale,
        setFallbackLocale,
        getFallbackLocale,
        // Message management
        mergeLocaleMessage,
        getLocaleMessage,
        setLocaleMessage,
        // Instance
        i18n
    };
}
//# sourceMappingURL=useI18n.js.map
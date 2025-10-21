/**
 * @ldesign/i18n - Vue 3 Adapter
 * Vue 3 integration for the i18n library
 */
import { computed, h, inject, ref } from 'vue';
import { createI18n } from '../core';
// Injection key for Vue
export const I18N_INJECTION_KEY = Symbol('i18n');
/**
 * Create Vue plugin for i18n
 */
export function createVueI18n(config) {
    const i18n = createI18n(config);
    return {
        i18n,
        install(app) {
            // Provide i18n instance globally
            app.provide(I18N_INJECTION_KEY, i18n);
            // Add global properties
            app.config.globalProperties.$i18n = i18n;
            app.config.globalProperties.$t = i18n.t.bind(i18n);
            // Add global methods
            app.config.globalProperties.$setLocale = async (locale) => {
                await i18n.setLocale(locale);
            };
            // Initialize i18n
            i18n.init().catch(err => {
                console.error('Failed to initialize i18n:', err);
            });
        }
    };
}
/**
 * Vue composable for using i18n
 */
export function useI18n(config) {
    // Try to inject existing instance
    const injected = inject(I18N_INJECTION_KEY, null);
    // Use injected or create new instance
    const i18n = injected || createI18n(config);
    // Reactive locale
    const locale = ref(i18n.locale);
    const isReady = ref(false);
    // Watch for locale changes
    i18n.on('localeChanged', ({ locale: newLocale }) => {
        if (newLocale) {
            locale.value = newLocale;
        }
    });
    // Initialize if not already done
    if (!injected && config?.messages) {
        i18n.init().then(() => {
            isReady.value = true;
        });
    }
    else {
        isReady.value = true;
    }
    // Computed properties
    const availableLocales = computed(() => i18n.getAvailableLocales());
    const currentLocale = computed(() => locale.value);
    const fallbackLocale = computed(() => i18n.fallbackLocale);
    // Methods
    const setLocale = async (newLocale) => {
        await i18n.setLocale(newLocale);
        locale.value = newLocale;
    };
    // 让 t 对 locale 产生响应式依赖，切换语言时可触发组件重渲染
    const reactiveT = ((key, params) => {
        // 使用 locale.value 建立依赖关系，但避免不必要的字符串拼接
        void locale.value;
        return i18n.t(key, params);
    });
    return {
        i18n,
        t: reactiveT,
        locale,
        setLocale,
        availableLocales,
        currentLocale,
        fallbackLocale,
        isReady
    };
}
/**
 * Create Vue directive for translations
 */
export const vI18n = {
    mounted(el, binding) {
        const i18n = inject(I18N_INJECTION_KEY);
        if (!i18n) {
            console.warn('i18n instance not found. Make sure to install the i18n plugin.');
            return;
        }
        const { value, modifiers } = binding;
        if (typeof value === 'string') {
            // Simple translation
            el.textContent = i18n?.t(value) || value;
        }
        else if (typeof value === 'object') {
            // Translation with params
            const { key, params } = value;
            if (modifiers.html) {
                el.innerHTML = i18n?.t(key, params) || key;
            }
            else {
                el.textContent = i18n?.t(key, params) || key;
            }
        }
    },
    updated(el, binding) {
        const i18n = inject(I18N_INJECTION_KEY);
        if (!i18n)
            return;
        const { value, modifiers } = binding;
        if (typeof value === 'string') {
            el.textContent = i18n?.t(value) || value;
        }
        else if (typeof value === 'object') {
            const { key, params } = value;
            if (modifiers.html) {
                el.innerHTML = i18n?.t(key, params) || key;
            }
            else {
                el.textContent = i18n?.t(key, params) || key;
            }
        }
    }
};
/**
 * Translation component for Vue
 */
export const I18nT = {
    name: 'I18nT',
    props: {
        keypath: {
            type: String,
            required: true
        },
        tag: {
            type: String,
            default: 'span'
        },
        params: {
            type: Object,
            default: () => ({})
        }
    },
    setup(props) {
        const { t } = useI18n();
        const translation = computed(() => {
            return t(props.keypath, props.params);
        });
        return () => {
            const { tag } = props;
            return h(tag, translation.value);
        };
    }
};
// Vue-specific helper to create reactive translations
export function useTranslation(key, params) {
    const { t, locale } = useI18n();
    return computed(() => {
        // 建立响应式依赖
        void locale.value;
        return t(key, params?.value);
    });
}
// Helper for plural translations
export function usePlural(key, count, params) {
    const { i18n, locale } = useI18n();
    return computed(() => {
        void locale.value;
        return i18n.plural(key, count.value, { params: { ...params?.value, count: count.value } });
    });
}
// Helper for formatted numbers
export function useNumber(value, options) {
    const { i18n, locale } = useI18n();
    return computed(() => {
        void locale.value;
        return i18n.number(value.value, options);
    });
}
// Helper for formatted dates
export function useDate(value, options) {
    const { i18n, locale } = useI18n();
    return computed(() => {
        void locale.value;
        return i18n.date(value.value, options);
    });
}
// Helper for formatted currency
export function useCurrency(value, currency, options) {
    const { i18n, locale } = useI18n();
    return computed(() => {
        void locale.value;
        return i18n.currency(value.value, currency, options);
    });
}
// Helper for relative time
export function useRelativeTime(value, options) {
    const { i18n, locale } = useI18n();
    return computed(() => {
        void locale.value;
        return i18n.relativeTime(value.value, options);
    });
}
// h function is already imported above
//# sourceMappingURL=vue.js.map
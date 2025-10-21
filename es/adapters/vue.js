/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { inject, ref, computed, h } from 'vue';
import { createI18n } from '../core/index.js';

const I18N_INJECTION_KEY = Symbol("i18n");
function createVueI18n(config) {
  const i18n = createI18n(config);
  return {
    i18n,
    install(app) {
      app.provide(I18N_INJECTION_KEY, i18n);
      app.config.globalProperties.$i18n = i18n;
      app.config.globalProperties.$t = i18n.t.bind(i18n);
      app.config.globalProperties.$setLocale = async (locale) => {
        await i18n.setLocale(locale);
      };
      i18n.init().catch((err) => {
        console.error("Failed to initialize i18n:", err);
      });
    }
  };
}
function useI18n(config) {
  const injected = inject(I18N_INJECTION_KEY, null);
  const i18n = injected || createI18n(config);
  const locale = ref(i18n.locale);
  const isReady = ref(false);
  i18n.on("localeChanged", ({
    locale: newLocale
  }) => {
    if (newLocale) {
      locale.value = newLocale;
    }
  });
  if (!injected && config?.messages) {
    i18n.init().then(() => {
      isReady.value = true;
    });
  } else {
    isReady.value = true;
  }
  const availableLocales = computed(() => i18n.getAvailableLocales());
  const currentLocale = computed(() => locale.value);
  const fallbackLocale = computed(() => i18n.fallbackLocale);
  const setLocale = async (newLocale) => {
    await i18n.setLocale(newLocale);
    locale.value = newLocale;
  };
  const reactiveT = (key, params) => {
    void locale.value;
    return i18n.t(key, params);
  };
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
const vI18n = {
  mounted(el, binding) {
    const i18n = inject(I18N_INJECTION_KEY);
    if (!i18n) {
      console.warn("i18n instance not found. Make sure to install the i18n plugin.");
      return;
    }
    const {
      value,
      modifiers
    } = binding;
    if (typeof value === "string") {
      el.textContent = i18n?.t(value) || value;
    } else if (typeof value === "object") {
      const {
        key,
        params
      } = value;
      if (modifiers.html) {
        el.innerHTML = i18n?.t(key, params) || key;
      } else {
        el.textContent = i18n?.t(key, params) || key;
      }
    }
  },
  updated(el, binding) {
    const i18n = inject(I18N_INJECTION_KEY);
    if (!i18n) return;
    const {
      value,
      modifiers
    } = binding;
    if (typeof value === "string") {
      el.textContent = i18n?.t(value) || value;
    } else if (typeof value === "object") {
      const {
        key,
        params
      } = value;
      if (modifiers.html) {
        el.innerHTML = i18n?.t(key, params) || key;
      } else {
        el.textContent = i18n?.t(key, params) || key;
      }
    }
  }
};
const I18nT = {
  name: "I18nT",
  props: {
    keypath: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: "span"
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const {
      t
    } = useI18n();
    const translation = computed(() => {
      return t(props.keypath, props.params);
    });
    return () => {
      const {
        tag
      } = props;
      return h(tag, translation.value);
    };
  }
};
function useTranslation(key, params) {
  const {
    t,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return t(key, params?.value);
  });
}
function usePlural(key, count, params) {
  const {
    i18n,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return i18n.plural(key, count.value, {
      params: {
        ...params?.value,
        count: count.value
      }
    });
  });
}
function useNumber(value, options) {
  const {
    i18n,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return i18n.number(value.value, options);
  });
}
function useDate(value, options) {
  const {
    i18n,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return i18n.date(value.value, options);
  });
}
function useCurrency(value, currency, options) {
  const {
    i18n,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return i18n.currency(value.value, currency, options);
  });
}
function useRelativeTime(value, options) {
  const {
    i18n,
    locale
  } = useI18n();
  return computed(() => {
    void locale.value;
    return i18n.relativeTime(value.value, options);
  });
}

export { I18N_INJECTION_KEY, I18nT, createVueI18n, useCurrency, useDate, useI18n, useNumber, usePlural, useRelativeTime, useTranslation, vI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=vue.js.map

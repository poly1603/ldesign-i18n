/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { inject, ref, watchEffect, onUnmounted, computed } from 'vue';
import { I18N_SYMBOL } from '../constants.js';

function useI18n(options = {}) {
  const {
    useScope = "global",
    messages: localMessages,
    locale: localLocale,
    fallbackLocale: localFallback,
    inheritLocale = true,
    namespace
  } = options;
  const globalI18n = inject(I18N_SYMBOL);
  if (!globalI18n) {
    throw new Error("[useI18n] No i18n instance found. Make sure to install the i18n plugin.");
  }
  let i18n;
  if (useScope === "local" && localMessages) {
    i18n = globalI18n.clone({
      locale: localLocale || (inheritLocale ? globalI18n.locale : void 0),
      fallbackLocale: localFallback || (inheritLocale ? globalI18n.fallbackLocale : void 0),
      messages: localMessages
    });
  } else {
    i18n = globalI18n;
  }
  const locale = ref(i18n.locale || "en_us");
  const fallbackLocale = ref(i18n.fallbackLocale || "en_us");
  const stopWatchLocale = watchEffect(() => {
    i18n.locale = locale.value;
  });
  const stopWatchFallback = watchEffect(() => {
    i18n.fallbackLocale = fallbackLocale.value;
  });
  const unsubscribe = i18n.on("localeChanged", ({
    locale: newLocale
  }) => {
    locale.value = newLocale;
  });
  onUnmounted(() => {
    stopWatchLocale();
    stopWatchFallback();
    if (unsubscribe && typeof unsubscribe === "function") {
      unsubscribe();
    }
    if (useScope === "local" && i18n !== globalI18n && "destroy" in i18n) {
      i18n.destroy();
    }
  });
  const messages = computed(() => i18n.getMessages(locale.value) || {});
  const availableLocales = computed(() => i18n.getAvailableLocales());
  const t = (key, params) => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.t(actualKey, params);
  };
  const te = (key, checkLocale) => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.exists(actualKey, {
      locale: checkLocale
    });
  };
  const tm = (key) => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    const messages2 = i18n.getMessages(locale.value);
    if (!messages2) return void 0;
    const keys = actualKey.split(".");
    let result = messages2;
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        return void 0;
      }
    }
    return result;
  };
  const rt = (message, params) => {
    return i18n.interpolation.interpolate(message, params || {}, locale.value);
  };
  const tc = (key, count, params) => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.plural(actualKey, count, {
      params
    });
  };
  const d = (value, format) => {
    return i18n.date(value, format ? {
      dateStyle: format
    } : void 0);
  };
  const n = (value, format) => {
    if (format === "currency") {
      return i18n.currency(value, "USD");
    } else if (format === "percent") {
      return i18n.number(value, {
        style: "percent"
      });
    }
    return i18n.number(value);
  };
  const setLocale = async (newLocale) => {
    await i18n.setLocale(newLocale);
    locale.value = newLocale;
  };
  const getLocale = () => locale.value || "en_us";
  const setFallbackLocale = (newFallback) => {
    i18n.fallbackLocale = newFallback;
    fallbackLocale.value = newFallback;
  };
  const getFallbackLocale = () => fallbackLocale.value;
  const mergeLocaleMessage = (locale2, messages2) => {
    i18n.mergeMessages(locale2, messages2, namespace);
  };
  const getLocaleMessage = (locale2) => {
    return i18n.getMessages(locale2, namespace) || {};
  };
  const setLocaleMessage = (locale2, messages2) => {
    i18n.setMessages(locale2, messages2, namespace);
  };
  return {
    // Properties
    locale,
    fallbackLocale,
    messages,
    availableLocales,
    // Methods
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc,
    // Alias for tc
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

export { useI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useI18n.js.map

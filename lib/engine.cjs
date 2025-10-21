/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var vue = require('vue');
var vue$1 = require('./adapters/vue.cjs');

function createI18nEnginePlugin(options = {}) {
  const {
    detectBrowserLanguage = true,
    persistLanguage = true,
    storageKey = "ldesign-locale",
    onLocaleChange,
    ...i18nConfig
  } = options;
  let i18nInstance;
  let vuePlugin;
  let initialLocale = i18nConfig.locale || "zh-CN";
  if (persistLanguage && typeof window !== "undefined") {
    const savedLocale = localStorage.getItem(storageKey);
    if (savedLocale) {
      initialLocale = savedLocale;
    }
  }
  if (detectBrowserLanguage && !i18nConfig.locale && typeof window !== "undefined") {
    const browserLang = navigator.language;
    if (browserLang) {
      initialLocale = browserLang;
    }
  }
  const localeRef = vue.ref(initialLocale);
  const initialize = () => {
    i18nConfig.locale = localeRef.value;
    vuePlugin = vue$1.createVueI18n(i18nConfig);
    i18nInstance = vuePlugin.i18n;
    i18nInstance.on("localeChanged", ({
      locale
    }) => {
      if (!locale) return;
      localeRef.value = locale;
      if (persistLanguage && typeof window !== "undefined") {
        localStorage.setItem(storageKey, locale);
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = String(locale).split("-")[0];
      }
      if (onLocaleChange) {
        onLocaleChange(locale);
      }
    });
    if (typeof document !== "undefined" && i18nInstance?.locale) {
      document.documentElement.lang = String(i18nInstance.locale).split("-")[0];
    }
    return {
      i18nInstance,
      vuePlugin
    };
  };
  return {
    name: "@ldesign/i18n",
    version: "3.0.0",
    // 暴露响应式 locale - 其他插件可以直接使用
    localeRef,
    // Engine 插件的 install 方法
    async install(context) {
      const {
        i18nInstance: instance
      } = initialize();
      if (context.engine) {
        context.engine.i18n = instance;
        if (context.engine.state && instance.locale) {
          context.engine.state.set("locale", instance.locale);
        }
        instance.on("localeChanged", ({
          locale
        }) => {
          if (context.engine.state && locale) {
            context.engine.state.set("locale", locale);
          }
        });
      }
    },
    // Vue 插件安装函数
    setupVueApp(app) {
      const {
        vuePlugin: plugin
      } = initialize();
      if (plugin) {
        app.use(plugin);
      }
    },
    // 提供API
    api: {
      get i18n() {
        return i18nInstance;
      },
      get vuePlugin() {
        return vuePlugin;
      },
      async changeLocale(locale) {
        if (i18nInstance) {
          await i18nInstance.setLocale(locale);
        }
      },
      t(key, params) {
        return i18nInstance?.t(key, params) || key;
      },
      getCurrentLocale() {
        return i18nInstance?.locale;
      },
      getAvailableLocales() {
        return i18nInstance?.getAvailableLocales() || [];
      }
    }
  };
}
function createDefaultI18nEnginePlugin() {
  return createI18nEnginePlugin({
    locale: "zh-CN",
    fallbackLocale: "en-US",
    messages: {},
    detectBrowserLanguage: true,
    persistLanguage: true
  });
}
const i18nPlugin = createI18nEnginePlugin;

exports.createDefaultI18nEnginePlugin = createDefaultI18nEnginePlugin;
exports.createI18nEnginePlugin = createI18nEnginePlugin;
exports.i18nPlugin = i18nPlugin;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=engine.cjs.map

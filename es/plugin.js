/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, watchEffect, inject } from 'vue';
import { OptimizedI18n } from './core/i18n-optimized.js';

const isRef = (v) => {
  return v && typeof v === "object" && "value" in v && "_rawValue" in v;
};
function createI18nPlugin(options = {}) {
  const {
    persist = true,
    storageKey = "ldesign-locale",
    ...i18nConfig
  } = options;
  let locale;
  if (isRef(options.locale)) {
    locale = options.locale;
  } else {
    let initialLocale = options.locale || "zh-CN";
    if (persist && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) initialLocale = saved;
    }
    locale = ref(initialLocale);
  }
  const i18n = new OptimizedI18n({
    ...i18nConfig,
    locale: locale.value
  });
  i18n.init().catch(console.error);
  const watchers = [];
  const startWatcher = () => {
    const stopWatcher = watchEffect(() => {
      const currentLocale = locale.value;
      if (currentLocale !== i18n.locale) {
        i18n.setLocale(currentLocale);
        if (persist && typeof window !== "undefined") {
          localStorage.setItem(storageKey, currentLocale);
        }
        if (typeof document !== "undefined") {
          document.documentElement.lang = currentLocale.split("-")[0];
        }
      }
    });
    watchers.push(stopWatcher);
  };
  startWatcher();
  const t = i18n.t.bind(i18n);
  return {
    name: "@ldesign/i18n",
    locale,
    // 直接暴露 ref
    t,
    // 翻译函数
    i18n,
    // 完整实例（可选使用）
    // 便捷方法
    setLocale: (newLocale) => {
      locale.value = newLocale;
    },
    // 销毁方法
    destroy: () => {
      watchers.forEach((stop) => stop());
      watchers.length = 0;
      i18n.destroy();
    },
    // Vue 插件安装
    install(app) {
      if (!isRef(options.locale)) {
        const sharedLocale = app._context?.provides?.locale;
        if (sharedLocale && sharedLocale.value !== void 0) {
          locale = sharedLocale;
          this.locale = sharedLocale;
          const stopSharedWatcher = watchEffect(() => {
            const currentLocale = sharedLocale.value;
            if (currentLocale !== i18n.locale) {
              i18n.setLocale(currentLocale);
              if (persist && typeof window !== "undefined") {
                localStorage.setItem(storageKey, currentLocale);
              }
            }
          });
          watchers.push(stopSharedWatcher);
        } else {
          app.provide("locale", locale);
        }
      }
      app.provide("i18n", this);
      app.config.globalProperties.$t = t;
      app.config.globalProperties.$i18n = this;
    }
  };
}
function useI18n() {
  const i18n = inject("i18n");
  if (!i18n) {
    console.warn("[i18n] No i18n instance found. Did you forget to install the plugin?");
    return {
      locale: ref("zh-CN"),
      t: (key) => key,
      setLocale: () => {
      }
    };
  }
  return i18n;
}

export { createI18nPlugin, useI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.js.map

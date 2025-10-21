/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import * as index from './components/index.js';
import { I18N_SYMBOL } from './constants.js';
import { vT } from './directives/vT.js';
import { vTHtml } from './directives/vTHtml.js';
import { vTPlural } from './directives/vTPlural.js';

function createI18nPlugin(i18n, options = {}) {
  const {
    globalProperties = true,
    directives = true,
    components: registerComponents = true
  } = options;
  return {
    install(app) {
      app.provide(I18N_SYMBOL, i18n);
      if (globalProperties) {
        app.config.globalProperties.$i18n = i18n;
        app.config.globalProperties.$t = i18n.t.bind(i18n);
        app.config.globalProperties.$locale = {
          get: () => i18n.locale,
          set: (locale) => {
            i18n.locale = locale;
          }
        };
      }
      if (directives) {
        app.directive("t", vT);
        app.directive("t-html", vTHtml);
        app.directive("t-plural", vTPlural);
      }
      if (registerComponents) {
        Object.entries(index).forEach(([name, component]) => {
          if (name !== "default" && component) {
            app.component(name, component);
          }
        });
      }
      if (!i18n.initialized) {
        i18n.init().catch(console.error);
      }
    }
  };
}
class LDesignI18nPlugin {
  constructor(i18n, options = {}) {
    Object.defineProperty(this, "i18n", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "options", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.i18n = i18n;
    this.options = options;
  }
  install(app) {
    createI18nPlugin(this.i18n, this.options).install(app);
  }
}

export { LDesignI18nPlugin, createI18nPlugin };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.js.map

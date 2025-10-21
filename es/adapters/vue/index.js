/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { OptimizedI18n } from '../../core/i18n-optimized.js';
import { I18N_SYMBOL } from './constants.js';
import { createI18nPlugin } from './plugin.js';
export { LDesignI18nPlugin } from './plugin.js';
import './components/I18nProvider.vue.js';
import './components/I18nText.vue.js';
import './components/I18nTranslate.vue.js';
import './components/LocaleSwitcher.vue.js';
export { useI18n } from './composables/useI18n.js';
export { useI18nAsync } from './composables/useI18nAsync.js';
export { useLocale } from './composables/useLocale.js';
export { useTranslation } from './composables/useTranslation.js';
export { vT } from './directives/vT.js';
export { vTHtml } from './directives/vTHtml.js';
export { vTPlural } from './directives/vTPlural.js';
export { createI18n } from './utils/createI18n.js';
export { defineI18nConfig } from './utils/defineI18nConfig.js';
export { loadLocaleMessages } from './utils/loadLocaleMessages.js';
export { default as I18nProvider } from './components/I18nProvider.vue2.js';
export { default as I18nText } from './components/I18nText.vue2.js';
export { default as I18nTranslate } from './components/I18nTranslate.vue2.js';
export { default as LocaleSwitcher } from './components/LocaleSwitcher.vue2.js';

function setupI18n(app, config) {
  const i18n = new OptimizedI18n(config);
  app.use(createI18nPlugin(i18n));
  app.provide(I18N_SYMBOL, i18n);
  return i18n;
}

export { createI18nPlugin, setupI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map

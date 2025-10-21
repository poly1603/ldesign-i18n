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

var i18nOptimized = require('../../core/i18n-optimized.cjs');
var constants = require('./constants.cjs');
var plugin = require('./plugin.cjs');
require('./components/I18nProvider.vue.cjs');
require('./components/I18nText.vue.cjs');
require('./components/I18nTranslate.vue.cjs');
require('./components/LocaleSwitcher.vue.cjs');
var useI18n = require('./composables/useI18n.cjs');
var useI18nAsync = require('./composables/useI18nAsync.cjs');
var useLocale = require('./composables/useLocale.cjs');
var useTranslation = require('./composables/useTranslation.cjs');
var vT = require('./directives/vT.cjs');
var vTHtml = require('./directives/vTHtml.cjs');
var vTPlural = require('./directives/vTPlural.cjs');
var createI18n = require('./utils/createI18n.cjs');
var defineI18nConfig = require('./utils/defineI18nConfig.cjs');
var loadLocaleMessages = require('./utils/loadLocaleMessages.cjs');
var I18nProvider_vue_vue_type_script_setup_true_lang = require('./components/I18nProvider.vue2.cjs');
var I18nText_vue_vue_type_script_setup_true_lang = require('./components/I18nText.vue2.cjs');
var I18nTranslate_vue_vue_type_script_setup_true_lang = require('./components/I18nTranslate.vue2.cjs');
var LocaleSwitcher_vue_vue_type_script_setup_true_lang = require('./components/LocaleSwitcher.vue2.cjs');

function setupI18n(app, config) {
  const i18n = new i18nOptimized.OptimizedI18n(config);
  app.use(plugin.createI18nPlugin(i18n));
  app.provide(constants.I18N_SYMBOL, i18n);
  return i18n;
}

exports.LDesignI18nPlugin = plugin.LDesignI18nPlugin;
exports.createI18nPlugin = plugin.createI18nPlugin;
exports.useI18n = useI18n.useI18n;
exports.useI18nAsync = useI18nAsync.useI18nAsync;
exports.useLocale = useLocale.useLocale;
exports.useTranslation = useTranslation.useTranslation;
exports.vT = vT.vT;
exports.vTHtml = vTHtml.vTHtml;
exports.vTPlural = vTPlural.vTPlural;
exports.createI18n = createI18n.createI18n;
exports.defineI18nConfig = defineI18nConfig.defineI18nConfig;
exports.loadLocaleMessages = loadLocaleMessages.loadLocaleMessages;
exports.I18nProvider = I18nProvider_vue_vue_type_script_setup_true_lang.default;
exports.I18nText = I18nText_vue_vue_type_script_setup_true_lang.default;
exports.I18nTranslate = I18nTranslate_vue_vue_type_script_setup_true_lang.default;
exports.LocaleSwitcher = LocaleSwitcher_vue_vue_type_script_setup_true_lang.default;
exports.setupI18n = setupI18n;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map

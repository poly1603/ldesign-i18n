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

var i18nOptimized = require('../../../core/i18n-optimized.cjs');

function createI18n(config) {
  const i18n = new i18nOptimized.OptimizedI18n(config);
  i18n.init().catch(console.error);
  return i18n;
}
function defineI18nConfig(config) {
  return config;
}
async function loadLocaleMessages(locale, loader) {
  try {
    const module = await loader();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    return {};
  }
}

exports.createI18n = createI18n;
exports.defineI18nConfig = defineI18nConfig;
exports.loadLocaleMessages = loadLocaleMessages;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=createI18n.cjs.map

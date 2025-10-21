/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { OptimizedI18n } from '../../../core/i18n-optimized.js';

function createI18n(config) {
  const i18n = new OptimizedI18n(config);
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

export { createI18n, defineI18nConfig, loadLocaleMessages };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=createI18n.js.map

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

async function loadLocaleMessages(locale, loader) {
  const messages = await loader();
  return messages;
}

exports.loadLocaleMessages = loadLocaleMessages;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=loadLocaleMessages.cjs.map

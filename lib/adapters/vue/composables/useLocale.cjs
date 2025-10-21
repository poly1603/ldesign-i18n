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
var useI18n = require('./useI18n.cjs');

function useLocale() {
  const {
    locale,
    availableLocales,
    setLocale
  } = useI18n.useI18n();
  const isCurrentLocale = (checkLocale) => {
    return locale?.value === checkLocale;
  };
  return {
    locale: locale || vue.ref("en_us"),
    availableLocales,
    setLocale,
    isCurrentLocale
  };
}

exports.useLocale = useLocale;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useLocale.cjs.map

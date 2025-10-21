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

function useTranslation(namespace) {
  const {
    t,
    tc,
    te,
    locale
  } = useI18n.useI18n({
    namespace
  });
  const ready = vue.computed(() => locale.value !== void 0);
  return {
    t,
    tc,
    te,
    locale: locale.value,
    ready: ready.value
  };
}

exports.useTranslation = useTranslation;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useTranslation.cjs.map

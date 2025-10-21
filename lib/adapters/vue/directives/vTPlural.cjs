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

Object.defineProperty(exports, '__esModule', { value: true });

const vTPlural = {
  mounted(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
    if (!i18n) {
      return;
    }
    updatePlural(el, binding, i18n);
  },
  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
    if (!i18n) {
      return;
    }
    updatePlural(el, binding, i18n);
  }
};
function updatePlural(el, binding, i18n) {
  if (!binding.value) {
    return;
  }
  const {
    key,
    count,
    params,
    locale
  } = binding.value;
  if (!key) {
    return;
  }
  if (count === void 0) {
    return;
  }
  const translated = i18n.plural(key, count, {
    params,
    locale
  });
  el.textContent = translated;
}

exports.default = vTPlural;
exports.vTPlural = vTPlural;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=vTPlural.cjs.map

/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
const vTHtml = {
  mounted(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
    if (!i18n) {
      console.warn("[v-t-html] i18n instance not found");
      return;
    }
    updateHTML(el, binding, i18n);
  },
  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
    if (!i18n) {
      return;
    }
    updateHTML(el, binding, i18n);
  }
};
function updateHTML(el, binding, i18n) {
  let key;
  let params;
  let locale;
  if (typeof binding.value === "string") {
    key = binding.value;
  } else if (binding.value && typeof binding.value === "object") {
    key = binding.value.key || "";
    params = binding.value.params;
    locale = binding.value.locale;
  } else {
    key = "";
  }
  if (!key) {
    console.warn("[v-t-html] translation key is required");
    return;
  }
  const translated = i18n.t(key, {
    params,
    locale
  });
  el.innerHTML = translated;
}

export { vTHtml as default, vTHtml };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=vTHtml.js.map

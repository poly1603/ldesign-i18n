/**
 * v-t-plural directive for Vue
 * Pluralization directive
 */
export const vTPlural = {
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
    const { key, count, params, locale } = binding.value;
    if (!key) {
        return;
    }
    if (count === undefined) {
        return;
    }
    const translated = i18n.plural(key, count, { params, locale });
    el.textContent = translated;
}
export default vTPlural;
//# sourceMappingURL=vTPlural.js.map
/**
 * v-t directive for Vue
 * Basic translation directive
 */
export const vT = {
    mounted(el, binding, vnode) {
        const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
        if (!i18n) {
            console.warn('[v-t] i18n instance not found');
            return;
        }
        updateContent(el, binding, i18n);
    },
    updated(el, binding, vnode) {
        const i18n = vnode.appContext?.app.config.globalProperties.$i18n;
        if (!i18n) {
            return;
        }
        updateContent(el, binding, i18n);
    }
};
function updateContent(el, binding, i18n) {
    let key;
    let params;
    let locale;
    if (typeof binding.value === 'string') {
        key = binding.value;
    }
    else if (binding.value && typeof binding.value === 'object') {
        key = binding.value.key || '';
        params = binding.value.params;
        locale = binding.value.locale;
    }
    else {
        key = '';
    }
    if (!key) {
        console.warn('[v-t] translation key is required');
        return;
    }
    const translated = i18n.t(key, { params, locale });
    el.textContent = translated;
}
export default vT;
//# sourceMappingURL=vT.js.map
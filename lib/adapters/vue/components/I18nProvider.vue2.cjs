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

var vue = require('vue');
var constants = require('../constants.cjs');

var script = /* @__PURE__ */ vue.defineComponent({
  __name: "I18nProvider",
  props: {
    i18n: {
      type: Object,
      required: true
    },
    locale: {
      type: String,
      required: false,
      default: void 0
    }
  },
  setup(__props) {
    const props = __props;
    vue.provide(constants.I18N_INJECTION_KEY, props.i18n);
    vue.watch(() => props.locale, (newLocale) => {
      if (newLocale && props.i18n.currentLocale !== newLocale) {
        props.i18n.changeLocale(newLocale);
      }
    }, {
      immediate: true
    });
    return (_ctx, _cache) => {
      return vue.renderSlot(_ctx.$slots, "default");
    };
  }
});

exports.default = script;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nProvider.vue2.cjs.map

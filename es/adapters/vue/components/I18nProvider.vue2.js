/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, provide, watch, renderSlot } from 'vue';
import { I18N_INJECTION_KEY } from '../constants.js';

var script = /* @__PURE__ */ defineComponent({
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
    provide(I18N_INJECTION_KEY, props.i18n);
    watch(() => props.locale, (newLocale) => {
      if (newLocale && props.i18n.currentLocale !== newLocale) {
        props.i18n.changeLocale(newLocale);
      }
    }, {
      immediate: true
    });
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});

export { script as default };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nProvider.vue2.js.map

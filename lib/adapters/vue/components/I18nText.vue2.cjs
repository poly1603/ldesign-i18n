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
var useI18n = require('../composables/useI18n.cjs');

var script = /* @__PURE__ */ vue.defineComponent({
  __name: "I18nText",
  props: {
    keypath: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      required: false,
      default: "span"
    },
    params: {
      type: Object,
      required: false
    },
    locale: {
      type: String,
      required: false
    },
    plural: {
      type: Number,
      required: false
    },
    defaultValue: {
      type: String,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const {
      t,
      tc
    } = useI18n.useI18n();
    const translatedText = vue.computed(() => {
      const options = {
        params: props.params,
        locale: props.locale,
        defaultValue: props.defaultValue
      };
      if (props.plural !== void 0) {
        return tc(props.keypath, props.plural, props.params);
      }
      return t(props.keypath, options);
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(_ctx.tag), null, {
        default: vue.withCtx(() => [vue.createTextVNode(
          vue.toDisplayString(translatedText.value),
          1
          /* TEXT */
        )]),
        _: 1
        /* STABLE */
      });
    };
  }
});

exports.default = script;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nText.vue2.cjs.map

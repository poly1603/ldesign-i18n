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
  __name: "I18nTranslate",
  props: {
    keypath: {
      type: String,
      required: true
    },
    values: {
      type: Object,
      required: false,
      default: void 0
    },
    count: {
      type: Number,
      required: false,
      default: void 0
    },
    context: {
      type: String,
      required: false,
      default: void 0
    },
    defaultValue: {
      type: String,
      required: false,
      default: void 0
    },
    tag: {
      type: String,
      required: false,
      default: "span"
    },
    locale: {
      type: String,
      required: false,
      default: void 0
    }
  },
  setup(__props) {
    const props = __props;
    const {
      t,
      currentLocale
    } = useI18n.useI18n();
    const translatedText = vue.computed(() => {
      const options = {
        values: props.values,
        count: props.count,
        context: props.context,
        defaultValue: props.defaultValue
      };
      const locale = props.locale || currentLocale.value;
      return t(props.keypath, options, locale);
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(_ctx.tag), null, {
        default: vue.withCtx(() => [_ctx.$slots.default ? vue.renderSlot(_ctx.$slots, "default", {
          key: 0,
          text: translatedText.value,
          values: _ctx.values
        }) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          {
            key: 1
          },
          [vue.createTextVNode(
            vue.toDisplayString(translatedText.value),
            1
            /* TEXT */
          )],
          64
          /* STABLE_FRAGMENT */
        ))]),
        _: 3
        /* FORWARDED */
      });
    };
  }
});

exports.default = script;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nTranslate.vue2.cjs.map

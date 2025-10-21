/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, computed, createBlock, openBlock, resolveDynamicComponent, withCtx, renderSlot, createElementBlock, Fragment, createTextVNode, toDisplayString } from 'vue';
import { useI18n } from '../composables/useI18n.js';

var script = /* @__PURE__ */ defineComponent({
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
    } = useI18n();
    const translatedText = computed(() => {
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
      return openBlock(), createBlock(resolveDynamicComponent(_ctx.tag), null, {
        default: withCtx(() => [_ctx.$slots.default ? renderSlot(_ctx.$slots, "default", {
          key: 0,
          text: translatedText.value,
          values: _ctx.values
        }) : (openBlock(), createElementBlock(
          Fragment,
          {
            key: 1
          },
          [createTextVNode(
            toDisplayString(translatedText.value),
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

export { script as default };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nTranslate.vue2.js.map

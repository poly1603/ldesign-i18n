/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, computed, createBlock, openBlock, resolveDynamicComponent, withCtx, createTextVNode, toDisplayString } from 'vue';
import { useI18n } from '../composables/useI18n.js';

var script = /* @__PURE__ */ defineComponent({
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
    } = useI18n();
    const translatedText = computed(() => {
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
      return openBlock(), createBlock(resolveDynamicComponent(_ctx.tag), null, {
        default: withCtx(() => [createTextVNode(
          toDisplayString(translatedText.value),
          1
          /* TEXT */
        )]),
        _: 1
        /* STABLE */
      });
    };
  }
});

export { script as default };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=I18nText.vue2.js.map

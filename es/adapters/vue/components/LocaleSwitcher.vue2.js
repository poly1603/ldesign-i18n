/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, ref, onMounted, onBeforeUnmount, createElementBlock, openBlock, createCommentVNode, createElementVNode, createVNode, toDisplayString, normalizeClass, Transition, withCtx, Fragment, renderList, unref } from 'vue';
import { useI18n } from '../composables/useI18n.js';

const _hoisted_1 = {
  class: "locale-switcher-wrapper"
};
const _hoisted_2 = ["aria-expanded"];
const _hoisted_3 = {
  class: "locale-icon"
};
const _hoisted_4 = {
  class: "locale-label"
};
const _hoisted_5 = {
  key: 0,
  class: "locale-dropdown-menu"
};
const _hoisted_6 = ["onClick"];
const _hoisted_7 = {
  class: "locale-option-flag"
};
const _hoisted_8 = {
  class: "locale-option-label"
};
const _hoisted_9 = {
  key: 0,
  class: "locale-check",
  width: "16",
  height: "16",
  viewBox: "0 0 16 16"
};
const _hoisted_10 = {
  class: "locale-buttons"
};
const _hoisted_11 = ["title", "onClick"];
const _hoisted_12 = {
  class: "locale-button-flag"
};
const _hoisted_13 = {
  class: "locale-button-label"
};
const _hoisted_14 = {
  class: "locale-tabs"
};
const _hoisted_15 = ["onClick"];
var script = /* @__PURE__ */ defineComponent({
  __name: "LocaleSwitcher",
  props: {
    mode: {
      type: String,
      required: false,
      default: "dropdown"
    },
    displayNames: {
      type: Object,
      required: false,
      default: () => ({
        "zh-CN": "\u7B80\u4F53\u4E2D\u6587",
        "en-US": "English",
        "ja-JP": "\u65E5\u672C\u8A9E"
      })
    },
    flags: {
      type: Object,
      required: false,
      default: () => ({
        "zh-CN": "\u{1F1E8}\u{1F1F3}",
        "en-US": "\u{1F1FA}\u{1F1F8}",
        "ja-JP": "\u{1F1EF}\u{1F1F5}"
      })
    },
    showFlags: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ["change"],
  setup(__props, {
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;
    const {
      locale,
      availableLocales,
      setLocale
    } = useI18n();
    const isOpen = ref(false);
    const dropdownRef = ref();
    const getLocaleName = (loc) => {
      return props.displayNames[loc] || loc;
    };
    const getShortName = (loc) => {
      return loc.split("-")[0].toUpperCase();
    };
    const getFlag = (loc) => {
      if (!props.showFlags) return "";
      return props.flags[loc] || "\u{1F310}";
    };
    const getCurrentLabel = () => {
      return getLocaleName(locale.value);
    };
    const getCurrentFlag = () => {
      return getFlag(locale.value);
    };
    const isCurrentLocale = (loc) => {
      return locale.value === loc;
    };
    const selectLocale = async (loc) => {
      await setLocale(loc);
      emit("change", loc);
      isOpen.value = false;
    };
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
      }
    };
    onMounted(() => {
      if (props.mode === "dropdown") {
        document.addEventListener("click", handleClickOutside);
      }
    });
    onBeforeUnmount(() => {
      if (props.mode === "dropdown") {
        document.removeEventListener("click", handleClickOutside);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [createCommentVNode(" \u4E0B\u62C9\u9009\u62E9\u5668\u6837\u5F0F "), _ctx.mode === "dropdown" ? (openBlock(), createElementBlock(
        "div",
        {
          key: 0,
          ref_key: "dropdownRef",
          ref: dropdownRef,
          class: "locale-dropdown"
        },
        [createElementVNode("button", {
          class: "locale-dropdown-trigger",
          "aria-expanded": isOpen.value,
          onClick: toggleDropdown
        }, [createElementVNode(
          "span",
          _hoisted_3,
          toDisplayString(getCurrentFlag()),
          1
          /* TEXT */
        ), createElementVNode(
          "span",
          _hoisted_4,
          toDisplayString(getCurrentLabel()),
          1
          /* TEXT */
        ), (openBlock(), createElementBlock(
          "svg",
          {
            class: normalizeClass(["locale-arrow", {
              "rotate": isOpen.value
            }]),
            width: "12",
            height: "12",
            viewBox: "0 0 12 12"
          },
          [..._cache[0] || (_cache[0] = [createElementVNode(
            "path",
            {
              d: "M2.5 4.5L6 8L9.5 4.5",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              fill: "none"
            },
            null,
            -1
            /* CACHED */
          )])],
          2
          /* CLASS */
        ))], 8, _hoisted_2), createVNode(Transition, {
          name: "dropdown"
        }, {
          default: withCtx(() => [isOpen.value ? (openBlock(), createElementBlock("div", _hoisted_5, [(openBlock(true), createElementBlock(
            Fragment,
            null,
            renderList(unref(availableLocales), (loc) => {
              return openBlock(), createElementBlock("button", {
                key: loc,
                class: normalizeClass(["locale-option", {
                  "active": isCurrentLocale(loc)
                }]),
                onClick: ($event) => selectLocale(loc)
              }, [createElementVNode(
                "span",
                _hoisted_7,
                toDisplayString(getFlag(loc)),
                1
                /* TEXT */
              ), createElementVNode(
                "span",
                _hoisted_8,
                toDisplayString(getLocaleName(loc)),
                1
                /* TEXT */
              ), isCurrentLocale(loc) ? (openBlock(), createElementBlock("svg", _hoisted_9, [..._cache[1] || (_cache[1] = [createElementVNode(
                "path",
                {
                  d: "M13.5 4.5L6 12L2.5 8.5",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  fill: "none"
                },
                null,
                -1
                /* CACHED */
              )])])) : createCommentVNode("v-if", true)], 10, _hoisted_6);
            }),
            128
            /* KEYED_FRAGMENT */
          ))])) : createCommentVNode("v-if", true)]),
          _: 1
          /* STABLE */
        })],
        512
        /* NEED_PATCH */
      )) : _ctx.mode === "buttons" ? (openBlock(), createElementBlock(
        Fragment,
        {
          key: 1
        },
        [createCommentVNode(" \u6309\u94AE\u7EC4\u6837\u5F0F "), createElementVNode("div", _hoisted_10, [(openBlock(true), createElementBlock(
          Fragment,
          null,
          renderList(unref(availableLocales), (loc) => {
            return openBlock(), createElementBlock("button", {
              key: loc,
              class: normalizeClass(["locale-button", {
                "active": isCurrentLocale(loc)
              }]),
              title: getLocaleName(loc),
              onClick: ($event) => selectLocale(loc)
            }, [createElementVNode(
              "span",
              _hoisted_12,
              toDisplayString(getFlag(loc)),
              1
              /* TEXT */
            ), createElementVNode(
              "span",
              _hoisted_13,
              toDisplayString(getShortName(loc)),
              1
              /* TEXT */
            )], 10, _hoisted_11);
          }),
          128
          /* KEYED_FRAGMENT */
        ))])],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : _ctx.mode === "tabs" ? (openBlock(), createElementBlock(
        Fragment,
        {
          key: 2
        },
        [createCommentVNode(" \u6807\u7B7E\u6837\u5F0F "), createElementVNode("div", _hoisted_14, [(openBlock(true), createElementBlock(
          Fragment,
          null,
          renderList(unref(availableLocales), (loc) => {
            return openBlock(), createElementBlock("button", {
              key: loc,
              class: normalizeClass(["locale-tab", {
                "active": isCurrentLocale(loc)
              }]),
              onClick: ($event) => selectLocale(loc)
            }, toDisplayString(getLocaleName(loc)), 11, _hoisted_15);
          }),
          128
          /* KEYED_FRAGMENT */
        ))])],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : createCommentVNode("v-if", true)]);
    };
  }
});

export { script as default };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=LocaleSwitcher.vue2.js.map

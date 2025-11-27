/**
 * I18nProvider 组件
 *
 * 为子组件提供 i18n 实例的上下文提供者
 *
 * @example
 * ```tsx
 * <I18nProvider i18n={i18nInstance} locale="zh-CN">
 *   <App />
 * </I18nProvider>
 * ```
 */
import { defineComponent, provide, watch } from 'vue'
import type { PropType } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'
import { I18N_SYMBOL } from '../core/constants'

export default defineComponent({
  name: 'I18nProvider',

  props: {
    /**
     * i18n 实例
     */
    i18n: {
      type: Object as PropType<I18nInstance>,
      required: true,
    },

    /**
     * 当前语言环境
     */
    locale: {
      type: String,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    // 向子组件提供 i18n 实例
    provide(I18N_SYMBOL, props.i18n)

    // 监听 locale 变化
    watch(
      () => props.locale,
      (newLocale) => {
        if (newLocale && props.i18n.locale !== newLocale) {
          props.i18n.setLocale(newLocale)
        }
      },
      { immediate: true },
    )

    return () => slots.default?.()
  },
})
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
// @ts-nocheck - Vue JSX 类型定义与实际使用存在差异，禁用类型检查以避免误报
import { defineComponent, provide, watch } from 'vue'
import type { PropType } from 'vue'
import type { OptimizedI18n } from '@ldesign/i18n-core'
import { I18N_INJECTION_KEY } from '../constants'

export default defineComponent({
  name: 'I18nProvider',

  props: {
    /**
     * i18n 实例
     */
    i18n: {
      type: Object as PropType<OptimizedI18n>,
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
    provide(I18N_INJECTION_KEY, props.i18n)

    // 监听 locale 变化
    watch(
      () => props.locale,
      (newLocale) => {
        if (newLocale && props.i18n.currentLocale !== newLocale) {
          props.i18n.changeLocale(newLocale)
        }
      },
      { immediate: true },
    )

    return () => slots.default?.()
  },
})


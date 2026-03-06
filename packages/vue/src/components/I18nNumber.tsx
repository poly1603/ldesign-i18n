/**
 * I18nNumber 组件
 *
 * 声明式数字格式化组件，支持数字、货币、百分比、紧凑格式
 *
 * @example
 * ```tsx
 * <I18nNumber :value="1234567" />
 * <I18nNumber :value="99.99" format="currency" currency="CNY" />
 * <I18nNumber :value="0.856" format="percent" />
 * <I18nNumber :value="1234567" format="compact" />
 * ```
 */
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from '../composables/useI18n'

export default defineComponent({
  name: 'I18nNumber',

  props: {
    /**
     * 要格式化的数值
     */
    value: {
      type: Number,
      required: true,
    },

    /**
     * 格式化类型
     */
    format: {
      type: String as PropType<'number' | 'currency' | 'percent' | 'compact'>,
      default: 'number',
    },

    /**
     * 货币代码（format="currency" 时必填）
     */
    currency: {
      type: String,
      default: 'USD',
    },

    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },

    /**
     * 额外的 Intl.NumberFormatOptions
     */
    options: {
      type: Object as PropType<Intl.NumberFormatOptions>,
      default: undefined,
    },
  },

  setup(props) {
    const { i18n, locale } = useI18n()

    const formattedValue = computed(() => {
      void locale.value // track locale changes

      switch (props.format) {
        case 'currency':
          return i18n.currency(props.value, props.currency, props.options)
        case 'percent':
          return i18n.number(props.value, {
            style: 'percent',
            ...props.options,
          })
        case 'compact':
          return i18n.number(props.value, {
            notation: 'compact',
            compactDisplay: 'short',
            ...props.options,
          })
        default:
          return i18n.number(props.value, props.options)
      }
    })

    return () => {
      const Tag = props.tag as any
      return <Tag>{formattedValue.value}</Tag>
    }
  },
})

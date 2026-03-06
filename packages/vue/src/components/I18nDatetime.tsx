/**
 * I18nDatetime 组件
 *
 * 声明式日期时间格式化组件，支持日期、时间、日期时间、相对时间
 *
 * @example
 * ```tsx
 * <I18nDatetime :value="new Date()" />
 * <I18nDatetime :value="new Date()" dateStyle="full" />
 * <I18nDatetime :value="new Date()" format="time" />
 * <I18nDatetime :value="pastDate" format="relative" />
 * ```
 */
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from '../composables/useI18n'

export default defineComponent({
  name: 'I18nDatetime',

  props: {
    /**
     * 要格式化的日期值
     */
    value: {
      type: [Date, String, Number] as PropType<Date | string | number>,
      required: true,
    },

    /**
     * 格式化类型
     */
    format: {
      type: String as PropType<'date' | 'time' | 'datetime' | 'relative'>,
      default: 'date',
    },

    /**
     * 日期样式
     */
    dateStyle: {
      type: String as PropType<'full' | 'long' | 'medium' | 'short'>,
      default: undefined,
    },

    /**
     * 时间样式
     */
    timeStyle: {
      type: String as PropType<'full' | 'long' | 'medium' | 'short'>,
      default: undefined,
    },

    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },

    /**
     * 额外的 Intl.DateTimeFormatOptions
     */
    options: {
      type: Object as PropType<Intl.DateTimeFormatOptions>,
      default: undefined,
    },
  },

  setup(props) {
    const { i18n, locale } = useI18n()

    const formattedValue = computed(() => {
      void locale.value // track locale changes

      if (props.format === 'relative') {
        return i18n.relativeTime(props.value)
      }

      // Build options from props
      const opts: Intl.DateTimeFormatOptions = { ...props.options }

      if (props.dateStyle) {
        opts.dateStyle = props.dateStyle
      }
      if (props.timeStyle) {
        opts.timeStyle = props.timeStyle
      }

      // Apply defaults if no explicit style set
      if (!opts.dateStyle && !opts.timeStyle && !props.options) {
        switch (props.format) {
          case 'time':
            opts.timeStyle = 'medium'
            break
          case 'datetime':
            opts.dateStyle = 'medium'
            opts.timeStyle = 'short'
            break
          default: // 'date'
            opts.dateStyle = 'medium'
            break
        }
      }

      return i18n.date(props.value, opts)
    })

    return () => {
      const Tag = props.tag as any
      return <Tag>{formattedValue.value}</Tag>
    }
  },
})

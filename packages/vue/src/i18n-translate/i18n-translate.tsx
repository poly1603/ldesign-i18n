/**
 * I18nTranslate 组件
 * 
 * 高级翻译组件,支持插槽、上下文和复数形式
 * 
 * @example
 * ```tsx
 * <I18nTranslate keypath="welcome" values={{ name: 'John' }} />
 * <I18nTranslate keypath="items" count={5} />
 * ```
 */
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { TranslateOptions } from '@ldesign/i18n-core'
import { useI18n } from '../composables'

export default defineComponent({
  name: 'I18nTranslate',

  props: {
    /**
     * 翻译键路径
     */
    keypath: {
      type: String,
      required: true,
    },

    /**
     * 插值变量
     */
    values: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },

    /**
     * 复数形式的数量
     */
    count: {
      type: Number,
      default: undefined,
    },

    /**
     * 上下文信息
     */
    context: {
      type: String,
      default: undefined,
    },

    /**
     * 默认值(当翻译不存在时)
     */
    defaultValue: {
      type: String,
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
     * 指定语言环境
     */
    locale: {
      type: String,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    const { t, currentLocale } = useI18n()

    /**
     * 计算翻译后的文本
     */
    const translatedText = computed(() => {
      const options: TranslateOptions = {
        values: props.values,
        count: props.count,
        context: props.context,
        defaultValue: props.defaultValue,
      }

      // 使用提供的 locale 或当前 locale
      const locale = props.locale || currentLocale.value

      return t(props.keypath, options, locale)
    })

    return () => {
      const Tag = props.tag as any

      // 如果有默认插槽,传递翻译文本和变量
      if (slots.default) {
        return (
          <Tag>
            {slots.default({
              text: translatedText.value,
              values: props.values,
            })}
          </Tag>
        )
      }

      // 否则直接显示翻译文本
      return <Tag>{translatedText.value}</Tag>
    }
  },
})


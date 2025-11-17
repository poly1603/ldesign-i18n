/**
 * I18nText 组件
 *
 * 用于显示翻译文本的组件,支持插值和复数形式
 *
 * @example
 * ```tsx
 * <I18nText keypath="welcome.message" params={{ name: 'John' }} />
 * <I18nText keypath="items.count" plural={5} />
 * ```
 */
// @ts-nocheck - Vue JSX 类型定义与实际使用存在差异，禁用类型检查以避免误报
import { computed, defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { InterpolationParams, MessageKey } from '@ldesign/i18n-core'
import { useI18n } from '../composables/useI18n'

export default defineComponent({
  name: 'I18nText',

  props: {
    /**
     * 翻译键路径
     */
    keypath: {
      type: String as PropType<MessageKey>,
      required: true,
    },

    /**
     * 渲染的 HTML 标签
     */
    tag: {
      type: String,
      default: 'span',
    },

    /**
     * 插值参数
     */
    params: {
      type: Object as PropType<InterpolationParams>,
      default: undefined,
    },

    /**
     * 指定语言环境
     */
    locale: {
      type: String,
      default: undefined,
    },

    /**
     * 复数形式的数量
     */
    plural: {
      type: Number,
      default: undefined,
    },

    /**
     * 默认值(当翻译不存在时)
     */
    defaultValue: {
      type: String,
      default: undefined,
    },
  },

  setup(props) {
    const { t, tc } = useI18n()

    /**
     * 计算翻译后的文本
     */
    const translatedText = computed(() => {
      const options = {
        params: props.params,
        locale: props.locale,
        defaultValue: props.defaultValue,
      }

      // 如果指定了复数形式,使用 tc 函数
      if (props.plural !== undefined) {
        return tc(props.keypath, props.plural, props.params)
      }

      // 否则使用普通的 t 函数
      return t(props.keypath, options)
    })

    return () => {
      const Tag = props.tag as any
      return <Tag>{translatedText.value}</Tag>
    }
  },
})


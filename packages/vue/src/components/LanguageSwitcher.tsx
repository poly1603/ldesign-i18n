/**
 * LanguageSwitcher 组件
 *
 * 语言切换器，参考 ThemeColorPicker 的设计风格
 *
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
// @ts-nocheck - Vue JSX 类型定义与实际使用存在差异，禁用类型检查以避免误报
import { computed, defineComponent, onMounted, onUnmounted, ref, Transition } from 'vue'
import { Languages, Check } from 'lucide-vue-next'
import { useI18n } from '../composables/useI18n'
import './LanguageSwitcher.css'

// 语言配置
interface LocaleConfig {
  code: string
  label: string
  nativeLabel: string
  description?: string
}

// 默认语言配置
const defaultLocaleConfigs: LocaleConfig[] = [
  { code: 'zh-CN', label: '简体中文', nativeLabel: '简体中文', description: 'Simplified Chinese' },
  { code: 'zh-TW', label: '繁體中文', nativeLabel: '繁體中文', description: 'Traditional Chinese' },
  { code: 'en-US', label: 'English', nativeLabel: 'English', description: 'United States' },
  { code: 'en', label: 'English', nativeLabel: 'English', description: 'International' },
  { code: 'ja-JP', label: '日本語', nativeLabel: '日本語', description: 'Japanese' },
  { code: 'ja', label: '日本語', nativeLabel: '日本語', description: 'Japanese' },
  { code: 'ko-KR', label: '한국어', nativeLabel: '한국어', description: 'Korean' },
  { code: 'ko', label: '한국어', nativeLabel: '한국어', description: 'Korean' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français', description: 'French' },
  { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch', description: 'German' },
  { code: 'es', label: 'Español', nativeLabel: 'Español', description: 'Spanish' },
]

export default defineComponent({
  name: 'LanguageSwitcher',
  props: {
    disabled: { type: Boolean, default: false },
    size: { type: String as () => 'small' | 'medium' | 'large', default: 'medium' },
    title: { type: String, default: '' },
    variant: { type: String as () => 'light' | 'primary', default: 'light' },
  },

  setup(props) {
    // 使用全局 i18n 实例
    const { locale, availableLocales, setLocale, t } = useI18n()

    // 下拉菜单状态
    const isOpen = ref(false)
    const containerRef = ref<HTMLElement | null>(null)

    // 本地可选项
    const locales = computed(() => availableLocales.value)

    // 获取语言配置
    const getLocaleConfig = (code: string): LocaleConfig => {
      const config = defaultLocaleConfigs.find(c => c.code === code)
      if (config) return config
      // 默认配置
      return {
        code,
        label: code,
        nativeLabel: code,
        description: '',
      }
    }

    // 当前语言代码（简短）
    const currentLocaleCode = computed(() => {
      return locale.value.split('-')[0].toUpperCase()
    })

    // 当前语言显示名称
    const currentLocaleName = computed(() => {
      return getLocaleConfig(locale.value).label
    })

    // 判断当前语言是中文
    const isZh = computed(() => {
      const lang = locale.value.toLowerCase()
      return lang.startsWith('zh') || lang.includes('cn') || lang.includes('hans')
    })

    // 标题文本
    const titleText = computed(() => {
      return props.title || (isZh.value ? '选择语言' : 'Select Language')
    })

    // 触发器样式类
    const triggerClass = computed(() => {
      const classes = ['ldesign-lang-switcher__trigger']
      if (props.size === 'small') classes.push('ldesign-lang-switcher__trigger--small')
      if (props.size === 'large') classes.push('ldesign-lang-switcher__trigger--large')
      return classes.join(' ')
    })

    // Inline fallback style based on variant to match ThemeColorPicker
    const triggerStyle = computed(() => {
      if (props.variant === 'primary') {
        return {
          background: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          color: 'var(--color-text-inverse, #ffffff)'
        }
      }
      return {
        background: 'var(--color-bg-hover, #f3f4f6)',
        borderColor: 'var(--color-border, #e5e7eb)'
      }
    })

    // 容器样式类
    const containerClass = computed(() => {
      const classes = ['ldesign-lang-switcher']
      if (props.disabled) classes.push('ldesign-lang-switcher--disabled')
      return classes.join(' ')
    })

    /**
     * 选择语言
     */
    const selectLocale = async (loc: string) => {
      await setLocale(loc)
      isOpen.value = false
    }

    /**
     * 点击外部关闭下拉菜单
     */
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => (
      <div ref={containerRef} class={containerClass.value} data-variant={props.variant || 'light'}>
        <button
          type="button"
          class={triggerClass.value}
          style={triggerStyle.value}
          onClick={() => (isOpen.value = !isOpen.value)}
          disabled={props.disabled}
          title={currentLocaleName.value}
        >
          <Languages size={18} strokeWidth={2} />
        </button>

        <Transition name="ldesign-dropdown">
          {isOpen.value && (
            <div class="ldesign-lang-switcher__dropdown">
              <div class="ldesign-lang-switcher__arrow" />
              <div class="ldesign-lang-switcher__header">
                <h4 class="ldesign-lang-switcher__title">{titleText.value}</h4>
              </div>
              <div class="ldesign-lang-switcher__list">
                {locales.value.map(loc => {
                  const config = getLocaleConfig(loc)
                  const isActive = locale.value === loc
                  return (
                    <div
                      key={loc}
                      class={[
                        'ldesign-lang-switcher__item',
                        isActive && 'ldesign-lang-switcher__item--active',
                      ].filter(Boolean).join(' ')}
                      onClick={() => selectLocale(loc)}
                    >
                      <span class="ldesign-lang-switcher__item-icon">
                        {loc.split('-')[0].toUpperCase()}
                      </span>
                      <div class="ldesign-lang-switcher__item-info">
                        <span class="ldesign-lang-switcher__item-label">{config.label}</span>
                        {config.description && (
                          <span class="ldesign-lang-switcher__item-desc">{config.description}</span>
                        )}
                      </div>
                      {isActive && (
                        <Check size={16} class="ldesign-lang-switcher__check" strokeWidth={3} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Transition>
      </div>
    )
  },
})
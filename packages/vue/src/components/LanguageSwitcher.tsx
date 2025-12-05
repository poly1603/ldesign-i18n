/**
 * LanguageSwitcher 组件
 *
 * 语言切换器,提供图标按钮和下拉菜单用于切换语言
 *
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
// @ts-nocheck - Vue JSX 类型定义与实际使用存在差异，禁用类型检查以避免误报
import { computed, defineComponent, onMounted, onUnmounted, ref, Transition } from 'vue'
import { Languages } from 'lucide-vue-next'
import { useI18n } from '../composables/useI18n'
import './LanguageSwitcher.css'

export default defineComponent({
  name: 'LanguageSwitcher',

  setup() {
    // 使用全局 i18n 实例
    const { locale, availableLocales, setLocale, t } = useI18n()

    // 下拉菜单状态
    const isOpen = ref(false)

    // 本地可选项
    const locales = computed(() => availableLocales.value)

    /**
     * 显示名称映射
     * @param loc - 语言代码
     * @returns 显示名称
     */
    function displayName(loc: string): string {
      const map: Record<string, string> = {
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'en-US': 'English',
        'en': 'English',
        'ja-JP': '日本語',
        'ja': '日本語',
        'ko-KR': '한국어',
        'ko': '한국어',
        'fr': 'Français',
        'de': 'Deutsch',
        'es': 'Español',
      }
      return map[loc] || loc
    }

    /**
     * 当前语言显示名称
     */
    const currentLocaleName = computed(() => displayName(locale.value))

    /**
     * 切换下拉菜单
     */
    const toggleDropdown = (e: MouseEvent) => {
      e.stopPropagation() // 阻止事件冒泡
      isOpen.value = !isOpen.value
    }

    /**
     * 选择语言
     * @param loc - 语言代码
     */
    const selectLocale = async (loc: string) => {
      await setLocale(loc)
      isOpen.value = false
    }

    /**
     * 点击外部关闭下拉菜单
     */
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.ld-lang-switcher')) {
        isOpen.value = false
      }
    }

    // 生命周期(延迟添加事件监听,避免与按钮点击冲突)
    onMounted(() => {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => (
      <div class="ld-lang-switcher">
        <button
          class="lang-button"
          title={currentLocaleName.value}
          onClick={toggleDropdown}
        >
          <Languages size={18} strokeWidth={2} />
        </button>

        <Transition name="dropdown">
          {isOpen.value && (
            <div class="lang-dropdown" onClick={(e: MouseEvent) => e.stopPropagation()}>
              <div class="dropdown-header">
                <span class="dropdown-title">语言</span>
              </div>
              <div class="dropdown-content">
                <div class="language-grid">
                  {locales.value.map(loc => (
                    <div
                      key={loc}
                      class={['language-card', { active: locale.value === loc }]}
                      onClick={() => selectLocale(loc)}
                    >
                      <span class="card-code">{loc.split('-')[0].toUpperCase()}</span>
                      <span class="card-name">{displayName(loc)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Transition>
      </div>
    )
  },
})
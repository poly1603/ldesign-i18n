/**
 * LanguageSwitcher 组件
 * 
 * 语言切换器,提供下拉选择框用于切换语言
 * 
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * ```
 */
import { computed, defineComponent } from 'vue'
import { useI18n } from '../composables/useI18n'
import './style/index.less'

export default defineComponent({
  name: 'LanguageSwitcher',

  setup() {
    // 使用全局 i18n 实例
    const { locale, availableLocales, setLocale } = useI18n()

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
        'en-US': 'English',
        'ja-JP': '日本語',
      }
      return map[loc] || loc
    }

    /**
     * 处理语言切换
     * @param e - 选择框变更事件
     */
    async function onChange(e: Event): Promise<void> {
      const value = (e.target as HTMLSelectElement).value
      await setLocale(value)
    }

    return () => (
      <div class="ld-lang-switcher">
        <select
          class="lang-select"
          value={locale.value}
          onChange={onChange}
        >
          {locales.value.map(loc => (
            <option key={loc} value={loc}>
              {displayName(loc)}
            </option>
          ))}
        </select>
      </div>
    )
  },
})


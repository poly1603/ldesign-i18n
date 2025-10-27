/**
 * 插件系统示例
 * 
 * 演示如何使用和开发 i18n 插件
 */

import { createI18n } from '../src'
import type { I18nPlugin, I18n } from '../src/types'

// 1. 简单的日志插件
const loggerPlugin: I18nPlugin = {
  name: 'logger',
  install(i18n) {
    console.log('[Logger Plugin] 已安装')

    // 监听语言变化
    i18n.on('locale-changed', (newLocale, oldLocale) => {
      console.log(`[Logger] 语言从 ${oldLocale} 切换到 ${newLocale}`)
    })

    // 监听翻译键缺失
    i18n.on('missing-key', (locale, key) => {
      console.warn(`[Logger] 缺失翻译键: ${key} (${locale})`)
    })
  }
}

// 2. 本地存储插件
const storagePlugin: I18nPlugin = {
  name: 'storage',
  install(i18n) {
    console.log('[Storage Plugin] 已安装')

    // 从 localStorage 恢复语言
    const savedLocale = localStorage.getItem('i18n-locale')
    if (savedLocale && i18n.availableLocales.includes(savedLocale)) {
      i18n.setLocale(savedLocale)
      console.log(`[Storage] 恢复语言: ${savedLocale}`)
    }

    // 保存语言变化
    i18n.on('locale-changed', (newLocale) => {
      localStorage.setItem('i18n-locale', newLocale)
      console.log(`[Storage] 保存语言: ${newLocale}`)
    })
  }
}

// 3. 统计插件
interface Stats {
  translations: number
  localeChanges: number
  missingKeys: Set<string>
}

const statsPlugin: I18nPlugin = {
  name: 'stats',
  install(i18n) {
    console.log('[Stats Plugin] 已安装')

    const stats: Stats = {
      translations: 0,
      localeChanges: 0,
      missingKeys: new Set()
    }

    // 扩展 i18n 实例
    const originalT = i18n.t.bind(i18n)
    i18n.t = (key: string, ...args: any[]) => {
      stats.translations++
      return originalT(key, ...args)
    }

    i18n.on('locale-changed', () => {
      stats.localeChanges++
    })

    i18n.on('missing-key', (_, key) => {
      stats.missingKeys.add(key)
    })

      // 添加获取统计的方法
      ; (i18n as any).getStats = () => ({
        ...stats,
        missingKeys: Array.from(stats.missingKeys)
      })

    console.log('[Stats] 统计已启用')
  }
}

// 4. 验证插件
interface ValidationRule {
  test: (key: string, value: any) => boolean
  message: string
}

const validationPlugin = (rules: ValidationRule[]): I18nPlugin => ({
  name: 'validation',
  install(i18n) {
    console.log('[Validation Plugin] 已安装')

    // 验证所有翻译消息
    const validateMessages = (locale: string, messages: any, prefix = '') => {
      for (const [key, value] of Object.entries(messages)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null) {
          validateMessages(locale, value, fullKey)
        }
        else {
          for (const rule of rules) {
            if (!rule.test(fullKey, value)) {
              console.warn(
                `[Validation] ${locale}.${fullKey}: ${rule.message}`
              )
            }
          }
        }
      }
    }

    // 验证所有语言的消息
    for (const locale of i18n.availableLocales) {
      const messages = i18n.getLocaleMessage(locale)
      validateMessages(locale, messages)
    }
  }
})

// 5. 热更新插件
const hotReloadPlugin = (interval: number = 5000): I18nPlugin => ({
  name: 'hot-reload',
  install(i18n) {
    console.log('[Hot Reload Plugin] 已安装')

    let timerId: NodeJS.Timeout

    const checkUpdates = async () => {
      try {
        // 模拟从服务器获取更新
        console.log('[Hot Reload] 检查更新...')

        // 这里应该调用实际的 API
        // const response = await fetch('/api/i18n/version')
        // const { version, messages } = await response.json()

        // 如果有更新，合并新消息
        // i18n.mergeLocaleMessage(i18n.locale, messages)
        // console.log('[Hot Reload] 已更新翻译')
      }
      catch (error) {
        console.error('[Hot Reload] 检查更新失败:', error)
      }
    }

    // 定期检查更新
    timerId = setInterval(checkUpdates, interval)

    console.log(`[Hot Reload] 每 ${interval}ms 检查一次更新`)

      // 清理函数
      ; (i18n as any).__hotReloadCleanup = () => {
        clearInterval(timerId)
        console.log('[Hot Reload] 已停止')
      }
  },
  uninstall(i18n) {
    const cleanup = (i18n as any).__hotReloadCleanup
    if (cleanup) cleanup()
  }
})

// 创建带插件的 i18n 实例
console.log('=== 插件系统演示 ===\n')

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}',
      emptyValue: '',  // 用于验证测试
      tooLong: 'x'.repeat(200)  // 用于验证测试
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome, {name}'
      // 缺少其他键，用于验证测试
    }
  },
  plugins: [
    loggerPlugin,
    storagePlugin,
    statsPlugin,
    validationPlugin([
      {
        test: (_, value) => typeof value === 'string' && value.length > 0,
        message: '值不能为空'
      },
      {
        test: (_, value) => typeof value === 'string' && value.length <= 100,
        message: '值太长（超过 100 字符）'
      }
    ])
    // hotReloadPlugin(5000)  // 5秒检查一次
  ]
})

console.log('\n=== 测试插件功能 ===\n')

// 测试翻译（触发统计）
console.log('执行翻译...')
console.log(i18n.t('hello'))
console.log(i18n.t('welcome', { name: '张三' }))
console.log(i18n.t('missing'))  // 触发缺失键警告

// 测试语言切换（触发日志和存储）
console.log('\n切换语言...')
i18n.setLocale('en-US')
console.log(i18n.t('hello'))

// 获取统计信息
console.log('\n=== 统计信息 ===')
const stats = (i18n as any).getStats()
console.log('翻译次数:', stats.translations)
console.log('语言切换次数:', stats.localeChanges)
console.log('缺失的键:', stats.missingKeys)

// 清理
console.log('\n=== 清理资源 ===')
if ((i18n as any).__hotReloadCleanup) {
  (i18n as any).__hotReloadCleanup()
}

// 导出
export {
  i18n,
  loggerPlugin,
  storagePlugin,
  statsPlugin,
  validationPlugin,
  hotReloadPlugin
}


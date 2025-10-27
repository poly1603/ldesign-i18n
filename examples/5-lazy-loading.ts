/**
 * 懒加载示例
 * 
 * 演示如何动态加载语言包，优化首屏加载
 */

import { createI18n } from '../src'

// 模拟从服务器加载语言包
async function loadLocaleMessages(locale: string): Promise<Record<string, any>> {
  console.log(`正在加载 ${locale} 语言包...`)

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  const messages: Record<string, Record<string, any>> = {
    'zh-CN': {
      common: {
        hello: '你好',
        welcome: '欢迎',
        goodbye: '再见'
      },
      user: {
        profile: '个人资料',
        settings: '设置',
        logout: '退出登录'
      },
      dashboard: {
        title: '仪表盘',
        overview: '概览',
        statistics: '统计'
      }
    },
    'en-US': {
      common: {
        hello: 'Hello',
        welcome: 'Welcome',
        goodbye: 'Goodbye'
      },
      user: {
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout'
      },
      dashboard: {
        title: 'Dashboard',
        overview: 'Overview',
        statistics: 'Statistics'
      }
    },
    'ja-JP': {
      common: {
        hello: 'こんにちは',
        welcome: 'ようこそ',
        goodbye: 'さようなら'
      },
      user: {
        profile: 'プロフィール',
        settings: '設定',
        logout: 'ログアウト'
      },
      dashboard: {
        title: 'ダッシュボード',
        overview: '概要',
        statistics: '統計'
      }
    }
  }

  console.log(`${locale} 语言包加载完成`)
  return messages[locale] || {}
}

// 创建 i18n 实例，只加载默认语言
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        hello: '你好',
        loading: '加载中...'
      }
    }
  },
  lazyLoad: true  // 启用懒加载
})

// 语言加载器
async function loadLocale(locale: string) {
  // 检查是否已加载
  if (i18n.availableLocales.includes(locale)) {
    console.log(`${locale} 已经加载，直接切换`)
    i18n.setLocale(locale)
    return
  }

  console.log(`开始加载 ${locale}...`)
  const startTime = performance.now()

  try {
    // 加载语言包
    const messages = await loadLocaleMessages(locale)

    // 设置翻译消息
    i18n.setLocaleMessage(locale, messages)

    // 切换语言
    i18n.setLocale(locale)

    const loadTime = performance.now() - startTime
    console.log(`✅ ${locale} 加载成功，耗时 ${loadTime.toFixed(2)}ms`)
  }
  catch (error) {
    console.error(`❌ 加载 ${locale} 失败:`, error)
  }
}

// 演示懒加载
async function demo() {
  console.log('=== 懒加载演示 ===\n')

  // 初始状态（只有中文）
  console.log('初始可用语言:', i18n.availableLocales)
  console.log('当前语言:', i18n.locale)
  console.log(i18n.t('common.hello'), '\n')

  // 加载英文
  console.log('--- 加载英文 ---')
  await loadLocale('en-US')
  console.log('可用语言:', i18n.availableLocales)
  console.log(i18n.t('common.hello'))
  console.log(i18n.t('user.profile'), '\n')

  // 加载日文
  console.log('--- 加载日文 ---')
  await loadLocale('ja-JP')
  console.log('可用语言:', i18n.availableLocales)
  console.log(i18n.t('common.hello'))
  console.log(i18n.t('dashboard.title'), '\n')

  // 再次切换到英文（无需重新加载）
  console.log('--- 切换回英文 ---')
  await loadLocale('en-US')
  console.log(i18n.t('common.hello'), '\n')

  // 批量预加载
  console.log('--- 批量预加载 ---')
  const locales = ['zh-CN', 'en-US', 'ja-JP']
  await Promise.all(
    locales.map(locale => loadLocale(locale))
  )
  console.log('所有语言加载完成!')
  console.log('可用语言:', i18n.availableLocales)
}

// 运行演示
demo().catch(console.error)

// 导出加载器供应用使用
export { i18n, loadLocale }


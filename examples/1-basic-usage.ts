/**
 * 基础用法示例
 * 
 * 演示如何创建和使用基本的 i18n 实例
 */

import { createI18n } from '../src'

// 1. 创建基础 i18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}！',
      goodbye: '再见'
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome, {name}!',
      goodbye: 'Goodbye'
    }
  }
})

console.log('=== 基础翻译 ===')
console.log(i18n.t('hello'))  // 你好
console.log(i18n.t('goodbye'))  // 再见

console.log('\n=== 带参数的翻译 ===')
console.log(i18n.t('welcome', { name: '张三' }))  // 欢迎，张三！

console.log('\n=== 切换语言 ===')
i18n.setLocale('en-US')
console.log(i18n.t('hello'))  // Hello
console.log(i18n.t('welcome', { name: 'John' }))  // Welcome, John!

console.log('\n=== 获取语言信息 ===')
console.log('当前语言:', i18n.locale)  // en-US
console.log('可用语言:', i18n.availableLocales)  // ['zh-CN', 'en-US']

console.log('\n=== 检查键是否存在 ===')
console.log('hello 存在:', i18n.hasKey('hello'))  // true
console.log('unknown 存在:', i18n.hasKey('unknown'))  // false


/**
 * 插值和复数处理示例
 * 
 * 演示如何使用参数插值和复数处理
 */

import { createI18n } from '../src'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      // 基础插值
      greeting: '你好，{name}！',
      userInfo: '{name} 今年 {age} 岁',

      // 多个参数
      orderInfo: '订单号：{orderId}，金额：¥{amount}，状态：{status}',

      // 复数形式
      appleCount: '没有苹果 | 一个苹果 | {count} 个苹果',
      itemCount: '{count} 件商品',
      messageCount: '没有消息 | 1 条新消息 | {count} 条新消息',

      // 组合使用
      notification: '{user} 给你发送了 {count} 条消息 | {user} 给你发送了 1 条消息 | {user} 给你发送了 {count} 条消息'
    },
    'en-US': {
      greeting: 'Hello, {name}!',
      userInfo: '{name} is {age} years old',
      orderInfo: 'Order ID: {orderId}, Amount: ${amount}, Status: {status}',

      appleCount: 'no apples | one apple | {count} apples',
      itemCount: '{count} item | {count} items',
      messageCount: 'no messages | 1 new message | {count} new messages',

      notification: '{user} sent you {count} messages | {user} sent you 1 message | {user} sent you {count} messages'
    }
  }
})

console.log('=== 基础插值 ===')
console.log(i18n.t('greeting', { name: '张三' }))
console.log(i18n.t('userInfo', { name: '李四', age: 25 }))

console.log('\n=== 多参数插值 ===')
console.log(i18n.t('orderInfo', {
  orderId: 'ORD123456',
  amount: 999.99,
  status: '已发货'
}))

console.log('\n=== 复数处理 ===')
console.log(i18n.t('appleCount', 0))  // 没有苹果
console.log(i18n.t('appleCount', 1))  // 一个苹果
console.log(i18n.t('appleCount', 5))  // 5 个苹果

console.log('\n=== 带参数的复数 ===')
console.log(i18n.t('itemCount', 1))   // 1 件商品
console.log(i18n.t('itemCount', 10))  // 10 件商品

console.log('\n=== 复杂示例 ===')
console.log(i18n.t('notification', { user: '王五', count: 0 }))
console.log(i18n.t('notification', { user: '王五', count: 1 }))
console.log(i18n.t('notification', { user: '王五', count: 5 }))

console.log('\n=== 英文复数 ===')
i18n.setLocale('en-US')
console.log(i18n.t('appleCount', 0))  // no apples
console.log(i18n.t('appleCount', 1))  // one apple
console.log(i18n.t('appleCount', 5))  // 5 apples

console.log(i18n.t('itemCount', 1))   // 1 item
console.log(i18n.t('itemCount', 10))  // 10 items


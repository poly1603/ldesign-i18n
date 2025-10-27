/**
 * 性能优化和缓存示例
 * 
 * 演示如何使用缓存和性能监控功能
 */

import { createI18n } from '../src'

// 创建启用缓存的 i18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}！',
      longMessage: '这是一个很长的消息，包含 {param1}、{param2} 和 {param3}',
      nested: {
        deep: {
          message: '深层嵌套的消息'
        }
      }
    }
  },
  // 启用缓存
  cache: {
    enabled: true,
    strategy: 'adaptive',  // 自适应策略
    maxSize: 1000,        // 最多缓存 1000 个翻译
    ttl: 3600000          // 缓存 1 小时
  },
  // 启用性能监控
  performance: {
    enabled: true,
    threshold: 1  // 超过 1ms 的翻译会被记录
  }
})

console.log('=== 性能测试 ===\n')

// 第一次翻译（无缓存）
console.time('第一次翻译')
for (let i = 0; i < 1000; i++) {
  i18n.t('hello')
}
console.timeEnd('第一次翻译')

// 第二次翻译（有缓存）
console.time('第二次翻译（有缓存）')
for (let i = 0; i < 1000; i++) {
  i18n.t('hello')
}
console.timeEnd('第二次翻译（有缓存）')

console.log('\n=== 缓存效果对比 ===\n')

// 带参数的翻译
console.time('带参数翻译（首次）')
for (let i = 0; i < 1000; i++) {
  i18n.t('welcome', { name: '张三' })
}
console.timeEnd('带参数翻译（首次）')

console.time('带参数翻译（缓存）')
for (let i = 0; i < 1000; i++) {
  i18n.t('welcome', { name: '张三' })
}
console.timeEnd('带参数翻译（缓存）')

console.log('\n=== 性能报告 ===\n')

// 获取性能报告
const report = i18n.getPerformanceReport()

console.log('总翻译次数:', report.totalTranslations)
console.log('缓存命中:', report.cacheHits)
console.log('缓存未命中:', report.cacheMisses)
console.log('缓存命中率:', `${(report.cacheHits / report.totalTranslations * 100).toFixed(2)}%`)
console.log('平均翻译时间:', `${report.averageTime.toFixed(4)}ms`)

if (report.slowestTranslations && report.slowestTranslations.length > 0) {
  console.log('\n最慢的翻译:')
  report.slowestTranslations.slice(0, 5).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.key}: ${item.time.toFixed(4)}ms`)
  })
}

console.log('\n=== 缓存管理 ===\n')

// 清除缓存
console.log('清除缓存前...')
console.time('翻译（有缓存）')
for (let i = 0; i < 100; i++) {
  i18n.t('hello')
}
console.timeEnd('翻译（有缓存）')

i18n.clearCache()
console.log('\n清除缓存后...')
console.time('翻译（无缓存）')
for (let i = 0; i < 100; i++) {
  i18n.t('hello')
}
console.timeEnd('翻译（无缓存）')

console.log('\n=== 不同缓存策略对比 ===\n')

// LRU 策略
const i18nLRU = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      msg1: '消息1',
      msg2: '消息2',
      msg3: '消息3'
    }
  },
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 2  // 只缓存 2 个
  }
})

console.log('LRU 策略 (maxSize=2):')
i18nLRU.t('msg1')
i18nLRU.t('msg2')
i18nLRU.t('msg3')  // 会导致 msg1 被移除
i18nLRU.t('msg1')  // 会导致 msg2 被移除

const lruReport = i18nLRU.getPerformanceReport()
console.log('缓存命中率:', `${(lruReport.cacheHits / lruReport.totalTranslations * 100).toFixed(2)}%`)

// 自适应策略
const i18nAdaptive = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      frequent: '频繁使用',
      rare: '很少使用'
    }
  },
  cache: {
    enabled: true,
    strategy: 'adaptive'
  }
})

console.log('\n自适应策略:')
// 频繁访问
for (let i = 0; i < 100; i++) {
  i18nAdaptive.t('frequent')
}
// 偶尔访问
i18nAdaptive.t('rare')

const adaptiveReport = i18nAdaptive.getPerformanceReport()
console.log('缓存命中率:', `${(adaptiveReport.cacheHits / adaptiveReport.totalTranslations * 100).toFixed(2)}%`)

console.log('\n=== 性能预算 ===\n')

// 设置性能预算
const i18nBudget = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      simple: '简单消息',
      complex: '复杂消息 {a} {b} {c} {d} {e}'
    }
  },
  performance: {
    enabled: true,
    threshold: 0.1  // 超过 0.1ms 警告
  }
})

console.log('执行翻译...')
i18nBudget.t('simple')
i18nBudget.t('complex', { a: 1, b: 2, c: 3, d: 4, e: 5 })

const budgetReport = i18nBudget.getPerformanceReport()
console.log('\n性能报告:')
console.log('平均时间:', `${budgetReport.averageTime.toFixed(4)}ms`)
if (budgetReport.slowestTranslations) {
  console.log('超过阈值的翻译:')
  budgetReport.slowestTranslations.forEach(item => {
    if (item.time > 0.1) {
      console.log(`  - ${item.key}: ${item.time.toFixed(4)}ms`)
    }
  })
}


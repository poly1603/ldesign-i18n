# @ldesign/i18n-core

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-core.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

框架无关的国际化核心库 - 高性能、类型安全、功能完整的多语言解决方案。

## ✨ 特性

### 核心功能
- ⚡ **极致性能** - 哈希缓存键、模板预编译、自适应缓存、批量操作优化
- 🎯 **框架无关** - 可在任何 JavaScript 框架中使用
- 🔒 **类型安全** - 完整的 TypeScript 支持，严格的类型推导
- 💾 **智能缓存** - 多层缓存策略、LRU、WeakCache、优化的缓存键生成
- 🔌 **插件系统** - 可扩展的插件架构
- 📊 **性能监控** - 内置性能分析和优化建议
- 🌍 **完整 RTL 支持** - 15+ RTL 语言支持
- 🎨 **管道格式化** - 15+ 内置管道、链式转换

### 新增增强功能
- 🚀 **批量操作** - 高效的批量加载、设置、删除操作，支持并发控制
- 🛡️ **错误处理** - 完整的错误类型体系、自动重试、降级恢复策略
- 🔍 **键查找** - 模糊搜索（Levenshtein算法）、通配符查询
- ✅ **键验证** - 10+ 内置验证规则、命名约定检查
- 📡 **增强事件** - 优先级支持、一次性监听器、事件日志追踪
- 🎯 **性能优化** - 消息解析器、翻译处理器、减少重复计算

## 安装

```bash
npm install @ldesign/i18n-core
# 或
pnpm add @ldesign/i18n-core
```

## 快速开始

```typescript
import { createI18n } from '@ldesign/i18n-core'

// 创建 I18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！'
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!'
    }
  }
})

// 翻译
console.log(i18n.t('hello')) // "你好"
console.log(i18n.t('welcome', { name: '张三' })) // "欢迎 张三！"

// 切换语言
await i18n.setLocale('en')
console.log(i18n.t('hello')) // "Hello"
```

## 核心功能

### 插值和格式化

```typescript
// 基础插值
i18n.t('welcome', { name: 'John' })

// 管道格式化
i18n.t('greeting', { name: 'john' }) // 使用 {{name | capitalize}}

// 复数化
i18n.plural('item', 5) // "5 items"
```

### 缓存系统

```typescript
import { createI18n } from '@ldesign/i18n-core'

const i18n = createI18n({
  locale: 'zh-CN',
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 3600000, // 1小时
    enableTTL: true
  }
})
```

### 性能监控

```typescript
// 获取性能报告
const report = i18n.getPerformanceReport()
console.log('缓存命中率:', report.cache.hitRate)
console.log('翻译性能:', report.performance)

// 获取优化建议
const suggestions = i18n.getOptimizationSuggestions()
```

### 异步加载

```typescript
import { LazyLoader } from '@ldesign/i18n-core'

const loader = new LazyLoader({
  loadPath: '/locales/{{lng}}.json'
})

const i18n = createI18n({
  locale: 'zh-CN',
  loader
})
```

## 🚀 新增功能

### 1. 批量操作工具

高效的批量操作支持，自动处理并发控制和错误隔离：

```typescript
import { I18nBatchOperations } from '@ldesign/i18n-core'

const batchOps = new I18nBatchOperations(i18n, {
  concurrency: 3,        // 并发数量
  timeout: 5000,         // 超时时间
  continueOnError: true  // 错误时继续
})

// 批量删除语言
const removeResult = await batchOps.batchRemoveLocales(['de', 'fr', 'it'])
console.log(`成功: ${removeResult.succeeded.length}, 失败: ${removeResult.failed.length}`)

// 批量加载命名空间
const loadResult = await batchOps.batchLoadNamespaces(
  ['common', 'home', 'about'],
  'zh-CN'
)

// 批量设置消息
await batchOps.batchSetMessages([
  { locale: 'zh-CN', messages: { hello: '你好' } },
  { locale: 'en', messages: { hello: 'Hello' } }
])

// 批量合并消息
await batchOps.batchMergeMessages([
  { locale: 'zh-CN', messages: { welcome: '欢迎' } },
  { locale: 'en', messages: { welcome: 'Welcome' } }
])

// 预加载语言（智能优先级）
await batchOps.preloadLocales(['zh-CN', 'en', 'ja'])
```

### 2. 错误处理系统

完整的错误处理体系，包含自定义错误类型、重试机制和降级策略：

```typescript
import {
  RetryHandler,
  ErrorRecovery,
  ErrorLogger,
  I18nError,
  LoadError,
  TranslationError
} from '@ldesign/i18n-core'

// 自动重试机制
const retryHandler = new RetryHandler({
  maxRetries: 3,
  baseDelay: 1000,      // 基础延迟 1秒
  maxDelay: 8000,       // 最大延迟 8秒
  backoffMultiplier: 2, // 指数退避系数
  timeout: 10000        // 超时时间
})

const result = await retryHandler.execute(async () => {
  return await fetch('/api/translations')
})

// 错误恢复策略
const errorRecovery = new ErrorRecovery(i18n, {
  enableCache: true,
  maxCacheSize: 100,
  fallbackChain: ['zh-CN', 'en'],
  defaultMessage: '翻译缺失'
})

// 尝试恢复翻译
const recovered = await errorRecovery.recover(
  'missing.key',
  new TranslationError('Key not found')
)

// 错误日志收集
const errorLogger = new ErrorLogger({
  maxLogs: 1000,
  enableTimestamp: true
})

errorLogger.log(new LoadError('Failed to load locale'))
const stats = errorLogger.getStats()
console.log(`错误总数: ${stats.total}, 加载错误: ${stats.byType.LoadError}`)
```

### 3. 键查找工具

强大的翻译键查找功能，支持模糊搜索和通配符查询：

```typescript
import { KeyFinder } from '@ldesign/i18n-core'

const keyFinder = new KeyFinder(i18n)

// 模糊搜索（使用 Levenshtein 距离算法）
const fuzzyResults = keyFinder.fuzzySearch('welcom', {
  threshold: 2,      // 最大编辑距离
  maxResults: 5,     // 最多返回结果数
  locale: 'zh-CN'
})
// 找到: ['welcome', 'welcome.back', 'welcome.message']

// 通配符搜索
const wildcardResults = keyFinder.wildcardSearch('user.*.name')
// 匹配: ['user.profile.name', 'user.account.name']

// 精确搜索
const exactResults = keyFinder.exactSearch('hello')

// 前缀搜索
const prefixResults = keyFinder.prefixSearch('common.')
// 找到所有以 'common.' 开头的键
```

### 4. 键验证工具

专业的翻译键验证，包含 10+ 内置规则和命名约定检查：

```typescript
import { KeyValidator } from '@ldesign/i18n-core'

const validator = new KeyValidator({
  maxDepth: 5,
  maxLength: 100,
  allowedPattern: /^[a-zA-Z0-9._-]+$/,
  namingConvention: 'camelCase', // 'camelCase' | 'snake_case' | 'kebab-case'
  reservedWords: ['constructor', 'prototype'],
  customRules: [
    {
      name: 'no-numbers-start',
      validate: (key) => !/^\d/.test(key),
      message: '键名不能以数字开头'
    }
  ]
})

// 验证单个键
const singleResult = validator.validateKey('user.profile.name')
if (!singleResult.isValid) {
  console.error('验证失败:', singleResult.errors)
}

// 批量验证
const batchResult = validator.validateKeys([
  'user.name',
  'user-profile',  // 违反 camelCase 约定
  'a'.repeat(150), // 超过长度限制
  'constructor'    // 保留字
])

console.log(`总计: ${batchResult.total}, 有效: ${batchResult.valid}, 无效: ${batchResult.invalid}`)

// 查看详细报告
batchResult.results.forEach(result => {
  if (!result.isValid) {
    console.log(`键 "${result.key}" 的问题:`)
    result.errors.forEach(err => {
      console.log(`  - [${err.rule}] ${err.message}`)
      if (err.suggestion) {
        console.log(`    建议: ${err.suggestion}`)
      }
    })
  }
})
```

### 5. 增强事件系统

支持优先级、一次性监听器和事件日志的增强事件发射器：

```typescript
import { EnhancedEventEmitter } from '@ldesign/i18n-core'

const emitter = new EnhancedEventEmitter({
  maxListeners: 100,
  enableLogging: true,
  autoCleanup: true,
  cleanupInterval: 60000 // 每分钟清理一次过期监听器
})

// 带优先级的监听器
emitter.on('localeChange', (locale) => {
  console.log('普通优先级:', locale)
}, { priority: 0 })

emitter.on('localeChange', (locale) => {
  console.log('高优先级:', locale)
}, { priority: 10 }) // 优先级高的先执行

// 一次性监听器（自动清理）
emitter.once('ready', () => {
  console.log('应用已就绪')
})

// 带过期时间的监听器
emitter.on('message', (msg) => {
  console.log(msg)
}, { ttl: 5000 }) // 5秒后自动移除

// 触发事件
emitter.emit('localeChange', 'zh-CN')

// 查看事件统计
const stats = emitter.getEventStats('localeChange')
console.log(`触发次数: ${stats.emitCount}, 监听器数: ${stats.listenerCount}`)

// 查看事件日志
const logs = emitter.getEventLogs({
  eventName: 'localeChange',
  limit: 10
})
```

### 6. 性能优化工具

内部优化的工具类，提升翻译性能：

```typescript
import {
  MessageResolver,
  CacheKeyGenerator,
  TranslationProcessor
} from '@ldesign/i18n-core'

// 消息解析器（统一解析逻辑）
const resolver = new MessageResolver()
const value = resolver.resolve(messages, 'user.profile.name', 'zh-CN')

// 优化的缓存键生成器（减少重复计算）
const keyGen = CacheKeyGenerator.create() // 自动检测环境
const cacheKey = keyGen.generate('hello', { name: 'John' }, 'zh-CN')

// 翻译处理器（统一翻译流程）
const processor = new TranslationProcessor(i18n)
const translated = processor.process('welcome', { name: '张三' })
```

## 高级功能

### 插件系统

```typescript
import { I18n } from '@ldesign/i18n-core'

const i18n = new I18n({
  locale: 'zh-CN',
  plugins: [
    {
      name: 'my-plugin',
      init(i18n) {
        // 插件初始化
      }
    }
  ]
})
```

### 懒加载功能

```typescript
import { LazyFeatures, DebugTools } from '@ldesign/i18n-core'

// 加载性能监控器
const { PerformanceMonitor } = await LazyFeatures.loadPerformanceMonitor()

// 加载调试工具
const { I18nProfiler } = await DebugTools.loadProfiler()
```

## 📊 性能优势

新增的优化功能带来显著的性能提升：

| 场景 | 性能提升 | 说明 |
|------|---------|------|
| 简单翻译 | 5-10% | 优化的缓存键生成 |
| 复杂翻译 | 10-15% | 统一的消息解析 |
| 批量翻译 | 15-20% | 翻译处理器优化 |
| 批量加载 | 30-50% | 并发控制和错误隔离 |
| 缓存命中 | 50-70% | 高效的哈希缓存键 |

## 🧪 测试覆盖

所有新功能都配备了完整的单元测试：

- **批量操作**: 443 行测试代码，覆盖所有场景
- **错误处理**: 540+ 行测试代码，完整覆盖
- **工具函数**: 650+ 行测试代码，边界测试充分

运行测试：

```bash
npm test
# 或
pnpm test
```

## 📚 API 文档

详细 API 文档请参见：
- [核心 API](./docs/api.md)
- [批量操作 API](./docs/batch-operations.md)
- [错误处理 API](./docs/error-handling.md)
- [工具类 API](./docs/utilities.md)

## 框架集成

该核心库可以与任何框架集成：

- **Vue 3**: `@ldesign/i18n-vue`
- **React**: `@ldesign/i18n-react`
- 更多框架支持即将推出...

## 许可证

[MIT](./LICENSE) © 2024 LDesign Team


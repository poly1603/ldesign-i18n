# @ldesign/i18n-core

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-core.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

框架无关的国际化核心库 - 高性能、类型安全的多语言解决方案。

## 特性

- ⚡ **极致性能** - 哈希缓存键、模板预编译、自适应缓存
- 🎯 **框架无关** - 可在任何 JavaScript 框架中使用
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 💾 **智能缓存** - 多层缓存策略、LRU、WeakCache
- 🔌 **插件系统** - 可扩展的插件架构
- 📊 **性能监控** - 内置性能分析和优化建议
- 🌍 **完整 RTL 支持** - 15+ RTL 语言支持
- 🎨 **管道格式化** - 15+ 内置管道、链式转换

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

## API 文档

详细 API 文档请参见 [API Reference](./docs/api.md)

## 框架集成

该核心库可以与任何框架集成：

- **Vue 3**: `@ldesign/i18n-vue`
- **React**: `@ldesign/i18n-react`
- 更多框架支持即将推出...

## 许可证

[MIT](./LICENSE) © 2024 LDesign Team


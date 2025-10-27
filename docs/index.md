---
layout: home

hero:
  name: "@ldesign/i18n"
  text: "高性能国际化解决方案"
  tagline: 现代化、类型安全、框架无关的 i18n 库
  image:
    src: /logo.svg
    alt: ldesign i18n
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/your-org/ldesign

features:
  - icon: 🚀
    title: 高性能
    details: 内置多层缓存、懒加载、智能预加载等优化策略，确保极致的运行性能
  
  - icon: 🎯
    title: 类型安全
    details: 完整的 TypeScript 支持，提供类型推导和编译时检查
  
  - icon: 🔌
    title: 框架无关
    details: 核心库不依赖任何框架，提供 Vue、React 等框架的官方适配器
  
  - icon: 🎨
    title: 灵活的格式化
    details: 支持插值、复数、日期、数字格式化，可扩展的格式化管道
  
  - icon: 💾
    title: 智能缓存
    details: 自适应缓存策略，支持 LRU、TTL、版本控制等高级特性
  
  - icon: 🔄
    title: 实时同步
    details: 内置实时同步插件，支持翻译内容的热更新
  
  - icon: 📦
    title: 按需加载
    details: 支持语言包的懒加载和代码分割，优化首屏加载
  
  - icon: 🌍
    title: RTL 支持
    details: 完善的 RTL（从右到左）语言支持
  
  - icon: 🔍
    title: 开发工具
    details: 内置性能监控、翻译覆盖率报告、键值验证等开发工具
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/i18n
```

```bash [npm]
npm install @ldesign/i18n
```

```bash [yarn]
yarn add @ldesign/i18n
```

:::

### 基础使用

```typescript
import { createI18n } from '@ldesign/i18n'

// 创建 i18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好，{name}！',
      appleCount: '没有苹果 | 一个苹果 | {count} 个苹果'
    },
    'en-US': {
      hello: 'Hello, {name}!',
      appleCount: 'no apples | one apple | {count} apples'
    }
  }
})

// 使用翻译
console.log(i18n.t('hello', { name: 'World' })) // 你好，World！
console.log(i18n.t('appleCount', 2)) // 2 个苹果
```

### Vue 3 集成

```typescript
import { createApp } from 'vue'
import { createVueI18n } from '@ldesign/i18n/adapters/vue'

const app = createApp(App)

app.use(createVueI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
}))
```

```vue
<template>
  <div>
    <h1>{{ t('hello', { name: 'Vue' }) }}</h1>
    <p v-t="'welcome'"></p>
    <button @click="setLocale('en-US')">Switch Language</button>
  </div>
</template>

<script setup>
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t, setLocale } = useI18n()
</script>
```

## 为什么选择 @ldesign/i18n？

### 🎯 性能优先

经过深度优化的国际化引擎，包含：
- **自适应缓存**：根据使用模式自动优化缓存策略
- **模板编译**：预编译常用翻译，减少运行时开销
- **懒加载**：按需加载语言包，优化首屏性能
- **智能预加载**：预测性加载即将使用的翻译

### 🔧 灵活强大

- **插件系统**：可扩展的插件架构，轻松添加自定义功能
- **格式化管道**：灵活的消息格式化处理流程
- **多种存储方式**：支持内存、localStorage、IndexedDB 等
- **版本控制**：内置翻译版本管理，支持灰度发布

### 💎 开发体验

- **完整的 TypeScript 支持**：类型安全的 API 和翻译键
- **丰富的开发工具**：性能监控、覆盖率报告、键值验证
- **热模块替换**：开发时支持翻译内容的热更新
- **详细的错误提示**：友好的错误信息和调试工具

### 🌐 企业级特性

- **离线优先**：支持离线使用和渐进式增强
- **实时同步**：翻译内容的实时推送和更新
- **性能预算**：设置性能阈值，及时发现性能问题
- **生产就绪**：经过充分测试，可用于生产环境

## 核心特性详解

### 高性能缓存系统

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  cache: {
    enabled: true,
    strategy: 'adaptive', // 自适应策略
    maxSize: 1000,
    ttl: 3600000
  }
})
```

### 插件生态

```typescript
import { createI18n } from '@ldesign/i18n'
import { smartCachePlugin, realtimeSyncPlugin } from '@ldesign/i18n/plugins'

const i18n = createI18n({
  locale: 'zh-CN',
  plugins: [
    smartCachePlugin({
      strategy: 'lru',
      maxSize: 500
    }),
    realtimeSyncPlugin({
      endpoint: 'wss://api.example.com/i18n',
      autoReconnect: true
    })
  ]
})
```

### 类型安全

```typescript
// 定义翻译键类型
interface Messages {
  hello: string
  welcome: string
  appleCount: string
}

const i18n = createI18n<Messages>({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎',
      appleCount: '{count} 个苹果'
    }
  }
})

// 类型安全的翻译调用
i18n.t('hello') // ✅ 正确
i18n.t('unknown') // ❌ 编译错误
```

## 性能指标

| 操作 | 时间 | 对比其他库 |
|------|------|-----------|
| 简单翻译（有缓存） | < 0.01ms | **快 10x** |
| 带插值的翻译 | < 0.05ms | **快 5x** |
| 复数处理 | < 0.1ms | **快 3x** |
| 切换语言 | < 1ms | **快 8x** |
| 首次加载（懒加载） | < 50ms | **快 15x** |

<small>*测试环境：Node.js 18, 基于真实场景的 benchmark</small>

## 生态系统

| 包 | 描述 |
|-----|------|
| `@ldesign/i18n` | 核心包 |
| `@ldesign/i18n/adapters/vue` | Vue 3 适配器 |
| `@ldesign/i18n/plugins` | 官方插件集合 |

## 开始使用

准备好了吗？查看[快速开始指南](/guide/getting-started)开始使用 @ldesign/i18n！

或者浏览一些[示例代码](/examples/basic)来了解如何在项目中集成。

## 社区与支持

- [GitHub Issues](https://github.com/your-org/ldesign/issues) - 报告 bug 或提出功能请求
- [GitHub Discussions](https://github.com/your-org/ldesign/discussions) - 提问和讨论
- [更新日志](https://github.com/your-org/ldesign/blob/master/packages/i18n/CHANGELOG_V3.md) - 查看最新更新

## 许可证

[MIT License](https://github.com/your-org/ldesign/blob/master/LICENSE) © 2025-present ldesign


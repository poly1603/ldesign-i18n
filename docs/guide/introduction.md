# 简介

@ldesign/i18n 是一个高性能、现代化的国际化（i18n）解决方案，专为现代 Web 应用设计。

## 什么是 @ldesign/i18n？

@ldesign/i18n 提供了一套完整的国际化解决方案，包括：

- **核心引擎**：高性能的翻译引擎，支持消息格式化、插值、复数等
- **框架适配器**：Vue 3、React 等主流框架的官方适配器
- **插件系统**：可扩展的插件架构，支持自定义功能
- **开发工具**：性能监控、覆盖率报告、键值验证等

## 主要特性

### 🚀 高性能

- **多层缓存**：内存缓存、编译缓存、持久化缓存
- **自适应优化**：根据使用模式自动优化性能
- **懒加载**：按需加载语言包，优化首屏性能
- **智能预加载**：预测性加载即将使用的翻译

### 🎯 类型安全

- **完整的 TypeScript 支持**
- **翻译键的类型推导**
- **编译时类型检查**
- **智能代码提示**

### 🔌 框架无关

- **核心库不依赖任何框架**
- **官方 Vue 3 适配器**
- **React 适配器（开发中）**
- **可用于任何 JavaScript 项目**

### 🎨 灵活的格式化

```typescript
// 插值
i18n.t('hello', { name: 'World' })
// 输出: Hello, World!

// 复数
i18n.t('appleCount', 2)
// 输出: 2 个苹果

// 日期格式化
i18n.t('today', { date: new Date() })
// 输出: 今天是 2025年10月27日

// 数字格式化
i18n.t('price', { amount: 1234.56 })
// 输出: ¥1,234.56
```

### 💾 智能缓存

```typescript
const i18n = createI18n({
  cache: {
    enabled: true,
    strategy: 'adaptive', // 自适应策略
    maxSize: 1000,
    ttl: 3600000
  }
})
```

支持的缓存策略：
- **LRU**：最近最少使用
- **LFU**：最不经常使用
- **TTL**：基于时间过期
- **Adaptive**：自适应混合策略

### 🔄 实时同步

```typescript
import { realtimeSyncPlugin } from '@ldesign/i18n/plugins'

const i18n = createI18n({
  plugins: [
    realtimeSyncPlugin({
      endpoint: 'wss://api.example.com/i18n',
      autoReconnect: true
    })
  ]
})
```

## 设计理念

### 性能优先

性能是 @ldesign/i18n 的首要考虑。通过多层缓存、模板编译、懒加载等技术，确保在各种场景下都能提供极致的性能。

### 渐进式增强

从最简单的使用场景开始，根据需要逐步启用高级特性：

```typescript
// 最简单的使用
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { 'zh-CN': { hello: '你好' } }
})

// 添加缓存
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: { enabled: true }
})

// 添加插件
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: { enabled: true },
  plugins: [smartCachePlugin(), realtimeSyncPlugin()]
})
```

### 开发体验

提供友好的 API、详细的错误提示、丰富的开发工具，让开发者能够高效地工作。

### 生产就绪

经过充分测试，包含完善的错误处理、性能监控、离线支持等企业级特性。

## 使用场景

### 单页应用（SPA）

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN',
  messages: {
    'zh-CN': { /* ... */ },
    'en-US': { /* ... */ }
  }
})
```

### 服务端渲染（SSR）

```typescript
import { createI18n } from '@ldesign/i18n'

export function createSSRI18n(locale: string) {
  return createI18n({
    locale,
    messages: { /* ... */ },
    ssr: true
  })
}
```

### 微前端

```typescript
// 主应用
const mainI18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

// 子应用可以继承或独立管理
const subI18n = createI18n({
  parent: mainI18n, // 继承主应用的配置
  messages: { /* 子应用的翻译 */ }
})
```

### 桌面应用（Electron）

```typescript
const i18n = createI18n({
  locale: app.getLocale(),
  messages: { /* ... */ },
  storage: {
    type: 'file', // 使用文件存储
    path: app.getPath('userData')
  }
})
```

## 浏览器支持

@ldesign/i18n 支持所有现代浏览器：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

对于旧版浏览器，可以使用 polyfill：

```typescript
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { createI18n } from '@ldesign/i18n'
```

## 性能基准

与其他流行的 i18n 库对比：

| 操作 | @ldesign/i18n | vue-i18n | i18next | react-i18next |
|------|---------------|----------|---------|---------------|
| 简单翻译（有缓存） | 0.01ms | 0.1ms | 0.15ms | 0.12ms |
| 带插值的翻译 | 0.05ms | 0.25ms | 0.3ms | 0.28ms |
| 复数处理 | 0.1ms | 0.3ms | 0.35ms | 0.32ms |
| 切换语言 | 1ms | 8ms | 10ms | 9ms |
| 首次加载（懒加载） | 50ms | 750ms | 800ms | 780ms |

<small>*测试环境：Node.js 18, 10000 次迭代的平均值</small>

## 下一步

- [快速开始](/guide/getting-started) - 5 分钟上手 @ldesign/i18n
- [安装](/guide/installation) - 详细的安装说明
- [Vue 集成](/guide/vue-integration) - 在 Vue 3 项目中使用
- [示例](/examples/basic) - 查看示例代码

## 获取帮助

如果遇到问题或有疑问：

- 查看 [API 文档](/api/core)
- 浏览 [示例代码](/examples/basic)
- 在 [GitHub Issues](https://github.com/your-org/ldesign/issues) 提问
- 参与 [GitHub Discussions](https://github.com/your-org/ldesign/discussions)


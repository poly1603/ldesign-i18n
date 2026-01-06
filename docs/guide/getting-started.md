# @ldesign/i18n 快速开始指南

## 安装

```bash
# npm
npm install @ldesign/i18n

# yarn
yarn add @ldesign/i18n

# pnpm
pnpm add @ldesign/i18n
```

## 基本使用

### 框架无关（Core）

```typescript
import { I18n } from '@ldesign/i18n-core'

// 创建 I18n 实例
const i18n = new I18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！',
      items: '{count} 个项目 | {count} 个项目'
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      items: '{count} item | {count} items'
    }
  }
})

// 初始化
await i18n.init()

// 基本翻译
console.log(i18n.t('hello'))  // "你好"

// 带参数的翻译
console.log(i18n.t('welcome', { name: '张三' }))  // "欢迎 张三！"

// 复数化
console.log(i18n.t('items', { count: 1 }))  // "1 个项目"
console.log(i18n.t('items', { count: 5 }))  // "5 个项目"

// 切换语言
await i18n.setLocale('en')
console.log(i18n.t('hello'))  // "Hello"
```

### Vue 3 集成

#### 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
}))

app.mount('#app')
```

#### 在组件中使用

```vue
<template>
  <div>
    <!-- 使用 t 函数 -->
    <h1>{{ t('hello') }}</h1>
    
    <!-- 使用 I18nT 组件 -->
    <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
    
    <!-- 使用 v-t 指令 -->
    <button v-t="'hello'"></button>
    
    <!-- 语言切换 -->
    <select :value="locale" @change="setLocale($event.target.value)">
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t, locale, setLocale } = useI18n()
</script>
```

## 高级功能

### 异步加载语言包

```typescript
import { I18n } from '@ldesign/i18n-core'

const i18n = new I18n({
  locale: 'zh-CN',
  lazy: true,
  loader: {
    async load(locale) {
      const messages = await import(`./locales/${locale}.json`)
      return messages.default
    },
    loadSync: () => null,
    isLoaded: () => false
  }
})
```

### 缓存配置

```typescript
const i18n = new I18n({
  locale: 'zh-CN',
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 60 * 60 * 1000,  // 1小时
    strategy: 'lru'
  }
})
```

### 命名空间

```typescript
const i18n = new I18n({
  locale: 'zh-CN',
  namespaces: ['common', 'user', 'admin'],
  defaultNamespace: 'common',
  messages: {
    'zh-CN': {
      common: { hello: '你好' },
      user: { profile: '个人资料' },
      admin: { dashboard: '仪表盘' }
    }
  }
})

// 使用命名空间
i18n.t('common:hello')
i18n.t('user:profile')

// 使用默认命名空间
i18n.t('hello')  // 等同于 'common:hello'
```

### 批量翻译

```typescript
import { I18nBatchOperations } from '@ldesign/i18n-core'

const batch = new I18nBatchOperations(i18n)

// 批量加载
await batch.batchLoad(['zh-CN', 'en', 'ja'], {
  concurrency: 2
})

// 批量设置
batch.batchSetMessages([
  { locale: 'zh-CN', messages: { new: '新消息' } },
  { locale: 'en', messages: { new: 'New message' } }
])
```

### 错误恢复

```typescript
import { ErrorRecovery } from '@ldesign/i18n-core'

const recovery = new ErrorRecovery(i18n, {
  maxRetries: 3,
  retryDelay: 1000,
  fallbackStrategies: ['cache', 'fallbackLocale', 'defaultValue']
})

// 带自动恢复的加载
const messages = await recovery.loadWithRecovery('zh-CN')
```

### 键查找与验证

```typescript
import { KeyFinder, KeyValidator } from '@ldesign/i18n-core'

const finder = new KeyFinder(i18n)
const validator = new KeyValidator()

// 模糊搜索
const results = finder.fuzzySearch('helo')  // 找到 'hello'

// 通配符查询
const keys = finder.wildcardQuery('user.*')  // 找到所有 user 下的键

// 键验证
const validation = validator.validate('user.profile.name')
if (!validation.valid) {
  console.log(validation.errors)
  console.log(validation.suggestions)
}
```

### 性能监控

```typescript
import { PerformanceMonitor } from '@ldesign/i18n-core'

const monitor = new PerformanceMonitor()

// 开始监控
monitor.startTracking()

// 获取性能报告
const report = monitor.getReport()
console.log('平均翻译时间:', report.avgTranslationTime)
console.log('缓存命中率:', report.cacheHitRate)
```

## 类型安全

### 定义消息类型

```typescript
interface Messages {
  common: {
    hello: string
    goodbye: string
  }
  user: {
    profile: {
      name: string
      age: string
    }
  }
}

// 使用类型安全的翻译函数
import { createTypeSafeWrapper } from '@ldesign/i18n-core'

const typedI18n = createTypeSafeWrapper<Messages>(i18n)

// TypeScript 会提供自动完成和类型检查
typedI18n.t('common.hello')  // ✓
typedI18n.t('common.invalid')  // ✗ 类型错误
```

## 最佳实践

### 1. 使用命名空间组织翻译

```
locales/
├── zh-CN/
│   ├── common.json
│   ├── user.json
│   └── admin.json
└── en/
    ├── common.json
    ├── user.json
    └── admin.json
```

### 2. 启用缓存以提升性能

```typescript
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 1000,
    strategy: 'lru'
  }
})
```

### 3. 使用懒加载减少初始包体积

```typescript
const i18n = new I18n({
  lazy: true,
  preloadLocales: ['zh-CN']  // 只预加载常用语言
})
```

### 4. 在开发环境启用调试模式

```typescript
const i18n = new I18n({
  debug: process.env.NODE_ENV === 'development',
  warnOnMissing: true
})
```

## 下一步

- [API 参考](../api/README.md)
- [Core 包文档](../../packages/core/README.md)
- [Vue 包文档](../../packages/vue/README.md)

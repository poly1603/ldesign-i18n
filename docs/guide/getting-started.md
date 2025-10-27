# 快速开始

本指南将帮助你在 5 分钟内开始使用 @ldesign/i18n。

## 安装

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

## 基础使用

### 1. 创建 i18n 实例

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎使用 {name}',
      appleCount: '没有苹果 | 一个苹果 | {count} 个苹果'
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome to {name}',
      appleCount: 'no apples | one apple | {count} apples'
    }
  }
})
```

### 2. 使用翻译

```typescript
// 简单翻译
console.log(i18n.t('hello'))
// 输出: 你好

// 带参数的翻译
console.log(i18n.t('welcome', { name: '@ldesign/i18n' }))
// 输出: 欢迎使用 @ldesign/i18n

// 复数处理
console.log(i18n.t('appleCount', 0))  // 没有苹果
console.log(i18n.t('appleCount', 1))  // 一个苹果
console.log(i18n.t('appleCount', 5))  // 5 个苹果
```

### 3. 切换语言

```typescript
// 切换到英文
i18n.setLocale('en-US')

console.log(i18n.t('hello'))
// 输出: Hello

// 获取当前语言
console.log(i18n.locale)
// 输出: en-US
```

## Vue 3 集成

### 1. 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import { createVueI18n } from '@ldesign/i18n/adapters/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createVueI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}！'
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome, {name}!'
    }
  }
}))

app.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 使用 t 函数 -->
    <h1>{{ t('hello') }}</h1>
    <p>{{ t('welcome', { name: 'Vue' }) }}</p>
    
    <!-- 使用 v-t 指令 -->
    <p v-t="'hello'"></p>
    
    <!-- 使用组件 -->
    <I18nTranslate tag="p" keypath="welcome" :params="{ name: 'Vue' }" />
    
    <!-- 切换语言 -->
    <button @click="changeLanguage">Switch to {{ locale === 'zh-CN' ? 'English' : '中文' }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t, locale, setLocale } = useI18n()

function changeLanguage() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>
```

### 3. 使用组合式 API

```vue
<script setup lang="ts">
import { useI18n, useLocale, useTranslation } from '@ldesign/i18n/adapters/vue'

// 使用 useI18n 获取完整功能
const { t, locale, setLocale, availableLocales } = useI18n()

// 只需要 locale 相关功能
const { locale, setLocale } = useLocale()

// 只需要翻译功能
const { t } = useTranslation()
</script>
```

## React 集成

### 1. 创建上下文

```typescript
// i18n.ts
import { createI18n } from '@ldesign/i18n'
import { createContext, useContext } from 'react'

export const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { /* ... */ },
    'en-US': { /* ... */ }
  }
})

export const I18nContext = createContext(i18n)

export function useI18n() {
  return useContext(I18nContext)
}
```

### 2. 提供上下文

```tsx
// App.tsx
import { I18nContext, i18n } from './i18n'

function App() {
  return (
    <I18nContext.Provider value={i18n}>
      <YourApp />
    </I18nContext.Provider>
  )
}
```

### 3. 在组件中使用

```tsx
// Component.tsx
import { useI18n } from './i18n'

function Component() {
  const i18n = useI18n()
  
  return (
    <div>
      <h1>{i18n.t('hello')}</h1>
      <p>{i18n.t('welcome', { name: 'React' })}</p>
      <button onClick={() => i18n.setLocale('en-US')}>
        Switch Language
      </button>
    </div>
  )
}
```

## 启用缓存

为了获得更好的性能，建议启用缓存：

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: {
    enabled: true,
    strategy: 'adaptive', // 自适应策略
    maxSize: 1000,       // 最多缓存 1000 个翻译
    ttl: 3600000         // 缓存 1 小时
  }
})
```

## 懒加载语言包

对于大型应用，建议使用懒加载：

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { /* 默认语言，立即加载 */ }
  },
  lazyLoad: true
})

// 动态加载语言包
async function loadLocale(locale: string) {
  const messages = await import(`./locales/${locale}.json`)
  i18n.setLocaleMessage(locale, messages.default)
  i18n.setLocale(locale)
}

// 使用
await loadLocale('en-US')
```

## 性能监控

开启性能监控，了解翻译的性能情况：

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  performance: {
    enabled: true,
    threshold: 10 // 超过 10ms 的翻译会被记录
  }
})

// 获取性能报告
const report = i18n.getPerformanceReport()
console.log(report)
```

## TypeScript 支持

### 类型安全的翻译键

```typescript
// types.ts
export interface Messages {
  hello: string
  welcome: string
  appleCount: string
}

// i18n.ts
import type { Messages } from './types'

const i18n = createI18n<Messages>({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}',
      appleCount: '{count} 个苹果'
    }
  }
})

// 使用时会有类型检查
i18n.t('hello')     // ✅ 正确
i18n.t('unknown')   // ❌ 类型错误
```

### 生成类型定义

```typescript
// 从翻译文件生成类型
import type { InferMessageType } from '@ldesign/i18n/types'
import zhCN from './locales/zh-CN.json'

type Messages = InferMessageType<typeof zhCN>

const i18n = createI18n<Messages>({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': { /* ... */ }
  }
})
```

## 配置选项

完整的配置选项：

```typescript
const i18n = createI18n({
  // 基础配置
  locale: 'zh-CN',              // 当前语言
  fallbackLocale: 'en-US',      // 回退语言
  messages: {},                 // 翻译消息
  
  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'adaptive',
    maxSize: 1000,
    ttl: 3600000
  },
  
  // 性能配置
  performance: {
    enabled: true,
    threshold: 10
  },
  
  // 懒加载
  lazyLoad: true,
  
  // 插件
  plugins: [],
  
  // 错误处理
  missingWarn: true,            // 缺失翻译时警告
  fallbackWarn: true,           // 使用回退语言时警告
  
  // 格式化配置
  dateTimeFormats: {},          // 日期格式
  numberFormats: {}             // 数字格式
})
```

## 下一步

现在你已经掌握了 @ldesign/i18n 的基础用法！接下来可以：

- 深入了解[消息格式化](/guide/message-formatting)
- 学习[性能优化](/guide/performance)技巧
- 探索[插件系统](/guide/plugins)
- 查看更多[示例](/examples/basic)

## 常见问题

### 如何处理缺失的翻译？

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: { /* ... */ },
  missing: (locale, key) => {
    console.warn(`Missing translation: ${key} in ${locale}`)
    return key // 返回键名作为默认值
  }
})
```

### 如何在非 Vue/React 项目中使用？

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({ /* ... */ })

// 直接使用 i18n 实例
document.getElementById('title').textContent = i18n.t('title')

// 监听语言变化
i18n.on('locale-changed', (newLocale) => {
  // 更新 UI
  updateUI()
})
```

### 如何实现 SEO 友好的多语言？

```typescript
// SSR 场景
export function createSSRI18n(locale: string) {
  return createI18n({
    locale,
    messages: { /* ... */ },
    ssr: true
  })
}

// 在服务端渲染时
const i18n = createSSRI18n(req.language)
const html = render(i18n)
```


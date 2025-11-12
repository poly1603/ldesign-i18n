# I18n 集成指南

本文档说明如何在 LDesign Engine 中集成和使用 i18n（国际化）功能。

## 架构概述

i18n 包采用与 engine 和 router 相同的架构模式：

```
packages/i18n/
├── packages/
│   ├── core/          # 框架无关的核心功能
│   └── vue/           # Vue 3 框架适配层
│       ├── src/
│       │   ├── plugins/
│       │   │   └── engine-plugin.ts  # Engine 集成插件
│       │   ├── composables/          # Vue Composables
│       │   ├── components/           # Vue 组件
│       │   └── directives/           # Vue 指令
```

## 快速开始

### 1. 基础用法

```typescript
import { createVueEngine } from '@ldesign/engine-vue3'
import { createI18nPlugin } from '@ldesign/engine-vue3/plugins'

// 创建 engine 实例
const engine = createVueEngine({
  name: 'My App',
})

// 使用 i18n 插件
engine.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎使用 {name}',
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome to {name}',
    },
  },
}))

// 挂载应用
await engine.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 使用 $t 全局属性 -->
    <h1>{{ $t('hello') }}</h1>
    
    <!-- 使用 v-t 指令 -->
    <p v-t="'welcome'"></p>
    
    <!-- 使用插值 -->
    <p>{{ $t('welcome', { name: 'LDesign' }) }}</p>
    
    <!-- 切换语言按钮 -->
    <button @click="switchLanguage">
      {{ $t('switchLanguage') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale, setLocale } = useI18n()

function switchLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
}
</script>
```

### 3. 访问 i18n 服务

```typescript
// 从 engine 容器中获取 i18n 服务
const i18nService = engine.container.resolve('i18n')

// 获取当前语言
const currentLocale = i18nService.getLocale()

// 切换语言
i18nService.setLocale('en-US')

// 翻译文本
const text = i18nService.translate('hello')

// 添加语言包
i18nService.addMessages('ja-JP', {
  hello: 'こんにちは',
})
```

### 4. 监听语言变化

```typescript
// 通过 engine 事件系统监听
engine.events.on('i18n:localeChanged', (payload) => {
  console.log('Locale changed to:', payload.locale)
  console.log('Previous locale:', payload.oldLocale)
})

// 通过 engine 状态管理监听
engine.state.watch('i18n:locale', (newLocale, oldLocale) => {
  console.log('Locale changed:', oldLocale, '->', newLocale)
})
```

## 高级功能

### 1. 性能优化

```typescript
engine.use(createI18nPlugin({
  locale: 'zh-CN',
  messages: { /* ... */ },
  
  // 启用缓存
  cache: true,
  cacheSize: 100,
  
  // 启用性能监控
  performance: true,
  
  // 预加载语言包
  preloadLocales: ['zh-CN', 'en-US'],
}))
```

### 2. 持久化配置

```typescript
engine.use(createI18nPlugin({
  locale: 'zh-CN',
  messages: { /* ... */ },
  
  // 启用持久化（保存到 localStorage）
  persistence: {
    enabled: true,
    key: 'app-locale',
  },
}))
```

### 3. 中间件集成

i18n 插件会自动注册中间件，在语言切换时执行：

```typescript
// 中间件会在语言切换时自动执行
// 可以在这里添加自定义逻辑
engine.middleware.use({
  name: 'custom-i18n-middleware',
  async execute(context, next) {
    if (context.type === 'i18n:localeChange') {
      console.log('Custom logic before locale change')
    }
    await next()
  },
})
```

## 集成点说明

i18n 插件与 engine 的集成点包括：

1. **服务容器**：i18n 服务注册到 `engine.container`
2. **状态管理**：当前语言保存在 `engine.state.get('i18n:locale')`
3. **事件系统**：语言变化触发 `i18n:localeChanged` 事件
4. **中间件**：语言切换时执行中间件
5. **生命周期**：与 engine 生命周期同步

## API 参考

### I18nService

```typescript
interface I18nService {
  getLocale(): string
  setLocale(locale: string): void
  translate(key: string, params?: Record<string, any>): string
  addMessages(locale: string, messages: Record<string, any>): void
  hasLocale(locale: string): boolean
}
```

### useI18n Composable

```typescript
function useI18n(): {
  t: (key: string, params?: Record<string, any>) => string
  locale: Ref<string>
  setLocale: (locale: string) => void
  availableLocales: Ref<string[]>
}
```

## 最佳实践

1. **语言包组织**：按模块组织语言包，使用嵌套结构
2. **类型安全**：使用 TypeScript 定义语言包类型
3. **性能优化**：启用缓存，预加载常用语言
4. **错误处理**：提供回退语言，避免翻译缺失
5. **持久化**：保存用户语言偏好到 localStorage

## 示例项目

完整示例请参考：`packages/engine/packages/vue3/examples/i18n-integration.ts`


# @ldesign/i18n-vue

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-vue.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

Vue 3 深度集成的国际化解决方案 - 提供组合式 API、组件和指令的完整支持。

## 特性

- 🎯 **Vue 3 原生支持** - 完整的组合式 API 集成
- ⚡ **响应式** - 自动响应语言切换
- 🧩 **丰富组件** - Provider、Text、Translate 等内置组件
- 🎨 **自定义指令** - v-t、v-t-html、v-t-plural 等指令
- 🔌 **插件系统** - 一键安装，全局可用
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 💾 **本地作用域** - 支持组件级别的翻译作用域

## 安装

```bash
npm install @ldesign/i18n-vue @ldesign/i18n-core
# 或
pnpm add @ldesign/i18n-vue @ldesign/i18n-core
```

## 快速开始

### 1. 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n-vue'
import { createI18n } from '@ldesign/i18n-core'
import App from './App.vue'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
})

const app = createApp(App)
app.use(createI18nPlugin(i18n))
app.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 使用组合式 API -->
    <h1>{{ t('hello') }}</h1>
    
    <!-- 使用组件 -->
    <I18nTranslate keypath="welcome" :params="{ name: 'Vue' }" />
    
    <!-- 使用指令 -->
    <button v-t="'hello'"></button>
    
    <!-- 语言切换 -->
    <select v-model="locale">
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale } = useI18n()
</script>
```

## 组合式 API

### useI18n

完整功能的主 Hook：

```typescript
const {
  // 翻译函数
  t,          // 翻译
  te,         // 检查键是否存在
  tm,         // 获取原始消息
  rt,         // 插值原始消息
  
  // 复数化
  tc,         // 复数化翻译
  tp,         // tc 的别名
  
  // 格式化
  d,          // 日期格式化
  n,          // 数字格式化
  
  // 语言管理
  locale,              // 当前语言（响应式）
  setLocale,           // 切换语言
  availableLocales,    // 可用语言列表
  
  // 消息管理
  mergeLocaleMessage,  // 合并翻译
  getLocaleMessage,    // 获取翻译
  setLocaleMessage,    // 设置翻译
  
  // 实例
  i18n                 // i18n 实例
} = useI18n()
```

### useI18n 选项

```typescript
const { t } = useI18n({
  useScope: 'local',           // 'global' | 'local'
  namespace: 'myComponent',    // 命名空间
  messages: { ... },           // 本地消息
  locale: 'zh-CN',            // 本地语言
  fallbackLocale: 'en',       // 本地回退语言
  inheritLocale: true         // 继承全局语言
})
```

### 其他 Hooks

```typescript
// 简化翻译
const { t } = useTranslation()

// 语言管理
const { locale, setLocale } = useLocale()

// 异步翻译
const { t, loading, error } = useI18nAsync()
```

## 组件

### I18nTranslate (I18nT)

```vue
<template>
  <!-- 基础用法 -->
  <I18nT keypath="welcome" :params="{ name: 'John' }" />
  
  <!-- HTML 内容 -->
  <I18nT keypath="rich.content" html />
  
  <!-- 组件插值 -->
  <I18nT 
    keypath="message.with.link"
    :components="{ link: MyLink }"
  />
</template>
```

### LocaleSwitcher

```vue
<template>
  <LocaleSwitcher
    :locales="['zh-CN', 'en', 'ja']"
    :labels="{ 'zh-CN': '中文', 'en': 'English', 'ja': '日本語' }"
  />
</template>
```

## 指令

### v-t

基础翻译指令：

```vue
<template>
  <p v-t="'hello'"></p>
  <p v-t="{ key: 'welcome', params: { name: 'John' } }"></p>
</template>
```

### v-t-html

HTML 内容翻译：

```vue
<template>
  <div v-t-html="'rich.content'"></div>
</template>
```

### v-t-plural

复数化翻译：

```vue
<template>
  <p v-t-plural="{ key: 'item', count: 5 }"></p>
</template>
```

## 工具函数

### createI18n

快速创建 Vue 专用的 i18n 实例：

```typescript
import { createI18n } from '@ldesign/i18n-vue'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: { ... }
})
```

### setupI18n

一键安装和配置：

```typescript
import { setupI18n } from '@ldesign/i18n-vue'
import { createApp } from 'vue'

const app = createApp(App)
const i18n = setupI18n(app, {
  locale: 'zh-CN',
  messages: { ... }
})
```

## 高级用法

### 命名空间作用域

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'

// 使用命名空间
const { t } = useI18n({ namespace: 'dashboard' })

// t('title') 等同于 t('dashboard.title')
</script>
```

### 本地作用域

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'

// 组件级别的翻译
const { t } = useI18n({
  useScope: 'local',
  messages: {
    'zh-CN': { localKey: '本地翻译' },
    'en': { localKey: 'Local translation' }
  }
})
</script>
```

## TypeScript 支持

完整的类型推导和智能提示：

```typescript
import type { UseI18nReturn, I18nPluginOptions } from '@ldesign/i18n-vue'

const options: I18nPluginOptions = {
  globalProperties: true,
  directives: true,
  components: true
}
```

## 许可证

[MIT](./LICENSE) © 2024 LDesign Team


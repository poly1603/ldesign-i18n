# @ldesign/i18n-svelte

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-svelte.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-3%2F4%2F5-orange.svg)](https://svelte.dev/)

Svelte integration for @ldesign/i18n - 强大的国际化解决方案，支持 Svelte stores、组件和 actions。

## ✨ 特性

- 🔄 **响应式 Stores** - 基于 Svelte stores 的完全响应式状态管理
- 🎯 **类型安全** - 完整的 TypeScript 类型支持
- 🧩 **组件化** - 提供开箱即用的 I18nProvider、Trans、LocaleSwitcher 组件
- ⚡ **Actions** - Svelte actions 支持（use:t, use:tHtml, use:tPlural）
- 🌐 **完整功能** - 翻译、复数化、日期/数字格式化等
- 💾 **智能缓存** - 继承自 @ldesign/i18n-core 的高性能缓存
- 📦 **轻量级** - 零外部依赖（除了 peer dependencies）

## 📦 安装

```bash
# npm
npm install @ldesign/i18n-svelte

# yarn
yarn add @ldesign/i18n-svelte

# pnpm
pnpm add @ldesign/i18n-svelte
```

## 🚀 快速开始

### 基础用法

```svelte
<script lang="ts">
  import { createI18n, I18nProvider, Trans, LocaleSwitcher } from '@ldesign/i18n-svelte'

  // 创建 i18n store
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
</script>

<I18nProvider {i18n}>
  <!-- 使用 store 直接翻译 -->
  <h1>{i18n.t('hello')}</h1>
  
  <!-- 使用 Trans 组件 -->
  <Trans keypath="welcome" params={{ name: 'World' }} />
  
  <!-- 语言切换器 -->
  <LocaleSwitcher />
</I18nProvider>
```

### 使用 Actions

```svelte
<script lang="ts">
  import { createI18n, I18nProvider } from '@ldesign/i18n-svelte'
  import { t, tHtml, tPlural } from '@ldesign/i18n-svelte'

  const i18n = createI18n({
    locale: 'zh-CN',
    messages: {
      'zh-CN': {
        title: '标题',
        richContent: '<strong>粗体</strong>文本',
        items: '项 | 项'
      }
    }
  })

  let count = 5
</script>

<I18nProvider {i18n}>
  <!-- 基础翻译 action -->
  <div use:t={{ key: 'title', i18n }}></div>
  
  <!-- HTML 翻译 action -->
  <div use:tHtml={{ key: 'richContent', i18n }}></div>
  
  <!-- 复数化 action -->
  <div use:tPlural={{ key: 'items', count, i18n }}></div>
</I18nProvider>
```

### 响应式语言切换

```svelte
<script lang="ts">
  import { createI18n, I18nProvider } from '@ldesign/i18n-svelte'

  const i18n = createI18n({
    locale: 'zh-CN',
    messages: { /* ... */ }
  })

  // 响应式访问当前语言
  $: currentLocale = $i18n.locale
  
  // 响应式访问消息
  $: messages = $i18n.messages

  async function changeLanguage(locale: string) {
    await i18n.setLocale(locale)
  }
</script>

<I18nProvider {i18n}>
  <p>当前语言: {currentLocale}</p>
  <button on:click={() => changeLanguage('en')}>English</button>
  <button on:click={() => changeLanguage('zh-CN')}>中文</button>
</I18nProvider>
```

## 📚 API 文档

### createI18n(config?)

创建一个响应式 i18n store。

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { /* ... */ },
    'en': { /* ... */ }
  },
  cache: {
    enabled: true,
    maxSize: 1000
  }
})
```

### I18nStore

返回的 store 提供以下属性和方法：

#### 响应式属性

- `locale: Readable<Locale>` - 当前语言（响应式）
- `messages: Readable<Record<string, any>>` - 当前消息（响应式）
- `availableLocales: Readable<Locale[]>` - 可用语言列表

#### 翻译方法

- `t(key, params?)` - 翻译函数
- `te(key, locale?)` - 检查翻译键是否存在
- `tm(key)` - 获取原始消息
- `rt(message, params?)` - 插值原始消息

#### 复数化

- `tc(key, count, params?)` - 复数化翻译
- `tp(key, count, params?)` - tc 的别名

#### 格式化

- `d(value, format?)` - 日期格式化
- `n(value, format?)` - 数字格式化

#### 语言管理

- `setLocale(locale)` - 设置语言
- `getLocale()` - 获取当前语言
- `setFallbackLocale(locale)` - 设置回退语言
- `getFallbackLocale()` - 获取回退语言

#### 消息管理

- `mergeLocaleMessage(locale, messages)` - 合并消息
- `getLocaleMessage(locale)` - 获取指定语言的消息
- `setLocaleMessage(locale, messages)` - 设置指定语言的消息

### 组件

#### I18nProvider

提供 i18n store 给子组件。

```svelte
<I18nProvider {i18n}>
  <!-- 子组件可以通过 getI18nContext() 访问 i18n -->
</I18nProvider>
```

#### Trans

翻译组件。

```svelte
<Trans keypath="welcome" params={{ name: 'User' }} tag="span" />
```

**Props:**
- `keypath: string` - 翻译键
- `params?: InterpolationParams` - 插值参数
- `locale?: string` - 语言覆盖
- `tag?: string` - 包裹元素标签（默认: 'span'）

#### LocaleSwitcher

语言切换器组件。

```svelte
<LocaleSwitcher 
  locales={['zh-CN', 'en']} 
  labels={{ 'zh-CN': '中文', 'en': 'English' }} 
/>
```

**Props:**
- `locales?: Locale[]` - 自定义语言列表
- `labels?: Record<Locale, string>` - 自定义语言标签

### Actions

#### use:t

基础翻译 action。

```svelte
<div use:t={{ key: 'hello', i18n }}></div>
<div use:t={{ key: 'welcome', params: { name: 'User' }, i18n }}></div>
```

#### use:tHtml

HTML 翻译 action（设置 innerHTML）。

```svelte
<div use:tHtml={{ key: 'richContent', i18n }}></div>
```

#### use:tPlural

复数化 action。

```svelte
<div use:tPlural={{ key: 'items', count: 5, i18n }}></div>
```

### 工具函数

#### getI18nContext()

从 Svelte context 中获取 i18n store。

```svelte
<script lang="ts">
  import { getI18nContext } from '@ldesign/i18n-svelte'
  
  const i18n = getI18nContext()
</script>
```

#### setI18nContext(i18n)

设置 i18n store 到 Svelte context。

```typescript
import { setI18nContext } from '@ldesign/i18n-svelte'

setI18nContext(i18n)
```

## 🎯 高级用法

### 动态加载语言包

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { /* 初始消息 */ }
  }
})

// 稍后动态加载
async function loadLanguage(locale: string) {
  const messages = await fetch(`/locales/${locale}.json`).then(r => r.json())
  i18n.mergeLocaleMessage(locale, messages)
  await i18n.setLocale(locale)
}
```

### 使用命名空间

```svelte
<script lang="ts">
  const i18n = createI18n({
    locale: 'zh-CN',
    messages: {
      'zh-CN': {
        common: {
          hello: '你好',
          goodbye: '再见'
        },
        dashboard: {
          title: '仪表板'
        }
      }
    }
  })
</script>

<!-- 使用点号访问嵌套键 -->
<p>{i18n.t('common.hello')}</p>
<p>{i18n.t('dashboard.title')}</p>
```

### 性能优化

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 3600000 // 1 小时
  }
})

// 访问底层实例进行高级配置
i18n.instance.on('localeChanged', ({ locale }) => {
  console.log('Locale changed to:', locale)
})
```

## 📝 示例

查看 `examples/` 目录获取更多示例：

- `basic-usage.svelte` - 基础用法示例
- `advanced.svelte` - 高级特性示例

## 🔗 相关链接

- [@ldesign/i18n-core](../core) - 核心库
- [@ldesign/i18n-vue](../vue) - Vue 集成
- [@ldesign/i18n-react](../react) - React 集成
- [Svelte 官方文档](https://svelte.dev/)

## 📄 许可证

[MIT](../../LICENSE) © 2024 LDesign Team

## 🤝 贡献

欢迎贡献代码！请查看主仓库的贡献指南。

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign">LDesign Team</a></sub>
</div>


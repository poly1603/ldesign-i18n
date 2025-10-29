# @ldesign/i18n-solid

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-solid.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-solid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Solid](https://img.shields.io/badge/Solid-1.x-blue.svg)](https://www.solidjs.com/)

Solid.js integration for @ldesign/i18n - 强大的国际化解决方案，支持 Solid signals、组件和指令。

## ✨ 特性

- ⚡ **细粒度响应式** - 基于 Solid signals 的高性能响应式状态管理
- 🎯 **类型安全** - 完整的 TypeScript 类型支持
- 🧩 **组件化** - 提供开箱即用的 I18nProvider、Trans、LocaleSwitcher 组件
- 🎨 **Directives** - Solid 指令支持（use:t, use:tHtml, use:tPlural）
- 🌐 **完整功能** - 翻译、复数化、日期/数字格式化等
- 💾 **智能缓存** - 继承自 @ldesign/i18n-core 的高性能缓存
- 📦 **轻量级** - 零外部依赖（除了 peer dependencies）

## 📦 安装

```bash
# npm
npm install @ldesign/i18n-solid

# yarn
yarn add @ldesign/i18n-solid

# pnpm
pnpm add @ldesign/i18n-solid
```

## 🚀 快速开始

### 基础用法

```tsx
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18nProvider, useI18n, Trans, LocaleSwitcher } from '@ldesign/i18n-solid'

// 创建 i18n 实例
const i18n = new OptimizedI18n({
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

function App() {
  const { t, locale } = useI18n()
  
  return (
    <div>
      {/* 使用 t 函数翻译 */}
      <h1>{t('hello')}</h1>
      
      {/* 使用 Trans 组件 */}
      <Trans keypath="welcome" params={{ name: 'World' }} />
      
      {/* 当前语言 */}
      <p>Current: {locale()}</p>
      
      {/* 语言切换器 */}
      <LocaleSwitcher />
    </div>
  )
}

function Root() {
  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  )
}
```

### 使用 Directives

```tsx
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18nProvider, useI18n } from '@ldesign/i18n-solid'
import { t, tHtml, tPlural } from '@ldesign/i18n-solid'

const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      title: '标题',
      richContent: '<strong>粗体</strong>文本',
      items: '项 | 项'
    }
  }
})

function App() {
  const { locale } = useI18n()
  let count = 5
  
  return (
    <div>
      {/* 基础翻译 directive */}
      <div use:t={{ key: 'title', i18n }}></div>
      
      {/* HTML 翻译 directive */}
      <div use:tHtml={{ key: 'richContent', i18n }}></div>
      
      {/* 复数化 directive */}
      <div use:tPlural={{ key: 'items', count, i18n }}></div>
    </div>
  )
}

function Root() {
  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  )
}
```

### 响应式语言切换

```tsx
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18nProvider, useI18n } from '@ldesign/i18n-solid'

const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

function App() {
  const { t, locale, setLocale, messages } = useI18n()
  
  // 响应式访问当前语言
  const currentLocale = () => locale()
  
  // 响应式访问消息
  const currentMessages = () => messages()

  return (
    <div>
      <p>当前语言: {currentLocale()}</p>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh-CN')}>中文</button>
    </div>
  )
}

function Root() {
  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  )
}
```

## 📚 API 文档

### useI18n(options?)

主要的 Solid primitive，提供完整的 i18n 功能。

```typescript
function MyComponent() {
  const { t, locale, setLocale } = useI18n()
  
  return <div>{t('hello')}</div>
}
```

**返回值：**

#### 响应式属性

- `locale: Accessor<Locale>` - 当前语言（响应式）
- `messages: Accessor<Record<string, any>>` - 当前消息（响应式）
- `availableLocales: Accessor<Locale[]>` - 可用语言列表

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

### useLocale()

专门用于语言管理的 primitive。

```typescript
function LanguageSwitcher() {
  const { locale, availableLocales, setLocale } = useLocale()
  
  return (
    <select value={locale()} onChange={(e) => setLocale(e.target.value)}>
      {availableLocales().map(loc => (
        <option value={loc}>{loc}</option>
      ))}
    </select>
  )
}
```

### useTranslation(options?)

专门用于翻译功能的 primitive。

```typescript
function MyComponent() {
  const { t, tc } = useTranslation({ namespace: 'common' })
  
  return (
    <div>
      <p>{t('hello')}</p>
      <p>{tc('items', 5)}</p>
    </div>
  )
}
```

### createI18n(config?)

创建一个带响应式 signals 的 i18n 实例。

```typescript
import { createI18n } from '@ldesign/i18n-solid'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

// 访问响应式 locale
console.log(i18n.$locale())
```

### 组件

#### I18nProvider

提供 i18n 实例给子组件。

```tsx
<I18nProvider i18n={i18n}>
  <App />
</I18nProvider>

// 或者使用配置
<I18nProvider config={{ locale: 'zh-CN', messages: {...} }}>
  <App />
</I18nProvider>
```

**Props:**
- `i18n?: I18nInstance` - i18n 实例
- `config?: I18nConfig` - i18n 配置
- `children: JSX.Element` - 子组件

#### Trans

翻译组件。

```tsx
<Trans keypath="welcome" params={{ name: 'User' }} tag="span" />
```

**Props:**
- `keypath: string` - 翻译键
- `params?: InterpolationParams` - 插值参数
- `locale?: string` - 语言覆盖
- `tag?: keyof JSX.IntrinsicElements` - 包裹元素标签（默认: 'span'）

#### LocaleSwitcher

语言切换器组件。

```tsx
<LocaleSwitcher 
  locales={['zh-CN', 'en']} 
  labels={{ 'zh-CN': '中文', 'en': 'English' }}
/>
```

**Props:**
- `locales?: Locale[]` - 自定义语言列表
- `labels?: Record<Locale, string>` - 自定义语言标签

### Directives

#### use:t

基础翻译 directive。

```tsx
<div use:t={{ key: 'hello', i18n }}></div>
<div use:t={{ key: 'welcome', params: { name: 'User' }, i18n }}></div>
```

#### use:tHtml

HTML 翻译 directive（设置 innerHTML）。

```tsx
<div use:tHtml={{ key: 'richContent', i18n }}></div>
```

#### use:tPlural

复数化 directive。

```tsx
<div use:tPlural={{ key: 'items', count: 5, i18n }}></div>
```

## 🎯 高级用法

### 动态加载语言包

```typescript
const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { /* 初始消息 */ }
  }
})

// 稍后动态加载
async function loadLanguage(locale: string) {
  const messages = await fetch(`/locales/${locale}.json`).then(r => r.json())
  
  const { mergeLocaleMessage } = useI18n()
  mergeLocaleMessage(locale, messages)
  await setLocale(locale)
}
```

### 使用命名空间

```tsx
function MyComponent() {
  const { t } = useI18n({ namespace: 'common' })
  
  // 自动添加 'common.' 前缀
  return <p>{t('hello')}</p> // 实际访问 'common.hello'
}
```

### 性能优化

```typescript
const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 3600000 // 1 小时
  }
})

// 监听语言变化
i18n.on('localeChanged', ({ locale }) => {
  console.log('Locale changed to:', locale)
})
```

## 📝 示例

查看 `examples/` 目录获取更多示例：

- `basic-usage.tsx` - 基础用法示例
- `advanced.tsx` - 高级特性示例

## 🔗 相关链接

- [@ldesign/i18n-core](../core) - 核心库
- [@ldesign/i18n-vue](../vue) - Vue 集成
- [@ldesign/i18n-react](../react) - React 集成
- [@ldesign/i18n-svelte](../svelte) - Svelte 集成
- [Solid.js 官方文档](https://www.solidjs.com/)

## 📄 许可证

[MIT](../../LICENSE) © 2024 LDesign Team

## 🤝 贡献

欢迎贡献代码！请查看主仓库的贡献指南。

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign">LDesign Team</a></sub>
</div>


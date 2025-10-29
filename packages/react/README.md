# @ldesign/i18n-react

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-react.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-16.8%2B%20%7C%2017%20%7C%2018-blue.svg)](https://reactjs.org/)

React 深度集成的国际化解决方案 - 提供 Hooks、组件和 HOC 的完整支持。

## 特性

- 🎯 **React 原生支持** - 完整的 Hooks 集成
- ⚡ **高性能** - 使用 useSyncExternalStore 优化性能
- 🧩 **丰富组件** - Provider、Trans、LocaleSwitcher 等
- 🪝 **强大 Hooks** - useI18n、useTranslation、useLocale
- 🔌 **HOC 支持** - 为类组件提供 withI18n
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 💾 **Context API** - 基于 React Context 的状态管理

## 安装

```bash
npm install @ldesign/i18n-react @ldesign/i18n-core react
# 或
pnpm add @ldesign/i18n-react @ldesign/i18n-core react
```

## 快速开始

### 1. 设置 Provider

```tsx
// App.tsx
import { I18nProvider } from '@ldesign/i18n-react'

function App() {
  return (
    <I18nProvider
      config={{
        locale: 'zh-CN',
        fallbackLocale: 'en',
        messages: {
          'zh-CN': { hello: '你好', welcome: '欢迎 {name}！' },
          'en': { hello: 'Hello', welcome: 'Welcome {name}!' }
        }
      }}
    >
      <YourApp />
    </I18nProvider>
  )
}
```

### 2. 在组件中使用

```tsx
import { useI18n, Trans, LocaleSwitcher } from '@ldesign/i18n-react'

function MyComponent() {
  const { t, locale, setLocale } = useI18n()

  return (
    <div>
      {/* 使用 Hook */}
      <h1>{t('hello')}</h1>
      <p>{t('welcome', { name: 'React' })}</p>

      {/* 使用组件 */}
      <Trans i18nKey="welcome" values={{ name: 'World' }} />

      {/* 语言切换器 */}
      <LocaleSwitcher
        locales={['zh-CN', 'en', 'ja']}
        labels={{
          'zh-CN': '中文',
          'en': 'English',
          'ja': '日本語'
        }}
      />

      {/* 手动切换 */}
      <button onClick={() => setLocale('en')}>
        Switch to English
      </button>
    </div>
  )
}
```

## Hooks API

### useI18n

完整功能的主 Hook：

```tsx
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

**使用命名空间：**

```tsx
const { t } = useI18n({ namespace: 'dashboard' })
// t('title') 等同于 t('dashboard.title')
```

### useTranslation

简化版翻译 Hook：

```tsx
function SimpleComponent() {
  const { t } = useTranslation()
  return <h1>{t('hello')}</h1>
}
```

### useLocale

语言管理 Hook：

```tsx
function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLocale()
  
  return (
    <select value={locale} onChange={e => setLocale(e.target.value)}>
      {availableLocales.map(loc => (
        <option key={loc} value={loc}>{loc}</option>
      ))}
    </select>
  )
}
```

## 组件

### I18nProvider

Context Provider 组件：

```tsx
<I18nProvider
  config={{
    locale: 'zh-CN',
    messages: { ... }
  }}
>
  <App />
</I18nProvider>

// 或传入已创建的实例
<I18nProvider i18n={i18nInstance}>
  <App />
</I18nProvider>
```

### Trans

翻译组件，支持插值和组件插值：

```tsx
// 基础用法
<Trans i18nKey="welcome" values={{ name: 'John' }} />

// 组件插值
<Trans 
  i18nKey="message.with.link"
  components={{
    link: <a href="/about">About</a>
  }}
/>
// 翻译文本: "Visit our <link>about page</link>"

// 复数化
<Trans i18nKey="item" count={5} />

// 自定义渲染
<Trans i18nKey="hello">
  {(text) => <strong>{text}</strong>}
</Trans>
```

### LocaleSwitcher

语言切换器组件：

```tsx
// 下拉选择框
<LocaleSwitcher
  locales={['zh-CN', 'en', 'ja']}
  labels={{
    'zh-CN': '中文',
    'en': 'English',
    'ja': '日本語'
  }}
/>

// 按钮组
<LocaleSwitcher
  type="buttons"
  locales={['zh-CN', 'en']}
/>
```

## HOC

### withI18n

为类组件添加 i18n 支持：

```tsx
import { withI18n, WithI18nProps } from '@ldesign/i18n-react'

interface MyComponentProps extends WithI18nProps {
  title: string
}

class MyComponent extends React.Component<MyComponentProps> {
  render() {
    const { i18n, title } = this.props
    return <h1>{i18n.t(title)}</h1>
  }
}

export default withI18n(MyComponent)
```

## 高级用法

### 创建自定义 i18n 实例

```tsx
import { createI18n } from '@ldesign/i18n-react'
import { I18nProvider } from '@ldesign/i18n-react'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: { ... },
  cache: {
    enabled: true,
    maxSize: 1000
  }
})

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <YourApp />
    </I18nProvider>
  )
}
```

### 异步加载语言包

```tsx
import { useEffect } from 'react'
import { useI18n } from '@ldesign/i18n-react'

function App() {
  const { i18n, setLocale } = useI18n()

  useEffect(() => {
    // 动态加载语言包
    async function loadLanguage(locale: string) {
      const messages = await fetch(`/locales/${locale}.json`).then(r => r.json())
      i18n.mergeMessages(locale, messages)
      await setLocale(locale)
    }

    loadLanguage('zh-CN')
  }, [])

  return <YourApp />
}
```

### 性能优化

```tsx
import { memo } from 'react'
import { useTranslation } from '@ldesign/i18n-react'

// 使用 memo 避免不必要的重渲染
const MyComponent = memo(() => {
  const { t } = useTranslation()
  return <div>{t('hello')}</div>
})
```

## TypeScript 支持

完整的类型推导和智能提示：

```typescript
import type {
  UseI18nReturn,
  UseTranslationReturn,
  UseLocaleReturn,
  I18nProviderProps,
  TransProps,
} from '@ldesign/i18n-react'
```

## 与其他库对比

| 特性 | @ldesign/i18n-react | react-i18next | react-intl |
|------|---------------------|---------------|------------|
| TypeScript 支持 | ✅ 完整 | ✅ 良好 | ✅ 良好 |
| Hooks API | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| 性能优化 | ✅ useSyncExternalStore | ⚠️ 基础 | ⚠️ 基础 |
| 组件插值 | ✅ 原生支持 | ✅ 支持 | ✅ 支持 |
| 包体积 | 🎯 优化 | 📦 中等 | 📦 较大 |
| 学习曲线 | ⭐⭐ 简单 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较难 |

## 许可证

[MIT](./LICENSE) © 2024 LDesign Team


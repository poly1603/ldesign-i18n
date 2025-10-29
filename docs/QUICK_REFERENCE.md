# @ldesign/i18n 快速参考

## 📦 安装

```bash
# 核心包
pnpm add @ldesign/i18n-core

# React
pnpm add @ldesign/i18n-react

# Vue
pnpm add @ldesign/i18n-vue

# Next.js
pnpm add @ldesign/i18n-nextjs

# 其他框架...
```

## 🚀 基础用法

### Core (框架无关)

```typescript
import { createI18n } from '@ldesign/i18n-core'

const i18n = createI18n({
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh'],
  messages: {
    en: { hello: 'Hello' },
    zh: { hello: '你好' }
  }
})

// 翻译
i18n.t('hello') // "Hello"

// 切换语言
await i18n.setLocale('zh')
i18n.t('hello') // "你好"
```

### React

```tsx
import { createI18n, I18nProvider, useI18n, Trans } from '@ldesign/i18n-react'

// 创建实例
const i18n = createI18n({ /* config */ })

// Provider
<I18nProvider i18n={i18n}>
  <App />
</I18nProvider>

// Hook
function App() {
  const { t, setLocale } = useI18n()
  return <h1>{t('hello')}</h1>
}

// 组件
<Trans i18nKey="welcome" params={{ name: 'World' }} />
```

### Vue

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale } = useI18n()
</script>

<template>
  <div>
    <!-- 函数 -->
    <h1>{{ t('hello') }}</h1>
    
    <!-- 指令 -->
    <p v-t="'welcome'"></p>
    
    <!-- 组件 -->
    <I18nT keypath="greeting" :params="{ name: 'Vue' }" />
  </div>
</template>
```

### Next.js

```tsx
// app/[locale]/layout.tsx
import { createI18n } from '@ldesign/i18n-nextjs'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }]
}

export default function Layout({ params, children }) {
  const i18n = await createI18n({ locale: params.locale })
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}

// app/[locale]/page.tsx
import { useI18n } from '@ldesign/i18n-nextjs'

export default function Page() {
  const { t } = useI18n()
  return <h1>{t('hello')}</h1>
}
```

## 🎯 常用功能

### 参数插值

```typescript
// 消息
const messages = {
  en: {
    greeting: 'Hello, {{name}}!',
    welcome: 'Welcome {{name}} to {{app}}!'
  }
}

// 使用
t('greeting', { name: 'World' })
// "Hello, World!"

t('welcome', { name: 'John', app: 'MyApp' })
// "Welcome John to MyApp!"
```

### 嵌套键

```typescript
const messages = {
  en: {
    user: {
      profile: {
        name: 'Name',
        email: 'Email'
      }
    }
  }
}

t('user.profile.name') // "Name"
```

### 复数形式

```typescript
const messages = {
  en: {
    items: 'You have {{count}} item | You have {{count}} items'
  }
}

t('items', { count: 1 }) // "You have 1 item"
t('items', { count: 5 }) // "You have 5 items"
```

### 回退语言

```typescript
const i18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: { hello: 'Hello', goodbye: 'Goodbye' },
    zh: { hello: '你好' } // 缺少 goodbye
  }
})

i18n.t('hello') // "你好"
i18n.t('goodbye') // "Goodbye" (使用回退语言)
```

### 懒加载

```typescript
const i18n = createI18n({
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh', 'ja'],
  messages: {
    en: { hello: 'Hello' }
  },
  async loadLocale(locale) {
    // 动态导入
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  }
})

// 切换时自动加载
await i18n.setLocale('zh')
```

## 🎨 格式化器

### 日期格式化

```typescript
const messages = {
  en: {
    date: 'Today is {{date}}'
  }
}

// 使用格式化器
t('date', {
  date: new Date(),
  formatters: {
    date: (value) => value.toLocaleDateString()
  }
})
```

### 数字格式化

```typescript
t('price', {
  amount: 1234.56,
  formatters: {
    amount: (value) => `$${value.toFixed(2)}`
  }
})
```

## 🔧 配置选项

```typescript
interface I18nConfig {
  // 必需
  defaultLocale: string
  supportedLocales: string[]
  messages: Record<string, Record<string, string>>
  
  // 可选
  fallbackLocale?: string
  cache?: boolean
  cacheSize?: number
  debug?: boolean
  
  // 懒加载
  loadLocale?: (locale: string) => Promise<Record<string, string>>
  
  // 格式化器
  formatters?: Record<string, (value: any) => string>
  
  // 复数规则
  pluralRules?: (count: number, locale: string) => number
}
```

## 📱 框架特定

### React Hooks

```typescript
const { 
  t,              // 翻译函数
  locale,         // 当前语言
  setLocale,      // 切换语言
  i18n            // i18n 实例
} = useI18n()
```

### Vue Composables

```typescript
const {
  t,              // 翻译函数
  locale,         // 响应式语言
  setLocale,      // 切换语言
  i18n            // i18n 实例
} = useI18n()
```

### Angular Service

```typescript
@Component({...})
export class MyComponent {
  constructor(private i18n: I18nService) {}
  
  translate(key: string) {
    return this.i18n.t(key)
  }
}
```

### Svelte Stores

```svelte
<script>
  import { createI18nStore } from '@ldesign/i18n-svelte'
  
  const i18n = createI18nStore({ /* config */ })
  
  $: text = $i18n.t('hello')
</script>
```

## 🎯 最佳实践

### 1. 组织语言文件

```
locales/
├── en/
│   ├── common.ts
│   ├── home.ts
│   └── user.ts
├── zh/
│   ├── common.ts
│   ├── home.ts
│   └── user.ts
└── index.ts
```

### 2. 类型安全

```typescript
// types.ts
export interface Messages {
  common: {
    hello: string
    goodbye: string
  }
  user: {
    profile: {
      name: string
    }
  }
}

// i18n.ts
const i18n = createI18n<Messages>({ /* config */ })

// 类型安全的键名
i18n.t('common.hello') // ✅
i18n.t('invalid.key')  // ❌ TypeScript 错误
```

### 3. 命名空间

```typescript
const messages = {
  en: {
    'common.button.save': 'Save',
    'common.button.cancel': 'Cancel',
    'user.form.name': 'Name',
    'user.form.email': 'Email'
  }
}

// 使用前缀简化
const commonT = (key: string) => t(`common.${key}`)
commonT('button.save') // "Save"
```

### 4. 环境配置

```typescript
const i18n = createI18n({
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  debug: import.meta.env.DEV,
  cache: import.meta.env.PROD
})
```

## 🐛 常见问题

### 翻译不工作

```typescript
// ❌ 错误：未等待初始化
const i18n = createI18n({...})
i18n.t('hello') // 可能失败

// ✅ 正确：等待初始化（如果需要）
const i18n = createI18n({...})
// 对于同步消息，可以直接使用
i18n.t('hello')
```

### 语言未切换

```typescript
// ❌ 错误：未等待异步切换
i18n.setLocale('zh')
i18n.t('hello') // 可能还是旧语言

// ✅ 正确：等待切换完成
await i18n.setLocale('zh')
i18n.t('hello') // 新语言
```

### 键名未找到

```typescript
// 使用默认值
t('missing.key', {}, 'Default Text')

// 或使用回退语言
const i18n = createI18n({
  fallbackLocale: 'en'
})
```

## 📚 更多资源

- [完整 API 文档](./API_REFERENCE.md)
- [最佳实践](./BEST_PRACTICES.md)
- [示例项目](../examples/)
- [迁移指南](./MIGRATION_GUIDE.md)
- [FAQ](./FAQ.md)

## 🎉 快速参考卡片

```
┌─────────────────────────────────────┐
│ 基础翻译                             │
├─────────────────────────────────────┤
│ t('key')                            │
│ t('key', { param: 'value' })        │
│ t('nested.key')                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 语言管理                             │
├─────────────────────────────────────┤
│ await setLocale('zh')               │
│ const current = locale              │
│ const list = supportedLocales       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ React                               │
├─────────────────────────────────────┤
│ useI18n()                           │
│ <Trans i18nKey="key" />             │
│ <I18nProvider i18n={i18n} />        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Vue                                 │
├─────────────────────────────────────┤
│ useI18n()                           │
│ v-t="'key'"                         │
│ <I18nT keypath="key" />             │
└─────────────────────────────────────┘
```

---

**提示**: 这是一个快速参考指南。完整文档请查看对应章节。

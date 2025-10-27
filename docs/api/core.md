# 核心 API

## createI18n

创建 i18n 实例。

### 类型签名

```typescript
function createI18n<T = any>(options: I18nOptions<T>): I18n<T>
```

### 参数

#### options

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `locale` | `string` | 必填 | 当前语言 |
| `fallbackLocale` | `string \| string[]` | `'en-US'` | 回退语言 |
| `messages` | `Record<string, T>` | `{}` | 翻译消息 |
| `cache` | `CacheOptions` | - | 缓存配置 |
| `performance` | `PerformanceOptions` | - | 性能配置 |
| `plugins` | `I18nPlugin[]` | `[]` | 插件列表 |
| `lazyLoad` | `boolean` | `false` | 是否启用懒加载 |
| `missingWarn` | `boolean` | `true` | 缺失翻译时警告 |
| `fallbackWarn` | `boolean` | `true` | 使用回退时警告 |
| `missing` | `MissingHandler` | - | 缺失翻译处理器 |
| `dateTimeFormats` | `DateTimeFormats` | `{}` | 日期时间格式 |
| `numberFormats` | `NumberFormats` | `{}` | 数字格式 |
| `ssr` | `boolean` | `false` | SSR 模式 |

### 返回值

返回一个 `I18n` 实例，包含以下方法和属性。

### 示例

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好'
    },
    'en-US': {
      hello: 'Hello'
    }
  },
  cache: {
    enabled: true,
    strategy: 'adaptive'
  }
})
```

## I18n 实例

### 属性

#### locale

- **类型**: `string`
- **说明**: 当前语言

```typescript
console.log(i18n.locale) // 'zh-CN'
```

#### availableLocales

- **类型**: `string[]`
- **说明**: 可用的语言列表

```typescript
console.log(i18n.availableLocales) // ['zh-CN', 'en-US']
```

#### messages

- **类型**: `Record<string, any>`
- **说明**: 所有翻译消息

```typescript
console.log(i18n.messages)
// { 'zh-CN': { ... }, 'en-US': { ... } }
```

### 方法

#### t(key, params?)

翻译指定的键。

**类型签名**:
```typescript
t(key: string, params?: TranslateParams): string
```

**参数**:
- `key`: 翻译键
- `params`: 插值参数或复数数量

**返回值**: 翻译后的字符串

**示例**:
```typescript
// 简单翻译
i18n.t('hello') // '你好'

// 带参数
i18n.t('welcome', { name: 'Vue' }) // '欢迎，Vue'

// 复数
i18n.t('appleCount', 5) // '5 个苹果'

// 嵌套键
i18n.t('user.profile.title') // '用户资料'
```

#### setLocale(locale)

切换语言。

**类型签名**:
```typescript
setLocale(locale: string): void
```

**参数**:
- `locale`: 目标语言

**示例**:
```typescript
i18n.setLocale('en-US')
console.log(i18n.locale) // 'en-US'
```

#### setLocaleMessage(locale, messages)

设置指定语言的翻译消息。

**类型签名**:
```typescript
setLocaleMessage(locale: string, messages: Record<string, any>): void
```

**参数**:
- `locale`: 语言标识
- `messages`: 翻译消息对象

**示例**:
```typescript
i18n.setLocaleMessage('ja-JP', {
  hello: 'こんにちは'
})
```

#### mergeLocaleMessage(locale, messages)

合并翻译消息（不会覆盖现有的）。

**类型签名**:
```typescript
mergeLocaleMessage(locale: string, messages: Record<string, any>): void
```

**示例**:
```typescript
i18n.mergeLocaleMessage('zh-CN', {
  newKey: '新翻译'
})
```

#### getLocaleMessage(locale)

获取指定语言的翻译消息。

**类型签名**:
```typescript
getLocaleMessage(locale: string): Record<string, any>
```

**示例**:
```typescript
const messages = i18n.getLocaleMessage('zh-CN')
console.log(messages)
```

#### hasKey(key, locale?)

检查翻译键是否存在。

**类型签名**:
```typescript
hasKey(key: string, locale?: string): boolean
```

**示例**:
```typescript
if (i18n.hasKey('hello')) {
  console.log(i18n.t('hello'))
}
```

#### on(event, handler)

监听事件。

**类型签名**:
```typescript
on(event: I18nEvent, handler: EventHandler): () => void
```

**事件类型**:
- `'locale-changed'`: 语言切换
- `'message-updated'`: 翻译消息更新
- `'missing-key'`: 翻译键缺失

**返回值**: 取消监听函数

**示例**:
```typescript
const unsubscribe = i18n.on('locale-changed', (newLocale, oldLocale) => {
  console.log(`语言从 ${oldLocale} 切换到 ${newLocale}`)
})

// 取消监听
unsubscribe()
```

#### off(event, handler)

取消事件监听。

**类型签名**:
```typescript
off(event: I18nEvent, handler?: EventHandler): void
```

**示例**:
```typescript
const handler = (locale) => console.log(locale)

i18n.on('locale-changed', handler)
i18n.off('locale-changed', handler)
```

#### clearCache()

清除所有缓存。

**类型签名**:
```typescript
clearCache(): void
```

**示例**:
```typescript
i18n.clearCache()
```

#### getPerformanceReport()

获取性能报告。

**类型签名**:
```typescript
getPerformanceReport(): PerformanceReport
```

**返回值**:
```typescript
interface PerformanceReport {
  totalTranslations: number
  cacheHits: number
  cacheMisses: number
  averageTime: number
  slowestTranslations: Array<{
    key: string
    time: number
  }>
}
```

**示例**:
```typescript
const report = i18n.getPerformanceReport()
console.log(`缓存命中率: ${report.cacheHits / report.totalTranslations * 100}%`)
```

#### dispose()

销毁 i18n 实例，清理资源。

**类型签名**:
```typescript
dispose(): void
```

**示例**:
```typescript
// 组件卸载时
onUnmounted(() => {
  i18n.dispose()
})
```

## 类型定义

### I18nOptions

```typescript
interface I18nOptions<T = any> {
  locale: string
  fallbackLocale?: string | string[]
  messages: Record<string, T>
  cache?: CacheOptions
  performance?: PerformanceOptions
  plugins?: I18nPlugin[]
  lazyLoad?: boolean
  missingWarn?: boolean
  fallbackWarn?: boolean
  missing?: MissingHandler
  dateTimeFormats?: DateTimeFormats
  numberFormats?: NumberFormats
  ssr?: boolean
}
```

### CacheOptions

```typescript
interface CacheOptions {
  enabled: boolean
  strategy?: 'lru' | 'lfu' | 'ttl' | 'adaptive'
  maxSize?: number
  ttl?: number
}
```

### PerformanceOptions

```typescript
interface PerformanceOptions {
  enabled: boolean
  threshold?: number
  sampleRate?: number
}
```

### TranslateParams

```typescript
type TranslateParams = 
  | Record<string, any>  // 插值参数
  | number              // 复数数量
  | undefined
```

### MissingHandler

```typescript
type MissingHandler = (
  locale: string,
  key: string,
  instance: I18n
) => string | void
```

### I18nPlugin

```typescript
interface I18nPlugin {
  name: string
  install: (i18n: I18n) => void
  uninstall?: (i18n: I18n) => void
}
```

## 高级用法

### 自定义缺失处理

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  missing: (locale, key, instance) => {
    // 记录到日志服务
    console.warn(`Missing translation: ${key} in ${locale}`)
    
    // 返回默认值
    return key
    
    // 或者从备用来源获取
    return fetchTranslationFromAPI(locale, key)
  }
})
```

### 插件开发

```typescript
const myPlugin: I18nPlugin = {
  name: 'my-plugin',
  install: (i18n) => {
    // 监听事件
    i18n.on('locale-changed', (newLocale) => {
      console.log(`Locale changed to ${newLocale}`)
    })
    
    // 扩展功能
    i18n.customMethod = () => {
      // 自定义逻辑
    }
  },
  uninstall: (i18n) => {
    // 清理资源
  }
}

const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  plugins: [myPlugin]
})
```

### 日期和数字格式化

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  dateTimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  },
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY'
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 2
      }
    }
  }
})

// 使用
i18n.d(new Date(), 'short') // 2025年10月27日
i18n.n(1234.56, 'currency') // ¥1,234.56
```

## 参考

- [I18nEngine API](/api/i18n-engine) - 引擎 API
- [插件 API](/api/plugins) - 插件开发
- [类型定义](/api/types) - 完整类型定义


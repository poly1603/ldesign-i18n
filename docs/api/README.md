# @ldesign/i18n API 参考

## 核心类

### I18n (OptimizedI18n)

高性能国际化核心类。

```typescript
import { I18n } from '@ldesign/i18n-core'
```

#### 构造函数

```typescript
new I18n(config?: I18nConfig)
```

**参数**:
- `config.locale` - 当前语言，默认自动检测或 `'en'`
- `config.fallbackLocale` - 降级语言，默认 `'en'`
- `config.messages` - 初始翻译消息 `Record<Locale, Messages>`
- `config.cache` - 缓存配置 `boolean | CacheConfig`
- `config.loader` - 消息加载器 `MessageLoader`
- `config.keySeparator` - 键分隔符，默认 `'.'`
- `config.namespaceSeparator` - 命名空间分隔符，默认 `':'`
- `config.debug` - 开启调试模式
- `config.warnOnMissing` - 缺失键时警告
- `config.persistence` - 语言持久化配置

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `version` | `string` | 版本号 |
| `config` | `Readonly<I18nConfig>` | 只读配置对象 |
| `locale` | `Locale` | 当前语言（可读写） |
| `fallbackLocale` | `Locale \| Locale[]` | 降级语言（可读写） |

#### 核心方法

##### `init(): Promise<void>`
初始化 I18n 实例，加载初始语言包。

```typescript
await i18n.init()
```

##### `t(key, options?): string`
翻译函数（已优化）。

```typescript
// 基本用法
i18n.t('hello')

// 带参数
i18n.t('welcome', { name: '张三' })

// 带默认值
i18n.t('missing.key', { defaultValue: '默认文本' })

// 指定语言
i18n.t('hello', { locale: 'en' })
```

##### `translate(key, options?): string`
完整翻译方法，等同于 `t()`。

##### `exists(key, options?): boolean`
检查翻译键是否存在。

```typescript
if (i18n.exists('user.profile')) {
  // 键存在
}
```

#### 语言管理

##### `setLocale(locale): Promise<void>`
切换语言，如需要会自动加载语言包。

```typescript
await i18n.setLocale('en')
```

##### `getLocale(): Locale`
获取当前语言。

##### `addLocale(locale, messages): void`
添加新语言。

```typescript
i18n.addLocale('ja', { hello: 'こんにちは' })
```

##### `removeLocale(locale): void`
移除语言。

##### `hasLocale(locale): boolean`
检查语言是否存在。

##### `getAvailableLocales(): Locale[]`
获取所有可用语言列表。

#### 消息管理

##### `addMessages(locale, messages, namespace?): void`
添加翻译消息（合并）。

##### `setMessages(locale, messages, namespace?): void`
设置翻译消息（覆盖）。

##### `getMessages(locale?, namespace?): Messages | null`
获取翻译消息。

##### `mergeMessages(locale, messages, namespace?): void`
深度合并翻译消息。

#### 格式化

##### `format(value, format, locale?, options?): string`
通用格式化方法。

##### `number(value, options?): string`
数字格式化。

```typescript
i18n.number(1234.56)  // "1,234.56"
i18n.number(1234.56, { style: 'percent' })  // "123,456%"
```

##### `currency(value, currency, options?): string`
货币格式化。

```typescript
i18n.currency(99.99, 'USD')  // "$99.99"
i18n.currency(99.99, 'CNY')  // "¥99.99"
```

##### `date(value, options?): string`
日期格式化。

```typescript
i18n.date(new Date())  // "2024/1/15"
i18n.date(new Date(), { dateStyle: 'full' })
```

##### `relativeTime(value, options?): string`
相对时间格式化。

```typescript
i18n.relativeTime(new Date(Date.now() - 60000))  // "1 分钟前"
```

#### 复数化

##### `plural(key, count, options?): string`
复数化翻译。

```typescript
// messages: { items: '{count} 项 | {count} 项' }
i18n.plural('items', 1)  // "1 项"
i18n.plural('items', 5)  // "5 项"
```

#### 事件

##### `on(event, listener): () => void`
监听事件，返回取消函数。

```typescript
const unsubscribe = i18n.on('localeChanged', ({ locale }) => {
  console.log('语言已切换到:', locale)
})
```

##### `off(event, listener): void`
取消监听。

##### `once(event, listener): void`
监听一次。

##### `emit(event, data?): void`
触发事件。

**事件类型**:
- `initialized` - 初始化完成
- `localeChanged` - 语言切换
- `loaded` - 语言包加载完成
- `loadError` - 加载错误
- `missingKey` - 缺失翻译键
- `fallback` - 使用降级翻译

#### 插件

##### `use(plugin): Promise<void>`
安装插件。

```typescript
await i18n.use({
  name: 'my-plugin',
  install(i18n) {
    // 插件逻辑
  }
})
```

##### `unuse(plugin): Promise<void>`
卸载插件。

#### 生命周期

##### `ready(): Promise<void>`
等待初始化完成。

##### `destroy(): void`
销毁实例，清理资源。

##### `clone(config?): I18nInstance`
克隆实例。

---

## 缓存系统

### LRUCache

高性能 LRU 缓存实现。

```typescript
import { LRUCache } from '@ldesign/i18n-core'

const cache = new LRUCache<string, string>(100)
cache.set('key', 'value')
cache.get('key')  // 'value'
```

### AdaptiveCache

自适应缓存，根据使用模式自动调整策略。

```typescript
import { AdaptiveCache } from '@ldesign/i18n-core'

const cache = new AdaptiveCache({
  maxSize: 1000,
  adaptiveThreshold: 0.8
})
```

### OptimizedLRUCache

针对翻译场景优化的 LRU 缓存。

---

## 批量操作

### I18nBatchOperations

批量操作工具类。

```typescript
import { I18nBatchOperations } from '@ldesign/i18n-core'

const batch = new I18nBatchOperations(i18n)
```

#### 方法

##### `batchLoad(locales, options?): Promise<BatchResult>`
批量加载语言包。

```typescript
const result = await batch.batchLoad(['zh-CN', 'en', 'ja'], {
  concurrency: 2,
  onProgress: (loaded, total) => console.log(`${loaded}/${total}`)
})
```

##### `batchSetMessages(items): void`
批量设置消息。

##### `batchDelete(locales): void`
批量删除语言。

---

## 错误处理

### I18nError

基础错误类。

```typescript
import { I18nError, LoadError, TranslationError } from '@ldesign/i18n-core'

try {
  // ...
} catch (e) {
  if (e instanceof LoadError) {
    console.error('加载错误:', e.locale)
  }
}
```

### 错误类型

- `I18nError` - 基础错误
- `LoadError` - 加载错误
- `TranslationError` - 翻译错误
- `ConfigError` - 配置错误
- `ValidationError` - 验证错误
- `TimeoutError` - 超时错误

### ErrorRecovery

错误恢复工具。

```typescript
import { ErrorRecovery } from '@ldesign/i18n-core'

const recovery = new ErrorRecovery(i18n, {
  maxRetries: 3,
  retryDelay: 1000
})

const messages = await recovery.loadWithRecovery('zh-CN')
```

### RetryHandler

重试处理器。

```typescript
import { RetryHandler } from '@ldesign/i18n-core'

const handler = new RetryHandler({
  maxRetries: 3,
  backoffMultiplier: 2
})

const result = await handler.execute(() => fetch('/api/locale'))
```

---

## 键查找与验证

### KeyFinder

翻译键查找工具。

```typescript
import { KeyFinder } from '@ldesign/i18n-core'

const finder = new KeyFinder(i18n)
```

#### 方法

##### `fuzzySearch(query, options?): SearchResult[]`
模糊搜索。

```typescript
finder.fuzzySearch('helo')  // 找到 'hello'
finder.fuzzySearch('usr', { maxDistance: 2, limit: 10 })
```

##### `wildcardQuery(pattern): string[]`
通配符查询。

```typescript
finder.wildcardQuery('user.*')  // 所有 user 下的键
finder.wildcardQuery('*.title')  // 所有 title 键
```

##### `getAllKeys(locale?): string[]`
获取所有键。

### KeyValidator

键名验证器。

```typescript
import { KeyValidator } from '@ldesign/i18n-core'

const validator = new KeyValidator({
  allowedPatterns: [/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/],
  maxLength: 100,
  minLength: 1
})
```

#### 方法

##### `validate(key): ValidationResult`
验证键名。

```typescript
const result = validator.validate('User.Profile')
// { valid: false, errors: ['应使用小写开头'], suggestions: ['user.profile'] }
```

---

## 调试工具

### PerformanceMonitor

性能监控器。

```typescript
import { PerformanceMonitor } from '@ldesign/i18n-core'

const monitor = new PerformanceMonitor()
monitor.startTracking()

// 获取报告
const report = monitor.getReport()
```

### 懒加载调试工具

```typescript
import { DebugTools } from '@ldesign/i18n-core'

// 加载性能分析器
const { I18nProfiler } = await DebugTools.loadProfiler()

// 加载翻译检查器
const { TranslationInspector } = await DebugTools.loadInspector()
```

---

## Vue 3 集成

### createI18nPlugin

创建 Vue 插件。

```typescript
import { createI18nPlugin } from '@ldesign/i18n/vue'

app.use(createI18nPlugin({
  locale: 'zh-CN',
  messages: { 'zh-CN': { hello: '你好' } }
}))
```

### useI18n

组合式 API。

```typescript
import { useI18n } from '@ldesign/i18n/vue'

const { t, locale, setLocale } = useI18n()
```

**返回值**:
- `t` - 翻译函数
- `locale` - 响应式当前语言
- `setLocale` - 切换语言
- `availableLocales` - 可用语言列表
- `messages` - 当前语言消息

### 组件

#### I18nT

翻译组件。

```vue
<I18nT keypath="welcome" :params="{ name: 'Vue' }" />
<I18nT keypath="rich.content" html />
```

#### I18nProvider

提供 i18n 上下文。

```vue
<I18nProvider :i18n="i18n">
  <App />
</I18nProvider>
```

### 指令

#### v-t

翻译指令。

```vue
<span v-t="'hello'"></span>
<span v-t="{ key: 'welcome', params: { name: 'Vue' } }"></span>
```

#### v-t-html

HTML 翻译指令。

```vue
<div v-t-html="'rich.content'"></div>
```

#### v-t-plural

复数化指令。

```vue
<span v-t-plural="{ key: 'items', count: 5 }"></span>
```

---

## 类型定义

### 基础类型

```typescript
type Locale = string
type MessageKey = string
type MessageValue = string | Record<string, unknown>
type Messages = { [key: string]: MessageValue | Messages }
```

### 配置类型

```typescript
interface I18nConfig {
  locale?: Locale
  fallbackLocale?: Locale | Locale[]
  messages?: Record<Locale, Messages>
  namespaces?: string[]
  defaultNamespace?: string
  keySeparator?: string
  namespaceSeparator?: string
  cache?: boolean | CacheConfig
  loader?: MessageLoader
  debug?: boolean
  warnOnMissing?: boolean
}

interface CacheConfig {
  enabled?: boolean
  ttl?: number
  maxSize?: number
  strategy?: 'lru' | 'lfu' | 'fifo'
}
```

### 接口类型

```typescript
interface MessageLoader {
  load: (locale: Locale, namespace?: string) => Promise<Messages>
  loadSync: (locale: Locale, namespace?: string) => Messages | null
  isLoaded: (locale: Locale, namespace?: string) => boolean
}

interface I18nPlugin {
  name: string
  version?: string
  install: (i18n: I18nInstance) => void | Promise<void>
  uninstall?: (i18n: I18nInstance) => void | Promise<void>
}
```

### 类型安全工具

```typescript
import { TranslationKey, createTypeSafeWrapper } from '@ldesign/i18n-core'

interface MyMessages {
  common: { hello: string }
  user: { profile: { name: string } }
}

// 获取所有可能的键
type Keys = TranslationKey<MyMessages>
// "common" | "common.hello" | "user" | "user.profile" | "user.profile.name"

// 创建类型安全包装器
const typedI18n = createTypeSafeWrapper<MyMessages>(i18n)
```

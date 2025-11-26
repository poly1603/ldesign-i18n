# @ldesign/i18n-vue

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-vue.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

Vue 3 深度集成的国际化解决方案 - 提供组合式 API、组件和指令的完整支持。

## ✨ 特性

### 核心特性
- 🎯 **Vue 3 原生支持** - 完整的组合式 API 集成
- ⚡ **响应式** - 自动响应语言切换，无需手动刷新
- 🧩 **丰富组件** - Provider、Text、Translate、LanguageSwitcher 等内置组件
- 🎨 **自定义指令** - v-t、v-t-html、v-t-plural 等指令
- 🔌 **插件系统** - 一键安装，全局可用
- 🔒 **类型安全** - 完整的 TypeScript 支持和智能提示
- 💾 **本地作用域** - 支持组件级别的翻译作用域
- 📦 **零依赖** - 仅依赖 @ldesign/i18n-core 和 Vue 3

### 开发体验
- 🚀 **开箱即用** - 一键安装配置
- 🎨 **灵活定制** - 支持自定义组件和指令
- 🔍 **调试友好** - 清晰的错误提示和警告
- 📝 **完整文档** - 详细的 API 文档和示例

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

## 🎯 实战示例

### 完整的应用配置

```typescript
// i18n.ts - 创建 i18n 实例
import { createI18n } from '@ldesign/i18n-core'
import { LazyLoader } from '@ldesign/i18n-core'

// 配置懒加载器
const loader = new LazyLoader({
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  preload: ['zh-CN', 'en']
})

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  loader,
  cache: {
    enabled: true,
    maxSize: 1000
  },
  messages: {
    'zh-CN': {
      common: {
        hello: '你好',
        welcome: '欢迎回来'
      }
    },
    'en': {
      common: {
        hello: 'Hello',
        welcome: 'Welcome back'
      }
    }
  }
})

// main.ts - 安装插件
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n-vue'
import { i18n } from './i18n'
import App from './App.vue'

const app = createApp(App)

// 安装 i18n 插件
app.use(createI18nPlugin(i18n, {
  globalProperties: true,  // 注入 $t, $i18n 到全局
  directives: true,        // 注册指令
  components: true         // 注册组件
}))

app.mount('#app')
```

### 页面级翻译

```vue
<!-- views/Home.vue -->
<template>
  <div class="home">
    <h1>{{ t('home.title') }}</h1>
    <p>{{ t('home.description', { name: userName }) }}</p>
    
    <!-- 使用组件 -->
    <I18nT keypath="home.greeting" :params="{ time: currentTime }">
      <template #time>
        <strong>{{ currentTime }}</strong>
      </template>
    </I18nT>
    
    <!-- 条件渲染 -->
    <p v-if="te('home.optional')">{{ t('home.optional') }}</p>
    
    <!-- 复数化 -->
    <p>{{ tc('home.items', itemCount, { count: itemCount }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'

const { t, te, tc } = useI18n()

const userName = ref('张三')
const itemCount = ref(5)
const currentTime = computed(() => new Date().toLocaleTimeString())
</script>
```

### 组件级作用域

```vue
<!-- components/UserCard.vue -->
<template>
  <div class="user-card">
    <h3>{{ t('title') }}</h3>
    <p>{{ t('description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n-vue'

// 组件级翻译作用域
const { t } = useI18n({
  useScope: 'local',
  messages: {
    'zh-CN': {
      title: '用户卡片',
      description: '这是本地翻译'
    },
    'en': {
      title: 'User Card',
      description: 'This is local translation'
    }
  }
})
</script>
```

### 命名空间管理

```vue
<!-- views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h1>{{ t('title') }}</h1>
    <p>{{ t('stats.users') }}</p>
    <p>{{ t('stats.orders') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n-vue'

// 使用命名空间，自动添加前缀
const { t } = useI18n({
  namespace: 'dashboard'
})

// t('title') 实际访问 'dashboard.title'
// t('stats.users') 实际访问 'dashboard.stats.users'
</script>
```

### 语言切换器

```vue
<!-- components/LanguageSwitcher.vue -->
<template>
  <div class="language-switcher">
    <!-- 使用内置组件 -->
    <LanguageSwitcher
      :locales="availableLocales"
      :labels="localeLabels"
      @change="handleLocaleChange"
    />
    
    <!-- 或自定义实现 -->
    <select v-model="currentLocale">
      <option
        v-for="locale in availableLocales"
        :key="locale"
        :value="locale"
      >
        {{ localeLabels[locale] }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, LanguageSwitcher } from '@ldesign/i18n-vue'

const { locale, setLocale, availableLocales } = useI18n()

const currentLocale = computed({
  get: () => locale.value,
  set: (val) => setLocale(val)
})

const localeLabels = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어'
}

const handleLocaleChange = (newLocale: string) => {
  console.log('语言已切换:', newLocale)
  // 可以在这里保存到 localStorage
  localStorage.setItem('locale', newLocale)
}
</script>
```

### 异步加载翻译

```vue
<!-- views/LazyPage.vue -->
<template>
  <div v-if="loading" class="loading">
    加载中...
  </div>
  <div v-else-if="error" class="error">
    加载失败: {{ error.message }}
  </div>
  <div v-else class="content">
    <h1>{{ t('title') }}</h1>
    <p>{{ t('content') }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18nAsync } from '@ldesign/i18n-vue'

const { t, loading, error, loadNamespace } = useI18nAsync()

onMounted(async () => {
  // 异步加载命名空间
  await loadNamespace('lazyPage')
})
</script>
```

### 与 Core 包高级功能集成

```vue
<!-- components/AdvancedFeatures.vue -->
<template>
  <div class="advanced">
    <!-- 使用批量操作 -->
    <button @click="batchLoad">批量加载语言</button>
    
    <!-- 使用键查找 -->
    <input
      v-model="searchQuery"
      @input="searchKeys"
      placeholder="搜索翻译键"
    />
    <ul>
      <li v-for="key in searchResults" :key="key">
        {{ key }}: {{ t(key) }}
      </li>
    </ul>
    
    <!-- 使用错误恢复 -->
    <p>{{ translatedWithFallback }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'
import {
  I18nBatchOperations,
  KeyFinder,
  ErrorRecovery
} from '@ldesign/i18n-core'

const { t, i18n } = useI18n()

// 批量操作
const batchOps = new I18nBatchOperations(i18n, {
  concurrency: 3,
  continueOnError: true
})

const batchLoad = async () => {
  await batchOps.preloadLocales(['zh-CN', 'en', 'ja'])
  console.log('批量加载完成')
}

// 键查找
const keyFinder = new KeyFinder(i18n)
const searchQuery = ref('')
const searchResults = ref<string[]>([])

const searchKeys = () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  searchResults.value = keyFinder.fuzzySearch(searchQuery.value, {
    threshold: 2,
    maxResults: 10
  })
}

// 错误恢复
const errorRecovery = new ErrorRecovery(i18n, {
  enableCache: true,
  defaultMessage: '翻译缺失'
})

const translatedWithFallback = computed(() => {
  try {
    return t('possibly.missing.key')
  } catch (error) {
    return errorRecovery.recover('possibly.missing.key', error as Error)
  }
})
</script>
```

## 🎨 最佳实践

### 1. 组织翻译文件

```
locales/
├── zh-CN/
│   ├── common.json      # 通用翻译
│   ├── home.json        # 首页翻译
│   ├── user.json        # 用户相关
│   └── errors.json      # 错误消息
├── en/
│   ├── common.json
│   ├── home.json
│   ├── user.json
│   └── errors.json
└── ja/
    └── ...
```

### 2. 键命名规范

```typescript
// ✅ 推荐：使用层级结构和描述性名称
{
  "user": {
    "profile": {
      "name": "姓名",
      "email": "邮箱",
      "settings": "设置"
    },
    "actions": {
      "save": "保存",
      "cancel": "取消"
    }
  }
}

// ❌ 不推荐：扁平结构和简短名称
{
  "n": "姓名",
  "e": "邮箱",
  "s": "保存"
}
```

### 3. 性能优化

```typescript
// 1. 预加载常用语言
const i18n = createI18n({
  locale: 'zh-CN',
  preload: ['zh-CN', 'en'],  // 预加载
  // ...
})

// 2. 启用缓存
const i18n = createI18n({
  cache: {
    enabled: true,
    maxSize: 1000,
    enableTTL: true
  }
})

// 3. 使用命名空间减小包体积
const { t } = useI18n({
  namespace: 'specificFeature'
})
```

### 4. TypeScript 类型安全

```typescript
// 定义翻译键类型
type TranslationKeys =
  | 'common.hello'
  | 'common.welcome'
  | 'user.profile.name'
  | 'user.profile.email'

// 在组件中使用
const { t } = useI18n<TranslationKeys>()

// 类型安全的翻译调用
const greeting = t('common.hello')  // ✅ 正确
// const error = t('invalid.key')   // ❌ 类型错误
```

### 5. 错误处理

```typescript
import { LoadError, TranslationError } from '@ldesign/i18n-core'

try {
  await i18n.setLocale('new-locale')
} catch (error) {
  if (error instanceof LoadError) {
    console.error('加载失败:', error.message)
    // 使用降级策略
  } else if (error instanceof TranslationError) {
    console.error('翻译失败:', error.message)
    // 显示默认值
  }
}
```

## 📋 常见问题

### Q: 如何在 Options API 中使用？

```vue
<script>
import { useI18n } from '@ldesign/i18n-vue'

export default {
  setup() {
    const { t, locale } = useI18n()
    return { t, locale }
  },
  // 或使用全局属性
  mounted() {
    console.log(this.$t('hello'))
    console.log(this.$i18n.locale)
  }
}
</script>
```

### Q: 如何实现语言持久化？

```typescript
// 保存语言到 localStorage
watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})

// 应用启动时恢复
const savedLocale = localStorage.getItem('locale')
if (savedLocale) {
  i18n.setLocale(savedLocale)
}
```

### Q: 如何处理 RTL 语言？

```typescript
import { computed } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'

const { locale } = useI18n()

const isRTL = computed(() => {
  return ['ar', 'he', 'fa', 'ur'].includes(locale.value)
})

const direction = computed(() => isRTL.value ? 'rtl' : 'ltr')

// 在模板中使用
<div :dir="direction">
  {{ t('content') }}
</div>
```

## TypeScript 支持

完整的类型推导和智能提示：

```typescript
import type {
  UseI18nReturn,
  I18nPluginOptions,
  UseI18nOptions,
  I18nInstance
} from '@ldesign/i18n-vue'

// 插件选项类型
const pluginOptions: I18nPluginOptions = {
  globalProperties: true,
  directives: true,
  components: true
}

// Composable 选项类型
const i18nOptions: UseI18nOptions = {
  useScope: 'local',
  namespace: 'myComponent',
  inheritLocale: true
}

// 返回类型
const i18nReturn: UseI18nReturn = useI18n()
```

## 🔗 相关链接

- [核心库文档](../core/README.md)
- [完整 API 文档](./docs/api.md)
- [在线示例](./examples)
- [问题反馈](https://github.com/ldesign/i18n/issues)

## 许可证

[MIT](./LICENSE) © 2024 LDesign Team


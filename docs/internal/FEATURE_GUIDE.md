# @ldesign/i18n 完整功能指南

## 📚 目录

- [核心功能 (Core)](#核心功能-core)
- [Vue 集成功能](#vue-集成功能)
- [高级特性](#高级特性)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

---

## 核心功能 (Core)

### 1. 翻译历史记录器 (TranslationHistory)

跟踪和分析翻译使用情况，获取统计信息。

```typescript
import { createTranslationHistory } from '@ldesign/i18n-core'

const history = createTranslationHistory({
  maxRecords: 1000,
  enableStats: true,
  enableTiming: true,
  autoCleanup: true
})

// 记录翻译
history.record('app.title', 'zh-CN', '应用标题', {
  params: { name: 'LDesign' },
  fromCache: false,
  queryTime: 2.5
})

// 获取统计信息
const stats = history.getStats()
console.log('缓存命中率:', stats.cacheHitRate)
console.log('最常用的键:', stats.topKeys)

// 获取热点键
const hotKeys = history.getHotKeys(10)

// 搜索记录
const records = history.searchByKey('app.title')
```

**主要功能：**
- ✅ 记录每次翻译的详细信息
- ✅ 统计缓存命中率
- ✅ 识别最常用的翻译键
- ✅ 语言和命名空间分布统计
- ✅ 查询时间分析
- ✅ 自动清理过期记录

---

### 2. 翻译变更检测器 (TranslationWatcher)

监听翻译内容的变化，支持热更新。

```typescript
import { createTranslationWatcher } from '@ldesign/i18n-core'

const watcher = createTranslationWatcher({
  deepCompare: true,
  recordHistory: true,
  batchDelay: 100
})

// 创建初始快照
watcher.snapshot('zh-CN', messages)

// 监听变更
watcher.onChange((change) => {
  console.log(`${change.type}: ${change.key}`)
  console.log(`旧值: ${change.oldValue}`)
  console.log(`新值: ${change.newValue}`)
})

// 监听特定类型的变更
watcher.onAdded((change) => {
  console.log('新增翻译:', change.key)
})

watcher.onUpdated((change) => {
  console.log('更新翻译:', change.key)
})

// 检测变更
const changes = watcher.detectChanges('zh-CN', newMessages)

// 获取变更历史
const history = watcher.getHistory(50)
```

**主要功能：**
- ✅ 自动检测新增、更新、删除
- ✅ 深度对比嵌套对象
- ✅ 批量变更通知
- ✅ 变更历史记录
- ✅ 支持多种监听器

---

### 3. 智能缓存预测器 (CachePredictor)

基于使用模式预测和预加载翻译。

```typescript
import { createCachePredictor } from '@ldesign/i18n-core'

const predictor = createCachePredictor({
  maxTrackedKeys: 500,
  predictionWindow: 10,
  minConfidence: 0.3,
  enableTimeDecay: true
})

// 记录键访问
predictor.recordAccess('app.title')
predictor.recordAccess('app.welcome')

// 预测下一个可能使用的键
const prediction = predictor.predict('app.title', 5)
console.log('预测的键:', prediction.keys)
console.log('置信度:', prediction.confidence)

// 批量预测
const relatedKeys = predictor.predictBatch(['app.title', 'app.menu'], 10)

// 获取热门键
const hotKeys = predictor.getHotKeys(20)

// 获取统计信息
const stats = predictor.getStats()
console.log('平均频率:', stats.avgFrequency)
console.log('平均相关键数:', stats.avgRelatedKeys)
```

**主要功能：**
- ✅ 基于使用频率的智能预测
- ✅ 相关键识别
- ✅ 时间衰减算法
- ✅ 热点键分析
- ✅ 数据导出导入

---

## Vue 集成功能

### 1. 表单验证 (useI18nValidation)

国际化的表单验证支持。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useI18nValidation } from '@ldesign/i18n-vue'

const { validate, validateAll, rules } = useI18nValidation()

const form = ref({
  email: '',
  password: '',
  age: 0
})

const handleSubmit = async () => {
  const results = await validateAll(form.value, [
    {
      field: 'email',
      rules: [rules.required(), rules.email()]
    },
    {
      field: 'password',
      rules: [rules.required(), rules.minLength(8)]
    },
    {
      field: 'age',
      rules: [rules.required(), rules.min(18), rules.max(120)]
    }
  ])
}
</script>
```

**内置验证规则：**
- ✅ required - 必填
- ✅ email - 邮箱格式
- ✅ min/max - 数值范围
- ✅ minLength/maxLength - 长度限制
- ✅ pattern - 正则匹配
- ✅ numeric - 纯数字
- ✅ url - URL 格式
- ✅ phone - 电话号码
- ✅ custom - 自定义规则

---

### 2. SEO 元数据 (useI18nMeta)

自动管理页面元数据的国际化。

```vue
<script setup lang="ts">
import { useI18nMeta } from '@ldesign/i18n-vue'

const { updateMeta } = useI18nMeta({
  title: 'page.home.title',
  description: 'page.home.description',
  titleTemplate: '{title} | LDesign',
  ogTitle: 'page.home.ogTitle',
  ogImage: '/images/og-home.jpg',
  autoLangTag: true
})
</script>
```

**主要功能：**
- ✅ 自动更新页面标题和描述
- ✅ Open Graph 标签支持
- ✅ Twitter 卡片支持
- ✅ 自动语言标签
- ✅ 响应语言切换

---

### 3. 性能监控 (useI18nPerformance)

实时监控翻译性能。

```vue
<script setup lang="ts">
import { useI18nPerformance } from '@ldesign/i18n-vue'

const { metrics, getReport } = useI18nPerformance({
  enabled: true,
  autoReport: true
})
</script>

<template>
  <div>
    <p>缓存命中率: {{ metrics.cacheHitRate }}%</p>
    <p>平均翻译时间: {{ metrics.avgTranslationTime }}ms</p>
    <p>内存使用: {{ metrics.estimatedMemoryUsage }}KB</p>
  </div>
</template>
```

---

### 4. 格式化工具 (useI18nFormat)

强大的格式化功能。

```vue
<script setup lang="ts">
import { useI18nFormat } from '@ldesign/i18n-vue'

const {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime
} = useI18nFormat()
</script>

<template>
  <div>
    <p>{{ formatNumber(1234.56).value }}</p>
    <p>{{ formatCurrency(price, 'USD').value }}</p>
    <p>{{ formatDate(new Date()).value }}</p>
  </div>
</template>
```

---

## 最佳实践

### 1. 项目结构

```
src/
├── locales/           # 翻译文件
│   ├── zh-CN.json
│   ├── en-US.json
│   └── index.ts
├── i18n/              # i18n 配置
│   ├── config.ts
│   └── index.ts
└── main.ts
```

### 2. 配置示例

```typescript
// src/i18n/config.ts
import { OptimizedI18n } from '@ldesign/i18n-core'
import zhCN from '../locales/zh-CN.json'
import enUS from '../locales/en-US.json'

export const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  cache: {
    maxSize: 1000,
    strategy: 'lru'
  },
  persistence: {
    enabled: true,
    key: 'app-locale',
    storage: 'localStorage'
  }
})
```

### 3. Vue 集成

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n-vue'
import { i18n } from './i18n'
import App from './App.vue'

const app = createApp(App)

app.use(createI18nPlugin(i18n, {
  globalProperties: true,
  directives: true,
  components: true
}))

app.mount('#app')
```

### 4. 性能优化建议

1. **启用缓存**
   - 使用 LRU 缓存策略
   - 合理设置缓存大小

2. **懒加载语言包**
   ```typescript
   const loader = {
     load: async (locale: string) => {
       const module = await import(`./locales/${locale}.json`)
       return module.default
     }
   }
   ```

3. **使用命名空间**
   ```typescript
   // 按模块拆分翻译
   i18n.addMessages('zh-CN', userModule, 'user')
   i18n.addMessages('zh-CN', productModule, 'product')
   ```

4. **监控性能**
   ```typescript
   import { useI18nPerformance } from '@ldesign/i18n-vue'
   
   const { metrics } = useI18nPerformance({
     enabled: process.env.NODE_ENV === 'development'
   })
   ```

---

## 高级特性

### 1. 批量操作

```typescript
// 批量翻译
const results = i18n.translateBatch(['key1', 'key2', 'key3'])

// 批量加载命名空间
await i18n.batch().batchLoadNamespaces(['user', 'product'], 'zh-CN')

// 批量预加载
await i18n.batch().preloadLocales(['zh-CN', 'en-US'])
```

### 2. 翻译键查找

```typescript
// 模糊搜索
const results = i18n.searchKeys('welcom', { threshold: 2 })

// 通配符搜索
const matches = i18n.searchKeysWildcard('user.*.name')

// 键验证
const report = i18n.validateMessages()
console.log('发现', report.errors, '个错误')
```

### 3. 错误处理

```typescript
// 错误恢复
const recovery = i18n.errorRecovery({
  fallbackLocales: ['zh-CN', 'en'],
  useCache: true
})

// 重试机制
const retry = i18n.createRetryHandler({
  maxRetries: 3,
  baseDelay: 1000
})
```

---

## 🎯 快速开始

### 安装

```bash
npm install @ldesign/i18n-core @ldesign/i18n-vue
```

### 基础使用

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale, setLocale } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('app.title') }}</h1>
    <p>{{ t('app.welcome', { name: 'LDesign' }) }}</p>
    <button @click="setLocale('en-US')">Switch to English</button>
  </div>
</template>
```

---

## 📖 更多资源

- [API 文档](./core/README.md)
- [Vue 集成文档](./vue/README.md)
- [优化策略](./OPTIMIZATION_STRATEGY.md)
- [示例项目](./core/examples)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

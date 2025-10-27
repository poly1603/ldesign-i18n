# Vue 3 集成

@ldesign/i18n 提供了完整的 Vue 3 适配器，包括插件、组合式 API、组件和指令。

## 安装

```bash
pnpm add @ldesign/i18n vue@^3.3.0
```

## 基础设置

### 1. 创建 i18n 实例

```typescript
// src/i18n/index.ts
import { createVueI18n } from '@ldesign/i18n/adapters/vue'

export const i18n = createVueI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎，{name}！',
      appleCount: '没有苹果 | 一个苹果 | {count} 个苹果'
    },
    'en-US': {
      hello: 'Hello',
      welcome: 'Welcome, {name}!',
      appleCount: 'no apples | one apple | {count} apples'
    }
  },
  cache: {
    enabled: true,
    strategy: 'adaptive'
  }
})
```

### 2. 注册插件

```typescript
// src/main.ts
import { createApp } from 'vue'
import { i18n } from './i18n'
import App from './App.vue'

const app = createApp(App)

app.use(i18n)
app.mount('#app')
```

## 组合式 API

### useI18n

获取完整的 i18n 功能：

```vue
<template>
  <div>
    <h1>{{ t('hello') }}</h1>
    <p>{{ t('welcome', { name: userName }) }}</p>
    <p>{{ t('appleCount', appleCount) }}</p>
    
    <div>
      <span>当前语言: {{ locale }}</span>
      <button @click="changeLanguage">切换语言</button>
    </div>
    
    <div>
      <span>可用语言: {{ availableLocales.join(', ') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t, locale, setLocale, availableLocales } = useI18n()

const userName = ref('张三')
const appleCount = ref(5)

function changeLanguage() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>
```

### useTranslation

只需要翻译功能时使用：

```vue
<template>
  <div>
    <h1>{{ t('title') }}</h1>
    <p>{{ t('description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@ldesign/i18n/adapters/vue'

const { t } = useTranslation()
</script>
```

### useLocale

只需要语言切换功能时使用：

```vue
<template>
  <div>
    <select v-model="locale">
      <option v-for="lang in availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from '@ldesign/i18n/adapters/vue'

const { locale, setLocale, availableLocales } = useLocale()
</script>
```

### useI18nAsync

异步加载翻译消息：

```vue
<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <h1>{{ t('hello') }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useI18nAsync } from '@ldesign/i18n/adapters/vue'

const { t, loading, error } = await useI18nAsync({
  locale: 'zh-CN',
  loader: async (locale) => {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  }
})
</script>
```

## 组件

### I18nTranslate

翻译组件，支持多种用法：

```vue
<template>
  <div>
    <!-- 简单翻译 -->
    <I18nTranslate keypath="hello" />
    
    <!-- 带参数 -->
    <I18nTranslate 
      keypath="welcome" 
      :params="{ name: 'Vue' }" 
    />
    
    <!-- 自定义标签 -->
    <I18nTranslate 
      tag="h1" 
      keypath="title" 
    />
    
    <!-- 复数处理 -->
    <I18nTranslate 
      keypath="appleCount" 
      :plural="count" 
    />
    
    <!-- 插槽插值 -->
    <I18nTranslate keypath="agreement">
      <template #link>
        <a href="/terms">服务条款</a>
      </template>
    </I18nTranslate>
  </div>
</template>

<script setup lang="ts">
import { I18nTranslate } from '@ldesign/i18n/adapters/vue'
import { ref } from 'vue'

const count = ref(5)
</script>
```

### I18nText

纯文本翻译组件：

```vue
<template>
  <div>
    <I18nText keypath="hello" />
    <I18nText keypath="welcome" :params="{ name: 'World' }" />
  </div>
</template>
```

### LocaleSwitcher

语言切换器组件：

```vue
<template>
  <div>
    <!-- 默认样式 -->
    <LocaleSwitcher />
    
    <!-- 自定义样式 -->
    <LocaleSwitcher 
      :locales="['zh-CN', 'en-US']"
      :labels="{ 'zh-CN': '中文', 'en-US': 'English' }"
    >
      <template #item="{ locale, label, isActive }">
        <button :class="{ active: isActive }">
          {{ label }}
        </button>
      </template>
    </LocaleSwitcher>
  </div>
</template>

<script setup lang="ts">
import { LocaleSwitcher } from '@ldesign/i18n/adapters/vue'
</script>
```

### I18nProvider

提供 i18n 上下文（通常不需要手动使用）：

```vue
<template>
  <I18nProvider :i18n="customI18n">
    <YourApp />
  </I18nProvider>
</template>

<script setup lang="ts">
import { I18nProvider } from '@ldesign/i18n/adapters/vue'
import { createI18n } from '@ldesign/i18n'

const customI18n = createI18n({ /* ... */ })
</script>
```

## 指令

### v-t

简单的翻译指令：

```vue
<template>
  <div>
    <!-- 简单翻译 -->
    <p v-t="'hello'"></p>
    
    <!-- 等同于 -->
    <p>{{ t('hello') }}</p>
    
    <!-- 带参数 -->
    <p v-t="{ path: 'welcome', params: { name: 'Vue' } }"></p>
  </div>
</template>
```

### v-t-html

翻译并渲染 HTML：

```vue
<template>
  <div>
    <!-- 渲染 HTML 内容 -->
    <div v-t-html="'richText'"></div>
    
    <!-- 带参数 -->
    <div v-t-html="{ path: 'richWelcome', params: { name: 'Vue' } }"></div>
  </div>
</template>

<script setup lang="ts">
// 翻译消息可以包含 HTML
// messages: {
//   'zh-CN': {
//     richText: '<strong>重要</strong>信息',
//     richWelcome: '欢迎 <em>{name}</em>！'
//   }
// }
</script>
```

::: warning 安全警告
使用 `v-t-html` 时要注意 XSS 攻击风险，确保翻译内容来自可信源。
:::

### v-t-plural

复数处理指令：

```vue
<template>
  <div>
    <p v-t-plural="{ path: 'appleCount', count: appleCount }"></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const appleCount = ref(5)
</script>
```

## TypeScript 支持

### 类型安全的翻译键

```typescript
// src/i18n/types.ts
import type { InferMessageType } from '@ldesign/i18n/types'
import zhCN from './locales/zh-CN.json'

export type Messages = InferMessageType<typeof zhCN>
```

```typescript
// src/i18n/index.ts
import type { Messages } from './types'
import { createVueI18n } from '@ldesign/i18n/adapters/vue'

export const i18n = createVueI18n<Messages>({
  locale: 'zh-CN',
  messages: { /* ... */ }
})
```

在组件中使用：

```vue
<script setup lang="ts">
import type { Messages } from '@/i18n/types'
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t } = useI18n<Messages>()

// 类型安全的翻译
t('hello')      // ✅ 正确
t('unknown')    // ❌ 类型错误
</script>
```

### 全局类型声明

```typescript
// src/i18n/global.d.ts
import type { Messages } from './types'

declare module '@ldesign/i18n/adapters/vue' {
  export interface I18nOptions {
    messages: Messages
  }
}
```

## 高级用法

### 动态加载语言包

```typescript
// src/i18n/index.ts
import { createVueI18n } from '@ldesign/i18n/adapters/vue'

export const i18n = createVueI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { /* 默认语言 */ }
  },
  lazyLoad: true
})

// 加载函数
export async function loadLocale(locale: string) {
  // 检查是否已加载
  if (i18n.availableLocales.includes(locale)) {
    i18n.setLocale(locale)
    return
  }
  
  // 动态导入
  const messages = await import(`./locales/${locale}.json`)
  i18n.setLocaleMessage(locale, messages.default)
  i18n.setLocale(locale)
}
```

在组件中使用：

```vue
<script setup lang="ts">
import { loadLocale } from '@/i18n'

async function changeLanguage(locale: string) {
  await loadLocale(locale)
}
</script>
```

### 作用域翻译

```vue
<template>
  <div>
    <!-- 使用作用域 -->
    <p>{{ t('title') }}</p>  <!-- user.profile.title -->
    <p>{{ t('description') }}</p>  <!-- user.profile.description -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t } = useI18n({
  scope: 'user.profile'
})
</script>
```

### 继承父级 i18n

```vue
<template>
  <ChildComponent />
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/adapters/vue'

// 父组件的 i18n
const parentI18n = useI18n()

// 子组件可以继承或创建新的 i18n
</script>
```

### 响应式语言切换

```vue
<template>
  <div>
    <h1>{{ currentTitle }}</h1>
    <button @click="toggleLanguage">切换语言</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t, locale, setLocale } = useI18n()

// 响应式计算属性
const currentTitle = computed(() => t('title'))

function toggleLanguage() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>
```

### 监听语言变化

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { locale } = useI18n()

// 监听语言变化
watch(locale, (newLocale, oldLocale) => {
  console.log(`语言从 ${oldLocale} 切换到 ${newLocale}`)
  
  // 保存到 localStorage
  localStorage.setItem('locale', newLocale)
  
  // 更新文档语言属性
  document.documentElement.lang = newLocale
})
</script>
```

## 性能优化

### 使用编译缓存

```typescript
export const i18n = createVueI18n({
  locale: 'zh-CN',
  messages: { /* ... */ },
  cache: {
    enabled: true,
    strategy: 'adaptive',
    maxSize: 1000
  }
})
```

### 按需导入

```typescript
// 只导入需要的功能
import { useI18n } from '@ldesign/i18n/adapters/vue'
// 而不是
import * as I18n from '@ldesign/i18n/adapters/vue'
```

### 避免在循环中翻译

```vue
<!-- ❌ 不推荐 -->
<template>
  <div v-for="item in items" :key="item.id">
    {{ t(item.key) }}
  </div>
</template>

<!-- ✅ 推荐 -->
<template>
  <div v-for="item in translatedItems" :key="item.id">
    {{ item.text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'

const { t } = useI18n()

const translatedItems = computed(() =>
  items.value.map(item => ({
    ...item,
    text: t(item.key)
  }))
)
</script>
```

## 测试

### 组件测试

```typescript
import { mount } from '@vue/test-utils'
import { createVueI18n } from '@ldesign/i18n/adapters/vue'
import YourComponent from './YourComponent.vue'

describe('YourComponent', () => {
  it('displays translated text', () => {
    const i18n = createVueI18n({
      locale: 'zh-CN',
      messages: {
        'zh-CN': {
          hello: '你好'
        }
      }
    })
    
    const wrapper = mount(YourComponent, {
      global: {
        plugins: [i18n]
      }
    })
    
    expect(wrapper.text()).toContain('你好')
  })
})
```

## 下一步

- 查看 [Vue API 参考](/api/vue-plugin)
- 学习 [性能优化](/guide/performance)
- 浏览 [Vue 示例](/examples/vue-basic)


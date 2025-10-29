# @ldesign/i18n 框架适配器

@ldesign/i18n 提供了针对主流前端框架的深度集成适配器。

## 📦 可用适配器

### 核心库

- **[@ldesign/i18n-core](./core)** - 框架无关的核心库
  - 所有框架通用的功能
  - 翻译引擎、缓存系统、性能监控
  - 可以在任何 JavaScript 环境中使用

### 框架适配器

- **[@ldesign/i18n-vue](./vue)** - Vue 3 集成
  - Composition API（composables）
  - 组件（I18nProvider, Trans, LocaleSwitcher 等）
  - 指令（v-t, v-t-html, v-t-plural）
  - 插件系统

- **[@ldesign/i18n-react](./react)** - React 集成
  - Hooks（useI18n, useLocale, useTranslation）
  - 组件（I18nProvider, Trans, LocaleSwitcher）
  - HOC（withI18n）
  - Context API

- **[@ldesign/i18n-angular](./angular)** - Angular 集成
  - Services（I18nService）
  - Pipes（translate, i18nDate, i18nNumber, plural）
  - Directives（i18nTranslate）
  - 组件（LocaleSwitcher）
  - RxJS Observables

- **[@ldesign/i18n-svelte](./svelte)** - Svelte 集成
  - Stores（响应式状态管理）
  - 组件（I18nProvider, Trans, LocaleSwitcher）
  - Actions（use:t, use:tHtml, use:tPlural）
  - Context API

- **[@ldesign/i18n-solid](./solid)** - Solid.js 集成
  - Primitives（createI18n, useI18n, useLocale, useTranslation）
  - 组件（I18nProvider, Trans, LocaleSwitcher）
  - Directives（use:t, use:tHtml, use:tPlural）
  - Context API

## 🎯 功能对等性

所有框架适配器提供一致的功能和 API：

| 功能 | Core | Vue | React | Angular | Svelte | Solid |
|------|------|-----|-------|---------|--------|-------|
| 翻译函数 (t, te, tm, rt) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 复数化 (tc, tp) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 格式化 (d, n) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 语言管理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 消息管理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Provider 组件 | - | ✅ | ✅ | ✅ (Module) | ✅ | ✅ |
| 翻译组件 | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| 语言切换器 | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| 指令/Actions/Pipes | - | ✅ | - | ✅ | ✅ | ✅ |
| 响应式状态 | - | ✅ | ✅ | ✅ (RxJS) | ✅ | ✅ |

## 🚀 安装

### 核心库

```bash
pnpm add @ldesign/i18n-core
```

### Vue

```bash
pnpm add @ldesign/i18n-vue
```

### React

```bash
pnpm add @ldesign/i18n-react
```

### Angular

```bash
pnpm add @ldesign/i18n-angular
```

### Svelte

```bash
pnpm add @ldesign/i18n-svelte
```

### Solid

```bash
pnpm add @ldesign/i18n-solid
```

## 📖 使用指南

### Vue 3

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale, setLocale } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('hello') }}</h1>
    <button @click="setLocale('en')">English</button>
  </div>
</template>
```

### React

```tsx
import { useI18n } from '@ldesign/i18n-react'

function App() {
  const { t, locale, setLocale } = useI18n()
  
  return (
    <div>
      <h1>{t('hello')}</h1>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  )
}
```

### Svelte

```svelte
<script lang="ts">
  import { getI18nContext } from '@ldesign/i18n-svelte'
  
  const i18n = getI18nContext()
  $: currentLocale = $i18n.locale
</script>

<div>
  <h1>{i18n.t('hello')}</h1>
  <button on:click={() => i18n.setLocale('en')}>English</button>
</div>
```

### Angular

```typescript
import { Component } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ i18n.t('hello') }}</h1>
    <p>{{ 'welcome' | translate: { name: 'Angular' } }}</p>
    <button (click)="i18n.setLocale('en')">English</button>
  `
})
export class AppComponent {
  constructor(public i18n: I18nService) {}
}
```

### Solid.js

```tsx
import { useI18n } from '@ldesign/i18n-solid'

function App() {
  const { t, locale, setLocale } = useI18n()
  
  return (
    <div>
      <h1>{t('hello')}</h1>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  )
}
```

## 📚 详细文档

每个适配器都有自己的 README 文档：

- [Core 文档](./core/README.md)
- [Vue 文档](./vue/README.md)
- [React 文档](./react/README.md)
- [Angular 文档](./angular/README.md)
- [Svelte 文档](./svelte/README.md)
- [Solid 文档](./solid/README.md)

## 🔧 开发

### 构建所有包

```bash
pnpm -r build
```

### 构建特定包

```bash
# Vue
cd packages/vue && pnpm build

# React
cd packages/react && pnpm build

# Svelte
cd packages/svelte && pnpm build

# Solid
cd packages/solid && pnpm build
```

### 运行测试

```bash
pnpm -r test
```

## 📝 注意事项

1. **核心库依赖**: 所有框架适配器都依赖 `@ldesign/i18n-core`
2. **Peer Dependencies**: 每个适配器都声明了相应框架作为 peer dependency
3. **TypeScript**: 所有包都提供完整的 TypeScript 类型定义
4. **Tree-shaking**: 支持 ES modules，可以进行 tree-shaking

## 📄 许可证

[MIT](../../LICENSE) © 2024 LDesign Team
